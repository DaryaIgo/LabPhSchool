/**
 * Enrollment Management — Admin GUI for managing student course access & progress
 */

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../api/router";
import {
  BookOpen,
  Beaker,
  FileText,
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
  MoreHorizontal,
  Pause,
  Play,
  Trash2,
  Plus,
  GraduationCap,
  ExternalLink,
  User,
  ClipboardList,
} from "lucide-react";

type RouterOutput = inferRouterOutputs<AppRouter>;
type EnrollmentItem = RouterOutput["enrollment"]["listForStudent"][number];
type StudentUser = RouterOutput["student"]["list"]["users"][number];
type SubtopicProgressItem = RouterOutput["student"]["getTopicProgress"][number];
type LabItem = RouterOutput["course"]["topicLabWorks"][number];
type TopicItem = RouterOutput["course"]["topics"][number];

type EnrollmentStatus = EnrollmentItem["status"];
type SubtopicStatus = SubtopicProgressItem["status"];

const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
  active: "Активна",
  completed: "Завершена",
  suspended: "Приостановлена",
};

const ENROLLMENT_STATUS_COLORS: Record<EnrollmentStatus, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  completed: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  suspended: "bg-amber-500/15 text-amber-400 border-amber-500/20",
};

const SUBTOPIC_STATUS_LABELS: Record<SubtopicStatus, string> = {
  not_started: "Не начато",
  in_progress: "Изучается",
  completed: "Завершено",
};

const SUBTOPIC_STATUS_COLORS: Record<SubtopicStatus, string> = {
  not_started: "text-slate-400",
  in_progress: "text-sky-400",
  completed: "text-emerald-400",
};

export default function EnrollmentManagement() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();

  const [expandedStudent, setExpandedStudent] = useState<number | null>(null);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedTopicNodeId, setSelectedTopicNodeId] = useState<number | null>(null);

  const { data: students, isLoading: studentsLoading } =
    trpc.student.list.useQuery(
      { page: 1, pageSize: 100 },
      { enabled: !!user && user.role === "admin" }
    );

  const { data: topics } = trpc.course.topics.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const enrollMutation = trpc.enrollment.enroll.useMutation({
    onSuccess: () => {
      toast("Ученик записан на тему");
      utils.enrollment.listForStudent.invalidate();
      setEnrollDialogOpen(false);
      setSelectedTopicNodeId(null);
    },
    onError: (err) => toast(err.message),
  });

  const unenrollMutation = trpc.enrollment.unenroll.useMutation({
    onSuccess: () => {
      toast("Запись удалена");
      utils.enrollment.listForStudent.invalidate();
    },
    onError: (err) => toast(err.message),
  });

  const updateStatusMutation = trpc.enrollment.updateStatus.useMutation({
    onSuccess: () => {
      toast("Статус обновлён");
      utils.enrollment.listForStudent.invalidate();
    },
    onError: (err) => toast(err.message),
  });

  if (!user || user.role !== "admin") return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ClipboardList className="h-6 w-6 text-[#2eff8c]" />
          <h1 className="text-2xl font-bold text-white">
            Управление доступом к курсу
          </h1>
        </div>
        <p className="text-sm text-slate-400">
          Открывайте темы, управляйте прогрессом и комментариями
        </p>
      </header>

      {studentsLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 bg-[#37474f]" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {students?.users
            .filter((s) => s.roleName !== "admin")
            .map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                isExpanded={expandedStudent === student.id}
                onToggle={() =>
                  setExpandedStudent(
                    expandedStudent === student.id ? null : student.id
                  )
                }
                enrollDialog={
                  <EnrollDialog
                    student={student}
                    topics={topics ?? []}
                    open={
                      enrollDialogOpen && selectedStudentId === student.id
                    }
                    onOpenChange={(open) => {
                      setEnrollDialogOpen(open);
                      if (open) setSelectedStudentId(student.id);
                    }}
                    selectedTopicNodeId={selectedTopicNodeId}
                    onSelectTopic={setSelectedTopicNodeId}
                    onEnroll={() => {
                      if (selectedTopicNodeId && selectedStudentId) {
                        enrollMutation.mutate({
                          studentId: selectedStudentId,
                          topicNodeId: selectedTopicNodeId,
                        });
                      }
                    }}
                    isEnrolling={enrollMutation.isPending}
                  />
                }
              >
                {expandedStudent === student.id && (
                  <StudentEnrollments
                    studentId={student.id}
                    onUnenroll={(id) =>
                      unenrollMutation.mutate({ enrollmentId: id })
                    }
                    onUpdateStatus={(id, status) =>
                      updateStatusMutation.mutate({ enrollmentId: id, status })
                    }
                    isPending={
                      unenrollMutation.isPending ||
                      updateStatusMutation.isPending
                    }
                  />
                )}
              </StudentCard>
            ))}
        </div>
      )}
    </div>
  );
}

function StudentCard({
  student,
  isExpanded,
  onToggle,
  enrollDialog,
  children,
}: {
  student: StudentUser;
  isExpanded: boolean;
  onToggle: () => void;
  enrollDialog: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-[#1e2529] border-[#2a3338] overflow-hidden">
      <CardContent className="p-0">
        <div
          className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#232b2f] transition-colors"
          onClick={onToggle}
        >
          <div className="flex items-center gap-3 min-w-0">
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform shrink-0 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-slate-400" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-medium text-sm truncate">
                {student.name}
              </p>
              <p className="text-xs text-slate-400 truncate">
                @{student.login}
              </p>
            </div>
          </div>
          <div onClick={(e) => e.stopPropagation()}>{enrollDialog}</div>
        </div>

        {isExpanded && (
          <div className="border-t border-[#2a3338] px-4 py-4">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}

function EnrollDialog({
  student,
  topics,
  open,
  onOpenChange,
  selectedTopicNodeId,
  onSelectTopic,
  onEnroll,
  isEnrolling,
}: {
  student: StudentUser;
  topics: TopicItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTopicNodeId: number | null;
  onSelectTopic: (id: number | null) => void;
  onEnroll: () => void;
  isEnrolling: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a] font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          <Plus className="h-4 w-4 mr-1" />
          Открыть тему
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1e2529] border-[#37474f] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Открыть тему для {student.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <Select
            value={selectedTopicNodeId?.toString() ?? ""}
            onValueChange={(v) => onSelectTopic(Number(v))}
          >
            <SelectTrigger className="bg-[#263238] border-[#37474f]">
              <SelectValue placeholder="Выберите тему..." />
            </SelectTrigger>
            <SelectContent className="bg-[#1e2529] border-[#37474f]">
              {topics.map((t) => (
                <SelectItem key={t.id} value={t.id.toString()}>
                  {t.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="w-full bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]"
            disabled={!selectedTopicNodeId || isEnrolling}
            onClick={onEnroll}
          >
            {isEnrolling ? "Открываем..." : "Подтвердить"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StudentEnrollments({
  studentId,
  onUnenroll,
  onUpdateStatus,
  isPending,
}: {
  studentId: number;
  onUnenroll: (id: number) => void;
  onUpdateStatus: (id: number, status: EnrollmentStatus) => void;
  isPending: boolean;
}) {
  const { data: enrollments, isLoading } =
    trpc.enrollment.listForStudent.useQuery({ studentId });
  const { data: allSubtopics } = trpc.course.listSubtopics.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-14 bg-[#37474f]" />
        ))}
      </div>
    );
  }

  if (!enrollments?.length) {
    return (
      <p className="text-sm text-slate-500">
        У ученика пока нет открытых тем
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {enrollments.map((enrollment) => (
        <TopicRow
          key={enrollment.id}
          studentId={studentId}
          enrollment={enrollment}
          allSubtopics={allSubtopics ?? []}
          onUnenroll={onUnenroll}
          onUpdateStatus={onUpdateStatus}
          isPending={isPending}
        />
      ))}
    </div>
  );
}

function TopicRow({
  studentId,
  enrollment,
  allSubtopics,
  onUnenroll,
  onUpdateStatus,
  isPending,
}: {
  studentId: number;
  enrollment: EnrollmentItem;
  allSubtopics: { id: number; parentId: number | null; title: string }[];
  onUnenroll: (id: number) => void;
  onUpdateStatus: (id: number, status: EnrollmentStatus) => void;
  isPending: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: progress } = trpc.student.getTopicProgress.useQuery({
    studentId,
    topicNodeId: enrollment.topicNodeId,
  });
  const { data: topicLabs } = trpc.course.topicLabWorks.useQuery(
    { topicNodeId: enrollment.topicNodeId },
    { enabled: isOpen }
  );

  const completedCount =
    progress?.filter((p) => p.status === "completed").length ?? 0;
  const totalCount = progress?.length ?? 0;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const currentSubtopicNodeId = progress?.find((p) => p.status === "in_progress")
    ?.subtopicNodeId;
  const currentSubtopic = allSubtopics.find((s) => s.id === currentSubtopicNodeId);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="relative">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center gap-3 px-3 py-3 bg-[#232b2f] hover:bg-[#263238] rounded-lg border border-[#2a3338] text-left transition-colors pr-12">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: enrollment.topicColor ?? "#2eff8c" }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-white truncate">
                  {enrollment.topicTitle}
                </span>
                <Badge
                  variant="outline"
                  className={`${ENROLLMENT_STATUS_COLORS[enrollment.status]} text-[10px] px-1.5 py-0 h-5`}
                >
                  {ENROLLMENT_STATUS_LABELS[enrollment.status]}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <div className="w-28 sm:w-40">
                  <Progress
                    value={progressPercent}
                    className="h-1.5 bg-slate-700"
                  />
                </div>
                <span className="text-xs text-slate-400">
                  {completedCount} из {totalCount} подтем
                </span>
                {currentSubtopic && (
                  <span className="text-xs text-sky-400 truncate max-w-[200px] hidden sm:inline">
                    <GraduationCap className="h-3 w-3 inline mr-1" />
                    {currentSubtopic.title}
                  </span>
                )}
              </div>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </CollapsibleTrigger>
        <div
          className="absolute right-2 top-1/2 -translate-y-1/2"
          onClick={(e) => e.stopPropagation()}
        >
          <TopicActions
            status={enrollment.status}
            onToggleStatus={() =>
              onUpdateStatus(
                enrollment.id,
                enrollment.status === "active" ? "suspended" : "active"
              )
            }
            onUnenroll={() => {
              if (confirm("Удалить доступ к этой теме?")) {
                onUnenroll(enrollment.id);
              }
            }}
            isPending={isPending}
          />
        </div>
      </div>

      <CollapsibleContent className="mt-2 pl-3 border-l-2 border-[#2a3338] space-y-3">
        <SubtopicProgressManager
          studentId={studentId}
          topicNodeId={enrollment.topicNodeId}
        />
        {topicLabs && topicLabs.length > 0 && <LabList labs={topicLabs} />}
      </CollapsibleContent>
    </Collapsible>
  );
}

function TopicActions({
  status,
  onToggleStatus,
  onUnenroll,
  isPending,
}: {
  status: EnrollmentStatus;
  onToggleStatus: () => void;
  onUnenroll: () => void;
  isPending: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
          disabled={isPending}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-[#1e2529] border-[#37474f] text-white"
        align="end"
      >
        <DropdownMenuItem onClick={onToggleStatus} className="cursor-pointer">
          {status === "active" ? (
            <>
              <Pause className="h-4 w-4 mr-2 text-amber-400" />
              Приостановить
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2 text-emerald-400" />
              Активировать
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onUnenroll}
          className="cursor-pointer text-red-400 focus:text-red-400"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Удалить доступ
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SubtopicProgressManager({
  studentId,
  topicNodeId,
}: {
  studentId: number;
  topicNodeId: number;
}) {
  const { data: progress, isLoading } = trpc.student.getTopicProgress.useQuery({
    studentId,
    topicNodeId,
  });
  const utils = trpc.useUtils();

  const updateProgress = trpc.student.updateProgress.useMutation({
    onSuccess: () => {
      toast("Прогресс обновлён");
      utils.student.getTopicProgress.invalidate({ studentId, topicNodeId });
      utils.student.getProfile.invalidate();
      utils.student.getLearningPath.invalidate();
    },
    onError: (err) => toast(err.message),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 bg-[#37474f]" />
        ))}
      </div>
    );
  }

  if (!progress?.length) {
    return (
      <div className="text-sm text-slate-500 bg-[#1a2024] rounded-md px-3 py-2 border border-[#2a3338]">
        В этой теме пока нет подтем
      </div>
    );
  }

  return (
    <div className="bg-[#1a2024] rounded-lg border border-[#2a3338] overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[560px] pr-4">
          <div className="grid grid-cols-[1fr_180px_64px_64px_64px_120px] gap-2 px-3 py-2 bg-[#232b2f] text-xs font-medium text-slate-400 border-b border-[#2a3338]">
            <span>Подтема</span>
            <span>Комментарий</span>
            <span className="text-center">Теория</span>
            <span className="text-center">Практика</span>
            <span className="text-center">Лаба</span>
            <span>Статус</span>
          </div>
          <div className="divide-y divide-[#2a3338]">
            {progress.map((sub) => (
              <SubtopicRow
                key={sub.subtopicNodeId}
                sub={sub}
                onUpdate={(data) =>
                  updateProgress.mutate({
                    studentId,
                    subtopicNodeId: sub.subtopicNodeId,
                    ...data,
                  })
                }
                isPending={updateProgress.isPending}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SubtopicRow({
  sub,
  onUpdate,
  isPending,
}: {
  sub: SubtopicProgressItem;
  onUpdate: (data: {
    status?: SubtopicStatus;
    theoryCompleted?: boolean;
    practiceCompleted?: boolean;
    labCompleted?: boolean;
    comment?: string;
  }) => void;
  isPending: boolean;
}) {
  return (
    <div className="grid grid-cols-[1fr_180px_64px_64px_64px_120px] gap-2 px-3 py-2 items-center hover:bg-[#1e2529] transition-colors">
      <span className="text-sm text-white truncate" title={sub.title}>
        {sub.title}
      </span>
      <Input
        defaultValue={sub.comment ?? ""}
        onBlur={(ev) => {
          const value = ev.target.value;
          if (value !== (sub.comment ?? "")) {
            onUpdate({ comment: value });
          }
        }}
        placeholder="Комментарий..."
        className="h-7 text-xs bg-[#232b2f] border-[#37474f] text-white placeholder:text-slate-600"
        disabled={isPending}
      />
      <CompletionToggle
        completed={sub.theoryCompleted}
        onToggle={() => onUpdate({ theoryCompleted: !sub.theoryCompleted })}
        icon={<BookOpen className="h-4 w-4" />}
        activeClass="text-emerald-400 bg-emerald-400/10"
        title="Теория"
        isPending={isPending}
      />
      <CompletionToggle
        completed={sub.practiceCompleted}
        onToggle={() => onUpdate({ practiceCompleted: !sub.practiceCompleted })}
        icon={<FileText className="h-4 w-4" />}
        activeClass="text-sky-400 bg-sky-400/10"
        title="Практика"
        isPending={isPending}
      />
      <CompletionToggle
        completed={sub.labCompleted}
        onToggle={() => onUpdate({ labCompleted: !sub.labCompleted })}
        icon={<Beaker className="h-4 w-4" />}
        activeClass="text-amber-400 bg-amber-400/10"
        title="Лабораторная"
        isPending={isPending}
      />
      <Select
        value={sub.status}
        onValueChange={(val) => onUpdate({ status: val as SubtopicStatus })}
        disabled={isPending}
      >
        <SelectTrigger className="h-7 text-xs bg-[#232b2f] border-[#37474f] text-white">
          <SelectValue>
            <StatusLabel status={sub.status} />
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-[#1e2529] border-[#37474f]">
          <SelectItem value="not_started">
            <StatusLabel status="not_started" />
          </SelectItem>
          <SelectItem value="in_progress">
            <StatusLabel status="in_progress" />
          </SelectItem>
          <SelectItem value="completed">
            <StatusLabel status="completed" />
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function CompletionToggle({
  completed,
  onToggle,
  icon,
  activeClass,
  title,
  isPending,
}: {
  completed: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  activeClass: string;
  title: string;
  isPending: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isPending}
      title={title}
      className={`flex justify-center items-center h-7 w-7 mx-auto rounded-md transition-colors ${
        completed
          ? activeClass
          : "text-slate-600 hover:text-slate-400 hover:bg-slate-800"
      } disabled:opacity-50`}
    >
      {icon}
    </button>
  );
}

function StatusLabel({ status }: { status: SubtopicStatus }) {
  return (
    <span
      className={`flex items-center gap-1.5 text-xs ${SUBTOPIC_STATUS_COLORS[status]}`}
    >
      {status === "not_started" && <Circle className="h-3 w-3" />}
      {status === "in_progress" && <Clock className="h-3 w-3" />}
      {status === "completed" && <CheckCircle2 className="h-3 w-3" />}
      {SUBTOPIC_STATUS_LABELS[status]}
    </span>
  );
}

function LabList({ labs }: { labs: LabItem[] }) {
  return (
    <div className="space-y-1.5">
      <h4 className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
        <Beaker className="h-3.5 w-3.5" />
        Лабораторные работы
      </h4>
      <div className="grid gap-1.5">
        {labs.map((lab) => (
          <a
            key={lab.id}
            href={`/#/labs/${lab.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 bg-[#1a2024] hover:bg-[#232b2f] rounded-md border border-[#2a3338] transition-colors group"
          >
            <span className="text-sm text-white group-hover:text-[#2eff8c] transition-colors truncate pr-2">
              {lab.title}
            </span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-[#2eff8c] shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}


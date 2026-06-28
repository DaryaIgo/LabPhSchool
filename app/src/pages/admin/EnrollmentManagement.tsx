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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "sonner";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../api/router";
import {
  BookOpen,
  Beaker,
  FileText,
  NotebookPen,
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
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null
  );
  const [selectedTopicNodeId, setSelectedTopicNodeId] = useState<number | null>(
    null
  );

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
    onError: err => toast(err.message),
  });

  const unenrollMutation = trpc.enrollment.unenroll.useMutation({
    onSuccess: () => {
      toast("Запись удалена");
      utils.enrollment.listForStudent.invalidate();
    },
    onError: err => toast(err.message),
  });

  const updateStatusMutation = trpc.enrollment.updateStatus.useMutation({
    onSuccess: () => {
      toast("Статус обновлён");
      utils.enrollment.listForStudent.invalidate();
    },
    onError: err => toast(err.message),
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
            .filter(s => s.roleName !== "admin")
            .map(student => (
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
                    open={enrollDialogOpen && selectedStudentId === student.id}
                    onOpenChange={open => {
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
                    onUnenroll={id =>
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

function AssignedProblemsManager({
  enrollmentId,
  isOpen,
}: {
  enrollmentId: number;
  isOpen: boolean;
}) {
  const utils = trpc.useUtils();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<"assigned" | "completed">(
    "assigned"
  );

  const { data: assignedProblems, isLoading } =
    trpc.enrollment.listAssignedProblems.useQuery(
      { enrollmentId },
      { enabled: isOpen }
    );
  const { data: allProblems } =
    trpc.problems.adminListProblemsForAssignment.useQuery(undefined, {
      enabled: isOpen,
    });

  const assignMutation = trpc.enrollment.assignProblem.useMutation({
    onSuccess: () => {
      toast("Задача назначена");
      utils.enrollment.listAssignedProblems.invalidate({ enrollmentId });
      setAddDialogOpen(false);
      setSelectedProblemId(null);
    },
    onError: err => toast(err.message),
  });

  const unassignMutation = trpc.enrollment.unassignProblem.useMutation({
    onSuccess: () => {
      toast("Назначение удалено");
      utils.enrollment.listAssignedProblems.invalidate({ enrollmentId });
    },
    onError: err => toast(err.message),
  });

  const updateMutation = trpc.enrollment.updateAssignedProblem.useMutation({
    onSuccess: () => {
      utils.enrollment.listAssignedProblems.invalidate({ enrollmentId });
    },
    onError: err => toast(err.message),
  });

  const availableProblems =
    allProblems?.filter(
      p => !assignedProblems?.some(a => a.problemId === p.id)
    ) ?? [];

  const assignedCount =
    assignedProblems?.filter(p => p.status !== "completed").length ?? 0;
  const completedCount =
    assignedProblems?.filter(p => p.status === "completed").length ?? 0;

  const filteredProblems =
    assignedProblems?.filter(p => {
      if (statusFilter === "completed") return p.status === "completed";
      return p.status !== "completed";
    }) ?? [];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          Назначенные задачи
        </h4>
        <div className="flex items-center gap-2">
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="text-xs flex items-center gap-1 text-[#2eff8c] hover:text-[#26d97a] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Добавить задачу
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#1e2529] border-[#37474f] text-white sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Назначить задачу</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <Select
                  value={selectedProblemId?.toString() ?? ""}
                  onValueChange={v => setSelectedProblemId(Number(v))}
                >
                  <SelectTrigger className="bg-[#263238] border-[#37474f]">
                    <SelectValue placeholder="Выберите задачу..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e2529] border-[#37474f] max-h-80">
                    {availableProblems.map(p => (
                      <SelectItem
                        key={p.id}
                        value={p.id.toString()}
                        className="text-white"
                      >
                        <span className="truncate">{p.title}</span>
                        <span className="ml-2 text-xs text-slate-500">
                          {p.categoryTitle ?? "Без категории"}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  className="w-full bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]"
                  disabled={!selectedProblemId || assignMutation.isPending}
                  onClick={() => {
                    if (selectedProblemId) {
                      assignMutation.mutate({
                        enrollmentId,
                        problemId: selectedProblemId,
                      });
                    }
                  }}
                >
                  {assignMutation.isPending ? "Назначаем..." : "Назначить"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <ToggleGroup
            type="single"
            variant="outline"
            value={statusFilter}
            onValueChange={val =>
              setStatusFilter((val as "assigned") ?? "assigned")
            }
            className="bg-[#1a2024]"
          >
            <ToggleGroupItem
              value="assigned"
              className="group text-xs h-7 px-2.5 text-slate-300 border-[#37474f] data-[state=on]:bg-[#2eff8c] data-[state=on]:text-[#0d1117] data-[state=on]:border-[#2eff8c] gap-1.5"
            >
              Назначена
              <span className="inline-flex items-center justify-center min-w-[1.25rem] h-4 px-1 rounded-full bg-[#37474f] text-[10px] text-white group-data-[state=on]:bg-[#0d1117]/30">
                {assignedCount}
              </span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="completed"
              className="group text-xs h-7 px-2.5 text-slate-300 border-[#37474f] data-[state=on]:bg-[#2eff8c] data-[state=on]:text-[#0d1117] data-[state=on]:border-[#2eff8c] gap-1.5"
            >
              Выполнена
              <span className="inline-flex items-center justify-center min-w-[1.25rem] h-4 px-1 rounded-full bg-[#37474f] text-[10px] text-white group-data-[state=on]:bg-[#0d1117]/30">
                {completedCount}
              </span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-1.5">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-10 bg-[#37474f]" />
          ))}
        </div>
      ) : filteredProblems.length > 0 ? (
        <div className="grid gap-1.5">
          {filteredProblems.map((problem, idx) => (
            <div
              key={problem.id}
              className="flex items-center gap-2 px-3 py-2 bg-[#1a2024] rounded-md border border-[#2a3338] hover:border-[#37474f] transition-colors"
            >
              <span className="text-xs font-medium text-slate-500 w-5 shrink-0">
                {idx + 1}.
              </span>
              <span className="flex-1 min-w-0 text-sm text-white truncate">
                {problem.problemTitle}
              </span>
              <Select
                value={problem.status}
                onValueChange={val =>
                  updateMutation.mutate({
                    assignmentId: problem.id,
                    status: val as "assigned" | "completed",
                  })
                }
                disabled={updateMutation.isPending}
              >
                <SelectTrigger className="h-7 text-xs bg-[#232b2f] border-[#37474f] text-white w-32 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1e2529] border-[#37474f]">
                  <SelectItem value="assigned" className="text-white">
                    Назначена
                  </SelectItem>
                  <SelectItem value="completed" className="text-white">
                    Выполнена
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={problem.grade?.toString() ?? "none"}
                onValueChange={val =>
                  updateMutation.mutate({
                    assignmentId: problem.id,
                    grade: val === "none" ? null : Number(val),
                  })
                }
                disabled={updateMutation.isPending}
              >
                <SelectTrigger className="h-7 text-xs bg-[#232b2f] border-[#37474f] text-white w-24 shrink-0">
                  <SelectValue placeholder="Оценка" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e2529] border-[#37474f]">
                  <SelectItem value="none" className="text-white">
                    Без оценки
                  </SelectItem>
                  {[1, 2, 3, 4, 5].map(g => (
                    <SelectItem
                      key={g}
                      value={g.toString()}
                      className="text-white"
                    >
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Удалить назначенную задачу?")) {
                    unassignMutation.mutate({ assignmentId: problem.id });
                  }
                }}
                disabled={unassignMutation.isPending}
                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors shrink-0"
                title="Удалить"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">Нет задач с выбранным статусом</p>
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
          <div onClick={e => e.stopPropagation()}>{enrollDialog}</div>
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
          onClick={e => e.stopPropagation()}
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
            onValueChange={v => onSelectTopic(Number(v))}
          >
            <SelectTrigger className="bg-[#263238] border-[#37474f]">
              <SelectValue placeholder="Выберите тему..." />
            </SelectTrigger>
            <SelectContent className="bg-[#1e2529] border-[#37474f]">
              {topics.map(t => (
                <SelectItem
                  key={t.id}
                  value={t.id.toString()}
                  className="text-white"
                >
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
      <p className="text-sm text-slate-500">У ученика пока нет открытых тем</p>
    );
  }

  return (
    <div className="space-y-2">
      {enrollments.map(enrollment => (
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

  const completedCount =
    progress?.filter(p => p.status === "completed").length ?? 0;
  const totalCount = progress?.length ?? 0;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const currentSubtopicNodeId = progress?.find(
    p => p.status === "in_progress"
  )?.subtopicNodeId;
  const currentSubtopic = allSubtopics.find(
    s => s.id === currentSubtopicNodeId
  );

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
          onClick={e => e.stopPropagation()}
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
        <AssignedLabWorksManager enrollmentId={enrollment.id} isOpen={isOpen} />
        <AssignedProblemsManager enrollmentId={enrollment.id} isOpen={isOpen} />
        <AssignedJupyterNotebooksManager
          enrollmentId={enrollment.id}
          isOpen={isOpen}
        />
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
    onError: err => toast(err.message),
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
            <span className="text-center">Задача</span>
            <span className="text-center">Лаба</span>
            <span>Статус</span>
          </div>
          <div className="divide-y divide-[#2a3338]">
            {progress.map(sub => (
              <SubtopicRow
                key={sub.subtopicNodeId}
                sub={sub}
                onUpdate={data =>
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
        onBlur={ev => {
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
        title="Задача"
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
        onValueChange={val => onUpdate({ status: val as SubtopicStatus })}
        disabled={isPending}
      >
        <SelectTrigger className="h-7 text-xs bg-[#232b2f] border-[#37474f] text-white">
          <SelectValue>
            <StatusLabel status={sub.status} />
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-[#1e2529] border-[#37474f]">
          <SelectItem value="not_started" className="text-white">
            <StatusLabel status="not_started" />
          </SelectItem>
          <SelectItem value="in_progress" className="text-white">
            <StatusLabel status="in_progress" />
          </SelectItem>
          <SelectItem value="completed" className="text-white">
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

function AssignedJupyterNotebooksManager({
  enrollmentId,
  isOpen,
}: {
  enrollmentId: number;
  isOpen: boolean;
}) {
  const utils = trpc.useUtils();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedNotebookId, setSelectedNotebookId] = useState<number | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<"assigned" | "completed">(
    "assigned"
  );

  const { data: assignedNotebooks, isLoading } =
    trpc.enrollment.listAssignedJupyterNotebooks.useQuery(
      { enrollmentId },
      { enabled: isOpen }
    );
  const { data: allNotebooks } = trpc.admin.listJupyterNotebooks.useQuery(
    undefined,
    { enabled: isOpen }
  );

  const assignMutation = trpc.enrollment.assignJupyterNotebook.useMutation({
    onSuccess: () => {
      toast("Jupyter-ноутбук назначен");
      utils.enrollment.listAssignedJupyterNotebooks.invalidate({
        enrollmentId,
      });
      utils.student.getMyJupyterNotebooks.invalidate();
      setAddDialogOpen(false);
      setSelectedNotebookId(null);
    },
    onError: err => toast(err.message),
  });

  const unassignMutation = trpc.enrollment.unassignJupyterNotebook.useMutation({
    onSuccess: () => {
      toast("Назначение удалено");
      utils.enrollment.listAssignedJupyterNotebooks.invalidate({
        enrollmentId,
      });
      utils.student.getMyJupyterNotebooks.invalidate();
    },
    onError: err => toast(err.message),
  });

  const updateMutation =
    trpc.enrollment.updateAssignedJupyterNotebook.useMutation({
      onSuccess: () => {
        utils.enrollment.listAssignedJupyterNotebooks.invalidate({
          enrollmentId,
        });
        utils.student.getMyJupyterNotebooks.invalidate();
      },
      onError: err => toast(err.message),
    });

  const availableNotebooks =
    allNotebooks?.filter(
      n => !assignedNotebooks?.some(a => a.notebookId === n.id)
    ) ?? [];

  const assignedCount =
    assignedNotebooks?.filter(n => n.status !== "completed").length ?? 0;
  const completedCount =
    assignedNotebooks?.filter(n => n.status === "completed").length ?? 0;

  const filteredNotebooks =
    assignedNotebooks?.filter(n => {
      if (statusFilter === "completed") return n.status === "completed";
      return n.status !== "completed";
    }) ?? [];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
          <NotebookPen className="h-3.5 w-3.5" />
          Назначенные Jupyter-ноутбуки
        </h4>
        <div className="flex items-center gap-2">
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="text-xs flex items-center gap-1 text-[#2eff8c] hover:text-[#26d97a] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Добавить ноутбук
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#1e2529] border-[#37474f] text-white sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Назначить Jupyter-ноутбук</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <Select
                  value={selectedNotebookId?.toString() ?? ""}
                  onValueChange={v => setSelectedNotebookId(Number(v))}
                >
                  <SelectTrigger className="bg-[#263238] border-[#37474f]">
                    <SelectValue placeholder="Выберите ноутбук..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e2529] border-[#37474f] max-h-80">
                    {availableNotebooks.map(n => (
                      <SelectItem
                        key={n.id}
                        value={n.id.toString()}
                        className="text-white"
                      >
                        <span className="truncate">{n.title}</span>
                        <span className="ml-2 text-xs text-slate-500">
                          {n.subtopicTitle ?? "Без подтемы"}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  className="w-full bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]"
                  disabled={!selectedNotebookId || assignMutation.isPending}
                  onClick={() => {
                    if (selectedNotebookId) {
                      assignMutation.mutate({
                        enrollmentId,
                        notebookId: selectedNotebookId,
                      });
                    }
                  }}
                >
                  {assignMutation.isPending ? "Назначаем..." : "Назначить"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <ToggleGroup
            type="single"
            variant="outline"
            value={statusFilter}
            onValueChange={val =>
              setStatusFilter((val as "assigned") ?? "assigned")
            }
            className="bg-[#1a2024]"
          >
            <ToggleGroupItem
              value="assigned"
              className="group text-xs h-7 px-2.5 text-slate-300 border-[#37474f] data-[state=on]:bg-[#2eff8c] data-[state=on]:text-[#0d1117] data-[state=on]:border-[#2eff8c] gap-1.5"
            >
              Назначен
              <span className="inline-flex items-center justify-center min-w-[1.25rem] h-4 px-1 rounded-full bg-[#37474f] text-[10px] text-white group-data-[state=on]:bg-[#0d1117]/30">
                {assignedCount}
              </span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="completed"
              className="group text-xs h-7 px-2.5 text-slate-300 border-[#37474f] data-[state=on]:bg-[#2eff8c] data-[state=on]:text-[#0d1117] data-[state=on]:border-[#2eff8c] gap-1.5"
            >
              Выполнен
              <span className="inline-flex items-center justify-center min-w-[1.25rem] h-4 px-1 rounded-full bg-[#37474f] text-[10px] text-white group-data-[state=on]:bg-[#0d1117]/30">
                {completedCount}
              </span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-1.5">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-10 bg-[#37474f]" />
          ))}
        </div>
      ) : filteredNotebooks.length > 0 ? (
        <div className="grid gap-1.5">
          {filteredNotebooks.map((notebook, idx) => (
            <div
              key={notebook.id}
              className="flex items-center gap-2 px-3 py-2 bg-[#1a2024] rounded-md border border-[#2a3338] hover:border-[#37474f] transition-colors"
            >
              <span className="text-xs font-medium text-slate-500 w-5 shrink-0">
                {idx + 1}.
              </span>
              <span className="flex-1 min-w-0 text-sm text-white truncate">
                {notebook.notebookTitle}
              </span>
              <Select
                value={notebook.status}
                onValueChange={val =>
                  updateMutation.mutate({
                    assignmentId: notebook.id,
                    status: val as "assigned" | "submitted" | "completed",
                  })
                }
                disabled={updateMutation.isPending}
              >
                <SelectTrigger className="h-7 text-xs bg-[#232b2f] border-[#37474f] text-white w-32 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1e2529] border-[#37474f]">
                  <SelectItem value="assigned" className="text-white">
                    Назначен
                  </SelectItem>
                  <SelectItem value="submitted" className="text-white">
                    На проверке
                  </SelectItem>
                  <SelectItem value="completed" className="text-white">
                    Выполнен
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={notebook.grade?.toString() ?? "none"}
                onValueChange={val =>
                  updateMutation.mutate({
                    assignmentId: notebook.id,
                    grade: val === "none" ? null : Number(val),
                  })
                }
                disabled={updateMutation.isPending}
              >
                <SelectTrigger className="h-7 text-xs bg-[#232b2f] border-[#37474f] text-white w-24 shrink-0">
                  <SelectValue placeholder="Оценка" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e2529] border-[#37474f]">
                  <SelectItem value="none" className="text-white">
                    Без оценки
                  </SelectItem>
                  {[1, 2, 3, 4, 5].map(g => (
                    <SelectItem
                      key={g}
                      value={g.toString()}
                      className="text-white"
                    >
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Удалить назначенный Jupyter-ноутбук?")) {
                    unassignMutation.mutate({ assignmentId: notebook.id });
                  }
                }}
                disabled={unassignMutation.isPending}
                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors shrink-0"
                title="Удалить"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          Нет ноутбуков с выбранным статусом
        </p>
      )}
    </div>
  );
}

function AssignedLabWorksManager({
  enrollmentId,
  isOpen,
}: {
  enrollmentId: number;
  isOpen: boolean;
}) {
  const utils = trpc.useUtils();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedLabWorkId, setSelectedLabWorkId] = useState<number | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<"assigned" | "completed">(
    "assigned"
  );

  const { data: assignedLabs, isLoading } =
    trpc.enrollment.listAssignedLabWorks.useQuery(
      { enrollmentId },
      { enabled: isOpen }
    );
  const { data: allLabWorks } = trpc.virtualLab.adminListLabWorks.useQuery(
    undefined,
    { enabled: isOpen }
  );

  const assignMutation = trpc.enrollment.assignLabWork.useMutation({
    onSuccess: () => {
      toast("Лабораторная работа назначена");
      utils.enrollment.listAssignedLabWorks.invalidate({ enrollmentId });
      utils.student.getMyAssignedLabWorks.invalidate();
      setAddDialogOpen(false);
      setSelectedLabWorkId(null);
    },
    onError: err => toast(err.message),
  });

  const unassignMutation = trpc.enrollment.unassignLabWork.useMutation({
    onSuccess: () => {
      toast("Назначение удалено");
      utils.enrollment.listAssignedLabWorks.invalidate({ enrollmentId });
      utils.student.getMyAssignedLabWorks.invalidate();
    },
    onError: err => toast(err.message),
  });

  const updateMutation = trpc.enrollment.updateAssignedLabWork.useMutation({
    onSuccess: () => {
      utils.enrollment.listAssignedLabWorks.invalidate({ enrollmentId });
      utils.student.getMyAssignedLabWorks.invalidate();
    },
    onError: err => toast(err.message),
  });

  const availableLabWorks =
    allLabWorks?.filter(
      lw => !assignedLabs?.some(a => a.labWorkId === lw.id)
    ) ?? [];

  const assignedCount =
    assignedLabs?.filter(l => l.status === "assigned").length ?? 0;
  const completedCount =
    assignedLabs?.filter(l => l.status === "completed").length ?? 0;

  const filteredLabs =
    assignedLabs?.filter(l => l.status === statusFilter) ?? [];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
          <Beaker className="h-3.5 w-3.5" />
          Назначенные лабораторные работы
        </h4>
        <div className="flex items-center gap-2">
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="text-xs flex items-center gap-1 text-[#2eff8c] hover:text-[#26d97a] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Добавить лабораторную
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#1e2529] border-[#37474f] text-white sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Назначить лабораторную работу</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <Select
                  value={selectedLabWorkId?.toString() ?? ""}
                  onValueChange={v => setSelectedLabWorkId(Number(v))}
                >
                  <SelectTrigger className="bg-[#263238] border-[#37474f]">
                    <SelectValue placeholder="Выберите лабораторную работу..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e2529] border-[#37474f] max-h-80">
                    {availableLabWorks.map(lw => (
                      <SelectItem
                        key={lw.id}
                        value={lw.id.toString()}
                        className="text-white"
                      >
                        <span className="truncate">{lw.title}</span>
                        <span className="ml-2 text-xs text-slate-500">
                          {lw.categoryTitle ?? "Без категории"}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  className="w-full bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]"
                  disabled={!selectedLabWorkId || assignMutation.isPending}
                  onClick={() => {
                    if (selectedLabWorkId) {
                      assignMutation.mutate({
                        enrollmentId,
                        labWorkId: selectedLabWorkId,
                      });
                    }
                  }}
                >
                  {assignMutation.isPending ? "Назначаем..." : "Назначить"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <ToggleGroup
            type="single"
            variant="outline"
            value={statusFilter}
            onValueChange={val =>
              setStatusFilter((val as "assigned") ?? "assigned")
            }
            className="bg-[#1a2024]"
          >
            <ToggleGroupItem
              value="assigned"
              className="group text-xs h-7 px-2.5 text-slate-300 border-[#37474f] data-[state=on]:bg-[#2eff8c] data-[state=on]:text-[#0d1117] data-[state=on]:border-[#2eff8c] gap-1.5"
            >
              Назначена
              <span className="inline-flex items-center justify-center min-w-[1.25rem] h-4 px-1 rounded-full bg-[#37474f] text-[10px] text-white group-data-[state=on]:bg-[#0d1117]/30">
                {assignedCount}
              </span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="completed"
              className="group text-xs h-7 px-2.5 text-slate-300 border-[#37474f] data-[state=on]:bg-[#2eff8c] data-[state=on]:text-[#0d1117] data-[state=on]:border-[#2eff8c] gap-1.5"
            >
              Выполнена
              <span className="inline-flex items-center justify-center min-w-[1.25rem] h-4 px-1 rounded-full bg-[#37474f] text-[10px] text-white group-data-[state=on]:bg-[#0d1117]/30">
                {completedCount}
              </span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-1.5">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-10 bg-[#37474f]" />
          ))}
        </div>
      ) : filteredLabs.length > 0 ? (
        <div className="grid gap-1.5">
          {filteredLabs.map((lab, idx) => (
            <div
              key={lab.id}
              className="flex items-center gap-2 px-3 py-2 bg-[#1a2024] rounded-md border border-[#2a3338] hover:border-[#37474f] transition-colors"
            >
              <span className="text-xs font-medium text-slate-500 w-5 shrink-0">
                {idx + 1}.
              </span>
              <a
                href={`/#/labs/work/${lab.labSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-0 flex items-center gap-2 group"
              >
                <span className="text-sm text-white group-hover:text-[#2eff8c] transition-colors truncate">
                  {lab.labTitle}
                </span>
                <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-[#2eff8c] shrink-0" />
              </a>
              <Select
                value={lab.status}
                onValueChange={val =>
                  updateMutation.mutate({
                    assignmentId: lab.id,
                    status: val as "assigned" | "completed",
                  })
                }
                disabled={updateMutation.isPending}
              >
                <SelectTrigger className="h-7 text-xs bg-[#232b2f] border-[#37474f] text-white w-32 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1e2529] border-[#37474f]">
                  <SelectItem value="assigned" className="text-white">
                    Назначена
                  </SelectItem>
                  <SelectItem value="completed" className="text-white">
                    Выполнена
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={lab.grade?.toString() ?? "none"}
                onValueChange={val =>
                  updateMutation.mutate({
                    assignmentId: lab.id,
                    grade: val === "none" ? null : Number(val),
                  })
                }
                disabled={updateMutation.isPending}
              >
                <SelectTrigger className="h-7 text-xs bg-[#232b2f] border-[#37474f] text-white w-24 shrink-0">
                  <SelectValue placeholder="Оценка" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e2529] border-[#37474f]">
                  <SelectItem value="none" className="text-white">
                    Без оценки
                  </SelectItem>
                  {[1, 2, 3, 4, 5].map(g => (
                    <SelectItem
                      key={g}
                      value={g.toString()}
                      className="text-white"
                    >
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Удалить назначенную лабораторную работу?")) {
                    unassignMutation.mutate({ assignmentId: lab.id });
                  }
                }}
                disabled={unassignMutation.isPending}
                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors shrink-0"
                title="Удалить"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          Нет лабораторных работ с выбранным статусом
        </p>
      )}
    </div>
  );
}

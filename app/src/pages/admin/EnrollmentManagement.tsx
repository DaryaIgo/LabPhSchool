/**
 * Enrollment Management — Admin GUI for managing student course access & progress
 */

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  ClipboardList,
  Plus,
  Trash2,
  PauseCircle,
  PlayCircle,
  ChevronDown,
  Settings,
  CheckCircle2,
  BookOpen,
  Beaker,
  FileText,
  GraduationCap,
  Save,
  X,
  Eye,
  EyeOff,
  Circle,
  Clock,
} from "lucide-react";

const ENROLLMENT_STATUS_COLORS: Record<string, string> = {
  active: "bg-green-600 text-white hover:bg-green-700",
  completed: "bg-blue-600 text-white hover:bg-blue-700",
  suspended: "bg-red-600 text-white hover:bg-red-700",
};

const SUBTOPIC_STATUS_COLORS: Record<string, string> = {
  not_started: "bg-[#434e54] text-[#c8cdd1] border-[#434e54]",
  in_progress: "bg-[#01acff]/20 text-[#01acff] border-[#01acff]/40",
  completed: "bg-[#2eff8c]/20 text-[#2eff8c] border-[#2eff8c]/40",
};

const SUBTOPIC_STATUS_LABELS: Record<string, string> = {
  not_started: "Не начато",
  in_progress: "Изучается",
  completed: "Завершено",
};

export default function EnrollmentManagement() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });

  const utils = trpc.useUtils();

  const [expandedStudent, setExpandedStudent] = useState<number | null>(null);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);

  const { data: students, isLoading: studentsLoading } =
    trpc.student.list.useQuery(
      { page: 1, pageSize: 100 },
      { enabled: !!user && user.role === "admin" }
    );

  const { data: topics } = trpc.admin.listTopics.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const enrollMutation = trpc.enrollment.enroll.useMutation({
    onSuccess: () => {
      toast("Ученик записан на тему");
      utils.enrollment.listForStudent.invalidate();
      setEnrollOpen(false);
      setSelectedTopicId(null);
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-7 w-7 text-[#2eff8c]" />
          <div>
            <h1 className="text-2xl font-bold">Управление доступом к курсу</h1>
            <p className="text-sm text-gray-400">
              Открывайте темы, управляйте прогрессом и комментариями
            </p>
          </div>
        </div>
      </div>

      {studentsLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 bg-[#37474f]" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {students?.users.map((student) => (
            <Card
              key={student.id}
              className="bg-[#1e2529] border-[#37474f]"
            >
              <CardContent className="p-4">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() =>
                    setExpandedStudent(
                      expandedStudent === student.id ? null : student.id
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <ChevronDown
                      className={`h-4 w-4 text-gray-400 transition-transform ${
                        expandedStudent === student.id ? "rotate-180" : ""
                      }`}
                    />
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-xs text-gray-400">
                        {student.login} ·
                        <Badge
                          className="ml-2 text-xs"
                          variant={
                            student.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {student.status}
                        </Badge>
                      </p>
                    </div>
                  </div>
                  <Dialog
                    open={enrollOpen && selectedStudentId === student.id}
                    onOpenChange={(open) => {
                      setEnrollOpen(open);
                      if (open) setSelectedStudentId(student.id);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudentId(student.id);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Открыть тему
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#1e2529] border-[#37474f] text-white">
                      <DialogHeader>
                        <DialogTitle>
                          Открыть тему для {student.name}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <Select
                          value={selectedTopicId?.toString() ?? ""}
                          onValueChange={(v) =>
                            setSelectedTopicId(Number(v))
                          }
                        >
                          <SelectTrigger className="bg-[#263238] border-[#37474f]">
                            <SelectValue placeholder="Выберите тему..." />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1e2529] border-[#37474f]">
                            {topics?.map((t) => (
                              <SelectItem
                                key={t.id}
                                value={t.id.toString()}
                              >
                                {t.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          className="w-full bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]"
                          disabled={!selectedTopicId || enrollMutation.isPending}
                          onClick={() => {
                            if (selectedTopicId && selectedStudentId) {
                              enrollMutation.mutate({
                                studentId: selectedStudentId,
                                topicId: selectedTopicId,
                              });
                            }
                          }}
                        >
                          {enrollMutation.isPending
                            ? "Открываем..."
                            : "Подтвердить"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {expandedStudent === student.id && (
                  <StudentEnrollments
                    studentId={student.id}
                    onUnenroll={(id) => unenrollMutation.mutate({ enrollmentId: id })}
                    onUpdateStatus={(id, status) =>
                      updateStatusMutation.mutate({ enrollmentId: id, status })
                    }
                    isPending={
                      unenrollMutation.isPending || updateStatusMutation.isPending
                    }
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
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
  onUpdateStatus: (id: number, status: "active" | "completed" | "suspended") => void;
  isPending: boolean;
}) {
  const { data: enrollments, isLoading } =
    trpc.enrollment.listForStudent.useQuery({ studentId });

  const [expandedEnrollment, setExpandedEnrollment] = useState<number | null>(null);
  const [editEnrollment, setEditEnrollment] = useState<number | null>(null);
  const [currentSubtopicId, setCurrentSubtopicId] = useState<string>("");
  const [comment, setComment] = useState("");

  const utils = trpc.useUtils();

  const updateDetailsMutation = trpc.enrollment.updateDetails.useMutation({
    onSuccess: () => {
      toast("Данные обновлены");
      utils.enrollment.listForStudent.invalidate({ studentId });
      setEditEnrollment(null);
    },
    onError: (err) => toast(err.message),
  });

  const { data: allSubtopics } = trpc.course.listSubtopics.useQuery();
  const { data: allLabs } = trpc.course.labs.useQuery();

  if (isLoading) {
    return (
      <div className="mt-4 pl-8">
        <Skeleton className="h-8 bg-[#37474f]" />
      </div>
    );
  }

  if (!enrollments?.length) {
    return (
      <p className="mt-4 pl-8 text-sm text-gray-500">
        У ученика пока нет открытых тем
      </p>
    );
  }

  return (
    <div className="mt-4 pl-8 space-y-3">
      {enrollments.map((e) => (
        <div key={e.id} className="space-y-2">
          {/* Enrollment header */}
          <div className="flex items-center justify-between py-2 px-3 bg-[#263238] rounded-lg">
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: e.topicColor ?? "#2eff8c" }}
              />
              <span className="text-sm font-medium truncate">{e.topicTitle}</span>
              <Badge
                className={`${ENROLLMENT_STATUS_COLORS[e.status]} text-[10px] shrink-0`}
              >
                {e.status === "active" && "Активна"}
                {e.status === "completed" && "Завершена"}
                {e.status === "suspended" && "Приостановлена"}
              </Badge>
              {e.currentSubtopicId && allSubtopics && (
                <Badge className="bg-[#01acff]/20 text-[#01acff] text-[10px] shrink-0">
                  <GraduationCap size={10} className="mr-1" />
                  {allSubtopics.find((s) => s.id === e.currentSubtopicId)?.title ?? `ID ${e.currentSubtopicId}`}
                </Badge>
              )}
              {e.comment && (
                <span className="text-xs text-[#798389] truncate max-w-[180px] hidden lg:inline">
                  {e.comment}
                </span>
              )}
            </div>
            <div className="flex gap-1 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Настройки"
                onClick={() => {
                  setEditEnrollment(editEnrollment === e.id ? null : e.id);
                  setCurrentSubtopicId(e.currentSubtopicId?.toString() ?? "none");
                  setComment(e.comment ?? "");
                }}
              >
                <Settings className="h-4 w-4 text-[#c8cdd1]" />
              </Button>
              {e.status === "active" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="Приостановить"
                  onClick={() => onUpdateStatus(e.id, "suspended")}
                  disabled={isPending}
                >
                  <PauseCircle className="h-4 w-4 text-yellow-400" />
                </Button>
              ) : e.status === "suspended" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="Активировать"
                  onClick={() => onUpdateStatus(e.id, "active")}
                  disabled={isPending}
                >
                  <PlayCircle className="h-4 w-4 text-green-400" />
                </Button>
              ) : null}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Удалить доступ"
                onClick={() => {
                  if (confirm("Удалить доступ к этой теме?")) {
                    onUnenroll(e.id);
                  }
                }}
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </div>
          </div>

          {/* Edit enrollment details */}
          {editEnrollment === e.id && (
            <div className="px-3 py-3 bg-[#1e2529] rounded-lg border border-[#37474f] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#798389] mb-1 block">
                    Текущая подтема
                  </label>
                  <Select
                    value={currentSubtopicId}
                    onValueChange={setCurrentSubtopicId}
                  >
                    <SelectTrigger className="bg-[#263238] border-[#37474f] text-white text-sm">
                      <SelectValue placeholder="Выберите подтему..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e2529] border-[#37474f]">
                      <SelectItem value="none">Не назначена</SelectItem>
                      {allSubtopics
                        ?.filter((s) => s.topicId === e.topicId)
                        .map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-[#798389] mb-1 block">
                    Комментарий для ученика
                  </label>
                  <Input
                    value={comment}
                    onChange={(ev) => setComment(ev.target.value)}
                    placeholder="Например, изучить к следующему занятию..."
                    className="bg-[#263238] border-[#37474f] text-white text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]"
                  disabled={updateDetailsMutation.isPending}
                  onClick={() => {
                    updateDetailsMutation.mutate({
                      enrollmentId: e.id,
                      currentSubtopicId: currentSubtopicId && currentSubtopicId !== "none"
                        ? Number(currentSubtopicId)
                        : null,
                      comment: comment || undefined,
                    });
                  }}
                >
                  <Save className="h-3.5 w-3.5 mr-1" />
                  Сохранить
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditEnrollment(null)}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Отмена
                </Button>
              </div>
            </div>
          )}

          {/* Subtopic progress manager */}
          <div className="px-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-between border-[#37474f] bg-[#1e2529] hover:bg-[#263238] hover:text-[#2eff8c] text-[#c8cdd1] text-xs h-8"
              onClick={() =>
                setExpandedEnrollment(
                  expandedEnrollment === e.id ? null : e.id
                )
              }
            >
              <span className="flex items-center gap-2">
                {expandedEnrollment === e.id ? (
                  <EyeOff size={14} />
                ) : (
                  <Eye size={14} />
                )}
                {expandedEnrollment === e.id
                  ? "Скрыть темы раздела"
                  : "Управлять темами и прогрессом"}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${
                  expandedEnrollment === e.id ? "rotate-180" : ""
                }`}
              />
            </Button>

            {expandedEnrollment === e.id && (
              <SubtopicProgressManager
                studentId={studentId}
                topicId={e.topicId}
                labs={allLabs?.filter((l) => l.topicId === e.topicId) ?? []}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function SubtopicProgressManager({
  studentId,
  topicId,
  labs,
}: {
  studentId: number;
  topicId: number;
  labs: { id: number; title: string; slug: string; shortDesc: string | null }[];
}) {
  const { data: progress, isLoading } = trpc.student.getTopicProgress.useQuery(
    { studentId, topicId }
  );
  const utils = trpc.useUtils();

  const updateProgress = trpc.student.updateProgress.useMutation({
    onSuccess: () => {
      toast("Прогресс обновлён");
      utils.student.getTopicProgress.invalidate({ studentId, topicId });
      utils.student.getProfile.invalidate();
      utils.student.getLearningPath.invalidate();
    },
    onError: (err) => toast(err.message),
  });

  if (isLoading) {
    return (
      <div className="mt-2 space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 bg-[#37474f]" />
        ))}
      </div>
    );
  }

  if (!progress?.length) {
    return (
      <div className="mt-2 p-3 bg-[#1e2529] rounded-lg border border-[#37474f] text-sm text-[#798389]">
        В этом разделе пока нет подтем
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      {progress.map((sub) => (
        <div
          key={sub.subtopicId}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 px-3 bg-[#1e2529] rounded-lg border border-[#37474f]"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium truncate">{sub.title}</span>
            <Badge className={`${SUBTOPIC_STATUS_COLORS[sub.status]} text-[10px] border`}>
              {SUBTOPIC_STATUS_LABELS[sub.status]}
            </Badge>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Theory toggle */}
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 w-7 p-0 rounded-md ${
                sub.theoryCompleted
                  ? "bg-[#2eff8c]/10 text-[#2eff8c]"
                  : "text-[#434e54] hover:text-[#c8cdd1]"
              }`}
              title="Теория"
              onClick={() =>
                updateProgress.mutate({
                  studentId,
                  subtopicId: sub.subtopicId,
                  theoryCompleted: !sub.theoryCompleted,
                })
              }
            >
              <BookOpen size={14} />
            </Button>

            {/* Practice toggle */}
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 w-7 p-0 rounded-md ${
                sub.practiceCompleted
                  ? "bg-[#01acff]/10 text-[#01acff]"
                  : "text-[#434e54] hover:text-[#c8cdd1]"
              }`}
              title="Практика"
              onClick={() =>
                updateProgress.mutate({
                  studentId,
                  subtopicId: sub.subtopicId,
                  practiceCompleted: !sub.practiceCompleted,
                })
              }
            >
              <FileText size={14} />
            </Button>

            {/* Lab toggle */}
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 w-7 p-0 rounded-md ${
                sub.labCompleted
                  ? "bg-[#ffcb3d]/10 text-[#ffcb3d]"
                  : "text-[#434e54] hover:text-[#c8cdd1]"
              }`}
              title="Лабораторная"
              onClick={() =>
                updateProgress.mutate({
                  studentId,
                  subtopicId: sub.subtopicId,
                  labCompleted: !sub.labCompleted,
                })
              }
            >
              <Beaker size={14} />
            </Button>

            <div className="w-px h-4 bg-[#37474f]" />

            {/* Status dropdown */}
            <Select
              value={sub.status}
              onValueChange={(val) =>
                updateProgress.mutate({
                  studentId,
                  subtopicId: sub.subtopicId,
                  status: val as "not_started" | "in_progress" | "completed",
                })
              }
            >
              <SelectTrigger className="h-7 w-[120px] text-[10px] bg-[#263238] border-[#37474f] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1e2529] border-[#37474f]">
                <SelectItem value="not_started">
                  <span className="flex items-center gap-1.5 text-xs">
                    <Circle size={12} className="text-[#434e54]" />
                    Не начато
                  </span>
                </SelectItem>
                <SelectItem value="in_progress">
                  <span className="flex items-center gap-1.5 text-xs">
                    <Clock size={12} className="text-[#01acff]" />
                    Изучается
                  </span>
                </SelectItem>
                <SelectItem value="completed">
                  <span className="flex items-center gap-1.5 text-xs">
                    <CheckCircle2 size={12} className="text-[#2eff8c]" />
                    Завершено
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ))}

      {/* Labs */}
      {labs.length > 0 && (
        <div className="mt-2 space-y-1">
          <p className="text-xs text-[#798389] px-1">Лабораторные работы</p>
          {labs.map((lab) => (
            <div
              key={lab.id}
              className="flex items-center gap-3 py-2 px-3 bg-[#263238]/50 rounded-lg border border-[#37474f]/50"
            >
              <Beaker size={14} className="text-[#2eff8c] shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm truncate">{lab.title}</span>
                {lab.shortDesc && (
                  <p className="text-xs text-[#798389]">{lab.shortDesc}</p>
                )}
              </div>
              <a
                href={`/#/labs/${lab.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#01acff] hover:underline shrink-0"
              >
                Открыть
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

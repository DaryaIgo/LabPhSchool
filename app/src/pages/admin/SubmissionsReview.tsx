import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import MarkdownRenderer from "@/components/MarkdownRenderer";

import {
  FlaskConical,
  FileText,
  NotebookPen,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Star,
  MessageSquare,
  CheckCircle2,
  User,
  Calendar,
  ImageIcon,
  Link2,
  ExternalLink,
} from "lucide-react";

type SubmissionType = "lab" | "problem" | "jupyter_notebook";

interface LabSubmissionItem {
  type: "lab";
  id: number;
  status: string;
  grade: number | null;
  teacherComment: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  updatedAt: Date;
  studentId: number;
  studentName: string | null;
  studentLogin: string;
  labWorkId: number;
  labWorkTitle: string;
  labWorkSlug: string;
}

interface ProblemSubmissionItem {
  type: "problem";
  id: number;
  status: string;
  grade: number | null;
  teacherComment: string | null;
  submittedAt: Date | null;
  completedAt: Date | null;
  updatedAt: Date;
  studentId: number;
  studentName: string | null;
  studentLogin: string;
  problemId: number;
  problemTitle: string;
  problemSlug: string;
}

interface NotebookSubmissionItem {
  type: "jupyter_notebook";
  id: number;
  status: string;
  grade: number | null;
  teacherComment: string | null;
  submittedAt: Date | null;
  completedAt: Date | null;
  updatedAt: Date;
  studentId: number;
  studentName: string | null;
  studentLogin: string;
  notebookId: number;
  notebookTitle: string;
  studentColabUrl: string | null;
}

type SubmissionItem =
  | LabSubmissionItem
  | ProblemSubmissionItem
  | NotebookSubmissionItem;

const STATUS_LABELS: Record<string, string> = {
  submitted: "На проверке",
  completed: "Принято",
};

const STATUS_COLORS: Record<string, string> = {
  submitted: "bg-[#ffc832] text-[#0d1117]",
  completed: "bg-[#2eff8c] text-[#0d1117]",
};

const TYPE_LABELS: Record<SubmissionType | "all", string> = {
  all: "Все",
  lab: "Лабораторная",
  problem: "Задача",
  jupyter_notebook: "Jupyter-ноутбук",
};

export default function SubmissionsReview() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("submitted");
  const [typeFilter, setTypeFilter] = useState<"all" | SubmissionType>("all");
  const [search, setSearch] = useState("");
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [grade, setGrade] = useState<string>("");
  const [comment, setComment] = useState("");

  const pageSize = 15;

  const { data, isLoading } = trpc.admin.getSubmissions.useQuery(
    {
      status: statusFilter as "submitted" | "completed",
      type: typeFilter,
      search: search || undefined,
      page,
      pageSize,
    },
    { enabled: !!user && user.role === "admin" }
  );

  const { data: detailData } = trpc.admin.getSubmissionById.useQuery(
    {
      type: selectedSubmission?.type ?? "lab",
      id: selectedSubmission?.id ?? 0,
    },
    { enabled: !!selectedSubmission && detailOpen }
  );

  const gradeMutation = trpc.admin.gradeSubmission.useMutation({
    onSuccess: () => {
      toast.success("Оценка сохранена");
      utils.admin.getSubmissions.invalidate();
      utils.admin.getSubmissionById.invalidate();
      utils.enrollment.listAssignedLabWorks.invalidate();
      utils.enrollment.listAssignedProblems.invalidate();
      utils.enrollment.listAssignedJupyterNotebooks.invalidate();
      utils.student.getMyAssignedLabWorks.invalidate();
      utils.student.getMyAssignedProblems.invalidate();
      utils.student.getMyJupyterNotebooks.invalidate();
      setDetailOpen(false);
      setSelectedSubmission(null);
    },
    onError: err => toast.error(err.message),
  });

  const handleGrade = () => {
    if (!selectedSubmission) return;
    gradeMutation.mutate({
      type: selectedSubmission.type,
      id: selectedSubmission.id,
      grade: grade ? Number(grade) : undefined,
      teacherComment: comment || undefined,
      status: "completed",
    });
  };

  const handleOpenDetail = (submission: SubmissionItem) => {
    setSelectedSubmission(submission);
    setGrade(submission.grade?.toString() ?? "");
    setComment(submission.teacherComment ?? "");
    setDetailOpen(true);
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <CheckCircle2 className="h-8 w-8 text-[#2eff8c]" />
        <div>
          <h1 className="text-2xl font-bold">Проверка работ</h1>
          <p className="text-sm text-gray-400">
            Просмотр, оценка и комментирование лабораторных работ и задач
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Поиск по студенту или работе..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 bg-[#1e2529] border-[#37474f] text-white"
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={val => {
            setTypeFilter(val as "all" | SubmissionType);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px] bg-[#1e2529] border-[#37474f] text-white">
            <SelectValue placeholder="Тип" />
          </SelectTrigger>
          <SelectContent className="bg-[#1e2529] border-[#37474f]">
            <SelectItem value="all">Все работы</SelectItem>
            <SelectItem value="lab">Лабораторные</SelectItem>
            <SelectItem value="problem">Задачи</SelectItem>
            <SelectItem value="jupyter_notebook">Jupyter-ноутбуки</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-[#1e2529] border-[#37474f] text-white">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent className="bg-[#1e2529] border-[#37474f]">
            <SelectItem value="submitted">На проверке</SelectItem>
            <SelectItem value="completed">Принято</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="bg-[#1e2529] border-[#37474f]">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 bg-[#37474f]" />
              ))}
            </div>
          ) : data?.items.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <FileText className="h-12 w-12 mx-auto mb-4 text-[#37474f]" />
              <p>Работы не найдены</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#37474f]">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">
                      Студент
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">
                      Тип
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">
                      Работа
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">
                      Статус
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">
                      Оценка
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">
                      Обновлено
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data?.items.map(item => (
                    <tr
                      key={`${item.type}-${item.id}`}
                      className="border-b border-[#2a3237] hover:bg-[#263238] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-[#5c6b73]" />
                          <div>
                            <div className="text-sm font-medium text-white">
                              {item.studentName || item.studentLogin}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.studentLogin}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm text-gray-300">
                          {item.type === "lab" ? (
                            <FlaskConical className="h-4 w-4 text-[#2eff8c]" />
                          ) : item.type === "problem" ? (
                            <FileText className="h-4 w-4 text-[#01acff]" />
                          ) : (
                            <NotebookPen className="h-4 w-4 text-[#2eff8c]" />
                          )}
                          {TYPE_LABELS[item.type]}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-white">
                          {item.type === "lab"
                            ? item.labWorkTitle
                            : item.type === "problem"
                              ? item.problemTitle
                              : item.notebookTitle}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.type === "lab"
                            ? item.labWorkSlug
                            : item.type === "problem"
                              ? item.problemSlug
                              : "Jupyter-ноутбук"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={`${STATUS_COLORS[item.status] ?? "bg-gray-600"} text-xs`}
                        >
                          {STATUS_LABELS[item.status] ?? item.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {item.grade ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-[#ffc832] fill-[#ffc832]" />
                            <span className="text-sm font-bold text-white">
                              {item.grade}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="h-3 w-3" />
                          {new Date(item.updatedAt).toLocaleDateString("ru-RU")}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleOpenDetail(item as SubmissionItem)
                          }
                          className="text-[#2eff8c] hover:text-[#25cc70] hover:bg-[#2eff8c]/10"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Просмотр
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#37474f]">
              <div className="text-sm text-gray-400">
                Страница {data.page} из {data.totalPages} ({data.total} всего)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="bg-[#1e2529] border-[#37474f] text-white hover:bg-[#263238]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                  disabled={page >= data.totalPages}
                  className="bg-[#1e2529] border-[#37474f] text-white hover:bg-[#263238]"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl bg-[#1e2529] border-[#37474f] text-white max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              {selectedSubmission?.type === "lab" ? (
                <FlaskConical className="h-6 w-6 text-[#2eff8c]" />
              ) : selectedSubmission?.type === "problem" ? (
                <FileText className="h-6 w-6 text-[#01acff]" />
              ) : (
                <NotebookPen className="h-6 w-6 text-[#2eff8c]" />
              )}
              {selectedSubmission?.type === "lab"
                ? (detailData?.labWorkTitle ?? selectedSubmission?.labWorkTitle)
                : selectedSubmission?.type === "problem"
                  ? (detailData?.problemTitle ??
                    selectedSubmission?.problemTitle)
                  : (detailData?.notebookTitle ??
                    selectedSubmission?.notebookTitle)}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {detailData?.studentName || detailData?.studentLogin} (
              {detailData?.studentLogin})
            </DialogDescription>
          </DialogHeader>

          {detailData && (
            <div className="space-y-6">
              {/* Status & Dates */}
              <div className="flex flex-wrap gap-3">
                <Badge
                  className={`${STATUS_COLORS[String(detailData.status)] ?? ""}`}
                >
                  {STATUS_LABELS[String(detailData.status)] ??
                    String(detailData.status)}
                </Badge>
                {detailData.grade && (
                  <Badge className="bg-[#ffc832] text-[#0d1117]">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Оценка: {detailData.grade}
                  </Badge>
                )}
                <Badge className="bg-[#1e2529] border border-[#37474f] text-gray-300">
                  {TYPE_LABELS[detailData.type]}
                </Badge>
              </div>

              {/* Lab content */}
              {detailData.type === "lab" && (
                <>
                  {Array.isArray(detailData.measurements) &&
                    detailData.measurements.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-[#2eff8c] mb-2 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Измерения
                        </h4>
                        <div className="bg-[#0d1117] border border-[#37474f] rounded-lg overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-[#37474f]">
                                {Object.keys(
                                  detailData.measurements[0] as Record<
                                    string,
                                    unknown
                                  >
                                ).map(key => (
                                  <th
                                    key={key}
                                    className="px-3 py-2 text-left text-xs text-gray-400 uppercase"
                                  >
                                    {key}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {(
                                detailData.measurements as Record<
                                  string,
                                  unknown
                                >[]
                              ).map((row, i) => (
                                <tr
                                  key={i}
                                  className="border-b border-[#2a3237]"
                                >
                                  {Object.values(row).map((val, j) => (
                                    <td
                                      key={j}
                                      className="px-3 py-2 text-[#c8cdd1]"
                                    >
                                      {String(val)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                  {detailData.conclusion && (
                    <div>
                      <h4 className="text-sm font-semibold text-[#2eff8c] mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Вывод студента
                      </h4>
                      <div className="bg-[#0d1117] border border-[#37474f] rounded-lg p-4 text-sm text-[#c8cdd1] whitespace-pre-wrap">
                        {detailData.conclusion}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Problem content */}
              {detailData.type === "problem" && (
                <>
                  <div>
                    <h4 className="text-sm font-semibold text-[#01acff] mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Условие задачи
                    </h4>
                    <div className="bg-[#0d1117] border border-[#37474f] rounded-lg p-4">
                      <MarkdownRenderer content={detailData.problemCondition} />
                    </div>
                  </div>

                  {detailData.studentAnswer && (
                    <div>
                      <h4 className="text-sm font-semibold text-[#2eff8c] mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Ответ студента
                      </h4>
                      <div className="bg-[#0d1117] border border-[#37474f] rounded-lg p-4 text-sm text-[#c8cdd1] whitespace-pre-wrap">
                        {detailData.studentAnswer}
                      </div>
                    </div>
                  )}

                  {detailData.solutionImageUrl && (
                    <div>
                      <h4 className="text-sm font-semibold text-[#2eff8c] mb-2 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Фото решения
                      </h4>
                      <a
                        href={detailData.solutionImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={detailData.solutionImageUrl}
                          alt="Решение студента"
                          className="max-h-96 rounded-lg border border-[#37474f] hover:border-[#2eff8c] transition-colors"
                        />
                      </a>
                    </div>
                  )}
                </>
              )}

              {/* Notebook content */}
              {detailData.type === "jupyter_notebook" && (
                <>
                  {detailData.studentColabUrl ? (
                    <div>
                      <h4 className="text-sm font-semibold text-[#01acff] mb-2 flex items-center gap-2">
                        <Link2 className="h-4 w-4" />
                        Работа студента в Google Colab
                      </h4>
                      <div className="bg-[#0d1117] border border-[#37474f] rounded-lg p-4">
                        <a
                          href={detailData.studentColabUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[#2eff8c] hover:underline break-all"
                        >
                          {detailData.studentColabUrl}
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#1e2529] border border-[#37474f] rounded-lg p-4">
                      <p className="text-sm text-[#798389] flex items-center gap-2">
                        <Link2 className="h-4 w-4" />
                        Студент не прикрепил ссылку
                      </p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-semibold text-[#2eff8c] mb-2 flex items-center gap-2">
                      <NotebookPen className="h-4 w-4" />
                      Исходный ноутбук
                    </h4>
                    <div className="bg-[#0d1117] border border-[#37474f] rounded-lg p-4 text-sm text-[#c8cdd1]">
                      {detailData.notebookFilename}
                    </div>
                  </div>
                </>
              )}

              {/* Existing teacher comment */}
              {detailData.teacherComment && (
                <div>
                  <h4 className="text-sm font-semibold text-[#01acff] mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Комментарий преподавателя
                  </h4>
                  <div className="bg-[#0d1117] border border-[#37474f] rounded-lg p-4 text-sm text-[#c8cdd1] whitespace-pre-wrap">
                    {detailData.teacherComment}
                  </div>
                </div>
              )}

              {/* Grade Form */}
              <div className="border-t border-[#37474f] pt-4 space-y-4">
                <h4 className="text-sm font-semibold text-white">
                  Оценка работы
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-400 mb-2 block">
                      Оценка (1–5)
                    </Label>
                    <Select value={grade} onValueChange={setGrade}>
                      <SelectTrigger className="bg-[#0d1117] border-[#37474f] text-white">
                        <SelectValue placeholder="Выберите оценку" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1e2529] border-[#37474f]">
                        {[1, 2, 3, 4, 5].map(n => (
                          <SelectItem key={n} value={String(n)}>
                            {n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-400 mb-2 block">
                    Комментарий
                  </Label>
                  <Textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Ваш комментарий к работе..."
                    rows={4}
                    className="bg-[#0d1117] border-[#37474f] text-white resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleGrade}
                    disabled={gradeMutation.isPending}
                    className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#25cc70]"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {gradeMutation.isPending
                      ? "Сохранение..."
                      : "Сохранить оценку"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDetailOpen(false)}
                    className="border-[#37474f] text-white hover:bg-[#263238]"
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

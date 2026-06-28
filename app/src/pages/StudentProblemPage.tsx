import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import {
  FileText,
  Upload,
  Send,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ImageIcon,
} from "lucide-react";

export default function StudentProblemPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [answer, setAnswer] = useState("");
  const [solutionImageUrl, setSolutionImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const id = Number(assignmentId);
  const enabled = isAuthenticated && !Number.isNaN(id) && id > 0;

  const { data, isLoading } = trpc.student.getAssignedProblemById.useQuery(
    { id },
    { enabled }
  );

  const utils = trpc.useUtils();

  const submitMutation = trpc.student.submitProblemSolution.useMutation({
    onSuccess: () => {
      toast.success("Решение отправлено на проверку");
      utils.student.getAssignedProblemById.invalidate({ id });
      utils.student.getMyAssignedProblems.invalidate();
    },
    onError: err => toast.error(err.message),
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (json.url) {
        setSolutionImageUrl(json.url);
        toast.success("Фото загружено");
      } else {
        toast.error(json.error ?? "Ошибка загрузки фото");
      }
    } catch {
      toast.error("Ошибка загрузки фото");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) {
      toast.error("Введите ответ");
      return;
    }
    submitMutation.mutate({
      assignmentId: id,
      answer: answer.trim(),
      solutionImageUrl: solutionImageUrl || undefined,
    });
  };

  if (!isAuthenticated || user?.role !== "student") {
    return (
      <div className="min-h-screen bg-[#262e33] pt-24 flex items-center justify-center">
        <p className="text-[#c8cdd1]">Доступ только для учеников</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#262e33] pt-24">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-10 w-2/3 bg-[#37474f] mb-6" />
          <Skeleton className="h-48 bg-[#37474f] mb-6" />
          <Skeleton className="h-32 bg-[#37474f]" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#262e33] pt-24 flex items-center justify-center">
        <p className="text-[#c8cdd1]">Задача не найдена</p>
      </div>
    );
  }

  const isSubmitted =
    data.status === "submitted" || data.status === "completed";

  return (
    <div className="min-h-screen bg-[#262e33] pt-24 pb-12">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-[#798389] hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Назад
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 text-[#798389] text-sm mb-2">
            <FileText size={16} className="text-[#01acff]" />
            <span>Назначенная задача</span>
            {data.status === "submitted" && (
              <span className="ml-2 inline-flex items-center gap-1 text-[#ffc832]">
                <Clock size={14} />
                На проверке
              </span>
            )}
            {data.status === "completed" && (
              <span className="ml-2 inline-flex items-center gap-1 text-[#2eff8c]">
                <CheckCircle2 size={14} />
                Проверено
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {data.problemTitle}
          </h1>
        </div>

        <Card className="bg-[#2a3237] border-[#37474f] mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Условие задачи
            </h2>
            <MarkdownRenderer content={data.problemCondition} />
          </CardContent>
        </Card>

        {isSubmitted ? (
          <Card className="bg-[#2a3237] border-[#37474f]">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-lg font-semibold text-white">
                Отправленное решение
              </h2>

              <div>
                <Label className="text-[#798389] mb-2 block">Ваш ответ</Label>
                <div className="bg-[#1e2529] border border-[#37474f] rounded-lg p-4 text-[#c8cdd1]">
                  {data.studentAnswer ?? "—"}
                </div>
              </div>

              {data.solutionImageUrl && (
                <div>
                  <Label className="text-[#798389] mb-2 block">
                    Фото решения
                  </Label>
                  <a
                    href={data.solutionImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={data.solutionImageUrl}
                      alt="Решение"
                      className="max-h-96 rounded-lg border border-[#37474f] hover:border-[#2eff8c] transition-colors"
                    />
                  </a>
                </div>
              )}

              {data.grade && (
                <div className="flex items-center gap-3 p-4 bg-[#1e2529] rounded-lg border border-[#37474f]">
                  <span className="text-[#798389]">Оценка:</span>
                  <span className="text-2xl font-bold text-[#ffc832]">
                    {data.grade}
                  </span>
                </div>
              )}

              {data.teacherComment && (
                <div>
                  <Label className="text-[#798389] mb-2 block">
                    Комментарий преподавателя
                  </Label>
                  <div className="bg-[#1e2529] border border-[#37474f] rounded-lg p-4 text-[#c8cdd1] whitespace-pre-wrap">
                    {data.teacherComment}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-[#2a3237] border-[#37474f]">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Отправить решение
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="answer" className="text-[#c8cdd1] mb-2 block">
                    Ваш ответ
                  </Label>
                  <Textarea
                    id="answer"
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder="Напишите ответ..."
                    rows={4}
                    className="bg-[#1e2529] border-[#37474f] text-white resize-none"
                    disabled={submitMutation.isPending}
                  />
                </div>

                <div>
                  <Label
                    htmlFor="solution-photo"
                    className="text-[#c8cdd1] mb-2 block"
                  >
                    Фотография решения
                  </Label>
                  <div className="flex items-center gap-3">
                    <Label
                      htmlFor="solution-photo"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#1e2529] border border-[#37474f] rounded-lg text-[#c8cdd1] hover:bg-[#263238] hover:text-white transition-colors"
                    >
                      <Upload size={16} />
                      {uploading
                        ? "Загрузка..."
                        : solutionImageUrl
                          ? "Заменить фото"
                          : "Загрузить фото"}
                    </Label>
                    {solutionImageUrl && (
                      <span className="text-xs text-[#2eff8c] flex items-center gap-1">
                        <ImageIcon size={14} />
                        Фото загружено
                      </span>
                    )}
                  </div>
                  <Input
                    id="solution-photo"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                    onChange={handleFileChange}
                    disabled={uploading || submitMutation.isPending}
                    className="hidden"
                  />
                  {solutionImageUrl && (
                    <div className="mt-4">
                      <a
                        href={solutionImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={solutionImageUrl}
                          alt="Решение"
                          className="max-h-64 rounded-lg border border-[#37474f] hover:border-[#2eff8c] transition-colors"
                        />
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={
                      !answer.trim() || uploading || submitMutation.isPending
                    }
                    className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#25cc70]"
                  >
                    <Send size={16} className="mr-2" />
                    {submitMutation.isPending
                      ? "Отправка..."
                      : "Отправить на проверку"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

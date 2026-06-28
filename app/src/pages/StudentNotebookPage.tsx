import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  NotebookPen,
  Send,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Link2,
  MessageSquare,
  Star,
} from "lucide-react";

export default function StudentNotebookPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [colabUrl, setColabUrl] = useState("");
  const [noUrl, setNoUrl] = useState(false);

  const id = Number(assignmentId);
  const enabled = isAuthenticated && !Number.isNaN(id) && id > 0;

  const { data, isLoading } = trpc.student.getAssignedJupyterNotebookById.useQuery(
    { id },
    { enabled }
  );

  const utils = trpc.useUtils();

  const submitMutation = trpc.student.submitJupyterNotebookSolution.useMutation({
    onSuccess: () => {
      toast.success("Работа отправлена на проверку");
      utils.student.getAssignedJupyterNotebookById.invalidate({ id });
      utils.student.getMyJupyterNotebooks.invalidate();
    },
    onError: err => toast.error(err.message),
  });

  const handleDownload = () => {
    if (!data?.notebookFilePath) return;
    const link = document.createElement("a");
    link.href = `/api/jupyter/download/${data.notebookId}`;
    link.download = data.notebookFilename || "notebook.ipynb";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenColab = () => {
    handleDownload();
    window.open("https://colab.research.google.com", "_blank", "noopener,noreferrer");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    if (noUrl) {
      submitMutation.mutate({ assignmentId: id });
      return;
    }

    const url = colabUrl.trim();
    if (!url) {
      toast.error("Введите ссылку на выполненный ноутбук");
      return;
    }
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      toast.error("Ссылка должна начинаться с http:// или https://");
      return;
    }
    submitMutation.mutate({ assignmentId: id, studentColabUrl: url });
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
        <p className="text-[#c8cdd1]">Ноутбук не найден</p>
      </div>
    );
  }

  const isSubmitted = data.status === "submitted" || data.status === "completed";

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
            <NotebookPen size={16} className="text-[#2eff8c]" />
            <span>Назначенный Jupyter-ноутбук</span>
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
            {data.notebookTitle}
          </h1>
          <p className="text-sm text-[#798389] mt-1">{data.subtopicTitle}</p>
        </div>

        <Card className="bg-[#2a3237] border-[#37474f] mb-6">
          <CardContent className="p-6 space-y-5">
            <h2 className="text-lg font-semibold text-white">Файл ноутбука</h2>
            <p className="text-sm text-[#798389]">
              Скачайте ноутбук, затем откройте его в своём Google Colab, выполните
              задание и вставьте ссылку на готовую работу ниже. Если ссылку
              прикрепить невозможно, отправьте работу без неё — преподаватель
              проверит выполнение отдельно.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleDownload}
                className="bg-[#1e2529] border-[#37474f] text-[#c8cdd1] hover:bg-[#263238] hover:text-white"
              >
                <Download size={16} className="mr-2" />
                Скачать .ipynb
              </Button>
              <Button
                type="button"
                onClick={handleOpenColab}
                className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#25cc70]"
              >
                <ExternalLink size={16} className="mr-2" />
                Открыть в Google Colab
              </Button>
            </div>
          </CardContent>
        </Card>

        {isSubmitted ? (
          <Card className="bg-[#2a3237] border-[#37474f]">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-lg font-semibold text-white">
                Отправленная работа
              </h2>

              {data.studentColabUrl ? (
                <div>
                  <Label className="text-[#798389] mb-2 block flex items-center gap-2">
                    <Link2 size={14} />
                    Ссылка на тетрадь
                  </Label>
                  <a
                    href={data.studentColabUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#01acff] hover:underline break-all"
                  >
                    {data.studentColabUrl}
                    <ExternalLink size={14} />
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-[#798389]">
                  <Link2 size={14} />
                  Ссылка не прикреплена
                </div>
              )}

              {data.grade && (
                <div className="flex items-center gap-3 p-4 bg-[#1e2529] rounded-lg border border-[#37474f]">
                  <Star className="h-5 w-5 text-[#ffc832] fill-[#ffc832]" />
                  <span className="text-[#798389]">Оценка:</span>
                  <span className="text-2xl font-bold text-[#ffc832]">
                    {data.grade}
                  </span>
                </div>
              )}

              {data.teacherComment && (
                <div>
                  <Label className="text-[#798389] mb-2 block flex items-center gap-2">
                    <MessageSquare size={14} />
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
                Отправить выполненную работу
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label
                    htmlFor="colab-url"
                    className="text-[#c8cdd1] mb-2 block flex items-center gap-2"
                  >
                    <Link2 size={14} />
                    Ссылка на тетрадь
                  </Label>
                  <Input
                    id="colab-url"
                    value={colabUrl}
                    onChange={e => setColabUrl(e.target.value)}
                    placeholder="https://colab.research.google.com/drive/..."
                    className="bg-[#1e2529] border-[#37474f] text-white"
                    disabled={submitMutation.isPending || noUrl}
                  />
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="no-url"
                    checked={noUrl}
                    onCheckedChange={checked => setNoUrl(checked === true)}
                    disabled={submitMutation.isPending}
                  />
                  <Label
                    htmlFor="no-url"
                    className="text-sm text-[#c8cdd1] font-normal cursor-pointer"
                  >
                    Просмотренно
                  </Label>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={
                      (!noUrl && !colabUrl.trim()) || submitMutation.isPending
                    }
                    className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#25cc70]"
                  >
                    <Send size={16} className="mr-2" />
                    {submitMutation.isPending
                      ? "Отправка..."
                      : "Отправить"}
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

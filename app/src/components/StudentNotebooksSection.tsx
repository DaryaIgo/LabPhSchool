import { trpc } from "@/providers/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import {
  NotebookPen,
  Clock,
  CheckCircle2,
  Download,
  ExternalLink,
  Send,
  Trophy,
  Link2,
} from "lucide-react";

const GRADE_CONFIG: Record<
  number,
  { label: string; textColor: string; trophyColor: string }
> = {
  5: { label: "Отлично", textColor: "text-emerald-400", trophyColor: "#ffd700" },
  4: { label: "Хорошо", textColor: "text-sky-400", trophyColor: "#c0c0c0" },
  3: {
    label: "Удовлетворительно",
    textColor: "text-amber-400",
    trophyColor: "#cd7f32",
  },
  2: {
    label: "Неудовлетворительно",
    textColor: "text-rose-400",
    trophyColor: "#94a3b8",
  },
  1: { label: "Плохо", textColor: "text-red-400", trophyColor: "#64748b" },
};

export default function StudentNotebooksSection() {
  const { data, isLoading } = trpc.student.getMyJupyterNotebooks.useQuery();

  const handleDownload = (notebookId: number, filename: string) => {
    const link = document.createElement("a");
    link.href = `/api/jupyter/download/${notebookId}`;
    link.download = filename || "notebook.ipynb";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenColab = (notebookId: number, filename: string) => {
    handleDownload(notebookId, filename);
    window.open(
      "https://colab.research.google.com",
      "_blank",
      "noopener,noreferrer"
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 bg-[#37474f]" />
        ))}
      </div>
    );
  }

  const assigned = data?.assigned ?? [];
  const submitted = data?.submitted ?? [];
  const completed = data?.completed ?? [];
  const available = data?.available ?? [];

  return (
    <div>
      {/* Assigned */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-[#798389] mb-3 flex items-center gap-2">
          <Clock size={14} className="text-[#01acff]" />
          Назначенные
        </h3>
        {assigned.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {assigned.map(nb => (
              <NotebookCard
                key={nb.id}
                notebook={nb}
                status="assigned"
                onDownload={() =>
                  handleDownload(nb.notebookId, nb.notebookFilename)
                }
                onOpenColab={() =>
                  handleOpenColab(nb.notebookId, nb.notebookFilename)
                }
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#798389]">
            У вас пока нет назначенных тетрадей.
          </p>
        )}
      </div>

      {/* Submitted */}
      {submitted.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-[#798389] mb-3 flex items-center gap-2">
            <Send size={14} className="text-[#ffc832]" />
            На проверке
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {submitted.map(nb => (
              <NotebookCard
                key={nb.id}
                notebook={nb}
                status="submitted"
                onDownload={() =>
                  handleDownload(nb.notebookId, nb.notebookFilename)
                }
                onOpenColab={() =>
                  handleOpenColab(nb.notebookId, nb.notebookFilename)
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-[#798389] mb-3 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-[#2eff8c]" />
            Архив выполненных
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {completed.map(nb => (
              <NotebookCard
                key={nb.id}
                notebook={nb}
                status="completed"
                onDownload={() =>
                  handleDownload(nb.notebookId, nb.notebookFilename)
                }
                onOpenColab={() =>
                  handleOpenColab(nb.notebookId, nb.notebookFilename)
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Available (direct access without assignment) */}
      {available.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[#798389] mb-3 flex items-center gap-2">
            <NotebookPen size={14} className="text-[#2eff8c]" />
            Доступные
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {available.map(nb => (
              <Card
                key={nb.id}
                className="bg-[#2a3237] border-[#434e54] hover:border-[#2eff8c]/50 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <NotebookPen
                      size={20}
                      className="text-[#2eff8c] shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-[#c8cdd1] truncate">
                        {nb.title}
                      </h3>
                      <p className="text-xs text-[#798389] mt-1">
                        {nb.subtopicTitle}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleDownload(nb.notebookId, nb.filename)
                          }
                          className="inline-flex items-center gap-1 text-xs bg-[#2eff8c]/10 text-[#2eff8c] px-3 py-1.5 rounded-md hover:bg-[#2eff8c]/20 transition-colors"
                        >
                          <Download size={12} />
                          Скачать
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenColab(nb.notebookId, nb.filename)
                          }
                          className="inline-flex items-center gap-1 text-xs text-[#01acff] hover:underline"
                        >
                          <ExternalLink size={12} />
                          Colab
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {assigned.length === 0 &&
        submitted.length === 0 &&
        completed.length === 0 &&
        available.length === 0 && (
          <p className="text-sm text-[#798389]">
            У вас пока нет доступных тетрадей. Преподаватель откроет доступ к
            новым материалам.
          </p>
        )}
    </div>
  );
}

function NotebookCard({
  notebook,
  status,
  onDownload,
  onOpenColab,
}: {
  notebook: {
    id: number;
    notebookId: number;
    notebookTitle: string;
    notebookFilename: string;
    subtopicTitle: string;
    grade: number | null;
    studentColabUrl: string | null;
    submittedAt: Date | null;
    completedAt: Date | null;
  };
  status: "assigned" | "submitted" | "completed";
  onDownload: () => void;
  onOpenColab: () => void;
}) {
  const grade = notebook.grade ?? undefined;
  const gradeConfig = grade ? GRADE_CONFIG[grade] : null;

  return (
    <Card className="bg-[#2a3237] border-[#434e54] hover:border-[#2eff8c]/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <NotebookPen
            size={20}
            className="text-[#2eff8c] shrink-0 mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-[#c8cdd1] truncate">
              {notebook.notebookTitle}
            </h3>
            <p className="text-xs text-[#798389] mt-1">
              {notebook.subtopicTitle}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {status === "assigned" && (
                <Badge className="bg-[#01acff]/20 text-[#01acff] text-[10px] px-1.5 py-0">
                  Назначен
                </Badge>
              )}
              {status === "submitted" && (
                <Badge className="bg-[#ffc832]/20 text-[#ffc832] text-[10px] px-1.5 py-0">
                  На проверке
                </Badge>
              )}
              {status === "completed" && gradeConfig && (
                <div className="flex items-center gap-1">
                  <Trophy
                    size={12}
                    style={{ color: gradeConfig.trophyColor }}
                    fill={gradeConfig.trophyColor}
                    fillOpacity={0.15}
                  />
                  <span className={`text-[10px] font-bold ${gradeConfig.textColor}`}>
                    {grade}
                  </span>
                </div>
              )}
            </div>

            {status === "completed" && notebook.studentColabUrl && (
              <a
                href={notebook.studentColabUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#01acff] hover:underline mt-2 break-all"
              >
                <Link2 size={12} />
                Ваша работа
              </a>
            )}

            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={onDownload}
                className="inline-flex items-center gap-1 text-xs bg-[#2eff8c]/10 text-[#2eff8c] px-3 py-1.5 rounded-md hover:bg-[#2eff8c]/20 transition-colors"
              >
                <Download size={12} />
                Скачать
              </button>
              <button
                type="button"
                onClick={onOpenColab}
                className="inline-flex items-center gap-1 text-xs text-[#01acff] hover:underline"
              >
                <ExternalLink size={12} />
                Colab
              </button>
              {status === "assigned" && (
                <Link to={`/student/notebook/${notebook.id}`}>
                  <Button
                    size="sm"
                    className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#25cc70] h-7 text-xs"
                  >
                    Выполнить
                  </Button>
                </Link>
              )}
              {status === "submitted" && (
                <Link to={`/student/notebook/${notebook.id}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#37474f] text-[#c8cdd1] hover:bg-[#263238] h-7 text-xs"
                  >
                    Смотреть
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { trpc } from "@/providers/trpc";
import { Skeleton } from "@/components/ui/skeleton";
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
  Link2,
} from "lucide-react";
import { getGradeVisuals } from "@/lib/grade-visuals";
import { GradeIcon } from "@/components/GradeIcon";

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
      <style>{`
        @keyframes labGlow {
          0%, 100% {
            box-shadow: 0 0 3px var(--glow-color), 0 0 6px var(--glow-color);
          }
          50% {
            box-shadow: 0 0 8px var(--glow-color), 0 0 14px var(--glow-color);
          }
        }
        .lab-glow {
          animation: labGlow 2.2s ease-in-out infinite;
        }
      `}</style>

      {/* Assigned */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-[#798389] mb-3 flex items-center gap-2">
          <Clock size={14} className="text-[#01acff]" />
          Назначенные
        </h3>
        {assigned.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {assigned.map(nb => (
              <ActiveNotebookCard
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
          <div className="grid grid-cols-1 gap-3">
            {submitted.map(nb => (
              <ActiveNotebookCard
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
              <ArchivedNotebookCard
                key={nb.id}
                notebook={nb}
                onDownload={() =>
                  handleDownload(nb.notebookId, nb.notebookFilename)
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
              <ActiveNotebookCard
                key={nb.id}
                notebook={{
                  id: nb.id,
                  notebookId: nb.notebookId,
                  notebookTitle: nb.title,
                  notebookFilename: nb.filename,
                  subtopicTitle: nb.subtopicTitle,
                  grade: null,
                  studentColabUrl: null,
                  submittedAt: null,
                  completedAt: null,
                }}
                status="assigned"
                onDownload={() => handleDownload(nb.notebookId, nb.filename)}
                onOpenColab={() => handleOpenColab(nb.notebookId, nb.filename)}
              />
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

function ActiveNotebookCard({
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
  status: "assigned" | "submitted";
  onDownload: () => void;
  onOpenColab: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-[#2a3237] border border-[#434e54] hover:border-[#2eff8c]/50 rounded-xl transition-colors">
      <NotebookPen size={18} className="text-[#2eff8c] shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-[#c8cdd1] break-words whitespace-normal">
          {notebook.notebookTitle}
        </h3>
        <p className="text-[10px] text-[#798389] break-words whitespace-normal">
          {notebook.subtopicTitle}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
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
        </div>
      </div>
      <div className="shrink-0 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex items-center gap-1 text-[10px] bg-[#2eff8c]/10 text-[#2eff8c] px-2 py-1 rounded hover:bg-[#2eff8c]/20 transition-colors"
          >
            <Download size={10} />
            Скачать
          </button>
          <button
            type="button"
            onClick={onOpenColab}
            className="inline-flex items-center gap-1 text-[10px] text-[#01acff] hover:underline"
          >
            <ExternalLink size={10} />
            Colab
          </button>
        </div>
        {status === "assigned" && (
          <Link to={`/student/notebook/${notebook.id}`}>
            <Button
              size="sm"
              className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#25cc70] h-7 text-xs w-full"
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
              className="border-[#37474f] text-[#c8cdd1] hover:bg-[#263238] h-7 text-xs w-full"
            >
              Смотреть
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

function ArchivedNotebookCard({
  notebook,
  onDownload,
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
  onDownload: () => void;
}) {
  const gradeVisuals = getGradeVisuals(notebook.grade);

  return (
    <div
      className={`relative flex items-center gap-2 px-3 py-2 bg-[#232b2f] rounded-lg border border-[#37474f] transition-colors ${
        gradeVisuals?.hasGlow ? "lab-glow" : ""
      }`}
      style={
        {
          "--glow-color": gradeVisuals?.glowColor ?? "transparent",
        } as React.CSSProperties
      }
    >
      <NotebookPen size={16} className="text-[#2eff8c] shrink-0" />
      <div className="flex-1 min-w-0">
        <Link
          to={`/student/notebook/${notebook.id}`}
          className="text-xs font-medium text-[#c8cdd1] hover:text-white truncate block"
        >
          {notebook.notebookTitle}
        </Link>
        {notebook.completedAt && (
          <p className="text-[10px] text-[#798389]">
            {new Date(notebook.completedAt).toLocaleDateString("ru-RU")}
          </p>
        )}
      </div>
      <div className="shrink-0 flex items-center gap-1.5">
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex items-center gap-1 text-[10px] text-[#2eff8c] hover:underline"
          title="Скачать .ipynb"
        >
          <Download size={12} />
        </button>
        {notebook.studentColabUrl && (
          <a
            href={notebook.studentColabUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-[#01acff] hover:underline"
            title="Открыть работу"
          >
            <Link2 size={12} />
          </a>
        )}
        {gradeVisuals && (
          <div className="flex items-center">
            <GradeIcon grade={notebook.grade} size={18} />
          </div>
        )}
      </div>
    </div>
  );
}

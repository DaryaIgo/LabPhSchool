import { trpc } from "@/providers/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { Clock, CheckCircle2, FileText, Send } from "lucide-react";
import { getGradeVisuals } from "@/lib/grade-visuals";
import { GradeIcon } from "@/components/GradeIcon";

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string }> = {
  easy: { label: "Лёгкая", color: "bg-[#2eff8c]/20 text-[#2eff8c]" },
  medium: { label: "Средняя", color: "bg-[#ffcb3d]/20 text-[#ffcb3d]" },
  hard: { label: "Сложная", color: "bg-[#ff6b6b]/20 text-[#ff6b6b]" },
};

export default function StudentProblemsSection() {
  const { data, isLoading } = trpc.student.getMyAssignedProblems.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 bg-[#37474f]" />
        ))}
      </div>
    );
  }

  const assigned = data?.active?.filter(p => p.status === "assigned") ?? [];
  const submitted = data?.active?.filter(p => p.status === "submitted") ?? [];
  const archived = data?.archived ?? [];

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

      {/* Assigned (not yet submitted) */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-[#798389] mb-3 flex items-center gap-2">
          <Clock size={14} className="text-[#01acff]" />
          Назначенные
        </h3>
        {assigned.length > 0 ? (
          <div className="space-y-3">
            {assigned.map((problem, idx) => (
              <ActiveProblemCard
                key={problem.id}
                problem={problem}
                number={idx + 1}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#798389]">
            У вас пока нет назначенных задач.
          </p>
        )}
      </div>

      {/* Submitted, awaiting review */}
      {submitted.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-[#798389] mb-3 flex items-center gap-2">
            <Send size={14} className="text-[#ffc832]" />
            На проверке
          </h3>
          <div className="space-y-3">
            {submitted.map((problem, idx) => (
              <ActiveProblemCard
                key={problem.id}
                problem={problem}
                number={idx + 1}
              />
            ))}
          </div>
        </div>
      )}

      {/* Archived completed problems */}
      <div>
        <h3 className="text-sm font-medium text-[#798389] mb-3 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-[#2eff8c]" />
          Архив выполненных
        </h3>
        {archived.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {archived.map((problem, idx) => (
              <ArchivedProblemCard
                key={problem.id}
                problem={problem}
                number={idx + 1}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#798389]">
            Здесь будут отображаться выполненные и оценённые задачи.
          </p>
        )}
      </div>
    </div>
  );
}

function ActiveProblemCard({
  problem,
  number,
}: {
  problem: {
    id: number;
    problemTitle: string;
    problemDifficulty: string | null;
    assignedAt: Date;
    status: string;
  };
  number: number;
}) {
  const difficulty = problem.problemDifficulty ?? "medium";
  const difficultyConfig = DIFFICULTY_CONFIG[difficulty] ?? {
    label: "—",
    color: "bg-[#37474f] text-[#c8cdd1]",
  };

  const isSubmitted = problem.status === "submitted";

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-[#2a3237] border border-[#37474f] rounded-xl transition-colors">
      <span className="text-xs font-medium text-[#798389] w-5 shrink-0">
        {number}.
      </span>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-white truncate">
          {problem.problemTitle}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <Badge
            className={`${difficultyConfig.color} text-[10px] px-1.5 py-0`}
          >
            {difficultyConfig.label}
          </Badge>
          <p className="text-[10px] text-[#798389]">
            Назначена:{" "}
            {new Date(problem.assignedAt).toLocaleDateString("ru-RU")}
          </p>
          {isSubmitted && (
            <Badge className="bg-[#ffc832]/20 text-[#ffc832] text-[10px] px-1.5 py-0">
              На проверке
            </Badge>
          )}
        </div>
      </div>
      <div className="shrink-0">
        {isSubmitted ? (
          <Link to={`/student/problem/${problem.id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-[#ffc832] hover:text-[#ffc832] hover:bg-[#ffc832]/10"
            >
              <FileText size={16} className="mr-1" />
              Смотреть
            </Button>
          </Link>
        ) : (
          <Link to={`/student/problem/${problem.id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-[#2eff8c] hover:text-[#2eff8c] hover:bg-[#2eff8c]/10"
            >
              Решать
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

function ArchivedProblemCard({
  problem,
  number,
}: {
  problem: {
    id: number;
    problemTitle: string;
    grade: number | null;
    completedAt: Date | null;
  };
  number: number;
}) {
  const gradeVisuals = getGradeVisuals(problem.grade);

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
      <span className="text-[10px] font-medium text-[#798389] w-4 shrink-0">
        {number}.
      </span>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium text-[#c8cdd1] truncate block">
          {problem.problemTitle}
        </span>
        {problem.completedAt && (
          <p className="text-[10px] text-[#798389]">
            {new Date(problem.completedAt).toLocaleDateString("ru-RU")}
          </p>
        )}
      </div>
      {gradeVisuals && (
        <div className="shrink-0 flex items-center">
          <GradeIcon grade={problem.grade} size={18} />
        </div>
      )}
    </div>
  );
}

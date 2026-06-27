import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Beaker, Trophy, Clock, CheckCircle2, ArrowRight, Send } from "lucide-react";

const GRADE_CONFIG: Record<
  number,
  {
    label: string;
    textColor: string;
    trophyColor: string;
  }
> = {
  5: {
    label: "Отлично",
    textColor: "text-emerald-400",
    trophyColor: "#ffd700",
  },
  4: {
    label: "Хорошо",
    textColor: "text-sky-400",
    trophyColor: "#c0c0c0",
  },
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
  1: {
    label: "Плохо",
    textColor: "text-red-400",
    trophyColor: "#64748b",
  },
};

export default function StudentLabsSection() {
  const { data, isLoading } = trpc.student.getMyAssignedLabWorks.useQuery();

  if (isLoading) {
    return (
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
          <Beaker size={18} className="text-[#2eff8c]" />
          Мои лабораторные
        </h2>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 bg-[#37474f]" />
          ))}
        </div>
      </section>
    );
  }

  const active = data?.active ?? [];
  const submitted = active.filter(lab => lab.status === "submitted");
  const assigned = active.filter(lab => lab.status === "assigned");
  const archived = data?.archived ?? [];

  return (
    <section className="mb-8">
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

      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
        <Beaker size={18} className="text-[#2eff8c]" />
        Мои лабораторные
      </h2>

      {/* Active assignments */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-[#798389] mb-3 flex items-center gap-2">
          <Clock size={14} className="text-[#01acff]" />
          Назначенные
        </h3>
        {assigned.length > 0 ? (
          <div className="space-y-3">
            {assigned.map((lab, idx) => (
              <ActiveLabCard key={lab.id} lab={lab} number={idx + 1} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#798389]">
            У вас пока нет назначенных лабораторных работ.
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
            {submitted.map((lab, idx) => (
              <ActiveLabCard key={lab.id} lab={lab} number={idx + 1} />
            ))}
          </div>
        </div>
      )}

      {/* Archived completed labs */}
      <div>
        <h3 className="text-sm font-medium text-[#798389] mb-3 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-[#2eff8c]" />
          Архив выполненных
        </h3>
        {archived.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {archived.map((lab, idx) => (
              <ArchivedLabCard key={lab.id} lab={lab} number={idx + 1} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#798389]">
            Здесь будут отображаться выполненные и оценённые работы.
          </p>
        )}
      </div>
    </section>
  );
}

function ActiveLabCard({
  lab,
  number,
}: {
  lab: {
    id: number;
    labTitle: string;
    labSlug: string;
    labGoal: string | null;
    assignedAt: Date;
    status: string;
  };
  number: number;
}) {
  const isSubmitted = lab.status === "submitted";

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-[#2a3237] border border-[#37474f] hover:border-[#01acff]/50 rounded-xl transition-colors">
      <span className="text-xs font-medium text-[#798389] w-5 shrink-0">
        {number}.
      </span>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-white truncate">
          {lab.labTitle}
        </h4>
        {lab.labGoal && (
          <p className="text-xs text-[#798389] truncate">{lab.labGoal}</p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <p className="text-[10px] text-[#798389]">
            Назначена: {new Date(lab.assignedAt).toLocaleDateString("ru-RU")}
          </p>
          {isSubmitted && (
            <Badge className="bg-[#ffc832]/20 text-[#ffc832] text-[10px] px-1.5 py-0">
              На проверке
            </Badge>
          )}
        </div>
      </div>
      <Link
        to={`/labs/work/${lab.labSlug}`}
        className={`shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
          isSubmitted
            ? "bg-[#ffc832]/10 text-[#ffc832] border-[#ffc832]/30 hover:bg-[#ffc832]/20"
            : "bg-[#2eff8c]/10 text-[#2eff8c] border-[#2eff8c]/30 hover:bg-[#2eff8c]/20"
        }`}
      >
        {isSubmitted ? "Смотреть" : "Выполнить"}
        <ArrowRight size={12} />
      </Link>
    </div>
  );
}

function ArchivedLabCard({
  lab,
  number,
}: {
  lab: {
    id: number;
    labTitle: string;
    labSlug: string;
    grade: number | null;
    completedAt: Date | null;
  };
  number: number;
}) {
  const grade = lab.grade ?? undefined;
  const gradeConfig = grade ? GRADE_CONFIG[grade] : null;
  const glowColor = gradeConfig?.trophyColor ?? "#2eff8c";

  return (
    <div
      className="relative flex items-center gap-2 px-3 py-2 bg-[#232b2f] rounded-lg border border-[#37474f] lab-glow transition-colors"
      style={{ "--glow-color": glowColor } as React.CSSProperties}
    >
      <span className="text-[10px] font-medium text-[#798389] w-4 shrink-0">
        {number}.
      </span>
      <div className="flex-1 min-w-0">
        <Link
          to={`/labs/work/${lab.labSlug}`}
          className="text-xs font-medium text-[#c8cdd1] hover:text-white truncate block"
        >
          {lab.labTitle}
        </Link>
        {lab.completedAt && (
          <p className="text-[10px] text-[#798389]">
            {new Date(lab.completedAt).toLocaleDateString("ru-RU")}
          </p>
        )}
      </div>
      {gradeConfig && (
        <div className="shrink-0 flex flex-col items-center">
          <Trophy
            size={16}
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
  );
}

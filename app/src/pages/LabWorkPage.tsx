import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Link, useParams } from "react-router";
import { ArrowLeft, Target, Wrench, BookOpen, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import SimulationWrapper from "@/components/lab/SimulationWrapper";
import ConclusionPanel from "@/components/lab/ConclusionPanel";
import { useAuth } from "@/hooks/useAuth";
import type { MeasurementRow } from "@/components/lab/simulations/types";

interface TheoryTab {
  label: string;
  title: string;
  content: string;
}

function parseTheoryTabs(theory: string): TheoryTab[] | null {
  const regex = /\*\*Способ\s+(\d+):\s*([^*]+)\*\*/g;
  const matches = Array.from(theory.matchAll(regex));
  if (matches.length < 2) return null;

  const tabs: TheoryTab[] = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index!;
    const end = i < matches.length - 1 ? matches[i + 1].index! : theory.length;
    const sectionText = theory.slice(start, end).trim();
    const header = matches[i][0];
    const body = sectionText.slice(header.length).trim();
    tabs.push({
      label: `Способ ${matches[i][1]}`,
      title: matches[i][2].trim(),
      content: body,
    });
  }
  return tabs;
}

function SectionHeading({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={18} className="text-[#2eff8c]" />
      <h3 className="text-lg font-semibold text-white">{children}</h3>
    </div>
  );
}

export default function LabWorkPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: labWork, isLoading } = trpc.virtualLab.labWorkBySlug.useQuery(
    { slug: slug! },
    { enabled: !!slug }
  );
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const [measurements, setMeasurements] = useState<MeasurementRow[]>([]);
  const [conclusion, setConclusion] = useState("");

  const saveProgress = trpc.virtualLab.saveLabProgress.useMutation({
    onSuccess: () => {
      toast.success("Прогресс сохранён");
      utils.virtualLab.getMyLabProgress.invalidate();
    },
    onError: err => toast.error(err.message),
  });

  const handleSaveProgress = () => {
    if (!labWork || !user) {
      toast.error("Необходимо авторизоваться");
      return;
    }
    saveProgress.mutate({
      labWorkId: labWork.id,
      mode: "training",
      status: measurements.length > 0 ? "in_progress" : "not_started",
      data: {},
      measurements,
      conclusion,
    });
  };

  const handleSubmit = () => {
    if (!labWork || !user) {
      toast.error("Необходимо авторизоваться");
      return;
    }
    saveProgress.mutate({
      labWorkId: labWork.id,
      mode: "training",
      status: "submitted",
      data: {},
      measurements,
      conclusion,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0d0f] pt-24 text-center">
        <div className="animate-pulse h-8 w-64 bg-[#1a1f22] rounded mx-auto mb-4" />
      </div>
    );
  }

  if (!labWork) {
    return (
      <div className="min-h-screen bg-[#0b0d0f] pt-24 text-center text-[#798389]">
        Лабораторная работа не найдена
      </div>
    );
  }

  const theoryContent = (labWork.theory || labWork.topicNodeContent) ?? "";
  const theoryTabs = parseTheoryTabs(theoryContent);
  const instructionTabs = labWork.instruction
    ? parseTheoryTabs(labWork.instruction)
    : null;

  return (
    <div className="min-h-screen bg-[#0b0d0f]">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-[#0b0d0f]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link
            to="/labs"
            className="inline-flex items-center gap-1.5 text-sm text-[#a0a8ad] hover:text-[#2eff8c] transition-colors shrink-0"
          >
            <ArrowLeft size={16} />
            Все лабораторные
          </Link>
          <h1 className="flex-1 text-sm sm:text-base font-semibold text-white truncate text-center">
            {labWork.title}
          </h1>
          <div className="w-16 shrink-0" />
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-8">
        {labWork.categoryTitle && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2eff8c]/20 bg-[#2eff8c]/5 text-[#2eff8c] text-xs font-medium tracking-wide mb-4">
            {labWork.categoryTitle}
            {labWork.subcategoryTitle && (
              <span className="text-[#2eff8c]/70">
                / {labWork.subcategoryTitle}
              </span>
            )}
          </div>
        )}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
          {labWork.title}
        </h2>
      </div>

      {/* Content */}
      <article className="pb-24 space-y-16">
        {/* Reading sections — narrow and comfortable */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-12">
          {/* Goal */}
          {labWork.goal && (
            <section>
              <SectionHeading icon={Target}>Цель работы</SectionHeading>
              <MarkdownRenderer content={labWork.goal} />
            </section>
          )}

          {/* Theory */}
          {theoryContent && (
            <section>
              <SectionHeading icon={BookOpen}>Теоретические сведения</SectionHeading>
              {theoryTabs ? (
                <div className="space-y-8">
                  {theoryTabs.map((tab, i) => (
                    <div key={i}>
                      <p className="text-sm font-medium text-[#2eff8c] mb-2">
                        {tab.label}: {tab.title}
                      </p>
                      <MarkdownRenderer content={tab.content} />
                    </div>
                  ))}
                </div>
              ) : (
                <MarkdownRenderer content={theoryContent} />
              )}
            </section>
          )}

          {/* Equipment */}
          {labWork.equipment && (
            <section>
              <SectionHeading icon={Wrench}>Оборудование</SectionHeading>
              {labWork.equipment.trim().startsWith("[") ? (
                <ul className="space-y-2 text-base">
                  {JSON.parse(labWork.equipment).map(
                    (item: string, i: number) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-[#d8dde0]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2eff8c]" />
                        {item}
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <MarkdownRenderer content={labWork.equipment} />
              )}
            </section>
          )}

          {/* Instruction */}
          {labWork.instruction && (
            <section>
              <SectionHeading icon={BookOpen}>Пошаговая инструкция</SectionHeading>
              {instructionTabs ? (
                <div className="space-y-8">
                  {instructionTabs.map((tab, i) => (
                    <div key={i}>
                      <p className="text-sm font-medium text-[#2eff8c] mb-2">
                        {tab.label}: {tab.title}
                      </p>
                      <MarkdownRenderer content={tab.content} />
                    </div>
                  ))}
                </div>
              ) : (
                <MarkdownRenderer content={labWork.instruction} />
              )}
            </section>
          )}
        </div>

        {/* Experiment — wide workspace */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeading icon={Wrench}>Эксперимент</SectionHeading>
          <SimulationWrapper
            simulation={labWork.simulation}
            cardType={labWork.cardType ?? "own"}
            slug={slug || ""}
            measurements={measurements}
            onMeasurementsChange={setMeasurements}
          />
        </section>

        {/* Conclusion — wide workspace */}
        {isAuthenticated && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeading icon={PenLine}>Вывод</SectionHeading>
            <ConclusionPanel value={conclusion} onChange={setConclusion} />

            <div className="flex flex-wrap gap-3 mt-4">
              <Button
                onClick={handleSaveProgress}
                disabled={saveProgress.isPending}
                className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#25cc70]"
              >
                Сохранить
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={saveProgress.isPending}
                variant="outline"
                className="border-[#37474f] text-[#c8cdd1] hover:text-white"
              >
                Отправить
              </Button>
            </div>
          </section>
        )}
      </article>
    </div>
  );
}

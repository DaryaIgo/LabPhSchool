import { useState, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import { useParams, useNavigate } from "react-router";
import { X, Target, Wrench, BookOpen, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import SimulationWrapper from "@/components/lab/SimulationWrapper";
import ConclusionPanel from "@/components/lab/ConclusionPanel";
import { useAuth } from "@/hooks/useAuth";
import type { MeasurementRow } from "@/components/lab/simulations/types";
import {
  DEFAULT_EXTERNAL_DATA,
  type ExternalLabData,
} from "@/components/lab/external-data";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../api/router";

type RouterOutput = inferRouterOutputs<AppRouter>;
type LabWorkDetail = NonNullable<RouterOutput["virtualLab"]["labWorkBySlug"]>;
type LabProgressDetail = Extract<
  RouterOutput["virtualLab"]["getMyLabProgress"],
  { labWorkId: number }
>;

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

  useEffect(() => {
    // Ensure scrolling is not locked by a previous immersive overlay
    const originalHtml = document.documentElement.style.overflow;
    const originalBody = document.body.style.overflow;
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";
    return () => {
      document.documentElement.style.overflow = originalHtml;
      document.body.style.overflow = originalBody;
    };
  }, []);

  const { data: labWork, isLoading: isLabWorkLoading } =
    trpc.virtualLab.labWorkBySlug.useQuery({ slug: slug! }, { enabled: !!slug });

  const { user } = useAuth();
  const isStudent = user?.type === "student";

  const { data: existingProgress } = trpc.virtualLab.getMyLabProgress.useQuery(
    { labWorkId: labWork?.id ?? 0 },
    { enabled: !!labWork && isStudent }
  );

  if (isLabWorkLoading) {
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

  return (
    <LabWorkContent
      key={labWork.id}
      labWork={labWork}
      existingProgress={existingProgress as LabProgressDetail | undefined}
    />
  );
}

interface LabWorkContentProps {
  labWork: LabWorkDetail;
  existingProgress: LabProgressDetail | undefined;
}

function LabWorkContent({ labWork, existingProgress }: LabWorkContentProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const [measurements, setMeasurements] = useState<MeasurementRow[]>([]);
  const [conclusion, setConclusion] = useState("");
  const [externalData, setExternalData] = useState<ExternalLabData>(
    DEFAULT_EXTERNAL_DATA
  );

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!existingProgress || Array.isArray(existingProgress)) return;

    setMeasurements(prev => {
      if (prev.length === 0 && existingProgress.measurements) {
        return existingProgress.measurements as MeasurementRow[];
      }
      return prev;
    });

    setConclusion(prev => {
      if (prev === "" && existingProgress.conclusion) {
        return existingProgress.conclusion;
      }
      return prev;
    });

    setExternalData(prev => {
      const isEmpty =
        prev.tables.length === 0 && prev.graphs.length === 0;
      if (!isEmpty) return prev;

      if (
        existingProgress.data &&
        typeof existingProgress.data === "object" &&
        "externalData" in existingProgress.data
      ) {
        const saved = (existingProgress.data as Record<string, unknown>)
          .externalData as ExternalLabData | undefined;
        if (saved) {
          return {
            tables: Array.isArray(saved.tables) ? saved.tables : [],
            graphs: Array.isArray(saved.graphs) ? saved.graphs : [],
          };
        }
      }
      return prev;
    });
  }, [existingProgress]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const saveProgress = trpc.virtualLab.saveLabProgress.useMutation({
    onSuccess: () => {
      toast.success("Прогресс сохранён");
      utils.virtualLab.getMyLabProgress.invalidate();
    },
    onError: err => toast.error(err.message),
  });

  const handleSubmit = () => {
    if (!labWork || !user) {
      toast.error("Необходимо авторизоваться");
      return;
    }
    saveProgress.mutate({
      labWorkId: labWork.id,
      mode: "training",
      status: "submitted",
      data: { externalData },
      measurements,
      conclusion,
    });
  };

  const theoryContent = (labWork.theory || labWork.topicNodeContent) ?? "";
  const theoryTabs = parseTheoryTabs(theoryContent);
  const instructionTabs = labWork.instruction
    ? parseTheoryTabs(labWork.instruction)
    : null;

  return (
    <div className="min-h-screen bg-[#0b0d0f]">
      {/* Floating close button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Закрыть"
        className="fixed top-5 right-5 z-50 w-10 h-10 rounded-full border border-[#434e54] bg-[#1a1f22]/80 backdrop-blur-md text-[#a0a8ad] hover:text-white hover:border-[#2eff8c]/50 flex items-center justify-center transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
      >
        <X size={18} />
      </button>

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-8">
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
              <SectionHeading icon={BookOpen}>
                Теоретические сведения
              </SectionHeading>
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
              <SectionHeading icon={BookOpen}>
                Пошаговая инструкция
              </SectionHeading>
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
            slug={labWork.slug}
            measurements={measurements}
            onMeasurementsChange={setMeasurements}
            externalData={externalData}
            onExternalDataChange={setExternalData}
          />
        </section>

        {/* Conclusion — wide workspace */}
        {isAuthenticated && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeading icon={PenLine}>Вывод</SectionHeading>
            <ConclusionPanel value={conclusion} onChange={setConclusion} />

            <div className="flex flex-wrap gap-3 mt-4">
              <Button
                onClick={handleSubmit}
                disabled={saveProgress.isPending}
                className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#25cc70]"
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

import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useParams } from "react-router";
import { Target, Wrench, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { toast } from "sonner";
import LabLayout from "@/components/lab/LabLayout";
import ConclusionPanel from "@/components/lab/ConclusionPanel";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import LabSidebar from "@/components/lab/LabSidebar";
import SimulationWrapper from "@/components/lab/SimulationWrapper";
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

export default function LabWorkPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: labWork, isLoading } = trpc.virtualLab.labWorkBySlug.useQuery(
    { slug: slug! },
    { enabled: !!slug }
  );
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const canAccessConclusion = isAuthenticated;

  const [activeTab, setActiveTab] = useState("theory");
  const visibleTab =
    activeTab === "conclusion" && !canAccessConclusion ? "theory" : activeTab;
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
      <div className="min-h-[calc(100vh-64px)] bg-[#262e33] pt-24 text-center">
        <div className="animate-pulse h-8 w-64 bg-[#2a3237] rounded mx-auto mb-4" />
      </div>
    );
  }

  if (!labWork) {
    return (
      <LabLayout title="Не найдено" topic="Ошибка">
        <div className="text-center text-[#798389] py-12">
          Лабораторная работа не найдена
        </div>
      </LabLayout>
    );
  }

  return (
    <LabLayout
      title={labWork.title}
      topic={labWork.categoryTitle || "Лабораторная работа"}
      fullWidth
    >
      <div className="flex">
        <LabSidebar
          activeTab={visibleTab}
          onTabChange={setActiveTab}
          showConclusion={canAccessConclusion}
        />

        {/* Content */}
        <main className="flex-1 p-6">
          <div
            key={activeTab}
            className="max-w-5xl mx-auto space-y-6 animate-fadeIn"
          >
            {visibleTab === "theory" && (
              <div className="space-y-6">
                <div className="bg-[#2a3237] border border-[#434e54] rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Target size={20} className="text-[#2eff8c]" />
                    <h3 className="text-lg font-bold text-white">
                      Цель работы
                    </h3>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none text-[#c8cdd1] leading-relaxed">
                    <MarkdownRenderer content={labWork.goal || ""} />
                  </div>
                </div>

                <div className="bg-[#2a3237] border border-[#434e54] rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <BookOpen size={20} className="text-[#2eff8c]" />
                    <h3 className="text-lg font-bold text-white">
                      Теоретические сведения
                    </h3>
                  </div>
                  {(() => {
                    const theoryContent =
                      (labWork.theory || labWork.topicNodeContent) ?? "";
                    const tabs = parseTheoryTabs(theoryContent);
                    if (tabs) {
                      return (
                        <Tabs defaultValue="0">
                          <TabsList>
                            {tabs.map((tab, i) => (
                              <TabsTrigger key={i} value={String(i)}>
                                {tab.label}
                              </TabsTrigger>
                            ))}
                          </TabsList>
                          {tabs.map((tab, i) => (
                            <TabsContent
                              key={i}
                              value={String(i)}
                              className="mt-4"
                            >
                              <p className="text-white font-semibold mb-3">
                                {tab.title}
                              </p>
                              <MarkdownRenderer content={tab.content} />
                            </TabsContent>
                          ))}
                        </Tabs>
                      );
                    }
                    return (
                      <div className="prose prose-invert prose-sm max-w-none text-[#c8cdd1] leading-relaxed">
                        <MarkdownRenderer content={theoryContent} />
                      </div>
                    );
                  })()}
                </div>

                <div className="bg-[#2a3237] border border-[#434e54] rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Wrench size={20} className="text-[#2eff8c]" />
                    <h3 className="text-lg font-bold text-white">
                      Оборудование
                    </h3>
                  </div>
                  {labWork.equipment && (
                    <div className="prose prose-invert prose-sm max-w-none text-[#c8cdd1]">
                      {labWork.equipment.trim().startsWith("[") ? (
                        <ul className="space-y-2">
                          {JSON.parse(labWork.equipment).map(
                            (item: string, i: number) => (
                              <li
                                key={i}
                                className="flex items-center gap-2 text-[#c8cdd1]"
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
                    </div>
                  )}
                </div>
              </div>
            )}

            {visibleTab === "experiment" && (
              <div className="space-y-6">
                {labWork.instruction && (
                  <div className="bg-[#1a1f22] border border-[#37474f] rounded-xl p-4 text-sm text-[#c8cdd1]">
                    <p className="font-medium text-white mb-2">
                      Пошаговая инструкция:
                    </p>
                    {(() => {
                      const instTabs = parseTheoryTabs(labWork.instruction);
                      if (instTabs) {
                        return (
                          <Tabs defaultValue="0">
                            <TabsList>
                              {instTabs.map((tab, i) => (
                                <TabsTrigger key={i} value={String(i)}>
                                  {tab.label}
                                </TabsTrigger>
                              ))}
                            </TabsList>
                            {instTabs.map((tab, i) => (
                              <TabsContent
                                key={i}
                                value={String(i)}
                                className="mt-3"
                              >
                                <p className="text-white font-medium mb-2">
                                  {tab.title}
                                </p>
                                <MarkdownRenderer content={tab.content} />
                              </TabsContent>
                            ))}
                          </Tabs>
                        );
                      }
                      return (
                        <div className="prose prose-invert prose-sm max-w-none text-[#c8cdd1]">
                          <MarkdownRenderer content={labWork.instruction} />
                        </div>
                      );
                    })()}
                  </div>
                )}

                <SimulationWrapper
                  simulation={labWork.simulation}
                  cardType={labWork.cardType ?? "own"}
                  slug={slug || ""}
                  measurements={measurements}
                  onMeasurementsChange={setMeasurements}
                />
              </div>
            )}

            {visibleTab === "conclusion" && canAccessConclusion && (
              <div className="space-y-6">
                <ConclusionPanel value={conclusion} onChange={setConclusion} />

                <div className="flex flex-wrap gap-3">
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
              </div>
            )}
          </div>
        </main>
      </div>
    </LabLayout>
  );
}

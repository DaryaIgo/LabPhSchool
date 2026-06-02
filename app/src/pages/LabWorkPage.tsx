import { useState, useMemo, useRef } from "react";
import { trpc } from "@/providers/trpc";
import { useParams } from "react-router";
import {
  FlaskConical,
  Target,
  BookOpen,
  Wrench,
  Play,
  Save,
  Send,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { toast } from "sonner";
import LabLayout from "@/components/lab/LabLayout";
import LabControls from "@/components/lab/LabControls";
import ResultsTable from "@/components/lab/ResultsTable";
import ConclusionPanel from "@/components/lab/ConclusionPanel";
import type { ControlItem } from "@/components/lab/LabControls";
import DensitySimulation from "@/components/lab/simulations/DensitySimulation";
import ArchimedesSimulation from "@/components/lab/simulations/ArchimedesSimulation";
import BuoyancySimulation from "@/components/lab/simulations/BuoyancySimulation";
import ElectricWorkSimulation from "@/components/lab/simulations/ElectricWorkSimulation";
import UniformLinearMotion from "@/components/lab/simulations/UniformLinearMotion";
import UniformlyAcceleratedMotion from "@/components/lab/simulations/UniformlyAcceleratedMotion";
import FreeFallG from "@/components/lab/simulations/FreeFallG";
import CircularMotion from "@/components/lab/simulations/CircularMotion";
import ProjectileMotion from "@/components/lab/simulations/ProjectileMotion";
import { LabGraphs } from "@/components/lab/LabGraphs";
import { useAuth } from "@/hooks/useAuth";

interface SimComponentProps {
  params: Record<string, number | string>;
  isRunning?: boolean;
  onStateChange?: (state: Record<string, number>) => void;
}

const simComponents: Record<string, React.FC<SimComponentProps>> = {
  "density-measurement": DensitySimulation,
  "archimedes-force": ArchimedesSimulation,
  "buoyancy-independence": BuoyancySimulation,
  "electric-work-measurement": ElectricWorkSimulation,
  "uniform-linear-motion": UniformLinearMotion,
  "uniformly-accelerated-motion": UniformlyAcceleratedMotion,
  "free-fall-g": FreeFallG,
  "circular-motion": CircularMotion,
  "projectile-motion": ProjectileMotion,
};

export default function LabWorkPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: labWork, isLoading } = trpc.virtualLab.labWorkBySlug.useQuery(
    { slug: slug! },
    { enabled: !!slug }
  );
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [activeTab, setActiveTab] = useState("theory");
  const [measurements, setMeasurements] = useState<Record<string, string | number>[]>([]);
  const [simParams, setSimParams] = useState<Record<string, number | string>>({});
  const [conclusion, setConclusion] = useState("");
  const [isSimRunning, setIsSimRunning] = useState(false);
  const simStateRef = useRef<Record<string, number>>({});

  const saveProgress = trpc.virtualLab.saveLabProgress.useMutation({
    onSuccess: () => {
      toast.success("Прогресс сохранён");
      utils.virtualLab.getMyLabProgress.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  // Compute effective params: DB defaults merged with user overrides
  const effectiveSimParams: Record<string, number | string> = (() => {
    if (!labWork?.params) return simParams;
    const defaults: Record<string, number | string> = {};
    labWork.params.forEach((p) => {
      if (p.paramType === "slider" || p.paramType === "number") {
        defaults[p.key] = Number(p.defaultValue) || 0;
      } else {
        defaults[p.key] = p.defaultValue || "";
      }
    });
    return { ...defaults, ...simParams };
  })();

  // Build controls from DB params and current simParams
  const controls: ControlItem[] = (() => {
    if (!labWork?.params) return [];
    return labWork.params.map((p) => {
      const value = effectiveSimParams[p.key] ?? p.defaultValue ?? 0;
      if (p.paramType === "slider") {
        return {
          type: "slider" as const,
          label: p.label,
          value: Number(value),
          min: Number(p.min || 0),
          max: Number(p.max || 100),
          step: Number(p.step || 1),
          unit: p.unit || undefined,
          onChange: (v: number) => {
            setSimParams((prev) => ({ ...prev, [p.key]: v }));
            setIsSimRunning(false);
          },
        };
      }
      if (p.paramType === "select") {
        const options = p.options ? JSON.parse(p.options) : [];
        return {
          type: "select" as const,
          label: p.label,
          value: String(value),
          options,
          onChange: (v: string) => {
            setSimParams((prev) => ({ ...prev, [p.key]: v }));
            setIsSimRunning(false);
          },
        };
      }
      return {
        type: "number" as const,
        label: p.label,
        value: Number(value),
        min: p.min ? Number(p.min) : undefined,
        max: p.max ? Number(p.max) : undefined,
        step: p.step ? Number(p.step) : undefined,
        unit: p.unit || undefined,
        onChange: (v: number) => {
          setSimParams((prev) => ({ ...prev, [p.key]: v }));
          setIsSimRunning(false);
        },
      };
    });
  })();

  const handleAddMeasurement = () => {
    const row: Record<string, string | number> = {
      "№": measurements.length + 1,
    };
    labWork?.params?.forEach((p) => {
      row[p.key] = effectiveSimParams[p.key] ?? p.defaultValue ?? "";
    });
    // Add computed values based on lab type
    if (slug === "density-measurement") {
      const m = Number(effectiveSimParams["mass"] || 0);
      const v = Number(effectiveSimParams["volume"] || 1);
      row["ρ"] = (m / v).toFixed(2);
      row["m"] = m;
      row["V"] = v;
    } else if (slug === "archimedes-force") {
      const rho = Number(effectiveSimParams["liquidDensity"] || 1000);
      const v = Number(effectiveSimParams["bodyVolume"] || 0);
      const level = Number(effectiveSimParams["immersionLevel"] || 100);
      const g = 9.8;
      const fa = (rho * g * (v * 1e-6) * (level / 100)).toFixed(3);
      row["Fₐ"] = fa;
      row["Vпогр"] = (v * (level / 100)).toFixed(1);
    } else if (slug === "buoyancy-independence") {
      const rho = 1000;
      const v = Number(effectiveSimParams["bodyVolume"] || 0);
      const g = 9.8;
      row["Fₐ"] = (rho * g * v * 1e-6).toFixed(3);
      row["V"] = v;
    } else if (slug === "electric-work-measurement") {
      const u = Number(effectiveSimParams["voltage"] || 0);
      const r = Number(effectiveSimParams["resistance"] || 1);
      const t = Number(effectiveSimParams["time"] || 0);
      const i = u / r;
      row["I"] = i.toFixed(2);
      row["A"] = (u * i * t).toFixed(1);
      row["P"] = (u * i).toFixed(1);
    } else if (slug === "uniform-linear-motion") {
      const speed = Number(effectiveSimParams["speed"] || 0);
      const startX = Number(effectiveSimParams["startX"] || 0);
      const simTime = simStateRef.current.time ?? Number(effectiveSimParams["time"] || 0);
      row["time"] = simTime.toFixed(1);
      row["s"] = (speed * simTime).toFixed(1);
      row["x"] = (startX + speed * simTime).toFixed(1);
    } else if (slug === "uniformly-accelerated-motion") {
      const v0 = Number(effectiveSimParams["v0"] || 0);
      const a = Number(effectiveSimParams["acceleration"] || 0);
      const simTime = simStateRef.current.time ?? Number(effectiveSimParams["time"] || 0);
      row["time"] = simTime.toFixed(1);
      row["v"] = (v0 + a * simTime).toFixed(1);
      row["s"] = (v0 * simTime + 0.5 * a * simTime * simTime).toFixed(1);
    } else if (slug === "free-fall-g") {
      const l = Number(effectiveSimParams["length"] || 0);
      const n = Number(effectiveSimParams["oscillations"] || 1);
      const tm = Number(effectiveSimParams["measuredTime"] || 0);
      const T = tm / n;
      const gCalc = (4 * Math.PI * Math.PI * l) / (T * T);
      row["T"] = T.toFixed(3);
      row["g"] = gCalc.toFixed(2);
    } else if (slug === "circular-motion") {
      const r = Number(effectiveSimParams["radius"] || 0);
      const T = Number(effectiveSimParams["period"] || 1);
      const m = Number(effectiveSimParams["mass"] || 0);
      const omega = (2 * Math.PI) / T;
      const v = (2 * Math.PI * r) / T;
      const a = (v * v) / r;
      const F = m * a;
      row["ω"] = omega.toFixed(2);
      row["v"] = v.toFixed(2);
      row["a"] = a.toFixed(2);
      row["F"] = F.toFixed(2);
    } else if (slug === "projectile-motion") {
      const v0val = Number(effectiveSimParams["v0"] || 0);
      const alpha = (Number(effectiveSimParams["angle"] || 0) * Math.PI) / 180;
      const gVal = Number(effectiveSimParams["g"] || 9.8);
      const L = (v0val * v0val * Math.sin(2 * alpha)) / gVal;
      const H = (v0val * v0val * Math.sin(alpha) * Math.sin(alpha)) / (2 * gVal);
      const Tflight = (2 * v0val * Math.sin(alpha)) / gVal;
      row["L"] = L.toFixed(1);
      row["H"] = H.toFixed(1);
      row["T"] = Tflight.toFixed(2);
    }
    setMeasurements((prev) => [...prev, row]);
  };

  const handleDeleteMeasurement = (index: number) => {
    setMeasurements((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearMeasurements = () => {
    setMeasurements([]);
  };

  const averages = useMemo(() => {
    if (measurements.length === 0) return undefined;
    const result: Record<string, string | number> = { "№": "Среднее" };
    const keys = Object.keys(measurements[0]).filter((k) => k !== "№");
    keys.forEach((key) => {
      const values = measurements
        .map((m) => Number(m[key]))
        .filter((v) => !isNaN(v));
      if (values.length > 0) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        result[key] = avg.toFixed(3);
      }
    });
    return result;
  }, [measurements]);

  const handleSaveProgress = () => {
    if (!labWork || !user) {
      toast.error("Необходимо авторизоваться");
      return;
    }
    saveProgress.mutate({
      labWorkId: labWork.id,
      mode: "training",
      status: measurements.length > 0 ? "in_progress" : "not_started",
      data: effectiveSimParams,
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
      data: effectiveSimParams,
      measurements,
      conclusion,
    });
  };

  const SimComponent = slug ? simComponents[slug] : null;

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

  const headers = measurements.length > 0
    ? Object.keys(measurements[0]).map((k) => ({ key: k, label: k }))
    : [];

  return (
    <LabLayout title={labWork.title} topic={labWork.categoryTitle || "Лабораторная работа"}>
      {/* Tabs + Actions bar */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <TabsList className="bg-[#1a1f22] border border-[#37474f] p-1 flex-wrap h-auto">
            <TabsTrigger value="theory" className="text-[#c8cdd1] hover:text-white data-[state=active]:bg-[#2a3237] data-[state=active]:text-[#2eff8c]">
              <BookOpen size={14} className="mr-1.5" />
              Теория
            </TabsTrigger>
            <TabsTrigger value="experiment" className="text-[#c8cdd1] hover:text-white data-[state=active]:bg-[#2a3237] data-[state=active]:text-[#2eff8c]">
              <Play size={14} className="mr-1.5" />
              Эксперимент
            </TabsTrigger>
            <TabsTrigger value="graphs" className="text-[#c8cdd1] hover:text-white data-[state=active]:bg-[#2a3237] data-[state=active]:text-[#2eff8c]">
              <Target size={14} className="mr-1.5" />
              Графики
            </TabsTrigger>
            <TabsTrigger value="conclusion" className="text-[#c8cdd1] hover:text-white data-[state=active]:bg-[#2a3237] data-[state=active]:text-[#2eff8c]">
              <CheckCircle2 size={14} className="mr-1.5" />
              Вывод
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveProgress}
              className="border-[#37474f] text-[#c8cdd1] hover:text-white"
            >
              <Save size={14} className="mr-1" />
              Сохранить
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#25cc70]"
            >
              <Send size={14} className="mr-1" />
              Отправить
            </Button>
          </div>
        </div>

        {/* Theory Tab */}
        <TabsContent value="theory" className="mt-6 space-y-6">
          <div className="bg-[#2a3237] border border-[#434e54] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target size={20} className="text-[#2eff8c]" />
              <h3 className="text-lg font-bold text-white">Цель работы</h3>
            </div>
            <p className="text-[#c8cdd1] leading-relaxed">{labWork.goal}</p>
          </div>

          <div className="bg-[#2a3237] border border-[#434e54] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen size={20} className="text-[#2eff8c]" />
              <h3 className="text-lg font-bold text-white">Теоретические сведения</h3>
            </div>
            <div className="prose prose-invert prose-sm max-w-none text-[#c8cdd1] leading-relaxed">
              {labWork.theory?.split("\n\n").map((paragraph, i) => (
                <p key={i} className="mb-4">{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="bg-[#2a3237] border border-[#434e54] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Wrench size={20} className="text-[#2eff8c]" />
              <h3 className="text-lg font-bold text-white">Оборудование</h3>
            </div>
            {labWork.equipment && (
              <ul className="space-y-2">
                {JSON.parse(labWork.equipment).map((item: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-[#c8cdd1]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2eff8c]" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>

        {/* Experiment Tab — combined simulation + results */}
        <TabsContent value="experiment" className="mt-6 space-y-6">
          {labWork.instruction && (
            <div className="bg-[#1a1f22] border border-[#37474f] rounded-xl p-4 text-sm text-[#c8cdd1]">
              <p className="font-medium text-white mb-2">Пошаговая инструкция:</p>
              <ol className="list-decimal list-inside space-y-1">
                {labWork.instruction.split("\n").filter(Boolean).map((step, i) => (
                  <li key={i}>{step.replace(/^\d+\.\s*/, "")}</li>
                ))}
              </ol>
            </div>
          )}

          <div className="bg-[#2a3237] border border-[#434e54] rounded-2xl p-6">
            <LabControls controls={controls} />
          </div>

          {/* Simulation + Start button */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setIsSimRunning((prev) => !prev)}
                className={
                  isSimRunning
                    ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30"
                    : "bg-[#2eff8c] text-[#0d1117] hover:bg-[#25cc70]"
                }
              >
                {isSimRunning ? (
                  <>
                    <RotateCcw size={16} className="mr-2" />
                    Остановить
                  </>
                ) : (
                  <>
                    <Play size={16} className="mr-2" />
                    Начать симуляцию
                  </>
                )}
              </Button>
              <Button
                onClick={handleAddMeasurement}
                variant="outline"
                className="border-[#37474f] text-[#c8cdd1] hover:text-white"
              >
                <FlaskConical size={16} className="mr-2" />
                Зафиксировать измерение
              </Button>
            </div>

            {SimComponent && (
              <div className="bg-[#1a1f22] border border-[#37474f] rounded-2xl overflow-hidden flex justify-center">
                <SimComponent
                  params={effectiveSimParams}
                  isRunning={isSimRunning}
                  onStateChange={(state) => { simStateRef.current = state; }}
                />
              </div>
            )}
            {!SimComponent && (
              <div className="bg-[#1a1f22] border border-[#37474f] rounded-2xl p-12 text-center text-[#798389]">
                Симуляция для этой лабораторной работы в разработке.
              </div>
            )}
          </div>

          {/* Results table */}
          <ResultsTable
            headers={headers}
            data={measurements}
            onAdd={handleAddMeasurement}
            onDelete={handleDeleteMeasurement}
            onClear={handleClearMeasurements}
            averages={averages}
          />

          {measurements.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(averages || {})
                .filter(([k]) => k !== "№")
                .map(([key, value]) => (
                  <div key={key} className="bg-[#2a3237] border border-[#434e54] rounded-xl p-4">
                    <p className="text-xs text-[#798389] mb-1">Среднее {key}</p>
                    <p className="text-xl font-bold text-[#2eff8c]">{String(value)}</p>
                  </div>
                ))}
            </div>
          )}
        </TabsContent>

        {/* Graphs Tab */}
        <TabsContent value="graphs" className="mt-6">
          <LabGraphs measurements={measurements} slug={slug || ""} />
        </TabsContent>

        {/* Conclusion Tab */}
        <TabsContent value="conclusion" className="mt-6 space-y-6">
          <ConclusionPanel
            template={labWork.conclusionTemplate || ""}
            data={averages || {}}
          />
          <div className="bg-[#2a3237] border border-[#434e54] rounded-2xl p-6">
            <label className="block text-sm text-[#798389] mb-2">Свой вывод</label>
            <textarea
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
              rows={6}
              className="w-full bg-[#1a1f22] border border-[#37474f] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#2eff8c] transition-colors resize-none"
              placeholder="Напишите свой вывод на основе полученных результатов..."
            />
          </div>
        </TabsContent>
      </Tabs>
    </LabLayout>
  );
}

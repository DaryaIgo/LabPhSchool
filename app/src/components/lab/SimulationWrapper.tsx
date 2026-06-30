import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  RotateCcw,
  Ruler,
  Trash2,
  Eraser,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LabControls from "@/components/lab/LabControls";
import ResultsTable from "@/components/lab/ResultsTable";
import ExternalIframeSimulation from "@/components/lab/simulations/ExternalIframeSimulation";
import SimulationChart from "@/components/lab/SimulationChart";
import ExternalDataTables from "@/components/lab/ExternalDataTables";
import ExternalGraphs from "@/components/lab/ExternalGraphs";
import { getRegisteredSimulation } from "@/components/lab/simulations/registry";
import type { ControlItem } from "@/components/lab/LabControls";
import type {
  MeasurementRow,
  RegisteredSimulation,
} from "@/components/lab/simulations/types";
import type { ExternalLabData } from "@/components/lab/external-data";

interface SimulationWrapperProps {
  simulation: {
    slug: string;
    componentRef: string | null;
    kind: string;
    isDynamic: boolean;
    config: unknown;
  } | null;
  cardType: "own" | "external";
  slug: string;
  measurements: MeasurementRow[];
  onMeasurementsChange: (measurements: MeasurementRow[]) => void;
  externalData?: ExternalLabData;
  onExternalDataChange?: (data: ExternalLabData) => void;
}

const DEFAULT_EXTERNAL_DATA: ExternalLabData = {
  tables: [],
  graphs: [],
};

export default function SimulationWrapper({
  simulation,
  cardType,
  slug,
  measurements,
  onMeasurementsChange,
  externalData,
  onExternalDataChange,
}: SimulationWrapperProps) {
  const registered = getRegisteredSimulation(simulation?.componentRef ?? slug);
  const isExternal = cardType === "external";

  if (isExternal || !registered) {
    return (
      <ExternalSimulationView
        simulation={simulation}
        externalData={externalData ?? DEFAULT_EXTERNAL_DATA}
        onExternalDataChange={onExternalDataChange ?? (() => {})}
      />
    );
  }

  return (
    <OwnSimulationView
      registered={registered}
      simulation={simulation}
      measurements={measurements}
      onMeasurementsChange={onMeasurementsChange}
    />
  );
}

interface ExternalSimulationViewProps {
  simulation: SimulationWrapperProps["simulation"];
  externalData: ExternalLabData;
  onExternalDataChange: (data: ExternalLabData) => void;
}

function ExternalSimulationView({
  simulation,
  externalData,
  onExternalDataChange,
}: ExternalSimulationViewProps) {
  const params: Record<string, number | string> = useMemo(() => {
    const defaults: Record<string, number | string> = {};
    if (Array.isArray(simulation?.config)) {
      simulation.config.forEach(
        (p: {
          key: string;
          paramType: string;
          defaultValue?: string | number;
        }) => {
          defaults[p.key] =
            p.defaultValue ??
            (p.paramType === "slider" || p.paramType === "number" ? 0 : "");
        }
      );
    }
    return defaults;
  }, [simulation]);

  const updateTables = useCallback(
    (tables: ExternalLabData["tables"]) => {
      onExternalDataChange({ ...externalData, tables });
    },
    [externalData, onExternalDataChange]
  );

  const updateGraphs = useCallback(
    (graphs: ExternalLabData["graphs"]) => {
      onExternalDataChange({ ...externalData, graphs });
    },
    [externalData, onExternalDataChange]
  );

  return (
    <div className="space-y-4">
      {simulation?.componentRef === "external-iframe" && (
        <div className="bg-[#1a1f22] border border-[#37474f] rounded-2xl overflow-hidden flex justify-center">
          <ExternalIframeSimulation params={params} />
        </div>
      )}
      {!simulation?.componentRef && (
        <div className="bg-[#1a1f22] border border-[#37474f] rounded-2xl p-12 text-center text-[#798389]">
          Симуляция для этой лабораторной работы в разработке.
        </div>
      )}

      <div className="bg-[#2a3237] border border-[#434e54] rounded-2xl p-6 space-y-6">
        <ExternalDataTables
          tables={externalData.tables}
          onChange={updateTables}
        />
      </div>

      <div className="bg-[#2a3237] border border-[#434e54] rounded-2xl p-6 space-y-6">
        <ExternalGraphs
          graphs={externalData.graphs}
          tables={externalData.tables}
          onChange={updateGraphs}
        />
      </div>
    </div>
  );
}

interface OwnSimulationViewProps {
  registered: RegisteredSimulation;
  simulation: SimulationWrapperProps["simulation"];
  measurements: MeasurementRow[];
  onMeasurementsChange: (measurements: MeasurementRow[]) => void;
}

function OwnSimulationView({
  registered,
  measurements,
  onMeasurementsChange,
}: OwnSimulationViewProps) {
  const { manifest, component: SimComponent, computeMeasurement } = registered;
  const blockTitles = manifest.wrapper.blockTitles;

  const [simParams, setSimParams] = useState<Record<string, number | string>>(
    {}
  );
  const [isRunning, setIsRunning] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [currentState, setCurrentState] = useState<Record<string, number>>({});
  const stateRef = useRef<Record<string, number>>({});

  const effectiveParams: Record<string, number | string> = useMemo(() => {
    const defaults: Record<string, number | string> = {};
    manifest.params.forEach(p => {
      defaults[p.key] = p.defaultValue ?? (p.paramType === "select" ? "" : 0);
    });
    return { ...defaults, ...simParams };
  }, [manifest.params, simParams]);

  const controls: ControlItem[] = useMemo(() => {
    return manifest.params.map(p => {
      const value = effectiveParams[p.key] ?? p.defaultValue ?? 0;
      if (p.paramType === "slider") {
        return {
          type: "slider",
          label: p.label,
          value: Number(value),
          min: p.min ?? 0,
          max: p.max ?? 100,
          step: p.step ?? 1,
          unit: p.unit,
          onChange: (v: number) => {
            setSimParams(prev => ({ ...prev, [p.key]: v }));
            setIsRunning(false);
            setHasFinished(false);
          },
        };
      }
      if (p.paramType === "select") {
        return {
          type: "select",
          label: p.label,
          value: String(value),
          options: p.options ?? [],
          onChange: (v: string) => {
            setSimParams(prev => ({ ...prev, [p.key]: v }));
            setIsRunning(false);
            setHasFinished(false);
          },
        };
      }
      return {
        type: "number",
        label: p.label,
        value: Number(value),
        min: p.min,
        max: p.max,
        step: p.step,
        unit: p.unit,
        onChange: (v: number) => {
          setSimParams(prev => ({ ...prev, [p.key]: v }));
          setIsRunning(false);
        },
      };
    });
  }, [manifest.params, effectiveParams]);

  const handleStart = () => {
    setIsRunning(prev => {
      const next = !prev;
      if (next) setHasFinished(false);
      return next;
    });
  };

  const handleReset = () => {
    setIsRunning(false);
    setHasFinished(false);
    setSimParams({});
    setCurrentState({});
    stateRef.current = {};
  };

  const handleAddMeasurement = useCallback(() => {
    const row = computeMeasurement(stateRef.current, effectiveParams);
    onMeasurementsChange([
      ...measurements,
      { "№": measurements.length + 1, ...row },
    ]);
  }, [computeMeasurement, effectiveParams, measurements, onMeasurementsChange]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat) return;

      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
      ) {
        return;
      }

      e.preventDefault();
      handleAddMeasurement();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleAddMeasurement]);

  const handleDeleteMeasurement = (index: number) => {
    onMeasurementsChange(measurements.filter((_, i) => i !== index));
  };

  const handleClearMeasurements = () => {
    onMeasurementsChange([]);
  };

  const headers = useMemo(() => {
    if (measurements.length > 0) {
      return Object.keys(measurements[0]).map(k => ({ key: k, label: k }));
    }
    return [
      { key: "№", label: "№" },
      ...manifest.measurements.map(m => ({
        key: m.key,
        label: `${m.label}${m.unit ? `, ${m.unit}` : ""}`,
      })),
    ];
  }, [measurements, manifest.measurements]);

  return (
    <div className="space-y-4">
      {/* Main simulation area: canvas + controls + sidebar */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left: simulation and controls */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Simulation visualization */}
          <div className="bg-[#1a1f22] border border-[#37474f] rounded-2xl overflow-hidden flex justify-center p-2">
            <SimComponent
              params={effectiveParams}
              isRunning={isRunning}
              isFinished={hasFinished}
              onStateChange={state => {
                stateRef.current = state;
                setCurrentState(state);
                if (state.finished) {
                  setHasFinished(true);
                  setIsRunning(false);
                }
              }}
            />
          </div>

          {/* Controls block */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleStart}
              className={
                isRunning
                  ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30"
                  : "bg-[#2eff8c] text-[#0d1117] hover:bg-[#25cc70]"
              }
            >
              {isRunning ? (
                <>
                  <RotateCcw size={16} className="mr-2" />
                  Остановить
                </>
              ) : (
                <>
                  <Play size={16} className="mr-2" />
                  Старт
                </>
              )}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-white bg-white text-[#0d1117] hover:bg-[#e5e7eb] hover:text-[#0d1117]"
            >
              <Trash2 size={16} className="mr-2" />
              Сброс
            </Button>
            <Button
              onClick={handleAddMeasurement}
              className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#25cc70]"
            >
              <Ruler size={16} className="mr-2" />
              Зафиксировать
            </Button>
          </div>
        </div>

        {/* Right: parameters and current values */}
        <div className="w-full lg:w-64 shrink-0 space-y-3">
          {controls.length > 0 && (
            <div className="bg-[#2a3237] border border-[#434e54] rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3">
                {blockTitles.parameters ?? "Параметры"}
              </h3>
              <LabControls controls={controls} compact />
            </div>
          )}

          {manifest.currentValues.length > 0 && (
            <div className="bg-[#2a3237] border border-[#434e54] rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3">
                {blockTitles.currentValues ?? "Текущие величины"}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {manifest.currentValues.map(item => {
                  const raw = currentState[item.key] ?? 0;
                  const formatted =
                    item.decimals !== undefined
                      ? raw.toFixed(item.decimals)
                      : String(raw);
                  return (
                    <div
                      key={item.key}
                      className="bg-[#1a1f22] border border-[#37474f] rounded-lg p-2"
                    >
                      <p className="text-[10px] text-[#798389] mb-0.5">
                        {item.label}
                        {item.unit ? `, ${item.unit}` : ""}
                      </p>
                      <p className="text-base font-mono font-semibold text-[#2eff8c]">
                        {formatted}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Graphs & Measurements */}
      <div
        className={`grid gap-4 ${
          manifest.wrapper.hasGraphs && manifest.graphs.length > 0
            ? "grid-cols-1 xl:grid-cols-3"
            : "grid-cols-1"
        }`}
      >
        {/* Graphs — main focus, 2/3 width */}
        {manifest.wrapper.hasGraphs && manifest.graphs.length > 0 && (
          <div className="xl:col-span-2 space-y-4">
            {manifest.graphs.map(graph => (
              <GraphCard key={graph.title} title={graph.title}>
                <SimulationChart graph={graph} data={measurements} />
              </GraphCard>
            ))}
          </div>
        )}

        {/* Measurements — compact sidebar, 1/3 width */}
        <div className="bg-[#1a1f22] border border-[#37474f] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Ruler size={16} className="text-[#2eff8c]" />
              <h4 className="text-sm font-semibold text-white">
                {blockTitles.measurements ?? "Измерения"}
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2a3237] text-[#96a3ab]">
                {measurements.length}
              </span>
            </div>
            {measurements.length > 0 && (
              <Button
                onClick={handleClearMeasurements}
                variant="outline"
                size="sm"
                className="h-7 text-xs border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-400"
              >
                <Eraser size={14} className="mr-1" />
                Очистить
              </Button>
            )}
          </div>
          <ResultsTable
            headers={headers}
            data={measurements}
            onDelete={handleDeleteMeasurement}
          />
        </div>
      </div>
    </div>
  );
}

function GraphCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#1a1f22] border border-[#37474f] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={16} className="text-[#2eff8c]" />
        <h4 className="text-sm font-semibold text-white">{title}</h4>
      </div>
      {children}
    </div>
  );
}

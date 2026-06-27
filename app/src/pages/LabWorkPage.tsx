import { useState, useMemo, useRef } from "react";
import { trpc } from "@/providers/trpc";
import { useParams } from "react-router";
import {
  FlaskConical,
  Target,
  Wrench,
  RotateCcw,
  BookOpen,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { toast } from "sonner";
import LabLayout from "@/components/lab/LabLayout";
import LabControls from "@/components/lab/LabControls";
import ResultsTable from "@/components/lab/ResultsTable";
import ConclusionPanel from "@/components/lab/ConclusionPanel";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import LabSidebar from "@/components/lab/LabSidebar";
import type { ControlItem } from "@/components/lab/LabControls";
import DensitySimulation from "@/components/lab/simulations/DensitySimulation";
import ArchimedesSimulation from "@/components/lab/simulations/ArchimedesSimulation";
import ArchimedesForceVsVolumeSimulation from "@/components/lab/simulations/ArchimedesForceVsVolumeSimulation";
import ArchimedesForceVsDensitySimulation from "@/components/lab/simulations/ArchimedesForceVsDensitySimulation";
import BuoyancySimulation from "@/components/lab/simulations/BuoyancySimulation";
import UnderPressurePhetSimulation from "@/components/lab/simulations/UnderPressurePhetSimulation";
import BuoyancyPhetSimulation from "@/components/lab/simulations/BuoyancyPhetSimulation";
import BuoyancyBasicsPhetSimulation from "@/components/lab/simulations/BuoyancyBasicsPhetSimulation";
import FloatingConditionsSimulation from "@/components/lab/simulations/FloatingConditionsSimulation";
import LiquidDensityMeasurementSimulation from "@/components/lab/simulations/LiquidDensityMeasurementSimulation";
import ElectricWorkSimulation from "@/components/lab/simulations/ElectricWorkSimulation";
import UniformLinearMotion from "@/components/lab/simulations/UniformLinearMotion";
import UniformlyAcceleratedMotion from "@/components/lab/simulations/UniformlyAcceleratedMotion";
import FreeFallG from "@/components/lab/simulations/FreeFallG";
import CircularMotion from "@/components/lab/simulations/CircularMotion";
import ProjectilePhetSimulation from "@/components/lab/simulations/ProjectilePhetSimulation";
import LightReflectionSimulation from "@/components/lab/simulations/LightReflectionSimulation";
import LightRefractionSimulation from "@/components/lab/simulations/LightRefractionSimulation";
import RefractionIndexSimulation from "@/components/lab/simulations/RefractionIndexSimulation";
import LensFocalSimulation from "@/components/lab/simulations/LensFocalSimulation";
import LensImageSimulation from "@/components/lab/simulations/LensImageSimulation";
import WavelengthMeasurementSimulation from "@/components/lab/simulations/WavelengthMeasurementSimulation";
import InterferenceDiffractionSimulation from "@/components/lab/simulations/InterferenceDiffractionSimulation";
import EmissionSpectraSimulation from "@/components/lab/simulations/EmissionSpectraSimulation";
import BoyleMariotteSimulation from "@/components/lab/simulations/BoyleMariotteSimulation";
import IsobaricProcessSimulation from "@/components/lab/simulations/IsobaricProcessSimulation";
import IsochoricProcessSimulation from "@/components/lab/simulations/IsochoricProcessSimulation";
import SpecificHeatCapacitySimulation from "@/components/lab/simulations/SpecificHeatCapacitySimulation";
import RelativeHumiditySimulation from "@/components/lab/simulations/RelativeHumiditySimulation";
import SurfaceTensionSimulation from "@/components/lab/simulations/SurfaceTensionSimulation";
import BalancingActSimulation from "@/components/lab/simulations/BalancingActSimulation";
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
  "archimedes-force-vs-volume": ArchimedesForceVsVolumeSimulation,
  "archimedes-force-vs-density": ArchimedesForceVsDensitySimulation,
  "buoyancy-independence": BuoyancySimulation,
  "floating-conditions": FloatingConditionsSimulation,
  "liquid-density-measurement": LiquidDensityMeasurementSimulation,
  "under-pressure-phet": UnderPressurePhetSimulation,
  "buoyancy-phet": BuoyancyPhetSimulation,
  "buoyancy-basics-phet": BuoyancyBasicsPhetSimulation,
  "electric-work-measurement": ElectricWorkSimulation,
  "uniform-linear-motion": UniformLinearMotion,
  "uniformly-accelerated-motion": UniformlyAcceleratedMotion,
  "free-fall-g": FreeFallG,
  "circular-motion": CircularMotion,
  "projectile-motion": ProjectilePhetSimulation,
  "light-reflection": LightReflectionSimulation,
  "light-refraction": LightRefractionSimulation,
  "glass-refraction-index": RefractionIndexSimulation,
  "converging-lens-focus": LensFocalSimulation,
  "lens-image-formation": LensImageSimulation,
  "wavelength-measurement": WavelengthMeasurementSimulation,
  "interference-diffraction": InterferenceDiffractionSimulation,
  "emission-spectra": EmissionSpectraSimulation,
  "boyle-mariotte": BoyleMariotteSimulation,
  "isobaric-process": IsobaricProcessSimulation,
  "isochoric-process": IsochoricProcessSimulation,
  "specific-heat-capacity": SpecificHeatCapacitySimulation,
  "relative-humidity": RelativeHumiditySimulation,
  "surface-tension": SurfaceTensionSimulation,
  "balancing-act": BalancingActSimulation,
};

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
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [activeTab, setActiveTab] = useState("theory");
  const [measurements, setMeasurements] = useState<
    Record<string, string | number>[]
  >([]);
  const [simParams, setSimParams] = useState<Record<string, number | string>>(
    {}
  );
  const [conclusion, setConclusion] = useState("");
  const [isSimRunning, setIsSimRunning] = useState(false);
  const simStateRef = useRef<Record<string, number>>({});

  const saveProgress = trpc.virtualLab.saveLabProgress.useMutation({
    onSuccess: () => {
      toast.success("Прогресс сохранён");
      utils.virtualLab.getMyLabProgress.invalidate();
    },
    onError: err => toast.error(err.message),
  });

  // Compute effective params: DB defaults merged with user overrides
  const effectiveSimParams: Record<string, number | string> = (() => {
    if (!labWork?.params) return simParams;
    const defaults: Record<string, number | string> = {};
    labWork.params.forEach(p => {
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
    return labWork.params.map(p => {
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
            setSimParams(prev => ({ ...prev, [p.key]: v }));
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
            setSimParams(prev => ({ ...prev, [p.key]: v }));
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
          setSimParams(prev => ({ ...prev, [p.key]: v }));
          setIsSimRunning(false);
        },
      };
    });
  })();

  const handleAddMeasurement = () => {
    const row: Record<string, string | number> = {
      "№": measurements.length + 1,
    };
    labWork?.params?.forEach(p => {
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
    } else if (slug === "archimedes-force-vs-volume") {
      const rho = Number(effectiveSimParams["liquidDensity"] || 1000);
      const v = Number(effectiveSimParams["bodyVolume"] || 0);
      const level = Number(effectiveSimParams["immersionLevel"] || 100);
      const g = 9.8;
      const fa = rho * g * (v * 1e-6) * (level / 100);
      row["Fₐ"] = fa.toFixed(4);
      row["Vпогр"] = (v * (level / 100)).toFixed(1);
      row["V"] = v;
    } else if (slug === "archimedes-force-vs-density") {
      const rho = Number(effectiveSimParams["liquidDensity"] || 1000);
      const v = Number(effectiveSimParams["bodyVolume"] || 0);
      const g = 9.8;
      const fa = rho * g * (v * 1e-6);
      row["Fₐ"] = fa.toFixed(4);
      row["ρж"] = rho;
      row["V"] = v;
    } else if (slug === "floating-conditions") {
      const rhoBody = Number(effectiveSimParams["bodyDensity"] || 800);
      const rhoLiquid = Number(effectiveSimParams["liquidDensity"] || 1000);
      const v = Number(effectiveSimParams["bodyVolume"] || 0);
      const g = 9.8;
      const gravity = rhoBody * (v * 1e-6) * g;
      const maxFa = rhoLiquid * (v * 1e-6) * g;
      const fa = rhoBody < rhoLiquid ? gravity : maxFa;
      let state = "тонет";
      if (rhoBody < rhoLiquid) state = "всплывает";
      else if (Math.abs(rhoBody - rhoLiquid) < 10) state = "плавает внутри";
      row["Fтяж"] = gravity.toFixed(4);
      row["Fₐ"] = fa.toFixed(4);
      row["состояние"] = state;
    } else if (slug === "liquid-density-measurement") {
      const v = Number(effectiveSimParams["bodyVolume"] || 0);
      const pAir = Number(effectiveSimParams["weightInAir"] || 0);
      const pLiquid = Number(effectiveSimParams["weightInLiquid"] || 0);
      const g = 9.8;
      const fa = pAir - pLiquid;
      const rho = v > 0 ? fa / (g * v * 1e-6) : 0;
      row["Pвозд"] = pAir.toFixed(2);
      row["Pжид"] = pLiquid.toFixed(2);
      row["Fₐ"] = fa.toFixed(4);
      row["ρж"] = rho.toFixed(0);
    } else if (slug === "under-pressure-phet") {
      const depth = Number(effectiveSimParams["depth"] || 0);
      const rho = Number(effectiveSimParams["liquidDensity"] || 1000);
      const area = Number(effectiveSimParams["area"] || 1);
      const g = 9.8;
      const pressure = rho * g * depth;
      const force = pressure * area;
      row["h"] = depth.toFixed(2);
      row["ρ"] = rho;
      row["S"] = area.toFixed(2);
      row["p"] = (pressure / 1000).toFixed(2);
      row["F"] = force.toFixed(2);
    } else if (slug === "buoyancy-phet") {
      const v = Number(effectiveSimParams["bodyVolume"] || 0);
      const rhoBody = Number(effectiveSimParams["bodyDensity"] || 800);
      const rhoLiquid = Number(effectiveSimParams["liquidDensity"] || 1000);
      const g = 9.8;
      const gravity = rhoBody * (v * 1e-6) * g;
      const maxFa = rhoLiquid * (v * 1e-6) * g;
      const fa = rhoBody < rhoLiquid ? gravity : maxFa;
      row["V"] = v;
      row["ρт"] = rhoBody;
      row["ρж"] = rhoLiquid;
      row["Fтяж"] = gravity.toFixed(4);
      row["Fₐ"] = fa.toFixed(4);
    } else if (slug === "buoyancy-basics-phet") {
      const v = Number(effectiveSimParams["bodyVolume"] || 0);
      const mass = Number(effectiveSimParams["bodyMass"] || 0);
      const rhoLiquid = Number(effectiveSimParams["liquidDensity"] || 1000);
      const g = 9.8;
      const rhoBody = v > 0 ? mass / 1000 / (v * 1e-6) : 0;
      const gravity = (mass / 1000) * g;
      const maxFa = rhoLiquid * (v * 1e-6) * g;
      const fa = rhoBody < rhoLiquid ? gravity : maxFa;
      row["m"] = mass;
      row["V"] = v;
      row["ρт"] = rhoBody.toFixed(0);
      row["ρж"] = rhoLiquid;
      row["Fтяж"] = gravity.toFixed(4);
      row["Fₐ"] = fa.toFixed(4);
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
      const simTime =
        simStateRef.current.time ?? Number(effectiveSimParams["time"] || 0);
      row["time"] = simTime.toFixed(1);
      row["s"] = (speed * simTime).toFixed(1);
      row["x"] = (startX + speed * simTime).toFixed(1);
      row["v"] = speed;
    } else if (slug === "uniformly-accelerated-motion") {
      const v0 = Number(effectiveSimParams["v0"] || 0);
      const angleDeg = Number(effectiveSimParams["angle"] || 10);
      const a = 9.8 * Math.sin((angleDeg * Math.PI) / 180);
      const simTime =
        simStateRef.current.time ?? Number(effectiveSimParams["time"] || 5);
      row["time"] = simTime.toFixed(1);
      row["v"] = (v0 + a * simTime).toFixed(1);
      row["s"] = (v0 * simTime + 0.5 * a * simTime * simTime).toFixed(1);
    } else if (slug === "free-fall-g") {
      const method = String(effectiveSimParams["method"] || "pendulum");
      row["method"] = method === "pendulum" ? "маятник" : "падение";
      if (method === "pendulum") {
        const l = Number(effectiveSimParams["length"] || 0);
        const n = Number(effectiveSimParams["oscillations"] || 1);
        const tm = Number(effectiveSimParams["measuredTime"] || 0);
        const T = tm / n;
        const gCalc = (4 * Math.PI * Math.PI * l) / (T * T);
        row["l"] = l.toFixed(2);
        row["n"] = n;
        row["t"] = tm.toFixed(1);
        row["T"] = T.toFixed(3);
        row["g"] = gCalc.toFixed(2);
      } else {
        const h = Number(effectiveSimParams["height"] || 0);
        const t = Number(effectiveSimParams["fallTime"] || 0);
        const trials = Number(effectiveSimParams["trials"] || 1);
        const gCalc = t > 0 ? (2 * h) / (t * t) : 0;
        row["h"] = h.toFixed(1);
        row["t"] = t.toFixed(2);
        row["t2"] = (t * t).toFixed(3);
        row["N"] = trials;
        row["g"] = gCalc.toFixed(2);
      }
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
      const H =
        (v0val * v0val * Math.sin(alpha) * Math.sin(alpha)) / (2 * gVal);
      const Tflight = (2 * v0val * Math.sin(alpha)) / gVal;
      row["L"] = L.toFixed(1);
      row["H"] = H.toFixed(1);
      row["T"] = Tflight.toFixed(2);
    } else if (slug === "light-reflection") {
      const alpha = Number(effectiveSimParams["incidentAngle"] || 0);
      row["α"] = alpha.toFixed(0);
      row["β"] = alpha.toFixed(0);
      row["α+β"] = (2 * alpha).toFixed(0);
    } else if (slug === "light-refraction") {
      const alpha = Number(effectiveSimParams["incidentAngle"] || 0);
      const n = Number(effectiveSimParams["medium"] || 1.5);
      const alphaRad = (alpha * Math.PI) / 180;
      const sinBeta = Math.min(Math.sin(alphaRad) / n, 1);
      const beta = (Math.asin(sinBeta) * 180) / Math.PI;
      row["α"] = alpha.toFixed(0);
      row["β"] = beta.toFixed(1);
      row["n"] = n.toFixed(2);
    } else if (slug === "glass-refraction-index") {
      const alpha = Number(effectiveSimParams["incidentAngle"] || 45);
      const n = Number(effectiveSimParams["nGlass"] || 1.5);
      const alphaRad = (alpha * Math.PI) / 180;
      const sinBeta = Math.min(Math.sin(alphaRad) / n, 1);
      const beta = (Math.asin(sinBeta) * 180) / Math.PI;
      const nMeasured = Math.sin(alphaRad) / Math.sin((beta * Math.PI) / 180);
      row["α"] = alpha.toFixed(0);
      row["β"] = beta.toFixed(1);
      row["n_изм"] = nMeasured.toFixed(2);
      row["n_табл"] = n.toFixed(2);
    } else if (slug === "converging-lens-focus") {
      const d = Number(effectiveSimParams["objectDistance"] || 30);
      const F = Number(effectiveSimParams["focalLength"] || 10);
      const f = d > F ? 1 / (1 / F - 1 / d) : 0;
      const D = 100 / F;
      const gamma = f / d;
      row["d"] = d.toFixed(1);
      row["f"] = f.toFixed(1);
      row["F"] = F.toFixed(1);
      row["D"] = D.toFixed(2);
      row["Γ"] = gamma.toFixed(2);
    } else if (slug === "lens-image-formation") {
      const d = Number(effectiveSimParams["objectDistance"] || 30);
      const F = Number(effectiveSimParams["focalLength"] || 10);
      const h = Number(effectiveSimParams["objectHeight"] || 3);
      let f = 0;
      let gamma = 0;
      let imageType = "";
      if (d > 2 * F) {
        f = 1 / (1 / F - 1 / d);
        gamma = f / d;
        imageType = "уменьшенное, перевёрнутое, действительное";
      } else if (Math.abs(d - 2 * F) < 0.1) {
        f = 1 / (1 / F - 1 / d);
        gamma = f / d;
        imageType = "равное, перевёрнутое, действительное";
      } else if (d > F && d < 2 * F) {
        f = 1 / (1 / F - 1 / d);
        gamma = f / d;
        imageType = "увеличенное, перевёрнутое, действительное";
      } else if (Math.abs(d - F) < 0.1) {
        f = Infinity;
        gamma = Infinity;
        imageType = "нет изображения";
      } else {
        f = 1 / (1 / F - 1 / d);
        gamma = Math.abs(f / d);
        imageType = "увеличенное, прямое, мнимое";
      }
      row["d"] = d.toFixed(1);
      row["F"] = F.toFixed(1);
      row["f"] = Number.isFinite(f) ? Math.abs(f).toFixed(1) : "∞";
      row["Γ"] = Number.isFinite(gamma) ? gamma.toFixed(2) : "∞";
      row["h"] = h.toFixed(1);
      row["тип"] = imageType;
    } else if (slug === "wavelength-measurement") {
      const d = Number(effectiveSimParams["gratingConstant"] || 1.0);
      const phi = Number(effectiveSimParams["diffractionAngle"] || 20);
      const k = Number(effectiveSimParams["order"] || 1);
      const lambda = (d * 1000 * Math.sin((phi * Math.PI) / 180)) / k;
      row["d"] = d.toFixed(1);
      row["φ"] = phi.toFixed(1);
      row["k"] = k;
      row["λ"] = lambda.toFixed(1);
    } else if (slug === "interference-diffraction") {
      const d = Number(effectiveSimParams["slitDistance"] || 0.5);
      const L = Number(effectiveSimParams["screenDistance"] || 1.0);
      const dx = Number(effectiveSimParams["fringeSpacing"] || 1.0);
      const lambda = (d * dx) / L;
      row["d"] = d.toFixed(1);
      row["L"] = L.toFixed(1);
      row["Δx"] = dx.toFixed(1);
      row["λ"] = lambda.toFixed(1);
    } else if (slug === "emission-spectra") {
      const substance = String(effectiveSimParams["substance"] || "hydrogen");
      const spectrumType = String(effectiveSimParams["spectrumType"] || "line");
      const substanceNames: Record<string, string> = {
        hydrogen: "Водород",
        helium: "Гелий",
        neon: "Неон",
        sodium: "Натрий",
        mercury: "Ртуть",
        tungsten: "Вольфрам",
      };
      const spectrumNames: Record<string, string> = {
        line: "линейчатый",
        continuous: "сплошной",
      };
      row["вещество"] = substanceNames[substance] || substance;
      row["тип спектра"] = spectrumNames[spectrumType] || spectrumType;
    } else if (slug === "boyle-mariotte") {
      const temperature = Number(effectiveSimParams["temperature"] || 0);
      const volume = Number(effectiveSimParams["volume"] || 0);
      const amount = Number(effectiveSimParams["amount"] || 0);
      const R = 8.31;
      const pressure =
        volume > 0 ? (amount * R * temperature) / (volume * 1e-3) / 1000 : 0;
      row["T"] = temperature.toFixed(0);
      row["V"] = volume.toFixed(1);
      row["p"] = pressure.toFixed(1);
      row["pV"] = (pressure * volume).toFixed(2);
    } else if (slug === "isobaric-process") {
      const pressure = Number(effectiveSimParams["pressure"] || 0);
      const temperature = Number(effectiveSimParams["temperature"] || 0);
      const amount = Number(effectiveSimParams["amount"] || 0);
      const R = 8.31;
      const volume =
        pressure > 0
          ? ((amount * R * temperature) / (pressure * 1000)) * 1000
          : 0;
      row["p"] = pressure.toFixed(0);
      row["T"] = temperature.toFixed(0);
      row["V"] = volume.toFixed(2);
      row["V/T"] = temperature > 0 ? (volume / temperature).toFixed(4) : "0";
    } else if (slug === "isochoric-process") {
      const volume = Number(effectiveSimParams["volume"] || 0);
      const temperature = Number(effectiveSimParams["temperature"] || 0);
      const amount = Number(effectiveSimParams["amount"] || 0);
      const R = 8.31;
      const pressure =
        volume > 0 ? (amount * R * temperature) / (volume * 1e-3) / 1000 : 0;
      row["V"] = volume.toFixed(1);
      row["T"] = temperature.toFixed(0);
      row["p"] = pressure.toFixed(1);
      row["p/T"] = temperature > 0 ? (pressure / temperature).toFixed(3) : "0";
    } else if (slug === "specific-heat-capacity") {
      const bodyMass = Number(effectiveSimParams["bodyMass"] || 0);
      const waterMass = Number(effectiveSimParams["waterMass"] || 0);
      const bodyTemp = Number(effectiveSimParams["bodyTemp"] || 0);
      const waterTemp = Number(effectiveSimParams["waterTemp"] || 0);
      const material = String(effectiveSimParams["material"] || "aluminum");
      const materialData: Record<string, { c: number }> = {
        aluminum: { c: 920 },
        copper: { c: 390 },
        steel: { c: 500 },
        lead: { c: 130 },
      };
      const cWater = 4200;
      const cTabl = materialData[material]?.c ?? 920;
      const mt = bodyMass / 1000;
      const mw = waterMass / 1000;
      const equilibriumTemp =
        (cTabl * mt * bodyTemp + cWater * mw * waterTemp) /
        (cTabl * mt + cWater * mw);
      const measuredC =
        mt > 0 && bodyTemp > equilibriumTemp
          ? (cWater * mw * (equilibriumTemp - waterTemp)) /
            (mt * (bodyTemp - equilibriumTemp))
          : 0;
      row["m_т"] = bodyMass.toFixed(0);
      row["m_в"] = waterMass.toFixed(0);
      row["T_т"] = bodyTemp.toFixed(0);
      row["T_в"] = waterTemp.toFixed(0);
      row["T_р"] = equilibriumTemp.toFixed(1);
      row["c_изм"] = measuredC.toFixed(0);
    } else if (slug === "relative-humidity") {
      const dryTemp = Number(effectiveSimParams["dryTemp"] || 0);
      const wetTemp = Number(effectiveSimParams["wetTemp"] || 0);
      const deltaT = dryTemp - wetTemp;
      const rh =
        deltaT <= 0
          ? 100
          : Math.max(
              10,
              Math.min(
                100,
                Math.round(100 - deltaT * (4.5 + 0.1 * (dryTemp - 20)))
              )
            );
      row["T_сух"] = dryTemp.toFixed(0);
      row["T_влж"] = wetTemp.toFixed(0);
      row["ΔT"] = deltaT.toFixed(1);
      row["φ"] = rh;
    } else if (slug === "surface-tension") {
      const dropCount = Number(effectiveSimParams["dropCount"] || 1);
      const totalMass = Number(effectiveSimParams["totalMass"] || 0);
      const radius = Number(effectiveSimParams["radius"] || 1);
      const g = 9.8;
      const dropMassMg = dropCount > 0 ? (totalMass / dropCount) * 1000 : 0;
      const detachForce = (dropMassMg / 1e6) * g * 1000;
      const sigma =
        radius > 0 ? (detachForce / (2 * Math.PI * radius)) * 1000 : 0;
      row["N"] = dropCount;
      row["m_кап"] = dropMassMg.toFixed(1);
      row["F_отр"] = detachForce.toFixed(2);
      row["σ_изм"] = sigma.toFixed(1);
    } else if (slug === "balancing-act") {
      const leftMass = Number(effectiveSimParams["leftMass"] || 0);
      const leftDistance = Number(effectiveSimParams["leftDistance"] || 0);
      const rightMass = Number(effectiveSimParams["rightMass"] || 0);
      const rightDistance = Number(effectiveSimParams["rightDistance"] || 0);
      const g = 9.8;
      const leftForce = (leftMass / 1000) * g;
      const rightForce = (rightMass / 1000) * g;
      const leftMoment = leftForce * leftDistance;
      const rightMoment = rightForce * rightDistance;
      row["m_лев"] = leftMass;
      row["d_лев"] = leftDistance;
      row["m_прав"] = rightMass;
      row["d_прав"] = rightDistance;
      row["M_лев"] = leftMoment.toFixed(2);
      row["M_прав"] = rightMoment.toFixed(2);
      row["ΔM"] = (leftMoment - rightMoment).toFixed(2);
    }
    setMeasurements(prev => [...prev, row]);
  };

  const handleDeleteMeasurement = (index: number) => {
    setMeasurements(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearMeasurements = () => {
    setMeasurements([]);
  };

  const averages = useMemo(() => {
    if (measurements.length === 0) return undefined;
    const result: Record<string, string | number> = { "№": "Среднее" };
    const keys = Object.keys(measurements[0]).filter(k => k !== "№");
    keys.forEach(key => {
      const values = measurements
        .map(m => Number(m[key]))
        .filter(v => !isNaN(v));
      if (values.length > 0) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        result[key] = avg.toFixed(3);
      }
    });
    return result;
  }, [measurements]);

  const conclusionData = useMemo(() => {
    const data: Record<string, string | number> = { ...(averages || {}) };

    if (labWork?.params) {
      labWork.params.forEach(p => {
        data[p.key] = effectiveSimParams[p.key] ?? p.defaultValue ?? "";
      });
    }

    if (slug === "uniform-linear-motion") {
      const avgV = Number(data["v"]);
      const theoreticalSpeed = Number(effectiveSimParams["speed"] || 1);
      data["avgSpeed"] = avgV.toFixed(2);
      data["errorPercent"] =
        theoreticalSpeed > 0
          ? (
              (Math.abs(avgV - theoreticalSpeed) / theoreticalSpeed) *
              100
            ).toFixed(1)
          : "0.0";
    } else if (slug === "uniformly-accelerated-motion") {
      const v0 = Number(effectiveSimParams["v0"] || 0);
      const angleDeg = Number(effectiveSimParams["angle"] || 10);
      const theoreticalA = 9.8 * Math.sin((angleDeg * Math.PI) / 180);
      const avgS = Number(data["s"]);
      const avgTime = Number(data["time"]);
      let expA = theoreticalA;
      if (avgTime > 0) {
        expA = (2 * (avgS - v0 * avgTime)) / (avgTime * avgTime);
      }
      data["v0"] = v0.toFixed(1);
      data["avgAccel"] = Math.abs(expA).toFixed(2);
      data["theoreticalAccel"] = theoreticalA.toFixed(2);
    } else if (slug === "free-fall-g") {
      const pendulumMeasurements = measurements.filter(
        m => m.method === "маятник"
      );
      const fallMeasurements = measurements.filter(m => m.method === "падение");

      const pendulumGs = pendulumMeasurements
        .map(m => Number(m["g"]))
        .filter(v => !isNaN(v));
      const fallGs = fallMeasurements
        .map(m => Number(m["g"]))
        .filter(v => !isNaN(v));

      if (pendulumGs.length > 0) {
        const avgGPendulum =
          pendulumGs.reduce((a, b) => a + b, 0) / pendulumGs.length;
        data["avgGPendulum"] = avgGPendulum.toFixed(2);
        data["errorPercentPendulum"] = (
          (Math.abs(avgGPendulum - 9.8) / 9.8) *
          100
        ).toFixed(1);
      } else {
        data["avgGPendulum"] = "не проведено";
        data["errorPercentPendulum"] = "—";
      }

      if (fallGs.length > 0) {
        const avgGFall = fallGs.reduce((a, b) => a + b, 0) / fallGs.length;
        data["avgGFall"] = avgGFall.toFixed(2);
        data["errorPercentFall"] = (
          (Math.abs(avgGFall - 9.8) / 9.8) *
          100
        ).toFixed(1);
      } else {
        data["avgGFall"] = "не проведено";
        data["errorPercentFall"] = "—";
      }

      const allGs = [...pendulumGs, ...fallGs];
      if (allGs.length > 0) {
        const avgAll = allGs.reduce((a, b) => a + b, 0) / allGs.length;
        const diff = Math.abs(avgAll - 9.8);
        if (diff < 0.5) {
          data["comparison"] = "близки";
        } else if (diff < 1.5) {
          data["comparison"] = "приближённо соответствуют";
        } else {
          data["comparison"] = "имеют значительное отклонение от";
        }
      } else {
        data["comparison"] = "требуют проведения измерений для сравнения с";
      }
    } else if (slug === "circular-motion") {
      data["avgRadius"] = Number(effectiveSimParams["radius"] || 0).toFixed(2);
      data["avgPeriod"] = Number(effectiveSimParams["period"] || 0).toFixed(2);
      data["avgV"] = Number(data["v"] || 0).toFixed(2);
      data["avgOmega"] = Number(data["ω"] || 0).toFixed(2);
      data["avgA"] = Number(data["a"] || 0).toFixed(2);
    } else if (slug === "projectile-motion") {
      const Ls = measurements.map(m => Number(m["L"])).filter(v => !isNaN(v));
      const Hs = measurements.map(m => Number(m["H"])).filter(v => !isNaN(v));
      data["maxL"] = Ls.length > 0 ? Math.max(...Ls).toFixed(1) : "0.0";
      data["maxH"] = Hs.length > 0 ? Math.max(...Hs).toFixed(1) : "0.0";
      data["avgV0"] = Number(effectiveSimParams["v0"] || 0).toFixed(1);
    } else if (slug === "density-measurement") {
      const avgRho = Number(data["ρ"]);
      data["avgDensity"] = avgRho.toFixed(2);
      data["unit"] = "кг/м³";
      const theoretical = 1000;
      data["theoreticalDensity"] = theoretical;
      data["errorPercent"] =
        theoretical > 0
          ? ((Math.abs(avgRho - theoretical) / theoretical) * 100).toFixed(1)
          : "0.0";
    } else if (slug === "archimedes-force") {
      const avgFa = Number(data["Fₐ"]);
      data["avgFaWater"] = avgFa.toFixed(3);
      data["avgFaSalt"] = (avgFa * 1.03).toFixed(3);
    } else if (slug === "buoyancy-independence") {
      const v = Number(effectiveSimParams["bodyVolume"] || 0);
      data["volume"] = v.toFixed(1);
      data["mass1"] = "50";
      data["mass2"] = "100";
      const avgFa = Number(data["Fₐ"]);
      data["fa1"] = avgFa.toFixed(3);
      data["fa2"] = avgFa.toFixed(3);
    } else if (slug === "archimedes-force-vs-volume") {
      const v = Number(effectiveSimParams["bodyVolume"] || 0);
      const rho = Number(effectiveSimParams["liquidDensity"] || 1000);
      const avgFa = Number(data["Fₐ"] || 0);
      data["volume"] = v.toFixed(0);
      data["liquidDensity"] = rho;
      data["avgFa"] = avgFa.toFixed(4);
      const faMax = rho * 9.8 * (v * 1e-6);
      data["faMax"] = faMax.toFixed(4);
    } else if (slug === "archimedes-force-vs-density") {
      const v = Number(effectiveSimParams["bodyVolume"] || 0);
      const rho = Number(effectiveSimParams["liquidDensity"] || 1000);
      const avgFa = Number(data["Fₐ"] || 0);
      data["volume"] = v.toFixed(0);
      data["liquidDensity"] = rho;
      data["avgFa"] = avgFa.toFixed(4);
    } else if (slug === "floating-conditions") {
      const rhoBody = Number(effectiveSimParams["bodyDensity"] || 800);
      const rhoLiquid = Number(effectiveSimParams["liquidDensity"] || 1000);
      let state = "тонет";
      if (rhoBody < rhoLiquid) state = "всплывает";
      else if (Math.abs(rhoBody - rhoLiquid) < 10)
        state = "плавает внутри жидкости";
      data["bodyDensity"] = rhoBody;
      data["liquidDensity"] = rhoLiquid;
      data["avgGravity"] = Number(data["Fтяж"] || 0).toFixed(4);
      data["avgFa"] = Number(data["Fₐ"] || 0).toFixed(4);
      data["state"] = state;
    } else if (slug === "liquid-density-measurement") {
      const v = Number(effectiveSimParams["bodyVolume"] || 0);
      const avgFa = Number(data["Fₐ"] || 0);
      const avgRho = Number(data["ρж"] || 0);
      data["volume"] = v.toFixed(0);
      data["avgFa"] = avgFa.toFixed(4);
      data["avgRho"] = avgRho.toFixed(0);
    } else if (slug === "under-pressure-phet") {
      const depth = Number(effectiveSimParams["depth"] || 0);
      const rho = Number(effectiveSimParams["liquidDensity"] || 1000);
      const avgP = Number(data["p"] || 0);
      const avgF = Number(data["F"] || 0);
      data["depth"] = depth.toFixed(2);
      data["liquidDensity"] = rho;
      data["avgPressure"] = avgP.toFixed(2);
      data["avgForce"] = avgF.toFixed(2);
    } else if (slug === "buoyancy-phet") {
      const v = Number(effectiveSimParams["bodyVolume"] || 0);
      const rhoBody = Number(effectiveSimParams["bodyDensity"] || 800);
      const rhoLiquid = Number(effectiveSimParams["liquidDensity"] || 1000);
      let state = "тонет";
      if (rhoBody < rhoLiquid) state = "всплывает";
      else if (Math.abs(rhoBody - rhoLiquid) < 10)
        state = "плавает внутри жидкости";
      data["volume"] = v.toFixed(0);
      data["bodyDensity"] = rhoBody;
      data["liquidDensity"] = rhoLiquid;
      data["avgGravity"] = Number(data["Fтяж"] || 0).toFixed(4);
      data["avgFa"] = Number(data["Fₐ"] || 0).toFixed(4);
      data["state"] = state;
    } else if (slug === "buoyancy-basics-phet") {
      const v = Number(effectiveSimParams["bodyVolume"] || 0);
      const mass = Number(effectiveSimParams["bodyMass"] || 0);
      const rhoLiquid = Number(effectiveSimParams["liquidDensity"] || 1000);
      const rhoBody = v > 0 ? mass / 1000 / (v * 1e-6) : 0;
      data["volume"] = v.toFixed(0);
      data["mass"] = mass.toFixed(0);
      data["bodyDensity"] = rhoBody.toFixed(0);
      data["liquidDensity"] = rhoLiquid;
      data["avgGravity"] = Number(data["Fтяж"] || 0).toFixed(4);
      data["avgFa"] = Number(data["Fₐ"] || 0).toFixed(4);
    } else if (slug === "electric-work-measurement") {
      const u = Number(effectiveSimParams["voltage"] || 0);
      const r = Number(effectiveSimParams["resistance"] || 1);
      const t = Number(effectiveSimParams["time"] || 0);
      const i = u / r;
      data["voltage"] = u.toFixed(1);
      data["current"] = i.toFixed(2);
      data["time"] = t.toFixed(1);
      data["work"] = Number(data["A"] || 0).toFixed(1);
      data["power"] = Number(data["P"] || 0).toFixed(1);
    } else if (slug === "light-reflection") {
      const alpha = Number(effectiveSimParams["incidentAngle"] || 0);
      data["alpha"] = alpha.toFixed(0);
      data["beta"] = alpha.toFixed(0);
    } else if (slug === "light-refraction") {
      const alpha = Number(effectiveSimParams["incidentAngle"] || 0);
      const n = Number(effectiveSimParams["medium"] || 1.5);
      const alphaRad = (alpha * Math.PI) / 180;
      const sinBeta = Math.min(Math.sin(alphaRad) / n, 1);
      const beta = (Math.asin(sinBeta) * 180) / Math.PI;
      data["alpha"] = alpha.toFixed(0);
      data["beta"] = beta.toFixed(1);
      data["n"] = n.toFixed(2);
    } else if (slug === "glass-refraction-index") {
      const alpha = Number(effectiveSimParams["incidentAngle"] || 45);
      const n = Number(effectiveSimParams["nGlass"] || 1.5);
      const alphaRad = (alpha * Math.PI) / 180;
      const sinBeta = Math.min(Math.sin(alphaRad) / n, 1);
      const beta = (Math.asin(sinBeta) * 180) / Math.PI;
      const nMeasured = Math.sin(alphaRad) / Math.sin((beta * Math.PI) / 180);
      data["nMeasured"] = nMeasured.toFixed(2);
      data["nTabular"] = n.toFixed(2);
    } else if (slug === "converging-lens-focus") {
      const d = Number(effectiveSimParams["objectDistance"] || 30);
      const F = Number(effectiveSimParams["focalLength"] || 10);
      const f = d > F ? 1 / (1 / F - 1 / d) : 0;
      const D = 100 / F;
      data["F"] = F.toFixed(1);
      data["d"] = d.toFixed(1);
      data["f"] = f.toFixed(1);
      data["Fcalc"] = f.toFixed(1);
      data["D"] = D.toFixed(2);
    } else if (slug === "lens-image-formation") {
      const d = Number(effectiveSimParams["objectDistance"] || 30);
      const F = Number(effectiveSimParams["focalLength"] || 10);
      let gamma = 0;
      let imageType = "";
      if (d > 2 * F) {
        const f = 1 / (1 / F - 1 / d);
        gamma = f / d;
        imageType = "уменьшенное, перевёрнутое, действительное";
      } else if (Math.abs(d - 2 * F) < 0.1) {
        const f = 1 / (1 / F - 1 / d);
        gamma = f / d;
        imageType = "равное, перевёрнутое, действительное";
      } else if (d > F && d < 2 * F) {
        const f = 1 / (1 / F - 1 / d);
        gamma = f / d;
        imageType = "увеличенное, перевёрнутое, действительное";
      } else if (Math.abs(d - F) < 0.1) {
        gamma = Infinity;
        imageType = "нет изображения";
      } else {
        const f = 1 / (1 / F - 1 / d);
        gamma = Math.abs(f / d);
        imageType = "увеличенное, прямое, мнимое";
      }
      data["d"] = d.toFixed(1);
      data["gamma"] = Number.isFinite(gamma) ? gamma.toFixed(2) : "∞";
      data["imageType"] = imageType;
    } else if (slug === "wavelength-measurement") {
      const d = Number(effectiveSimParams["gratingConstant"] || 1.0);
      const phi = Number(effectiveSimParams["diffractionAngle"] || 20);
      const k = Number(effectiveSimParams["order"] || 1);
      const lambda = (d * 1000 * Math.sin((phi * Math.PI) / 180)) / k;
      data["d"] = d.toFixed(1);
      data["lambda"] = lambda.toFixed(1);
    } else if (slug === "interference-diffraction") {
      const d = Number(effectiveSimParams["slitDistance"] || 0.5);
      const L = Number(effectiveSimParams["screenDistance"] || 1.0);
      const dx = Number(effectiveSimParams["fringeSpacing"] || 1.0);
      const lambda = (d * dx) / L;
      data["fringeSpacing"] = dx.toFixed(1);
      data["lambda"] = lambda.toFixed(1);
    } else if (slug === "emission-spectra") {
      const substance = String(effectiveSimParams["substance"] || "hydrogen");
      const spectrumType = String(effectiveSimParams["spectrumType"] || "line");
      const substanceNames: Record<string, string> = {
        hydrogen: "Водород",
        helium: "Гелий",
        neon: "Неон",
        sodium: "Натрий",
        mercury: "Ртуть",
        tungsten: "Вольфрам",
      };
      const spectrumNames: Record<string, string> = {
        line: "линейчатый",
        continuous: "сплошной",
      };
      data["substance"] = substanceNames[substance] || substance;
      data["spectrumType"] = spectrumNames[spectrumType] || spectrumType;
    } else if (slug === "boyle-mariotte") {
      const temperature = Number(effectiveSimParams["temperature"] || 0);
      data["temperature"] = temperature.toFixed(0);
      const pvs = measurements.map(m => Number(m["pV"])).filter(v => !isNaN(v));
      if (pvs.length > 0) {
        const avgPV = pvs.reduce((a, b) => a + b, 0) / pvs.length;
        data["avgPV"] = avgPV.toFixed(2);
      } else {
        data["avgPV"] = (Number(data["pV"]) || 0).toFixed(2);
      }
    } else if (slug === "isobaric-process") {
      const pressure = Number(effectiveSimParams["pressure"] || 0);
      data["pressure"] = pressure.toFixed(0);
      const vts = measurements
        .map(m => Number(m["V/T"]))
        .filter(v => !isNaN(v));
      if (vts.length > 0) {
        const avgVT = vts.reduce((a, b) => a + b, 0) / vts.length;
        data["avgVT"] = avgVT.toFixed(4);
      } else {
        data["avgVT"] = (Number(data["V/T"]) || 0).toFixed(4);
      }
    } else if (slug === "isochoric-process") {
      const volume = Number(effectiveSimParams["volume"] || 0);
      data["volume"] = volume.toFixed(1);
      const pts = measurements
        .map(m => Number(m["p/T"]))
        .filter(v => !isNaN(v));
      if (pts.length > 0) {
        const avgPT = pts.reduce((a, b) => a + b, 0) / pts.length;
        data["avgPT"] = avgPT.toFixed(3);
      } else {
        data["avgPT"] = (Number(data["p/T"]) || 0).toFixed(3);
      }
    } else if (slug === "specific-heat-capacity") {
      const material = String(effectiveSimParams["material"] || "aluminum");
      const materialNames: Record<string, string> = {
        aluminum: "Алюминий",
        copper: "Медь",
        steel: "Сталь",
        lead: "Свинец",
      };
      const tabularHeat: Record<string, number> = {
        aluminum: 920,
        copper: 390,
        steel: 500,
        lead: 130,
      };
      data["materialName"] = materialNames[material] || material;
      data["tabularHeat"] = tabularHeat[material] ?? 920;
      data["equilibriumTemp"] = Number(data["T_р"] || 0).toFixed(1);
      const cMeasured = Number(data["c_изм"] || 0);
      data["specificHeat"] = cMeasured.toFixed(0);
      const tab = data["tabularHeat"] as number;
      data["errorPercent"] =
        tab > 0 ? ((Math.abs(cMeasured - tab) / tab) * 100).toFixed(1) : "0.0";
    } else if (slug === "relative-humidity") {
      data["dryTemp"] = Number(effectiveSimParams["dryTemp"] || 0).toFixed(0);
      data["wetTemp"] = Number(effectiveSimParams["wetTemp"] || 0).toFixed(0);
      data["deltaT"] = (
        Number(effectiveSimParams["dryTemp"] || 0) -
        Number(effectiveSimParams["wetTemp"] || 0)
      ).toFixed(1);
      const rhValues = measurements
        .map(m => Number(m["φ"]))
        .filter(v => !isNaN(v));
      if (rhValues.length > 0) {
        const avgRh = rhValues.reduce((a, b) => a + b, 0) / rhValues.length;
        data["relativeHumidity"] = Math.round(avgRh);
      } else {
        data["relativeHumidity"] = Number(data["φ"] || 0);
      }
    } else if (slug === "surface-tension") {
      const liquid = String(effectiveSimParams["liquid"] || "water");
      const liquidNames: Record<string, string> = {
        water: "Вода",
        alcohol: "Спирт",
        glycerol: "Глицерин",
      };
      const tabularTension: Record<string, number> = {
        water: 73,
        alcohol: 22,
        glycerol: 63,
      };
      data["liquidName"] = liquidNames[liquid] || liquid;
      data["tabularTension"] = tabularTension[liquid] ?? 73;
      data["dropMass"] = Number(data["m_кап"] || 0).toFixed(1);
      data["detachForce"] = Number(data["F_отр"] || 0).toFixed(2);
      const sigmaMeasured = Number(data["σ_изм"] || 0);
      data["surfaceTension"] = sigmaMeasured.toFixed(1);
    } else if (slug === "balancing-act") {
      const leftMoments = measurements
        .map(m => Number(m["M_лев"]))
        .filter(v => !isNaN(v));
      const rightMoments = measurements
        .map(m => Number(m["M_прав"]))
        .filter(v => !isNaN(v));
      const diffs = measurements
        .map(m => Number(m["ΔM"]))
        .filter(v => !isNaN(v));
      data["avgLeftMoment"] =
        leftMoments.length > 0
          ? (
              leftMoments.reduce((a, b) => a + b, 0) / leftMoments.length
            ).toFixed(2)
          : Number(data["M_лев"] || 0).toFixed(2);
      data["avgRightMoment"] =
        rightMoments.length > 0
          ? (
              rightMoments.reduce((a, b) => a + b, 0) / rightMoments.length
            ).toFixed(2)
          : Number(data["M_прав"] || 0).toFixed(2);
      data["avgDiff"] =
        diffs.length > 0
          ? (diffs.reduce((a, b) => a + b, 0) / diffs.length).toFixed(2)
          : Number(data["ΔM"] || 0).toFixed(2);
    }

    return data;
  }, [averages, effectiveSimParams, slug, measurements, labWork]);

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

  const simSlug = labWork?.simulationSlug ?? slug;
  const SimComponent = simSlug ? simComponents[simSlug] : null;

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

  const headers =
    measurements.length > 0
      ? Object.keys(measurements[0]).map(k => ({ key: k, label: k }))
      : [];

  return (
    <LabLayout
      title={labWork.title}
      topic={labWork.categoryTitle || "Лабораторная работа"}
      fullWidth
    >
      <div className="flex">
        <LabSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSave={handleSaveProgress}
          onSubmit={handleSubmit}
        />

        {/* Content */}
        <main className="flex-1 p-6">
          <div
            key={activeTab}
            className="max-w-5xl mx-auto space-y-6 animate-fadeIn"
          >
            {activeTab === "theory" && (
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

            {activeTab === "experiment" && (
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

                <div className="bg-[#2a3237] border border-[#434e54] rounded-2xl p-6">
                  <LabControls controls={controls} />
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => setIsSimRunning(prev => !prev)}
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
                        onStateChange={state => {
                          simStateRef.current = state;
                          if (state.finished) {
                            setIsSimRunning(false);
                          }
                        }}
                      />
                    </div>
                  )}
                  {!SimComponent && (
                    <div className="bg-[#1a1f22] border border-[#37474f] rounded-2xl p-12 text-center text-[#798389]">
                      Симуляция для этой лабораторной работы в разработке.
                    </div>
                  )}
                </div>

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
                        <div
                          key={key}
                          className="bg-[#2a3237] border border-[#434e54] rounded-xl p-4"
                        >
                          <p className="text-xs text-[#798389] mb-1">
                            Среднее {key}
                          </p>
                          <p className="text-xl font-bold text-[#2eff8c]">
                            {String(value)}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "graphs" && (
              <LabGraphs measurements={measurements} slug={slug || ""} />
            )}

            {activeTab === "conclusion" && (
              <div className="space-y-6">
                <ConclusionPanel
                  template={labWork.conclusionTemplate || ""}
                  data={conclusionData}
                />
                <div className="bg-[#2a3237] border border-[#434e54] rounded-2xl p-6">
                  <label className="block text-sm text-[#798389] mb-2">
                    Свой вывод
                  </label>
                  <textarea
                    value={conclusion}
                    onChange={e => setConclusion(e.target.value)}
                    rows={6}
                    className="w-full bg-[#1a1f22] border border-[#37474f] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#2eff8c] transition-colors resize-none"
                    placeholder="Напишите свой вывод на основе полученных результатов..."
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </LabLayout>
  );
}

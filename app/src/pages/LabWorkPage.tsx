import { useState, useRef } from "react";
import { trpc } from "@/providers/trpc";
import { useParams } from "react-router";
import {
  Target,
  Wrench,
  RotateCcw,
  BookOpen,
  Play,
  Ruler,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { toast } from "sonner";
import LabLayout from "@/components/lab/LabLayout";
import LabControls from "@/components/lab/LabControls";
import ResultsTable from "@/components/lab/ResultsTable";
import ConclusionPanel from "@/components/lab/ConclusionPanel";
import { Textarea } from "@/components/ui/textarea";
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
import ExternalIframeSimulation from "@/components/lab/simulations/ExternalIframeSimulation";
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
  "external-iframe": ExternalIframeSimulation,
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
  const [notes, setNotes] = useState("");
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

  const simComponentRef =
    labWork?.simulation?.componentRef ?? labWork?.simulationSlug ?? slug;
  const SimComponent = simComponentRef
    ? simComponents[simComponentRef]
    : null;
  const isExternalSimulation = labWork?.simulation?.kind === "external";
  const needsStartButton = labWork?.simulation?.isDynamic === true;

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
        <LabSidebar activeTab={activeTab} onTabChange={setActiveTab} />

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

                {!isExternalSimulation && controls.length > 0 && (
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 bg-[#2a3237] border border-[#434e54] rounded-2xl p-6 w-full">
                      <LabControls controls={controls} />
                    </div>
                    <Button
                      onClick={handleAddMeasurement}
                      className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#25cc70] shrink-0"
                    >
                      <Ruler size={16} className="mr-2" />
                      Измерить
                    </Button>
                  </div>
                )}

                <div className="space-y-4">
                  {!isExternalSimulation && needsStartButton && (
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
                  </div>
                )}

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

                {isExternalSimulation ? (
                  <div className="bg-[#2a3237] border border-[#434e54] rounded-2xl p-6 space-y-3">
                    <h3 className="text-sm font-semibold text-white">
                      Заметки
                    </h3>
                    <Textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Ваши наблюдения и заметки по эксперименту..."
                      className="min-h-[160px] bg-[#1a1f22] border-[#37474f] text-white resize-y"
                    />
                    <p className="text-xs text-[#798389]">
                      Заметки не сохраняются и предназначены только для
                      личного пользования.
                    </p>
                  </div>
                ) : (
                  <>
                    <ResultsTable
                      headers={headers}
                      data={measurements}
                      onDelete={handleDeleteMeasurement}
                      onClear={handleClearMeasurements}
                    />
                  </>
                )}
              </div>
            )}

            {activeTab === "graphs" && (
              <LabGraphs measurements={measurements} slug={slug || ""} />
            )}

            {activeTab === "conclusion" && (
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

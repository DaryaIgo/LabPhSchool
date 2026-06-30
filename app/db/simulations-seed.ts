import { getLabsDb } from "../api/queries/connection";
import {
  simulations,
  type SimulationKind,
  type SimulationParamConfig,
} from "./schema/labs";
import { inArray, not } from "drizzle-orm";

type SimulationSeed = {
  slug: string;
  title: string;
  description: string;
  category: string;
  kind?: SimulationKind;
  isDynamic?: boolean;
  componentRef: string;
  params: SimulationParamConfig[];
};

// NOTE: external simulations are now managed via /admin/simulations.
// This seed file is kept only for own (built-in) simulations.
// Backup of previous external URLs: docs/external-labs-urls-backup.md
const simulationData: SimulationSeed[] = [
  {
    slug: "uniform-linear-motion",
    title: "Равномерное прямолинейное движение",
    description:
      "Анимированное движение тележки по линейке с измерением времени и пути.",
    category: "mechanics",
    isDynamic: true,
    componentRef: "uniform-linear-motion",
    params: [
      {
        key: "speed",
        label: "Скорость",
        paramType: "slider",
        min: "-20",
        max: "20",
        step: "0.5",
        defaultValue: "5",
        unit: "м/с",
      },
      {
        key: "time",
        label: "Время",
        paramType: "slider",
        min: "1",
        max: "30",
        step: "0.5",
        defaultValue: "10",
        unit: "с",
      },
      {
        key: "startX",
        label: "Начальная координата",
        paramType: "slider",
        min: "0",
        max: "50",
        step: "1",
        defaultValue: "0",
        unit: "м",
      },
    ],
  },
  {
    slug: "uniformly-accelerated-motion",
    title: "Равноускоренное прямолинейное движение",
    description:
      "Модель равноускоренного движения с изменением начальной скорости и ускорения.",
    category: "mechanics",
    isDynamic: true,
    componentRef: "uniformly-accelerated-motion",
    params: [
      {
        key: "v0",
        label: "Начальная скорость",
        paramType: "slider",
        min: "-20",
        max: "20",
        step: "0.5",
        defaultValue: "0",
        unit: "м/с",
      },
      {
        key: "angle",
        label: "Угол наклона плоскости",
        paramType: "slider",
        min: "-45",
        max: "45",
        step: "1",
        defaultValue: "10",
        unit: "°",
      },
      {
        key: "time",
        label: "Время",
        paramType: "slider",
        min: "1",
        max: "30",
        step: "0.5",
        defaultValue: "5",
        unit: "с",
      },
      {
        key: "startX",
        label: "Начальная координата",
        paramType: "slider",
        min: "0",
        max: "50",
        step: "1",
        defaultValue: "0",
        unit: "м",
      },
    ],
  },
  {
    slug: "free-fall",
    title: "Свободное падение",
    description:
      "Модель свободного падения тела с возможностью задать начальную высоту, скорость и ускорение свободного падения.",
    category: "mechanics",
    isDynamic: true,
    componentRef: "free-fall",
    params: [
      {
        key: "h0",
        label: "Начальная высота",
        paramType: "slider",
        min: "0",
        max: "100",
        step: "1",
        defaultValue: "20",
        unit: "м",
      },
      {
        key: "v0",
        label: "Начальная скорость",
        paramType: "slider",
        min: "-20",
        max: "20",
        step: "0.5",
        defaultValue: "0",
        unit: "м/с",
      },
      {
        key: "g",
        label: "Ускорение свободного падения",
        paramType: "select",
        defaultValue: "9.8",
        options: [
          { value: "9.8", label: "Земля (9.8 м/с²)" },
          { value: "1.62", label: "Луна (1.62 м/с²)" },
          { value: "3.71", label: "Марс (3.71 м/с²)" },
        ],
      },
    ],
  },
];

async function seedSimulations() {
  const db = getLabsDb();

  for (const sim of simulationData) {
    await db
      .insert(simulations)
      .values({
        slug: sim.slug,
        title: sim.title,
        description: sim.description,
        category: sim.category,
        kind: sim.kind ?? "own",
        isDynamic: sim.isDynamic ?? false,
        componentRef: sim.componentRef,
        config: sim.params,
        isActive: true,
      })
      .onDuplicateKeyUpdate({
        set: {
          title: sim.title,
          description: sim.description,
          category: sim.category,
          kind: sim.kind ?? "own",
          isDynamic: sim.isDynamic ?? false,
          componentRef: sim.componentRef,
          config: sim.params,
        },
      });
    console.log(`Upserted simulation "${sim.slug}"`);
  }

  // Remove simulations that are no longer in the seed list
  const slugs = simulationData.map(s => s.slug);
  if (slugs.length > 0) {
    await db.delete(simulations).where(not(inArray(simulations.slug, slugs)));
    console.log("Removed stale simulations");
  }

  console.log(`Seeded ${simulationData.length} simulations`);
}

seedSimulations().catch(err => {
  console.error("Failed to seed simulations:", err);
  process.exit(1);
});

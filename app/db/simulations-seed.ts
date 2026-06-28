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
    ],
  },
  {
    slug: "projectile-motion",
    title: "Движение тела, брошенного под углом",
    description: "Интерактивная PhET-симуляция баллистического движения.",
    category: "mechanics",
    kind: "external",
    componentRef: "projectile-motion",
    params: [],
  },
  {
    slug: "under-pressure-phet",
    title: "Давление в жидкости (PhET)",
    description: "Интерактивная симуляция давления в жидкости и на тело.",
    category: "fluid-mechanics",
    kind: "external",
    componentRef: "under-pressure-phet",
    params: [],
  },
  {
    slug: "buoyancy-phet",
    title: "Плавучесть (PhET)",
    description: "PhET-симуляция плавучести и силы Архимеда.",
    category: "fluid-mechanics",
    kind: "external",
    componentRef: "buoyancy-phet",
    params: [],
  },
  {
    slug: "buoyancy-basics-phet",
    title: "Основы плавучести (PhET)",
    description: "Упрощённая PhET-симуляция для изучения условий плавания.",
    category: "fluid-mechanics",
    kind: "external",
    componentRef: "buoyancy-basics-phet",
    params: [],
  },
  {
    slug: "masses-and-springs",
    title: "Массы и пружины",
    description:
      "Интерактивная симуляция для изучения колебаний пружинного маятника.",
    category: "mechanics",
    kind: "external",
    componentRef: "external-iframe",
    params: [
      {
        key: "url",
        label: "URL",
        paramType: "url",
        defaultValue:
          "https://phet.colorado.edu/sims/html/masses-and-springs/latest/masses-and-springs_all.html",
      },
    ],
  },
  {
    slug: "wave-interference",
    title: "Интерференция волн",
    description: "Интерактивная симуляция для изучения интерференции волн.",
    category: "mechanics",
    kind: "external",
    componentRef: "external-iframe",
    params: [
      {
        key: "url",
        label: "URL",
        paramType: "url",
        defaultValue:
          "https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_ru.html",
      },
    ],
  },
  {
    slug: "sound-waves",
    title: "Звуковые волны",
    description: "Интерактивная симуляция для изучения звуковых волн.",
    category: "mechanics",
    kind: "external",
    componentRef: "external-iframe",
    params: [
      {
        key: "url",
        label: "URL",
        paramType: "url",
        defaultValue:
          "https://phet.colorado.edu/sims/html/sound-waves/latest/sound-waves_all.html",
      },
    ],
  },
  {
    slug: "states-of-matter-basics",
    title: "Состояния веществ: Основы",
    description:
      "Интерактивная симуляция для изучения агрегатных состояний вещества.",
    category: "molecular-thermodynamics",
    kind: "external",
    componentRef: "external-iframe",
    params: [
      {
        key: "url",
        label: "URL",
        paramType: "url",
        defaultValue:
          "https://phet.colorado.edu/sims/html/states-of-matter-basics/latest/states-of-matter-basics_en.html",
      },
    ],
  },
  {
    slug: "gases-intro",
    title: "Газы: Введение",
    description:
      "Интерактивная симуляция для изучения поведения газов на молекулярном уровне.",
    category: "molecular-thermodynamics",
    kind: "external",
    componentRef: "external-iframe",
    params: [
      {
        key: "url",
        label: "URL",
        paramType: "url",
        defaultValue:
          "https://phet.colorado.edu/sims/html/gases-intro/latest/gases-intro_ru.html",
      },
    ],
  },
  {
    slug: "charges-and-fields",
    title: "Заряды и поля",
    description:
      "Интерактивная симуляция для изучения электрических зарядов и напряжённости электрического поля.",
    category: "electrodynamics",
    kind: "external",
    componentRef: "external-iframe",
    params: [
      {
        key: "url",
        label: "URL",
        paramType: "url",
        defaultValue:
          "https://phet.colorado.edu/sims/html/charges-and-fields/latest/charges-and-fields_ru.html",
      },
    ],
  },
  {
    slug: "electricity-maps",
    title: "Интерактивная карта потребления и генерации электроэнергии",
    description:
      "Изучите в реальном времени, как различные страны производят и потребляют электроэнергию.",
    category: "electrodynamics",
    kind: "external",
    componentRef: "external-iframe",
    params: [
      {
        key: "url",
        label: "URL",
        paramType: "url",
        defaultValue:
          "https://app.electricitymaps.com/map/live/fifteen_minutes",
      },
    ],
  },
  {
    slug: "circuit-construction-kit-dc",
    title: "Электрическая цепь постоянного тока",
    description:
      "Виртуальная лаборатория для сборки и исследования электрических цепей постоянного тока.",
    category: "electrodynamics",
    kind: "external",
    componentRef: "external-iframe",
    params: [
      {
        key: "url",
        label: "URL",
        paramType: "url",
        defaultValue:
          "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc-virtual-lab/latest/circuit-construction-kit-dc-virtual-lab_ru.html",
      },
    ],
  },
  {
    slug: "magnet-and-compass",
    title: "Магнит и компас",
    description:
      "Исследуйте магнитное поле постоянного магнита и его влияние на компас.",
    category: "electrodynamics",
    kind: "external",
    componentRef: "external-iframe",
    params: [
      {
        key: "url",
        label: "URL",
        paramType: "url",
        defaultValue:
          "https://phet.colorado.edu/sims/html/magnet-and-compass/latest/magnet-and-compass_all.html",
      },
    ],
  },
  {
    slug: "faradays-law",
    title: "Закон электромагнитной индукции Фарадея",
    description:
      "Изучите явление электромагнитной индукции при движении магнита в катушке.",
    category: "electrodynamics",
    kind: "external",
    componentRef: "external-iframe",
    params: [
      {
        key: "url",
        label: "URL",
        paramType: "url",
        defaultValue:
          "https://phet.colorado.edu/sims/html/faradays-law/latest/faradays-law_all.html",
      },
    ],
  },
  {
    slug: "faradays-electromagnetic-lab",
    title: "Электромагнитная лаборатория Фарадея",
    description:
      "Соберите электромагнит и исследуйте магнитное поле соленоида и катушки.",
    category: "electrodynamics",
    kind: "external",
    componentRef: "external-iframe",
    params: [
      {
        key: "url",
        label: "URL",
        paramType: "url",
        defaultValue:
          "https://phet.colorado.edu/sims/html/faradays-electromagnetic-lab/latest/faradays-electromagnetic-lab_all.html",
      },
    ],
  },
  {
    slug: "geometric-optics",
    title: "Геометрическая оптика",
    description:
      "Интерактивная симуляция для изучения поведения света при прохождении через линзы.",
    category: "optics",
    kind: "external",
    componentRef: "external-iframe",
    params: [
      {
        key: "url",
        label: "URL",
        paramType: "url",
        defaultValue:
          "https://phet.colorado.edu/sims/html/geometric-optics/latest/geometric-optics_ru.html",
      },
    ],
  },
  {
    slug: "build-an-atom",
    title: "Построй атом",
    description: "Интерактивная симуляция для изучения строения атома.",
    category: "nuclear-physics",
    kind: "external",
    componentRef: "external-iframe",
    params: [
      {
        key: "url",
        label: "URL",
        paramType: "url",
        defaultValue:
          "https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom_ru.html",
      },
    ],
  },
  {
    slug: "models-of-hydrogen-atom",
    title: "Модели атома водорода",
    description: "Интерактивная симуляция для изучения моделей атома водорода.",
    category: "nuclear-physics",
    kind: "external",
    componentRef: "external-iframe",
    params: [
      {
        key: "url",
        label: "URL",
        paramType: "url",
        defaultValue:
          "https://phet.colorado.edu/sims/html/models-of-the-hydrogen-atom/latest/models-of-the-hydrogen-atom_all.html",
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

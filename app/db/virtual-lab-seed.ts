import { getDb } from "../api/queries/connection";
import {
  labCategories,
  labWorks,
  labBlocks,
  labSimulationParams,
} from "./schema";
import { eq } from "drizzle-orm";

async function seedVirtualLabs() {
  const db = getDb();

  // Categories
  const categories = [
    {
      order: 1,
      title: "Механика",
      slug: "mechanics",
      grade: "7–9 класс",
      description:
        "Основы классической механики: кинематика, динамика, статика, законы сохранения.",
      shortDesc: "Кинематика, динамика, статика",
      color: "#2eff8c",
      iconType: "mechanics",
    },
    {
      order: 2,
      title: "Тепловые явления",
      slug: "thermal",
      grade: "8 класс",
      description:
        "Теплопередача, количество теплоты, теплоёмкость, агрегатные состояния вещества.",
      shortDesc: "Теплота, теплоёмкость",
      color: "#ff7043",
      iconType: "thermal",
    },
    {
      order: 3,
      title: "Давление и Архимедова сила",
      slug: "pressure-archimedes",
      grade: "7 класс",
      description:
        "Давление в жидкостях и газах, закон Паскаля, закон Архимеда, плавание тел.",
      shortDesc: "Давление, Архимедова сила",
      color: "#01acff",
      iconType: "pressure",
    },
    {
      order: 4,
      title: "Электричество",
      slug: "electricity",
      grade: "8 класс",
      description:
        "Электрический ток, напряжение, сопротивление, закон Ома, работа и мощность тока.",
      shortDesc: "Ток, напряжение, Ом",
      color: "#ffd600",
      iconType: "circuit",
    },
    {
      order: 5,
      title: "Магнитные явления",
      slug: "magnetism",
      grade: "8 класс",
      description:
        "Магнитное поле, электромагниты, сила Ампера, электромагнитная индукция.",
      shortDesc: "Магнитное поле",
      color: "#ab47bc",
      iconType: "magnetism",
    },
    {
      order: 6,
      title: "Колебания и волны",
      slug: "oscillations-waves",
      grade: "9 класс",
      description:
        "Механические и электромагнитные колебания, волны, звук, резонанс.",
      shortDesc: "Колебания, волны, звук",
      color: "#26c6da",
      iconType: "oscillations",
    },
    {
      order: 7,
      title: "Оптика",
      slug: "optics",
      grade: "8–11 класс",
      description:
        "Отражение и преломление света, линзы, интерференция, дифракция, дисперсия.",
      shortDesc: "Свет, линзы, волны",
      color: "#66bb6a",
      iconType: "optics",
    },
    {
      order: 8,
      title: "Атомная и ядерная физика",
      slug: "atomic-nuclear",
      grade: "9–11 класс",
      description:
        "Строение атома, радиоактивность, ядерные реакции, фотоэффект, квантовая физика.",
      shortDesc: "Атом, ядро, кванты",
      color: "#ef5350",
      iconType: "atomic",
    },
  ];

  for (const cat of categories) {
    const exists = await db
      .select()
      .from(labCategories)
      .where(eq(labCategories.slug, cat.slug))
      .limit(1);
    if (exists.length === 0) {
      await db.insert(labCategories).values(cat);
      console.log(`Created category: ${cat.title}`);
    }
  }

  // Fetch category IDs
  const catRows = await db.select().from(labCategories);
  const catMap = new Map(catRows.map((c) => [c.slug, c.id]));

  // Lab Works
  const works = [
    {
      categoryId: catMap.get("pressure-archimedes")!,
      order: 1,
      title: "Измерение средней плотности вещества",
      slug: "density-measurement",
      law: "ρ = m/V",
      skills: "Измерение массы и объёма тела, работа с мензуркой и весами, расчёт плотности.",
      difficulty: "easy" as const,
      duration: 25,
      goal:
        "Определить плотность различных твёрдых и жидких веществ экспериментальным путём и сравнить с табличными значениями.",
      theory: `**Плотность** — физическая величина, характеризующая вещество и численно равная отношению массы тела к его объёму.

$$\\rho = \\frac{m}{V}$$

gде:
- $\\rho$ — плотность вещества (кг/м³)
- $m$ — масса тела (кг)
- $V$ — объём тела (м³)

**Единицы измерения:**
- Основная единица: кг/м³
- Практическая единица: г/см³

**Методы измерения объёма:**
1. Для правильных тел — по геометрическим формулам
2. Для неровных тел — метод вытеснения жидкости (мензурка)

**Оборудование:**
- Весы
- Мензурка
- Исследуемые тела
- Вода`,
      equipment: JSON.stringify(["Весы", "Мензурка", "Исследуемые тела", "Вода"]),
      instruction: `1. Измерьте массу тела на весах.
2. Налейте в мензурку воду и запишите начальный объём V₁.
3. Опустите тело в воду и запишите новый объём V₂.
4. Вычислите объём тела: V = V₂ − V₁.
5. Рассчитайте плотность: ρ = m/V.
6. Повторите измерения 3–5 раз для разных тел.
7. Сравните полученные значения с табличными.`,
      conclusionTemplate:
        "В ходе работы была определена плотность веществ. Среднее значение плотности составило {{avgDensity}} {{unit}}. Отклонение от табличного значения {{theoreticalDensity}} составило {{errorPercent}}%. Вывод: экспериментальным путём можно определить плотность вещества с погрешностью около {{errorPercent}}%.",
      status: "published" as const,
    },
    {
      categoryId: catMap.get("pressure-archimedes")!,
      order: 2,
      title: "Измерение архимедовой силы",
      slug: "archimedes-force",
      law: "Fₐ = ρж·g·Vт",
      skills: "Измерение силы динамометром, наблюдение за погружением тел, работа с различными жидкостями.",
      difficulty: "medium" as const,
      duration: 35,
      goal:
        "Экспериментально исследовать зависимость архимедовой силы от объёма погружённой части тела и от плотности жидкости.",
      theory: `**Архимедова сила** — сила, действующая на тело, погружённое в жидкость или газ, и направленная вверх. Численно равна весу вытесненной жидкости.

$$F_А = \\rho_{ж} \\cdot g \\cdot V_{погр}$$

gде:
- $F_А$ — архимедова сила (Н)
- $\\rho_{ж}$ — плотность жидкости (кг/м³)
- $g ≈ 9,8$ Н/кг — ускорение свободного падения
- $V_{погр}$ — объём погружённой части тела (м³)

**Закон Архимеда:** на тело, погружённое в жидкость, действует выталкивающая сила, равная весу жидкости в объёме тела.

**Формула через разность весов:**
$$F_А = P_{воздухе} − P_{жидкости}$$`,
      equipment: JSON.stringify(["Динамометр", "Мензурка", "Цилиндр металлический", "Вода", "Раствор соли"]),
      instruction: `**Часть А. Зависимость Fₐ от объёма погружения**
1. Измерьте вес тела в воздухе P₀.
2. Погрузите тело на 1/3, измерьте вес P₁.
3. Погрузите на 2/3, измерьте вес P₂.
4. Полностью погрузите, измерьте вес P₃.
5. Рассчитайте Fₐ = P₀ − P для каждого случая.

**Часть Б. Зависимость Fₐ от плотности жидкости**
1. Повторите опыт в воде.
2. Повторите опыт в растворе соли (более плотная жидкость).
3. Сравните величины Fₐ.`,
      conclusionTemplate:
        "Архимедова сила прямо пропорциональна объёму погружённой части тела и плотности жидкости. В воде средняя Fₐ = {{avgFaWater}} Н, в соляном растворе Fₐ = {{avgFaSalt}} Н. Разница объясняется различной плотностью жидкостей.",
      status: "published" as const,
    },
    {
      categoryId: catMap.get("pressure-archimedes")!,
      order: 3,
      title: "Независимость выталкивающей силы от массы тела",
      slug: "buoyancy-independence",
      law: "Fₐ = ρж·g·Vт (не зависит от массы тела при постоянном V)",
      skills: "Проведение сравнительных измерений, формулировка выводов на основе эксперимента.",
      difficulty: "medium" as const,
      duration: 30,
      goal:
        "Экспериментально доказать, что выталкивающая сила не зависит от массы тела при постоянном объёме.",
      theory: `Если два тела имеют одинаковый объём, но разную массу (например, алюминиевый и свинцовый цилиндры одинакового размера), то выталкивающая сила, действующая на них в одной и той же жидкости, будет одинаковой.

$$F_{А1} = F_{А2} = \\rho_{ж} \\cdot g \\cdot V$$

Различие проявляется в том, что более тяжёлое тело может тонуть, а лёгкое — всплывать, но сама сила Архимеда определяется только объёмом и плотностью жидкости.`,
      equipment: JSON.stringify(["Динамометр", "Цилиндры одинакового объёма (разные материалы)", "Стакан с водой"]),
      instruction: `1. Возьмите два цилиндра одинакового объёма, но из разных материалов.
2. Измерьте вес каждого в воздухе.
3. Поочерёдно полностью погрузите каждый цилиндр в воду.
4. Измерьте вес каждого в воде.
5. Рассчитайте Fₐ для каждого.
6. Сравните результаты.`,
      conclusionTemplate:
        "Выталкивающая сила для тел одинакового объёма {{volume}} м³, но разной массы ({{mass1}} г и {{mass2}} г) оказалась примерно одинаковой: Fₐ₁ = {{fa1}} Н, Fₐ₂ = {{fa2}} Н. Это подтверждает, что Fₐ не зависит от массы тела.",
      status: "published" as const,
    },
    {
      categoryId: catMap.get("electricity")!,
      order: 1,
      title: "Измерение работы электрического тока",
      slug: "electric-work-measurement",
      law: "A = U·I·t",
      skills: "Сборка электрической цепи, работа с амперметром и вольтметром, расчёт работы и мощности тока.",
      difficulty: "medium" as const,
      duration: 40,
      goal:
        "Экспериментально определить работу и мощность электрического тока в цепи с резистором.",
      theory: `**Работа электрического тока** — энергия, которую получает участок цепи от протекающего тока.

$$A = U \\cdot I \\cdot t$$

gде:
- $A$ — работа тока (Дж)
- $U$ — напряжение (В)
- $I$ — сила тока (А)
- $t$ — время (с)

**Мощность тока:**
$$P = \\frac{A}{t} = U \\cdot I$$

**Закон Джоуля–Ленца:**
$$Q = I^2 \\cdot R \\cdot t$$

При постоянном сопротивлении работа тока идёт на нагрев проводника.`,
      equipment: JSON.stringify(["Источник питания", "Амперметр", "Вольтметр", "Резистор", "Ключ", "Соединительные провода", "Секундомер"]),
      instruction: `1. Соберите электрическую цепь: источник питания → ключ → амперметр → резистор (последовательно). Вольтметр подключите параллельно резистору.
2. Замкните цепь. Запишите показания амперметра (I) и вольтметра (U).
3. Включите секундомер. Через t = 60 с разомкните цепь.
4. Рассчитайте работу тока: A = U·I·t.
5. Рассчитайте мощность: P = U·I.
6. Повторите опыт при другом напряжении (измените источник питания).`,
      conclusionTemplate:
        "При напряжении U = {{voltage}} В и силе тока I = {{current}} А за время t = {{time}} с работа тока составила A = {{work}} Дж, мощность P = {{power}} Вт. Увеличение напряжения приводит к росту работы и мощности тока.",
      status: "published" as const,
    },
  ];

  for (const work of works) {
    const exists = await db
      .select()
      .from(labWorks)
      .where(eq(labWorks.slug, work.slug))
      .limit(1);
    if (exists.length === 0) {
      const result = await db.insert(labWorks).values(work);
      const workId = Number(result[0].insertId);
      console.log(`Created lab work: ${work.title}`);

      // Create default blocks
      const blocks = [
        { order: 1, type: "goal" as const, title: "Цель работы", content: work.goal },
        { order: 2, type: "theory" as const, title: "Теоретические сведения", content: work.theory },
        { order: 3, type: "equipment" as const, title: "Оборудование", content: work.equipment },
        { order: 4, type: "simulation" as const, title: "Симуляция эксперимента", content: work.instruction },
        { order: 5, type: "table" as const, title: "Таблица результатов", content: null },
        { order: 6, type: "graphs" as const, title: "Графики", content: null },
        { order: 7, type: "conclusion" as const, title: "Вывод", content: work.conclusionTemplate },
      ];

      for (const block of blocks) {
        await db.insert(labBlocks).values({
          labWorkId: workId,
          order: block.order,
          type: block.type,
          title: block.title,
          content: block.content,
          config: null,
        });
      }

      // Create simulation params based on lab type
      if (work.slug === "density-measurement") {
        const params = [
          { key: "mass", label: "Масса тела", paramType: "slider" as const, min: "10", max: "500", step: "1", defaultValue: "200", unit: "г" },
          { key: "volume", label: "Объём тела", paramType: "slider" as const, min: "1", max: "200", step: "1", defaultValue: "50", unit: "см³" },
          { key: "liquidDensity", label: "Плотность жидкости", paramType: "select" as const, defaultValue: "1000", options: "[{\"value\":\"1000\",\"label\":\"Вода\"},{\"value\":\"1260\",\"label\":\"Соляной раствор\"},{\"value\":\"800\",\"label\":\"Спирт\"}]", unit: "кг/м³" },
        ];
        for (const p of params) {
          await db.insert(labSimulationParams).values({ labWorkId: workId, ...p });
        }
      } else if (work.slug === "archimedes-force") {
        const params = [
          { key: "bodyVolume", label: "Объём тела", paramType: "slider" as const, min: "10", max: "200", step: "1", defaultValue: "100", unit: "см³" },
          { key: "immersionLevel", label: "Уровень погружения", paramType: "slider" as const, min: "0", max: "100", step: "5", defaultValue: "50", unit: "%" },
          { key: "liquidDensity", label: "Плотность жидкости", paramType: "select" as const, defaultValue: "1000", options: "[{\"value\":\"1000\",\"label\":\"Вода\"},{\"value\":\"1260\",\"label\":\"Соляной раствор\"},{\"value\":\"13600\",\"label\":\"Ртуть\"}]", unit: "кг/м³" },
        ];
        for (const p of params) {
          await db.insert(labSimulationParams).values({ labWorkId: workId, ...p });
        }
      } else if (work.slug === "buoyancy-independence") {
        const params = [
          { key: "bodyVolume", label: "Объём тел", paramType: "slider" as const, min: "20", max: "200", step: "1", defaultValue: "100", unit: "см³" },
          { key: "material1", label: "Материал 1", paramType: "select" as const, defaultValue: "2700", options: "[{\"value\":\"2700\",\"label\":\"Алюминий\"},{\"value\":\"7800\",\"label\":\"Сталь\"},{\"value\":\"11300\",\"label\":\"Свинец\"}]", unit: "кг/м³" },
          { key: "material2", label: "Материал 2", paramType: "select" as const, defaultValue: "7800", options: "[{\"value\":\"2700\",\"label\":\"Алюминий\"},{\"value\":\"7800\",\"label\":\"Сталь\"},{\"value\":\"11300\",\"label\":\"Свинец\"}]", unit: "кг/м³" },
        ];
        for (const p of params) {
          await db.insert(labSimulationParams).values({ labWorkId: workId, ...p });
        }
      } else if (work.slug === "electric-work-measurement") {
        const params = [
          { key: "voltage", label: "Напряжение", paramType: "slider" as const, min: "1", max: "12", step: "0.5", defaultValue: "6", unit: "В" },
          { key: "resistance", label: "Сопротивление", paramType: "slider" as const, min: "1", max: "100", step: "1", defaultValue: "10", unit: "Ом" },
          { key: "time", label: "Время", paramType: "slider" as const, min: "10", max: "300", step: "10", defaultValue: "60", unit: "с" },
        ];
        for (const p of params) {
          await db.insert(labSimulationParams).values({ labWorkId: workId, ...p });
        }
      }
    }
  }

  console.log("Virtual lab seed complete.");
}

seedVirtualLabs().catch((err) => {
  console.error(err);
  process.exit(1);
});

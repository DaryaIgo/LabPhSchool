import { getContentDb } from "../api/queries/connection";
import { topicNodes, resources } from "./schema/content";

async function seed() {
  const db = getContentDb();

  // Seed hierarchical topic nodes (single source of truth for course structure)
  const topicNodeRoots = [
    {
      order: 1,
      title: "Кинематика",
      slug: "kinematics",
      color: "#2eff8c",
      iconType: "mechanics",
      content:
        "Раздел механики, изучающий движение тел без рассмотрения причин, вызывающих это движение.",
      labCategorySlug: "mechanics",
    },
    {
      order: 2,
      title: "Динамика",
      slug: "dynamics",
      color: "#ffcb3d",
      iconType: "mechanics",
      content: "Раздел механики, изучающий причины движения тел.",
      labCategorySlug: "mechanics",
    },
    {
      order: 3,
      title: "Законы сохранения",
      slug: "conservation",
      color: "#01acff",
      iconType: "mechanics",
      content:
        "Фундаментальные законы: сохранение импульса, энергии, момента импульса.",
      labCategorySlug: "mechanics",
    },
    {
      order: 4,
      title: "Статика и гидростатика",
      slug: "statics",
      color: "#ff6b6b",
      iconType: "fluid-mechanics",
      content: "Условия равновесия, давление, закон Архимеда.",
      labCategorySlug: "mechanics",
    },
    {
      order: 5,
      title: "Молекулярная физика",
      slug: "molecular",
      color: "#ff8c42",
      iconType: "molecular-thermodynamics",
      content: "Основы МКТ, идеальный газ, термодинамические процессы.",
      labCategorySlug: "molecular-thermodynamics",
    },
    {
      order: 6,
      title: "Электростатика",
      slug: "electrostatics",
      color: "#a78bfa",
      iconType: "electrodynamics",
      content: "Закон Кулона, электрическое поле, потенциал, ёмкость.",
      labCategorySlug: "electrodynamics",
    },
    {
      order: 7,
      title: "Постоянный ток",
      slug: "dc-circuits",
      color: "#2eff8c",
      iconType: "circuit",
      content: "Законы Ома, соединения проводников, работа и мощность тока.",
      labCategorySlug: "electrodynamics",
    },
    {
      order: 8,
      title: "Магнетизм",
      slug: "magnetism",
      color: "#ffcb3d",
      iconType: "magnetism",
      content:
        "Магнитное поле, сила Ампера, сила Лоренца, электромагнитная индукция.",
      labCategorySlug: "electrodynamics",
    },
    {
      order: 9,
      title: "Колебания и волны",
      slug: "oscillations",
      color: "#01acff",
      iconType: "waves",
      content:
        "Механические и электромагнитные колебания, гармонические колебания, волны.",
      labCategorySlug: null,
    },
    {
      order: 10,
      title: "Оптика",
      slug: "optics",
      color: "#ff6b6b",
      iconType: "optics",
      content: "Закон преломления, линзы, оптические приборы, природа света.",
      labCategorySlug: "optics",
    },
    {
      order: 11,
      title: "Атомная физика",
      slug: "atomic",
      color: "#ff8c42",
      iconType: "atomic",
      content: "Модели атома, спектры, постулаты Бора, радиоактивность.",
      labCategorySlug: "nuclear-physics",
    },
    {
      order: 12,
      title: "Квантовая физика",
      slug: "quantum",
      color: "#a78bfa",
      iconType: "nuclear-physics",
      content: "Де Бройля, принцип неопределённости, элементы СТО.",
      labCategorySlug: "nuclear-physics",
    },
  ];

  const insertedRootIds: number[] = [];
  for (const root of topicNodeRoots) {
    const res = await db.insert(topicNodes).values({
      parentId: null,
      order: root.order,
      title: root.title,
      slug: root.slug,
      content: root.content,
      color: root.color,
      iconType: root.iconType,
      labCategorySlug: root.labCategorySlug,
    });
    insertedRootIds.push(Number(res[0].insertId));
  }
  console.log(`Inserted ${topicNodeRoots.length} topic node roots`);

  const subtopicNodeData: {
    rootIdx: number;
    order: number;
    title: string;
    content: string;
    jupyterUrl?: string;
  }[] = [
    {
      rootIdx: 0,
      order: 1,
      title: "Равномерное прямолинейное движение",
      content:
        "Равномерное прямолинейное движение — это движение по прямой линии, при котором тело за любые равные промежутки времени совершает одинаковые перемещения.",
      jupyterUrl:
        "https://colab.research.google.com/drive/1OXJsYuDLqnRhd3fCEC5pxSJq4bouf0o5#scrollTo=9w0__ZlyLA67",
    },
    {
      rootIdx: 0,
      order: 2,
      title: "Равноускоренное движение",
      content:
        "При равноускоренном движении ускорение постоянно. Основные формулы: v = v₀ + at, s = v₀t + at²/2.",
      jupyterUrl:
        "https://colab.research.google.com/drive/1PcNF0MfoVb93NxohEt7qvX6GQgkwxH-v#scrollTo=PA-IBasOqtFe",
    },
    {
      rootIdx: 0,
      order: 3,
      title: "Движение по окружности",
      content:
        "Период, частота, угловая скорость, центростремительное ускорение.",
    },
    {
      rootIdx: 0,
      order: 4,
      title: "Относительность движения",
      content: "Правило сложения скоростей. Системы отсчёта.",
    },
    {
      rootIdx: 0,
      order: 5,
      title: "Движение под углом к горизонту",
      content: "Движение в плоскости с ускорением свободного падения.",
    },
    {
      rootIdx: 1,
      order: 1,
      title: "Законы Ньютона",
      content:
        "Все законы Ньютона выполняются только в инерциальных системах отсчета.",
    },
    {
      rootIdx: 1,
      order: 2,
      title: "Гравитационные силы. Сила тяжести и Вес",
      content: "Закон всемирного тяготения. Сила тяжести и вес.",
    },
    {
      rootIdx: 1,
      order: 3,
      title: "Электромагнитные силы. Силы упругости и трения",
      content: "Сила упругости, закон Гука, силы трения.",
    },
    {
      rootIdx: 1,
      order: 4,
      title: "Криволинейное движение. Центростремительная сила",
      content: "Движение по окружности. Центростремительная сила.",
    },
    {
      rootIdx: 1,
      order: 5,
      title: "Олимпиадные методы анализа",
      content: "",
    },
    {
      rootIdx: 2,
      order: 1,
      title: "Импульс тела",
      content: "Импульс тела — векторная физическая величина.",
    },
    {
      rootIdx: 2,
      order: 2,
      title: "Закон сохранения импульса",
      content: "Замкнутая система. Закон сохранения импульса.",
    },
    {
      rootIdx: 2,
      order: 3,
      title: "Механическая работа и мощность",
      content: "Работа силы. Мощность. КПД.",
    },
    {
      rootIdx: 2,
      order: 4,
      title: "Кинетическая и потенциальная энергия",
      content: "Кинетическая и потенциальная энергия.",
    },
    {
      rootIdx: 2,
      order: 5,
      title: "Закон сохранения энергии",
      content: "Закон сохранения механической энергии.",
    },
    {
      rootIdx: 3,
      order: 1,
      title: "Условия равновесия твёрдого тела",
      content: "Условия равновесия твёрдого тела.",
    },
    {
      rootIdx: 3,
      order: 2,
      title: "Момент силы",
      content: "Плечо силы. Момент силы.",
    },
    {
      rootIdx: 3,
      order: 3,
      title: "Давление в жидкостях и газах",
      content: "Закон Паскаля. Гидростатическое давление.",
    },
    {
      rootIdx: 3,
      order: 4,
      title: "Сила Архимеда",
      content: "Сила Архимеда. Условия плавания тел.",
    },
    {
      rootIdx: 4,
      order: 1,
      title: "Основы МКТ",
      content: "Базовые понятия молекулярно-кинетической теории.",
    },
    {
      rootIdx: 4,
      order: 2,
      title: "Уравнение состояния идеального газа",
      content: "pV = νRT.",
    },
    {
      rootIdx: 4,
      order: 3,
      title: "Изопроцессы",
      content: "Изотермический, изобарный, изохорный процессы.",
    },
    {
      rootIdx: 4,
      order: 4,
      title: "Первое начало термодинамики",
      content: "ΔU = Q - A.",
    },
    {
      rootIdx: 5,
      order: 1,
      title: "Закон Кулона",
      content: "F = k|q₁q₂|/r².",
    },
    {
      rootIdx: 5,
      order: 2,
      title: "Напряжённость электрического поля",
      content: "E = F/q = k|q|/r².",
    },
    {
      rootIdx: 5,
      order: 3,
      title: "Потенциал и работа поля",
      content: "Потенциал и работа электрического поля.",
    },
    {
      rootIdx: 5,
      order: 4,
      title: "Конденсаторы и ёмкость",
      content: "Ёмкость конденсатора.",
    },
    {
      rootIdx: 6,
      order: 1,
      title: "Закон Ома для участка цепи",
      content: "I = U/R.",
    },
    {
      rootIdx: 6,
      order: 2,
      title: "Последовательное и параллельное соединение",
      content: "Соединение проводников.",
    },
    {
      rootIdx: 6,
      order: 3,
      title: "Работа и мощность тока",
      content: "Q = I²Rt. Мощность тока.",
    },
    {
      rootIdx: 6,
      order: 4,
      title: "ЭДС и закон Ома для полной цепи",
      content: "I = ε/(R+r).",
    },
    {
      rootIdx: 7,
      order: 1,
      title: "Магнитное поле",
      content: "Магнитное поле. Магнитные линии.",
    },
    {
      rootIdx: 7,
      order: 2,
      title: "Сила Ампера и Лоренца",
      content: "Сила Ампера и сила Лоренца.",
    },
    {
      rootIdx: 7,
      order: 3,
      title: "Закон электромагнитной индукции",
      content: "εᵢ = -ΔΦ/Δt.",
    },
    {
      rootIdx: 7,
      order: 4,
      title: "Самоиндукция",
      content: "εₛ = -LΔI/Δt.",
    },
    {
      rootIdx: 8,
      order: 1,
      title: "Гармонические колебания",
      content: "Уравнение гармонических колебаний.",
    },
    {
      rootIdx: 8,
      order: 2,
      title: "Электромагнитные колебания",
      content: "T = 2π√(LC).",
    },
    {
      rootIdx: 8,
      order: 3,
      title: "Механические волны",
      content: "v = λν.",
    },
    {
      rootIdx: 8,
      order: 4,
      title: "Интерференция и дифракция",
      content: "Условие максимума: Δd = mλ.",
    },
    {
      rootIdx: 9,
      order: 1,
      title: "Отражение и преломление света",
      content: "Законы отражения и преломления.",
    },
    {
      rootIdx: 9,
      order: 2,
      title: "Линзы и изображения",
      content: "Формула тонкой линзы.",
    },
    {
      rootIdx: 9,
      order: 3,
      title: "Волновая природа света",
      content: "Интерференция, дифракция, поляризация.",
    },
    {
      rootIdx: 9,
      order: 4,
      title: "Квантовая природа света",
      content: "Энергия фотона. Уравнение Эйнштейна для фотоэффекта.",
    },
    {
      rootIdx: 10,
      order: 1,
      title: "Модели атома",
      content: "Томсон, Резерфорд, Бор.",
    },
    {
      rootIdx: 10,
      order: 2,
      title: "Постулаты Бора",
      content: "Стационарные состояния. Излучение фотона.",
    },
    {
      rootIdx: 10,
      order: 3,
      title: "Радиоактивность",
      content: "α, β, γ излучение.",
    },
    {
      rootIdx: 10,
      order: 4,
      title: "Ядерные реакции",
      content: "Деление и синтез ядер.",
    },
    {
      rootIdx: 11,
      order: 1,
      title: "Гипотеза де Бройля",
      content: "λ = h/p.",
    },
    {
      rootIdx: 11,
      order: 2,
      title: "Принцип неопределённости",
      content: "Δx·Δp ≥ ℏ/2.",
    },
    {
      rootIdx: 11,
      order: 3,
      title: "Основы СТО",
      content: "E = mc².",
    },
    {
      rootIdx: 11,
      order: 4,
      title: "Фундаментальные взаимодействия",
      content: "Гравитационное, электромагнитное, сильное, слабое.",
    },
  ];

  for (const sub of subtopicNodeData) {
    await db.insert(topicNodes).values({
      parentId: insertedRootIds[sub.rootIdx],
      order: sub.order,
      title: sub.title,
      slug: `${topicNodeRoots[sub.rootIdx].slug}-sub-${sub.order}`,
      content: sub.content,
      jupyterUrl: sub.jupyterUrl ?? null,
    });
  }
  console.log(`Inserted ${subtopicNodeData.length} topic node subtopics`);

  // Seed resources
  const resourceData = [
    {
      title: "Механическое движение",
      description:
        "Плейлист с теорией и разбором задач на механическое движение",
      type: "video" as const,
      url: "https://www.youtube.com/playlist?list=PL1Us50cZo25k0P5jsqx5FYgVMCkxNxMKC",
      tags: "Видео,Механическое движение,Кинематика,Механика",
    },
    {
      title: "Электромагнитные волны",
      description:
        "Плейлист с теорией и разбором задач на электромагнитные волны",
      type: "video" as const,
      url: "https://youtube.com/playlist?list=PL1Us50cZo25meF0AqFID_fR0qwgYUkXY6&si=zXXmFvacNUJpXBPX",
      tags: "Видео,Электромагнитные волны,Оптика,Электричество",
    },
    {
      title: "Давление твёрдых тел, жидкостей и газов",
      description:
        "Плейлист с теорией и разбором задач на давление в твёрдых телах, жидкостях и газах",
      type: "video" as const,
      url: "https://youtube.com/playlist?list=PL1Us50cZo25m3ozxGRcOFqsGM30UK4NQ5&si=vKRZJPoiqVBia2aF",
      tags: "Видео,Давление,Гидростатика,Механика",
    },
    {
      title: "Электрические дуги в замедленной съёмке",
      description:
        "Сверхзамедленная съёмка высоковольтных электрических разрядов",
      type: "video" as const,
      url: "https://www.youtube.com/watch?v=HDzVD-cqiWM",
      tags: "Видео,Электричество,Разряды,Замедленная съёмка",
    },
    {
      title: "Измерения. Теория погрешностей",
      description:
        "Плейлист с теорией измерений и обработки погрешностей в школьной физике",
      type: "video" as const,
      url: "https://youtube.com/playlist?list=PL1Us50cZo25n0s1gsVxipdJkc6EQoptM5&si=FGMT6P_c2y_65lhB",
      tags: "Видео,Измерения,Погрешности,Теория",
    },
    {
      title: "Удивительная физика капель воды",
      description:
        "Захватывающее видео о физике капель воды в замедленной съёмке",
      type: "video" as const,
      url: "https://youtu.be/yFvEl3TTD38?si=1pRtjunepib92Qan",
      tags: "Видео,Молекулярная физика,Поверхностное натяжение",
    },
    {
      title: "Справочник формул по физике",
      description: "200+ формул по всем темам школьного курса с пояснениями",
      type: "reference" as const,
      url: "#",
      tags: "Справочник,Формулы,Все темы",
    },
    {
      title: "1001 задача по физике с решениями",
      description:
        "Сборник задач по физике с подробными решениями. Авторы: И.М. Гельфгат, Л.Э. Генденштейн, Л.А. Кирик",
      type: "workbook" as const,
      url: "https://lib.brsu.by/sites/default/files/books/%D0%93%D0%B5%D0%BB%D1%8C%D1%84%D0%B3%D0%B0%D1%82%20%D0%98.%D0%9C.%2C%20%D0%9B.%D0%AD.%D0%93%D0%B5%D0%BD%D0%B4%D0%B5%D0%BD%D1%88%D1%82%D0%B5%D0%B9%D0%BD%2C%20%D0%9B.%D0%90.%D0%9A%D0%B8%D1%80%D0%B8%D0%BA%20-%201001%20%D0%B7%D0%B0%D0%B4%D0%B0%D1%87%D0%B0%20%D0%BF%D0%BE%20%D1%84%D0%B8%D0%B7%D0%B8%D0%BA%D0%B5%20%D1%81%20%D1%80%D0%B5%D1%88%D0%B5%D0%BD%D0%B8%D1%8F%D0%BC%D0%B8_.pdf",
      tags: "Задачник,1001 задача,PDF,Решения",
    },
    {
      title: "Решу ЕГЭ по физике",
      description:
        "Банк заданий ЕГЭ по физике с разбором решений и тренировочными вариантами",
      type: "workbook" as const,
      url: "https://phys-ege.sdamgia.ru/",
      tags: "ЕГЭ,Задачник,Экзамен,Тренировка",
    },
    {
      title: "Тренажёр по решению задач (7–9 класс)",
      description:
        "Интерактивный тренажёр по решению физических задач для учащихся 7–9 классов",
      type: "workbook" as const,
      url: "https://physics-engineers.ru/page/tasks",
      tags: "Задачник,Задачи,7–9 класс,Тренажёр",
    },
    {
      title: "Интерактивная модель: Солнечная система",
      description: "3D-модель планет с реальными орбитами и масштабами",
      type: "model" as const,
      url: "https://eyes.nasa.gov/apps/solar-system/#/home",
      tags: "Астрофизика,Модель,3D",
    },
    {
      title: "Справочник: Квантовая физика",
      description: "Основные понятия и формулы квантовой механики",
      type: "reference" as const,
      url: "#",
      tags: "Кванты,Атом,Фотоэффект",
    },
    {
      title: "Интерактивная модель: Маятник",
      description: "Симуляция математического и пружинного маятника",
      type: "model" as const,
      url: "https://phet.colorado.edu/sims/html/pendulum-lab/latest/pendulum-lab_ru.html",
      tags: "Колебания,Маятник,Механика",
    },
    {
      title: "Тренажёр: сложение векторов",
      description:
        "Интерактивная симуляция для изучения сложения и вычитания векторов",
      type: "model" as const,
      url: "https://phet.colorado.edu/sims/html/vector-addition/latest/vector-addition_all.html",
      tags: "Механика,Векторы,Модель",
    },
    {
      title: "Океаны и волны (живой 3D-глобус)",
      description:
        "Интерактивная визуализация глобальных погодных условий, океанских течений и волн в реальном времени",
      type: "model" as const,
      url: "https://earth.nullschool.net/",
      tags: "Гидростатика,Астрофизика,Модель,3D",
    },
    {
      title: "Интерактивная карта потребления и генерации электроэнергии",
      description:
        "Изучите в реальном времени, как различные страны производят и потребляют электроэнергию",
      type: "model" as const,
      url: "https://app.electricitymaps.com/map/live/fifteen_minutes",
      tags: "Электричество,Энергетика,Модель",
    },
    {
      title: "Виртуальное исследование планет (NASA Trek)",
      description:
        "Интерактивный портал NASA для исследования поверхностей планет и спутников Солнечной системы",
      type: "model" as const,
      url: "https://trek.nasa.gov/#",
      tags: "Астрофизика,Модель,3D,NASA",
    },
  ];

  await db.insert(resources).values(resourceData);
  console.log(`Inserted ${resourceData.length} resources`);

  console.log("Seed complete!");
}

seed().catch(console.error);

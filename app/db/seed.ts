import { getDb } from "../api/queries/connection";
import { topics, subtopics, labs, resources } from "./schema";

async function seed() {
  const db = getDb();

  // Seed topics (12 themes of school physics)
  const topicData = [
    {
      order: 1,
      title: "Кинематика",
      slug: "kinematics",
      formula: "x = x₀ + v₀t + at²/2",
      description:
        "Раздел механики, изучающий способы описания движения тел без выяснения причин, вызывающих это движение. Равномерное и равноускоренное движение, движение по окружности, относительность.",
      shortDesc: "Равномерное и равноускоренное движение",
      color: "#2eff8c",
    },
    {
      order: 2,
      title: "Динамика",
      slug: "dynamics",
      formula: "F = ma",
      description:
        "Раздел механики, изучающий причины, по которым возникает движение тел. Законы Ньютона, силы в природе.",
      shortDesc: "Законы Ньютона, силы",
      color: "#01acff",
    },
    {
      order: 3,
      title: "Статика",
      slug: "statics",
      formula: "ΣM = 0",
      description:
        "Раздел механики, изучающий условия равновесия тел. Условия равновесия, момент силы, центр тяжести, простые механизмы.",
      shortDesc: "Равновесие, момент силы",
      color: "#2eff8c",
    },
    {
      order: 4,
      title: "Законы сохранения",
      slug: "conservation-laws",
      formula: "p = mv, E = mv²/2",
      description:
        "Импульс, работа, мощность, энергия. Закон сохранения импульса и энергии. Центральный удар.",
      shortDesc: "Импульс, энергия",
      color: "#01acff",
    },
    {
      order: 5,
      title: "Механические колебания и волны",
      slug: "oscillations-waves",
      formula: "T = 2π√(l/g)",
      description:
        "Гармонические колебания, математический и пружинный маятник, механические волны, звук.",
      shortDesc: "Маятник, волны, звук",
      color: "#2eff8c",
    },
    {
      order: 6,
      title: "Молекулярная физика",
      slug: "molecular-physics",
      formula: "pV = nRT",
      description:
        "Основы молекулярно-кинетической теории. Идеальный газ, уравнение состояния, изопроцессы.",
      shortDesc: "Идеальный газ",
      color: "#01acff",
    },
    {
      order: 7,
      title: "Термодинамика",
      slug: "thermodynamics",
      formula: "ΔU = Q - A",
      description:
        "Первое и второе начала термодинамики. Тепловые машины, КПД, энтропия.",
      shortDesc: "Начала термодинамики",
      color: "#2eff8c",
    },
    {
      order: 8,
      title: "Электростатика",
      slug: "electrostatics",
      formula: "F = k|q₁q₂|/r²",
      description:
        "Электрическое поле, потенциал, напряжённость, работа по перемещению заряда. Закон Кулона.",
      shortDesc: "Поле, потенциал",
      color: "#01acff",
    },
    {
      order: 9,
      title: "Постоянный ток",
      slug: "dc-circuits",
      formula: "I = U/R",
      description:
        "Закон Ома, соединение проводников, работа и мощность тока. Электрические цепи.",
      shortDesc: "Цепи, законы Ома, Джоуля",
      color: "#2eff8c",
    },
    {
      order: 10,
      title: "Магнетизм",
      slug: "magnetism",
      formula: "F = qvBsinα",
      description:
        "Магнитное поле, сила Ампера, сила Лоренца, электромагнитная индукция.",
      shortDesc: "Силы Лоренца и Ампера",
      color: "#01acff",
    },
    {
      order: 11,
      title: "Оптика",
      slug: "optics",
      formula: "n = c/v",
      description:
        "Волновая и геометрическая оптика. Отражение, преломление, интерференция, дифракция.",
      shortDesc: "Волновая и геометрическая",
      color: "#2eff8c",
    },
    {
      order: 12,
      title: "Квантовая физика",
      slug: "quantum-physics",
      formula: "E = hν",
      description:
        "Фотоэффект, корпускулярно-волновой дуализм, модель атома Бора, ядерные реакции.",
      shortDesc: "Фотоэффект, атом",
      color: "#01acff",
    },
  ];

  const insertedTopics = await db.insert(topics).values(topicData);
  console.log(`Inserted ${topicData.length} topics`);

  // Seed subtopics
  const subtopicData = [
    // Kinematics
    { topicId: 1, order: 1, title: "Равномерное прямолинейное движение", description: "Материальная точка. Скорость и путь. Уравнение движения." },
    { topicId: 1, order: 2, title: "Равноускоренное движение", description: "Ускорение. Уравнения скорости и координаты. Графики." },
    { topicId: 1, order: 3, title: "Движение по окружности", description: "Период, частота, угловая скорость, центростремительное ускорение." },
    { topicId: 1, order: 4, title: "Относительность движения", description: "Правило сложения скоростей. Системы отсчёта." },
    // Dynamics
    { topicId: 2, order: 1, title: "Первый закон Ньютона", description: "Инерция. Инерциальные системы отсчёта. Сила." },
    { topicId: 2, order: 2, title: "Второй закон Ньютона", description: "Уравнение движения. Сила как причина ускорения." },
    { topicId: 2, order: 3, title: "Третий закон Ньютона", description: "Действие и противодействие. Свойства сил." },
    { topicId: 2, order: 4, title: "Силы в природе", description: "Сила тяжести, упругости, трения, всемирного тяготения." },
    // Statics
    { topicId: 3, order: 1, title: "Условия равновесия", description: "Равенство нулю суммы сил и моментов." },
    { topicId: 3, order: 2, title: "Момент силы", description: "Плечо силы. Правило моментов." },
    { topicId: 3, order: 3, title: "Центр тяжести", description: "Положение центра тяжести для различных тел." },
    { topicId: 3, order: 4, title: "Простые механизмы", description: "Рычаг, блок, наклонная плоскость. Золотое правило механики." },
    // Conservation laws
    { topicId: 4, order: 1, title: "Импульс тела", description: "Векторная величина. Изменение импульса под действием силы." },
    { topicId: 4, order: 2, title: "Закон сохранения импульса", description: "Замкнутая система. Реактивное движение." },
    { topicId: 4, order: 3, title: "Механическая работа и мощность", description: "Работа силы. Мощность. КПД." },
    { topicId: 4, order: 4, title: "Энергия", description: "Кинетическая и потенциальная энергия. Закон сохранения энергии." },
    // Oscillations
    { topicId: 5, order: 1, title: "Гармонические колебания", description: "Уравнение гармонических колебаний. Амплитуда, период, частота." },
    { topicId: 5, order: 2, title: "Математический маятник", description: "Период колебаний. Зависимость от длины и g." },
    { topicId: 5, order: 3, title: "Пружинный маятник", description: "Период колебаний. Зависимость от массы и жёсткости." },
    { topicId: 5, order: 4, title: "Механические волны", description: "Длина волны, скорость, частота. Поперечные и продольные." },
    // Molecular physics
    { topicId: 6, order: 1, title: "МКТ и её основные положения", description: "Молекулы, атомы, броуновское движение." },
    { topicId: 6, order: 2, title: "Идеальный газ", description: "Уравнение состояния идеального газа." },
    { topicId: 6, order: 3, title: "Изопроцессы", description: "Изотермический, изобарный, изохорный процессы." },
    { topicId: 6, order: 4, title: "Насыщенный пар", description: "Испарение и конденсация. Влажность воздуха." },
    // Thermodynamics
    { topicId: 7, order: 1, title: "Внутренняя энергия", description: "Энергия молекул. Способы изменения." },
    { topicId: 7, order: 2, title: "Первое начало термодинамики", description: "Соотношение между работой, теплотой и изменением энергии." },
    { topicId: 7, order: 3, title: "Второе начало термодинамики", description: "Необратимость процессов. Тепловые машины." },
    { topicId: 7, order: 4, title: "КПД тепловой машины", description: "Цикл Карно. Максимальный КПД." },
    // Electrostatics
    { topicId: 8, order: 1, title: "Закон Кулона", description: "Взаимодействие точечных зарядов." },
    { topicId: 8, order: 2, title: "Электрическое поле", description: "Напряжённость поля. Силовые линии." },
    { topicId: 8, order: 3, title: "Потенциал", description: "Энергия заряда в поле. Разность потенциалов." },
    { topicId: 8, order: 4, title: "Конденсаторы", description: "Ёмкость. Энергия конденсатора." },
    // DC Circuits
    { topicId: 9, order: 1, title: "Сила тока", description: "Направление тока. Сила тока как скорость переноса заряда." },
    { topicId: 9, order: 2, title: "Закон Ома", description: "Для участка цепи и полной цепи." },
    { topicId: 9, order: 3, title: "Соединение проводников", description: "Последовательное и параллельное." },
    { topicId: 9, order: 4, title: "Работа и мощность тока", description: "Закон Джоуля-Ленца. Мощность." },
    // Magnetism
    { topicId: 10, order: 1, title: "Магнитное поле", description: "Источники поля. Магнитные линии." },
    { topicId: 10, order: 2, title: "Сила Ампера", description: "Действие поля на проводник с током." },
    { topicId: 10, order: 3, title: "Сила Лоренца", description: "Действие поля на движущийся заряд." },
    { topicId: 10, order: 4, title: "Электромагнитная индукция", description: "Явление индукции. Правило Ленца." },
    // Optics
    { topicId: 11, order: 1, title: "Отражение света", description: "Закон отражения. Плоское зеркало." },
    { topicId: 11, order: 2, title: "Преломление света", description: "Закон преломления. Полное внутреннее отражение." },
    { topicId: 11, order: 3, title: "Линзы", description: "Собирающие и рассеивающие. Фокусное расстояние." },
    { topicId: 11, order: 4, title: "Интерференция и дифракция", description: "Волновые свойства света." },
    // Quantum
    { topicId: 12, order: 1, title: "Фотоэффект", description: "Законы фотоэффекта. Красная граница." },
    { topicId: 12, order: 2, title: "Корпускулярно-волновой дуализм", description: "Гипотеза де Бройля. Волны материи." },
    { topicId: 12, order: 3, title: "Модель атома Бора", description: "Постулаты Бора. Спектры атомов." },
    { topicId: 12, order: 4, title: "Ядерные реакции", description: "Деление и синтез. Закон сохранения массового числа." },
  ];

  await db.insert(subtopics).values(subtopicData);
  console.log(`Inserted ${subtopicData.length} subtopics`);

  // Seed labs
  const labData = [
    {
      order: 1,
      title: "Определение ускорения свободного падения",
      slug: "free-fall-acceleration",
      description:
        "Интерактивная симуляция падения шара с фиксированной высоты. Измерьте время падения и рассчитайте ускорение свободного падения g.",
      shortDesc: "Падение шара с таймером",
      theory:
        "Ускорение свободного падения g определяется по формуле H = gt²/2. Измерив время падения t с высоты H, находим g = 2H/t². При малых высотах сопротивлением воздуха можно пренебречь.",
      iconType: "mechanics",
      topicId: 1,
    },
    {
      order: 2,
      title: "Изучение колебаний маятника",
      slug: "pendulum-oscillations",
      description:
        "Интерактивный математический маятник с возможностью изменения длины нити. Наблюдайте зависимость периода от длины.",
      shortDesc: "Маятник с изменяемой длиной",
      theory:
        "Период колебаний математического маятника: T = 2π√(l/g). Зависимость периода от длины нити носит квадратичный характер. При малых амплитудах (α < 5°) колебания близки к гармоническим.",
      iconType: "pendulum",
      topicId: 5,
    },
    {
      order: 3,
      title: "Закон Ома",
      slug: "ohms-law",
      description:
        "Соберите электрическую цепь с амперметром и вольтметром. Проверьте закон Ома для участка цепи.",
      shortDesc: "Сборка цепи с измерениями",
      theory:
        "Закон Ома для участка цепи: I = U/R. Сила тока прямо пропорциональна напряжению и обратно пропорциональна сопротивлению. Проверяется измерением I и U при разных R.",
      iconType: "circuit",
      topicId: 9,
    },
    {
      order: 4,
      title: "Наблюдение дифракции света",
      slug: "light-diffraction",
      description:
        "Интерактивная модель дифракции на двух щелях. Изменяйте шаг решётки и длину волны, наблюдайте интерференционную картину.",
      shortDesc: "Дифракционная решётка",
      theory:
        "Условие максимума при дифракции на решётке: d·sinφ = mλ. Где d — период решётки, φ — угол дифракции, m — порядок спектра, λ — длина волны.",
      iconType: "diffraction",
      topicId: 11,
    },
    {
      order: 5,
      title: "Определение фокусного расстояния линзы",
      slug: "lens-focal-length",
      description:
        "Перемещайте предмет относительно собирающей линзы и наблюдайте за изображением. Определите фокусное расстояние.",
      shortDesc: "Линза с перемещаемым предметом",
      theory:
        "Формула тонкой линзы: 1/F = 1/d + 1/f. Где F — фокусное расстояние, d — расстояние от предмета до линзы, f — расстояние от линзы до изображения. Линейное увеличение: Γ = f/d.",
      iconType: "lens",
      topicId: 11,
    },
    {
      order: 6,
      title: "Фотоэффект",
      slug: "photoelectric-effect",
      description:
        "Изменяйте частоту падающего света и материал катода. Наблюдайте за зависимостью кинетической энергии фотоэлектронов.",
      shortDesc: "Изменение частоты и материала",
      theory:
        "Уравнение Эйнштейна для фотоэффекта: hν = A + Eₖ. Где h — постоянная Планка, ν — частота света, A — работа выхода, Eₖ — кинетическая энергия электрона.",
      iconType: "photoeffect",
      topicId: 12,
    },
  ];

  await db.insert(labs).values(labData);
  console.log(`Inserted ${labData.length} labs`);

  // Seed resources
  const resourceData = [
    {
      title: "Видеокурс: Механика",
      description: "24 лекции по кинематике и динамике с разбором типовых задач",
      type: "video" as const,
      url: "#",
      tags: "Механика,Кинематика,Динамика",
    },
    {
      title: "Справочник формул по физике",
      description: "200+ формул по всем темам школьного курса с пояснениями",
      type: "reference" as const,
      url: "#",
      tags: "Справочник,Формулы,Все темы",
    },
    {
      title: "Задачник: Электричество и магнетизм",
      description: "150 задач с подробными решениями и алгоритмами",
      type: "workbook" as const,
      url: "#",
      tags: "Электричество,Магнетизм,Задачи",
    },
    {
      title: "Интерактивная модель: Солнечная система",
      description: "3D-модель планет с реальными орбитами и масштабами",
      type: "model" as const,
      url: "#",
      tags: "Астрофизика,Модель,3D",
    },
    {
      title: "Видеокурс: Термодинамика",
      description: "18 лекций с демонстрациями опытов",
      type: "video" as const,
      url: "#",
      tags: "Термодинамика,Газы,Тепло",
    },
    {
      title: "Задачник: Оптика",
      description: "100 задач на отражение, преломление, линзы",
      type: "workbook" as const,
      url: "#",
      tags: "Оптика,Линзы,Волны",
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
      url: "#",
      tags: "Колебания,Маятник,Механика",
    },
  ];

  await db.insert(resources).values(resourceData);
  console.log(`Inserted ${resourceData.length} resources`);

  console.log("Seed complete!");
}

seed().catch(console.error);

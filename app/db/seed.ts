import { getDb } from "../api/queries/connection";
import { topics, subtopics, labs, resources, topicNodes } from "./schema";

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

  // Seed hierarchical topic nodes
  const topicNodeRoots = [
    { order: 1, title: "Кинематика", slug: "kinematics", color: "#2eff8c", content: "Раздел механики, изучающий движение тел без рассмотрения причин, вызывающих это движение." },
    { order: 2, title: "Динамика", slug: "dynamics", color: "#ffcb3d", content: "Раздел механики, изучающий причины движения тел." },
    { order: 3, title: "Законы сохранения", slug: "conservation", color: "#01acff", content: "Фундаментальные законы: сохранение импульса, энергии, момента импульса." },
    { order: 4, title: "Статика и гидростатика", slug: "statics", color: "#ff6b6b", content: "Условия равновесия, давление, закон Архимеда." },
    { order: 5, title: "Молекулярная физика", slug: "molecular", color: "#ff8c42", content: "Основы МКТ, идеальный газ, термодинамические процессы." },
    { order: 6, title: "Электростатика", slug: "electrostatics", color: "#a78bfa", content: "Закон Кулона, электрическое поле, потенциал, ёмкость." },
    { order: 7, title: "Постоянный ток", slug: "dc-circuits", color: "#2eff8c", content: "Законы Ома, соединения проводников, работа и мощность тока." },
    { order: 8, title: "Магнетизм", slug: "magnetism", color: "#ffcb3d", content: "Магнитное поле, сила Ампера, сила Лоренца, электромагнитная индукция." },
    { order: 9, title: "Колебания и волны", slug: "oscillations", color: "#01acff", content: "Механические и электромагнитные колебания, гармонические колебания, волны." },
    { order: 10, title: "Оптика", slug: "optics", color: "#ff6b6b", content: "Закон преломления, линзы, оптические приборы, природа света." },
    { order: 11, title: "Атомная физика", slug: "atomic", color: "#ff8c42", content: "Модели атома, спектры, постулаты Бора, радиоактивность." },
    { order: 12, title: "Квантовая физика", slug: "quantum", color: "#a78bfa", content: "Де Бройля, принцип неопределенности, элементы СТО." },
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
    });
    insertedRootIds.push(Number(res[0].insertId));
  }
  console.log(`Inserted ${topicNodeRoots.length} topic node roots`);

  const subtopicNodeData = [
    // Kinematics
    { rootIdx: 0, order: 1, title: "Равномерное прямолинейное движение", content: "При равномерном прямолинейном движении тело за равные промежутки времени совершает равные перемещения.\\n\\nСкорость постоянна: $v = \\text{const}$.\\n\\nУравнение движения: $x = x_0 + vt$\\n\\nГрафик зависимости координаты от времени — прямая линия." },
    { rootIdx: 0, order: 2, title: "Равноускоренное движение", content: "При равноускоренном движении ускорение постоянно: $a = \\text{const}$.\\n\\nОсновные формулы:\\n- $v = v_0 + at$\\n- $s = v_0t + \\frac{at^2}{2}$\\n- $v^2 - v_0^2 = 2as$\\n\\nГрафик скорости от времени — наклонная прямая." },
    { rootIdx: 0, order: 3, title: "Движение по окружности", content: "При движении по окружности скорость направлена по касательной.\\n\\nЦентростремительное ускорение:\\n$$a = \\frac{v^2}{R} = \\omega^2 R$$\\n\\nПериод: $T = \\frac{2\\pi R}{v}$\\n\\nЧастота: $\\nu = \\frac{1}{T}$\\n\\nУгловая скорость: $\\omega = \\frac{2\\pi}{T}$" },
    { rootIdx: 0, order: 4, title: "Относительность движения", content: "Скорость тела относительно неподвижной системы отсчёта равна векторной сумме скорости тела относительно подвижной системы и скорости подвижной системы относительно неподвижной:\\n$$\\vec{v} = \\vec{v}\' + \\vec{v}_0$$" },
    // Dynamics
    { rootIdx: 1, order: 1, title: "Законы Ньютона", content: "**I закон:** существуют системы отсчёта (инерциальные), в которых тело сохраняет состояние покоя или равномерного прямолинейного движения, если на него не действуют силы.\\n\\n**II закон:** $\\vec{F} = m\\vec{a}$\\n\\n**III закон:** сила действия равна по модулю и противоположна по направлению силе противодействия." },
    { rootIdx: 1, order: 2, title: "Сила трения", content: "Сила трения покоя: $F_{тр} \\leq \\mu N$\\n\\nСила трения скольжения: $F_{тр} = \\mu N$\\n\\nСила трения направлена противоположно направлению движения или предполагаемого движения." },
    { rootIdx: 1, order: 3, title: "Сила упругости", content: "Сила упругости возникает при деформации тела.\\n\\n**Закон Гука:** $F = kx$\\n\\nгде $k$ — коэффициент жёсткости, $x$ — изменение длины." },
    // Conservation
    { rootIdx: 2, order: 1, title: "Импульс тела", content: "Импульс материальной точки:\\n$$\\vec{p} = m\\vec{v}$$\\n\\nИмпульс — векторная величина, направленная так же, как скорость." },
    { rootIdx: 2, order: 2, title: "Закон сохранения импульса", content: "Для замкнутой системы тел векторная сумма импульсов всех тел остаётся постоянной:\\n$$\\vec{p}_1 + \\vec{p}_2 + ... + \\vec{p}_n = \\text{const}$$" },
    { rootIdx: 2, order: 3, title: "Механическая работа и мощность", content: "Работа силы: $A = Fs\\cos\\alpha$\\n\\nМощность: $P = \\frac{A}{t} = Fv\\cos\\alpha$" },
    { rootIdx: 2, order: 4, title: "Кинетическая и потенциальная энергия", content: "Кинетическая энергия: $E_k = \\frac{mv^2}{2}$\\n\\nПотенциальная энергия в поле тяжести: $E_p = mgh$\\n\\nПолная механическая энергия: $E = E_k + E_p$" },
    { rootIdx: 2, order: 5, title: "Закон сохранения энергии", content: "В замкнутой системе тел, где действуют только консервативные силы, полная механическая энергия сохраняется:\\n$$E = E_k + E_p = \\text{const}$$" },
    // Statics
    { rootIdx: 3, order: 1, title: "Условия равновесия твёрдого тела", content: "Условия равновесия:\\n1. Геометрическая сумма всех сил равна нулю\\n2. Сумма моментов всех сил относительно любой оси равна нулю" },
    { rootIdx: 3, order: 2, title: "Момент силы", content: "Момент силы: $M = Fd$\\n\\nгде $d$ — плечо силы (кратчайшее расстояние от оси вращения до линии действия силы)." },
    { rootIdx: 3, order: 3, title: "Давление в жидкостях и газах", content: "Давление столба жидкости: $p = \\rho gh$\\n\\n**Закон Архимеда:** $F_A = \\rho_{ж} g V_{т}$" },
    // Molecular
    { rootIdx: 4, order: 1, title: "Основы МКТ", content: "Основные положения МКТ:\\n1. Вещество состоит из частиц\\n2. Частицы движутся хаотично\\n3. Между частицами действуют силы взаимодействия" },
    { rootIdx: 4, order: 2, title: "Уравнение состояния идеального газа", content: "$$pV = \\nu RT$$\\n\\nгде $\\nu$ — количество вещества, $R = 8.31$ Дж/(моль·К)." },
    { rootIdx: 4, order: 3, title: "Изопроцессы", content: "**Изотермический** ($T=\\text{const}$): $pV = \\text{const}$\\n\\n**Изобарный** ($p=\\text{const}$): $\\frac{V}{T} = \\text{const}$\\n\\n**Изохорный** ($V=\\text{const}$): $\\frac{p}{T} = \\text{const}$" },
    { rootIdx: 4, order: 4, title: "Первое начало термодинамики", content: "$$\\Delta U = Q - A$$\\n\\nИзменение внутренней энергии системы равно количеству теплоты, переданному системе, минус работа, совершённая системой." },
    // Electrostatics
    { rootIdx: 5, order: 1, title: "Закон Кулона", content: "$$F = k\\frac{|q_1 q_2|}{r^2}$$\\n\\nгде $k = 9\\cdot10^9$ Н·м²/Кл²." },
    { rootIdx: 5, order: 2, title: "Напряжённость электрического поля", content: "$$E = \\frac{F}{q} = k\\frac{|q|}{r^2}$$" },
    { rootIdx: 5, order: 3, title: "Потенциал и работа поля", content: "Потенциал: $\\varphi = \\frac{W}{q}$\\n\\nРабота поля: $A = q(\\varphi_1 - \\varphi_2)$" },
    { rootIdx: 5, order: 4, title: "Конденсаторы и ёмкость", content: "Ёмкость конденсатора: $C = \\frac{q}{U}$\\n\\nЁмкость плоского конденсатора: $C = \\frac{\\varepsilon\\varepsilon_0 S}{d}$" },
    // DC
    { rootIdx: 6, order: 1, title: "Закон Ома для участка цепи", content: "$$I = \\frac{U}{R}$$\\n\\nСопротивление проводника: $R = \\rho\\frac{l}{S}$" },
    { rootIdx: 6, order: 2, title: "Последовательное и параллельное соединение", content: "**Последовательное:** $R = R_1 + R_2 + ...$\\n\\n**Параллельное:** $\\frac{1}{R} = \\frac{1}{R_1} + \\frac{1}{R_2} + ...$" },
    { rootIdx: 6, order: 3, title: "Работа и мощность тока", content: "$$Q = I^2 Rt$$\\n\\nМощность: $P = IU = I^2R = \\frac{U^2}{R}$" },
    { rootIdx: 6, order: 4, title: "ЭДС и закон Ома для полной цепи", content: "$$I = \\frac{\\varepsilon}{R + r}$$\\n\\nгде $r$ — внутреннее сопротивление источника." },
    // Magnetism
    { rootIdx: 7, order: 1, title: "Магнитное поле", content: "Магнитное поле создаётся движущимися электрическими зарядами. Линии магнитной индукции замкнуты." },
    { rootIdx: 7, order: 2, title: "Сила Ампера и Лоренца", content: "Сила Ампера: $F = IBl\\sin\\alpha$\\n\\nСила Лоренца: $F = qvB\\sin\\alpha$" },
    { rootIdx: 7, order: 3, title: "Закон электромагнитной индукции", content: "$$\\varepsilon_i = -\\frac{\\Delta\\Phi}{\\Delta t}$$\\n\\nМагнитный поток: $\\Phi = BS\\cos\\alpha$" },
    { rootIdx: 7, order: 4, title: "Самоиндукция", content: "$$\\varepsilon_s = -L\\frac{\\Delta I}{\\Delta t}$$\\n\\nИндуктивность $L$ зависит от геометрии контура." },
    // Oscillations
    { rootIdx: 8, order: 1, title: "Гармонические колебания", content: "Уравнение гармонических колебаний:\\n$$x = A\\cos(\\omega t + \\varphi_0)$$\\n\\nПериод математического маятника: $T = 2\\pi\\sqrt{\\frac{l}{g}}$" },
    { rootIdx: 8, order: 2, title: "Электромагнитные колебания", content: "$$T = 2\\pi\\sqrt{LC}$$" },
    { rootIdx: 8, order: 3, title: "Механические волны", content: "$$v = \\lambda\\nu = \\frac{\\lambda}{T}$$" },
    { rootIdx: 8, order: 4, title: "Интерференция и дифракция", content: "Условие максимума: $\\Delta d = m\\lambda$" },
    // Optics
    { rootIdx: 9, order: 1, title: "Отражение и преломление света", content: "**Закон отражения:** угол падения равен углу отражения\\n\\n**Закон преломления:** $n_1\\sin\\alpha_1 = n_2\\sin\\alpha_2$" },
    { rootIdx: 9, order: 2, title: "Линзы и изображения", content: "Формула тонкой линзы:\\n$$\\frac{1}{F} = \\frac{1}{d} + \\frac{1}{f}$$" },
    { rootIdx: 9, order: 3, title: "Волновая природа света", content: "Свет — электромагнитная волна. Интерференция, дифракция, поляризация." },
    { rootIdx: 9, order: 4, title: "Квантовая природа света", content: "Энергия фотона: $E = h\\nu$\\n\\nУравнение Эйнштейна для фотоэффекта:\\n$$h\\nu = A_{\\text{вых}} + E_k$$" },
    // Atomic
    { rootIdx: 10, order: 1, title: "Модели атома", content: "Томсон — «пудинг с изюмом». Резерфорд — планетарная модель. Бор — квантовые постулаты." },
    { rootIdx: 10, order: 2, title: "Постулаты Бора", content: "1. Атом существует в стационарных состояниях\\n2. При переходе излучается фотон: $h\\nu = E_m - E_n$" },
    { rootIdx: 10, order: 3, title: "Радиоактивность", content: "$\\alpha$ — ядра гелия, $\\beta$ — электроны, $\\gamma$ — ЭМ излучение." },
    { rootIdx: 10, order: 4, title: "Ядерные реакции", content: "Деление и синтез ядер. Энергия связи: $E = \\Delta m c^2$" },
    // Quantum
    { rootIdx: 11, order: 1, title: "Гипотеза де Бройля", content: "$$\\lambda = \\frac{h}{p} = \\frac{h}{mv}$$" },
    { rootIdx: 11, order: 2, title: "Принцип неопределённости", content: "$$\\Delta x \\cdot \\Delta p \\geq \\frac{\\hbar}{2}$$" },
    { rootIdx: 11, order: 3, title: "Основы СТО", content: "Постулаты Эйнштейна. $E = mc^2$ — связь массы и энергии." },
    { rootIdx: 11, order: 4, title: "Фундаментальные взаимодействия", content: "Гравитационное, электромагнитное, сильное, слабое." },
  ];

  for (const sub of subtopicNodeData) {
    await db.insert(topicNodes).values({
      parentId: insertedRootIds[sub.rootIdx],
      order: sub.order,
      title: sub.title,
      slug: `${topicNodeRoots[sub.rootIdx].slug}-sub-${sub.order}`,
      content: sub.content,
    });
  }
  console.log(`Inserted ${subtopicNodeData.length} topic node subtopics`);

  console.log("Seed complete!");
}

seed().catch(console.error);

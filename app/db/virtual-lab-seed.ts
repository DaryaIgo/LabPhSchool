import { getDb } from "../api/queries/connection";
import {
  labCategories,
  labSubcategories,
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

  // Subcategories
  const subcategories = [
    {
      categoryId: catMap.get("mechanics")!,
      order: 1,
      title: "Кинематика",
      slug: "kinematics",
      description: "Равномерное и равноускоренное движение, движение по окружности, бросок тела.",
    },
  ];

  for (const sub of subcategories) {
    const exists = await db
      .select()
      .from(labSubcategories)
      .where(eq(labSubcategories.slug, sub.slug))
      .limit(1);
    if (exists.length === 0) {
      await db.insert(labSubcategories).values(sub);
      console.log(`Created subcategory: ${sub.title}`);
    }
  }

  const subRows = await db.select().from(labSubcategories);
  const subMap = new Map(subRows.map((s) => [s.slug, s.id]));

  // Lab Works
  const works = [
    {
      categoryId: catMap.get("pressure-archimedes")!,
      topicNodeId: 27,
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
      topicNodeId: 27,
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
      topicNodeId: 27,
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
      topicNodeId: 38,
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
    // ── Кинематика ──
    {
      categoryId: catMap.get("mechanics")!,
      subcategoryId: subMap.get("kinematics")!,
      topicNodeId: 13,
      order: 1,
      title: "Изучение прямолинейного равномерного движения",
      slug: "uniform-linear-motion",
      law: "s = v·t",
      skills: "Измерение скорости и времени, построение графиков зависимости координаты от времени.",
      difficulty: "easy" as const,
      duration: 25,
      goal:
        "Экспериментально определить скорость тела при равномерном прямолинейном движении и построить график зависимости координаты от времени.",
      theory: `При **равномерном прямолинейном движении** тело за равные промежутки времени совершает равные перемещения. Скорость остается постоянной.

**Основные формулы:**
$$s = v \\cdot t$$
$$x = x_0 + v \\cdot t$$

gde:
- $s$ — путь (м)
- $v$ — скорость (м/с)
- $t$ — время (с)
- $x$ — координата тела (м)
- $x_0$ — начальная координата (м)

**График $x(t)$** при равномерном движении — прямая линия, угловой коэффициент которой равен скорости $v$.

**График $s(t)$** — прямая линия, проходящая через начало координат.`,
      equipment: JSON.stringify(["Секундомер", "Измерительная лента", "Движущееся тело (тележка)", "Линейка", "Метки"]),
      instruction: `1. Установите начальное положение тела на измерительной ленте. Запишите x0.
2. Задайте скорость движения тела.
3. Запустите движение и одновременно включите секундомер.
4. Через равные промежутки времени (например, каждые 2 с) фиксируйте координату тела.
5. Занесите результаты в таблицу.
6. Постройте график зависимости x(t).
7. По угловому коэффициенту графика определите скорость движения.`,
      conclusionTemplate:
        "В ходе работы было исследовано равномерное прямолинейное движение. Установлено, что координата тела линейно зависит от времени. Экспериментально определенная скорость составила v = {{avgSpeed}} м/с, что соответствует заданному значению с погрешностью {{errorPercent}}%.",
      status: "published" as const,
    },
    {
      categoryId: catMap.get("mechanics")!,
      subcategoryId: subMap.get("kinematics")!,
      topicNodeId: 14,
      order: 2,
      title: "Изучение прямолинейного равноускоренного движения",
      slug: "uniformly-accelerated-motion",
      law: "s = v0t + at2/2",
      skills: "Измерение пути, скорости и ускорения; работа с наклонным желобом; построение графиков.",
      difficulty: "medium" as const,
      duration: 35,
      goal:
        "Экспериментально измерить путь и скорость тела, движущегося с постоянным ускорением, и определить величину ускорения.",
      theory: `При **равноускоренном прямолинейном движении** ускорение остается постоянным.

**Основные формулы:**
$$v = v_0 + a \\cdot t$$
$$s = v_0 \\cdot t + \\frac{a \\cdot t^2}{2}$$
$$v^2 - v_0^2 = 2 \\cdot a \\cdot s$$

gde:
- $v_0$ — начальная скорость (м/с)
- $a$ — ускорение (м/с²)
- $t$ — время (с)
- $s$ — путь (м)

**График $v(t)$** при равноускоренном движении — наклонная прямая. Угловой коэффициент равен ускорению $a$.

Эксперимент часто выполняется на **наклонном желобе** или с помощью **машины Атвуда**.`,
      equipment: JSON.stringify(["Наклонный желоб", "Шарик (или тележка)", "Секундомер", "Линейка", "Угломер", "Опоры"]),
      instruction: `1. Установите наклонный желоб под углом 10–15° к горизонту.
2. Отпустите шарик из начальной точки (v0 = 0).
3. Измерьте время движения до нескольких контрольных точек.
4. Для каждой точки рассчитайте пройденный путь s и мгновенную скорость v.
5. Повторите опыт при другом угле наклона (другом ускорении).
6. Постройте графики s(t) и v(t).
7. По графику v(t) определите ускорение.`,
      conclusionTemplate:
        "При равноускоренном движении с начальной скоростью v0 = {{v0}} м/с и ускорением a = {{avgAccel}} м/с² путь пропорционален квадрату времени, а скорость линейно зависит от времени. Экспериментально полученное значение ускорения подтверждает теоретический расчет: a = g·sin(α) ≈ {{theoreticalAccel}} м/с².",
      status: "published" as const,
    },
    {
      categoryId: catMap.get("mechanics")!,
      subcategoryId: subMap.get("kinematics")!,
      topicNodeId: 44,
      order: 3,
      title: "Определение ускорения свободного падения",
      slug: "free-fall-g",
      law: "T = 2π√(l/g)",
      skills: "Работа с маятником, измерение периода колебаний, обработка экспериментальных данных.",
      difficulty: "medium" as const,
      duration: 40,
      goal:
        "Экспериментально определить ускорение свободного падения g с помощью математического маятника.",
      theory: `**Математический маятник** — материальная точка, подвешенная на невесомой нерастяжимой нити.

Период его колебаний:
$$T = 2\\pi \\sqrt{\\frac{l}{g}}$$

gde:
- $T$ — период колебаний (с)
- $l$ — длина нити (м)
- $g$ — ускорение свободного падения (м/с²)

**Выражение для g:**
$$g = \\frac{4\\pi^2 l}{T^2}$$

Для повышения точности измеряют время $t$ большого числа колебаний $n$:
$$T = \\frac{t}{n}$$

При малых амплитудах (α < 5°) период не зависит от массы груза.`,
      equipment: JSON.stringify(["Штатив с кольцом", "Нить с грузом (шарик)", "Секундомер", "Линейка", "Транспортир"]),
      instruction: `1. Подвесьте груз на нити длиной l = 50 см.
2. Отведите маятник на малый угол (2–3°) и отпустите.
3. Измерьте время t = 20 полных колебаний.
4. Вычислите период: T = t/20.
5. Рассчитайте g по формуле g = 4π²l/T².
6. Повторите опыт для нитей длиной 75 см, 100 см, 125 см, 150 см.
7. Постройте график T²(l) и определите g по угловому коэффициенту.`,
      conclusionTemplate:
        "В ходе работы было определено ускорение свободного падения с помощью математического маятника. Среднее значение g = {{avgG}} м/с². Погрешность измерения составила {{errorPercent}}% по сравнению с табличным значением 9,8 м/с². Установлено, что T² пропорционально длине нити l.",
      status: "published" as const,
    },
    {
      categoryId: catMap.get("mechanics")!,
      subcategoryId: subMap.get("kinematics")!,
      topicNodeId: 15,
      order: 4,
      title: "Изучение движения по окружности",
      slug: "circular-motion",
      law: "a = v²/R = ω²R",
      skills: "Измерение периода вращения, расчет центростремительного ускорения, угловой и линейной скорости.",
      difficulty: "medium" as const,
      duration: 30,
      goal:
        "Определить центростремительное ускорение, угловую и линейную скорость тела при равномерном вращении по окружности.",
      theory: `При **равномерном движении по окружности** скорость по модулю постоянна, но направление непрерывно меняется.

**Основные величины:**
- Период: $T = \\frac{2\\pi R}{v} = \\frac{2\\pi}{\\omega}$
- Линейная скорость: $v = \\frac{2\\pi R}{T} = \\omega R$
- Угловая скорость: $\\omega = \\frac{2\\pi}{T}$
- Центростремительное ускорение: $a = \\frac{v^2}{R} = \\omega^2 R = \\frac{4\\pi^2 R}{T^2}$
- Центростремительная сила: $F = m \\cdot a = m \\cdot \\frac{v^2}{R}$

gde:
- $R$ — радиус окружности (м)
- $m$ — масса тела (кг)
- $T$ — период обращения (с)`,
      equipment: JSON.stringify(["Штатив с нитью", "Груз", "Секундомер", "Линейка", "Весы"]),
      instruction: `1. Подвесьте груз массой m на нити длиной R.
2. Приведите груз во вращение по горизонтальной окружности радиуса R (конический маятник).
3. Измерьте время 10 полных оборотов.
4. Вычислите период вращения T.
5. Рассчитайте линейную скорость v, угловую скорость ω и центростремительное ускорение a.
6. Повторите опыт при другом радиусе вращения.
7. Постройте график a(R) при постоянном T.`,
      conclusionTemplate:
        "При равномерном движении по окружности радиусом R = {{avgRadius}} м и периодом T = {{avgPeriod}} с линейная скорость составила v = {{avgV}} м/с, угловая скорость ω = {{avgOmega}} рад/с, центростремительное ускорение a = {{avgA}} м/с². Установлено, что a пропорционально R при постоянном ω и обратно пропорционально R при постоянном v.",
      status: "published" as const,
    },
    {
      categoryId: catMap.get("mechanics")!,
      subcategoryId: subMap.get("kinematics")!,
      topicNodeId: 16,
      order: 5,
      title: "Исследование движения тела, брошенного под углом",
      slug: "projectile-motion",
      law: "L = v0²·sin(2α)/g",
      skills: "Анализ параболического движения, расчет дальности, высоты и времени полета.",
      difficulty: "hard" as const,
      duration: 45,
      goal:
        "Определить дальность полета, максимальную высоту подъема и время полета тела, брошенного под углом к горизонту, в зависимости от угла бросания и начальной скорости.",
      theory: `Движение тела, брошенного под углом α к горизонту с начальной скоростью v0, можно разложить на два независимых движения:

**По горизонтали** — равномерное движение:
$$v_x = v_0 \\cdot \\cos\\alpha$$
$$x = v_0 \\cdot \\cos\\alpha \\cdot t$$

**По вертикали** — равноускоренное движение:
$$v_y = v_0 \\cdot \\sin\\alpha - g \\cdot t$$
$$y = v_0 \\cdot \\sin\\alpha \\cdot t - \\frac{g \\cdot t^2}{2}$$

**Характеристики полета:**
- Время подъема: $t_{п} = \\frac{v_0 \\cdot \\sin\\alpha}{g}$
- Полное время полета: $T = 2t_{п} = \\frac{2v_0 \\cdot \\sin\\alpha}{g}$
- Максимальная высота: $H = \\frac{v_0^2 \\cdot \\sin^2\\alpha}{2g}$
- Дальность полета: $L = \\frac{v_0^2 \\cdot \\sin(2\\alpha)}{g}$

Максимальная дальность достигается при угле броска α = 45°.`,
      equipment: JSON.stringify(["Стенд для броска", "Мяч", "Линейка", "Угломер", "Секундомер", "Бумага миллиметровая"]),
      instruction: `1. Установите угол броска α = 30° и начальную скорость v0.
2. Выполните бросок и измерьте дальность полета L и время полета T.
3. Рассчитайте теоретические значения L, H и T по формулам.
4. Повторите опыт для углов 45° и 60° (при той же v0).
5. Повторите опыт при другой начальной скорости.
6. Занесите результаты в таблицу.
7. Постройте графики L(α) и H(α).`,
      conclusionTemplate:
        "В ходе работы было исследовано движение тела, брошенного под углом к горизонту. Установлено, что максимальная дальность полета L = {{maxL}} м достигается при угле броска около 45°, а максимальная высота H = {{maxH}} м увеличивается с ростом угла α. При v0 = {{avgV0}} м/с экспериментальные значения хорошо согласуются с теоретическими расчетами.",
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
      } else if (work.slug === "uniform-linear-motion") {
        const params = [
          { key: "speed", label: "Скорость", paramType: "slider" as const, min: "0.5", max: "20", step: "0.5", defaultValue: "5", unit: "м/с" },
          { key: "time", label: "Время", paramType: "slider" as const, min: "1", max: "30", step: "1", defaultValue: "10", unit: "с" },
          { key: "startX", label: "Начальная координата", paramType: "slider" as const, min: "0", max: "50", step: "1", defaultValue: "0", unit: "м" },
        ];
        for (const p of params) {
          await db.insert(labSimulationParams).values({ labWorkId: workId, ...p });
        }
      } else if (work.slug === "uniformly-accelerated-motion") {
        const params = [
          { key: "v0", label: "Начальная скорость", paramType: "slider" as const, min: "0", max: "10", step: "0.5", defaultValue: "0", unit: "м/с" },
          { key: "acceleration", label: "Ускорение", paramType: "slider" as const, min: "-5", max: "5", step: "0.1", defaultValue: "2", unit: "м/с²" },
          { key: "time", label: "Время", paramType: "slider" as const, min: "1", max: "20", step: "0.5", defaultValue: "5", unit: "с" },
        ];
        for (const p of params) {
          await db.insert(labSimulationParams).values({ labWorkId: workId, ...p });
        }
      } else if (work.slug === "free-fall-g") {
        const params = [
          { key: "length", label: "Длина нити", paramType: "slider" as const, min: "0.1", max: "2", step: "0.05", defaultValue: "0.5", unit: "м" },
          { key: "oscillations", label: "Число колебаний", paramType: "slider" as const, min: "5", max: "50", step: "1", defaultValue: "20", unit: "" },
          { key: "measuredTime", label: "Измеренное время", paramType: "slider" as const, min: "1", max: "100", step: "0.1", defaultValue: "28.3", unit: "с" },
        ];
        for (const p of params) {
          await db.insert(labSimulationParams).values({ labWorkId: workId, ...p });
        }
      } else if (work.slug === "circular-motion") {
        const params = [
          { key: "radius", label: "Радиус окружности", paramType: "slider" as const, min: "0.1", max: "2", step: "0.05", defaultValue: "0.5", unit: "м" },
          { key: "period", label: "Период обращения", paramType: "slider" as const, min: "0.1", max: "5", step: "0.05", defaultValue: "1", unit: "с" },
          { key: "mass", label: "Масса тела", paramType: "slider" as const, min: "0.05", max: "2", step: "0.05", defaultValue: "0.2", unit: "кг" },
        ];
        for (const p of params) {
          await db.insert(labSimulationParams).values({ labWorkId: workId, ...p });
        }
      } else if (work.slug === "projectile-motion") {
        const params = [
          { key: "v0", label: "Начальная скорость", paramType: "slider" as const, min: "1", max: "50", step: "1", defaultValue: "20", unit: "м/с" },
          { key: "angle", label: "Угол броска", paramType: "slider" as const, min: "0", max: "90", step: "1", defaultValue: "45", unit: "°" },
          { key: "g", label: "Ускорение свободного падения", paramType: "slider" as const, min: "1.6", max: "20", step: "0.1", defaultValue: "9.8", unit: "м/с²" },
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

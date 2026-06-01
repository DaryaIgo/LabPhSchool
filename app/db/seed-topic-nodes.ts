import { getDb } from "../api/queries/connection";
import { topicNodes } from "./schema";

async function seedTopicNodes() {
  const db = getDb();

  // Check if already seeded
  const existing = await db.select({ count: topicNodes.id }).from(topicNodes);
  if (existing.length > 0 && existing[0]) {
    console.log("Topic nodes already seeded, skipping...");
    return;
  }

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
    { order: 12, title: "Квантовая физика", slug: "quantum", color: "#a78bfa", content: "Де Бройля, принцип неопределённости, элементы СТО." },
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
    { rootIdx: 0, order: 1, title: "Равномерное прямолинейное движение", content: "При равномерном прямолинейном движении тело за равные промежутки времени совершает равные перемещения.\n\nСкорость постоянна: $v = \\text{const}$.\n\nУравнение движения: $x = x_0 + vt$\n\nГрафик зависимости координаты от времени — прямая линия." },
    { rootIdx: 0, order: 2, title: "Равноускоренное движение", content: "При равноускоренном движении ускорение постоянно: $a = \\text{const}$.\n\nОсновные формулы:\n- $v = v_0 + at$\n- $s = v_0t + \\frac{at^2}{2}$\n- $v^2 - v_0^2 = 2as$\n\nГрафик скорости от времени — наклонная прямая." },
    { rootIdx: 0, order: 3, title: "Движение по окружности", content: "При движении по окружности скорость направлена по касательной.\n\nЦентростремительное ускорение:\n$$a = \\frac{v^2}{R} = \\omega^2 R$$\n\nПериод: $T = \\frac{2\\pi R}{v}$\n\nЧастота: $\\nu = \\frac{1}{T}$\n\nУгловая скорость: $\\omega = \\frac{2\\pi}{T}$" },
    { rootIdx: 0, order: 4, title: "Относительность движения", content: "Скорость тела относительно неподвижной системы отсчёта равна векторной сумме скорости тела относительно подвижной системы и скорости подвижной системы относительно неподвижной:\n$$\\vec{v} = \\vec{v}\\' + \\vec{v}_0$$" },
    // Dynamics
    { rootIdx: 1, order: 1, title: "Законы Ньютона", content: "**I закон:** существуют системы отсчёта (инерциальные), в которых тело сохраняет состояние покоя или равномерного прямолинейного движения, если на него не действуют силы.\n\n**II закон:** $\\vec{F} = m\\vec{a}$\n\n**III закон:** сила действия равна по модулю и противоположна по направлению силе противодействия." },
    { rootIdx: 1, order: 2, title: "Сила трения", content: "Сила трения покоя: $F_{тр} \\leq \\mu N$\n\nСила трения скольжения: $F_{тр} = \\mu N$\n\nСила трения направлена противоположно направлению движения или предполагаемого движения." },
    { rootIdx: 1, order: 3, title: "Сила упругости", content: "Сила упругости возникает при деформации тела.\n\n**Закон Гука:** $F = kx$\n\nгде $k$ — коэффициент жёсткости, $x$ — изменение длины." },
    // Conservation
    { rootIdx: 2, order: 1, title: "Импульс тела", content: "Импульс материальной точки:\n$$\\vec{p} = m\\vec{v}$$\n\nИмпульс — векторная величина, направленная так же, как скорость." },
    { rootIdx: 2, order: 2, title: "Закон сохранения импульса", content: "Для замкнутой системы тел векторная сумма импульсов всех тел остаётся постоянной:\n$$\\vec{p}_1 + \\vec{p}_2 + ... + \\vec{p}_n = \\text{const}$$" },
    { rootIdx: 2, order: 3, title: "Механическая работа и мощность", content: "Работа силы: $A = Fs\\cos\\alpha$\n\nМощность: $P = \\frac{A}{t} = Fv\\cos\\alpha$" },
    { rootIdx: 2, order: 4, title: "Кинетическая и потенциальная энергия", content: "Кинетическая энергия: $E_k = \\frac{mv^2}{2}$\n\nПотенциальная энергия в поле тяжести: $E_p = mgh$\n\nПолная механическая энергия: $E = E_k + E_p$" },
    { rootIdx: 2, order: 5, title: "Закон сохранения энергии", content: "В замкнутой системе тел, где действуют только консервативные силы, полная механическая энергия сохраняется:\n$$E = E_k + E_p = \\text{const}$$" },
    // Statics
    { rootIdx: 3, order: 1, title: "Условия равновесия твёрдого тела", content: "Условия равновесия:\n1. Геометрическая сумма всех сил равна нулю\n2. Сумма моментов всех сил относительно любой оси равна нулю" },
    { rootIdx: 3, order: 2, title: "Момент силы", content: "Момент силы: $M = Fd$\n\nгде $d$ — плечо силы (кратчайшее расстояние от оси вращения до линии действия силы)." },
    { rootIdx: 3, order: 3, title: "Давление в жидкостях и газах", content: "Давление столба жидкости: $p = \\rho gh$\n\n**Закон Архимеда:** $F_A = \\rho_{ж} g V_{т}$" },
    // Molecular
    { rootIdx: 4, order: 1, title: "Основы МКТ", content: "Основные положения МКТ:\n1. Вещество состоит из частиц\n2. Частицы движутся хаотично\n3. Между частицами действуют силы взаимодействия" },
    { rootIdx: 4, order: 2, title: "Уравнение состояния идеального газа", content: "$$pV = \\nu RT$$\n\nгде $\\nu$ — количество вещества, $R = 8.31$ Дж/(моль·К)." },
    { rootIdx: 4, order: 3, title: "Изопроцессы", content: "**Изотермический** ($T=\\text{const}$): $pV = \\text{const}$\n\n**Изобарный** ($p=\\text{const}$): $\\frac{V}{T} = \\text{const}$\n\n**Изохорный** ($V=\\text{const}$): $\\frac{p}{T} = \\text{const}$" },
    { rootIdx: 4, order: 4, title: "Первое начало термодинамики", content: "$$\\Delta U = Q - A$$\n\nИзменение внутренней энергии системы равно количеству теплоты, переданному системе, минус работа, совершённая системой." },
    // Electrostatics
    { rootIdx: 5, order: 1, title: "Закон Кулона", content: "$$F = k\\frac{|q_1 q_2|}{r^2}$$\n\nгде $k = 9\\cdot10^9$ Н·м²/Кл²." },
    { rootIdx: 5, order: 2, title: "Напряжённость электрического поля", content: "$$E = \\frac{F}{q} = k\\frac{|q|}{r^2}$$" },
    { rootIdx: 5, order: 3, title: "Потенциал и работа поля", content: "Потенциал: $\\varphi = \\frac{W}{q}$\n\nРабота поля: $A = q(\\varphi_1 - \\varphi_2)$" },
    { rootIdx: 5, order: 4, title: "Конденсаторы и ёмкость", content: "Ёмкость конденсатора: $C = \\frac{q}{U}$\n\nЁмкость плоского конденсатора: $C = \\frac{\\varepsilon\\varepsilon_0 S}{d}$" },
    // DC
    { rootIdx: 6, order: 1, title: "Закон Ома для участка цепи", content: "$$I = \\frac{U}{R}$$\n\nСопротивление проводника: $R = \\rho\\frac{l}{S}$" },
    { rootIdx: 6, order: 2, title: "Последовательное и параллельное соединение", content: "**Последовательное:** $R = R_1 + R_2 + ...$\n\n**Параллельное:** $\\frac{1}{R} = \\frac{1}{R_1} + \\frac{1}{R_2} + ...$" },
    { rootIdx: 6, order: 3, title: "Работа и мощность тока", content: "$$Q = I^2 Rt$$\n\nМощность: $P = IU = I^2R = \\frac{U^2}{R}$" },
    { rootIdx: 6, order: 4, title: "ЭДС и закон Ома для полной цепи", content: "$$I = \\frac{\\varepsilon}{R + r}$$\n\nгде $r$ — внутреннее сопротивление источника." },
    // Magnetism
    { rootIdx: 7, order: 1, title: "Магнитное поле", content: "Магнитное поле создаётся движущимися электрическими зарядами. Линии магнитной индукции замкнуты." },
    { rootIdx: 7, order: 2, title: "Сила Ампера и Лоренца", content: "Сила Ампера: $F = IBl\\sin\\alpha$\n\nСила Лоренца: $F = qvB\\sin\\alpha$" },
    { rootIdx: 7, order: 3, title: "Закон электромагнитной индукции", content: "$$\\varepsilon_i = -\\frac{\\Delta\\Phi}{\\Delta t}$$\n\nМагнитный поток: $\\Phi = BS\\cos\\alpha$" },
    { rootIdx: 7, order: 4, title: "Самоиндукция", content: "$$\\varepsilon_s = -L\\frac{\\Delta I}{\\Delta t}$$\n\nИндуктивность $L$ зависит от геометрии контура." },
    // Oscillations
    { rootIdx: 8, order: 1, title: "Гармонические колебания", content: "Уравнение гармонических колебаний:\n$$x = A\\cos(\\omega t + \\varphi_0)$$\n\nПериод математического маятника: $T = 2\\pi\\sqrt{\\frac{l}{g}}$" },
    { rootIdx: 8, order: 2, title: "Электромагнитные колебания", content: "$$T = 2\\pi\\sqrt{LC}$$" },
    { rootIdx: 8, order: 3, title: "Механические волны", content: "$$v = \\lambda\\nu = \\frac{\\lambda}{T}$$" },
    { rootIdx: 8, order: 4, title: "Интерференция и дифракция", content: "Условие максимума: $\\Delta d = m\\lambda$" },
    // Optics
    { rootIdx: 9, order: 1, title: "Отражение и преломление света", content: "**Закон отражения:** угол падения равен углу отражения\n\n**Закон преломления:** $n_1\\sin\\alpha_1 = n_2\\sin\\alpha_2$" },
    { rootIdx: 9, order: 2, title: "Линзы и изображения", content: "Формула тонкой линзы:\n$$\\frac{1}{F} = \\frac{1}{d} + \\frac{1}{f}$$" },
    { rootIdx: 9, order: 3, title: "Волновая природа света", content: "Свет — электромагнитная волна. Интерференция, дифракция, поляризация." },
    { rootIdx: 9, order: 4, title: "Квантовая природа света", content: "Энергия фотона: $E = h\\nu$\n\nУравнение Эйнштейна для фотоэффекта:\n$$h\\nu = A_{\\text{вых}} + E_k$$" },
    // Atomic
    { rootIdx: 10, order: 1, title: "Модели атома", content: "Томсон — «пудинг с изюмом». Резерфорд — планетарная модель. Бор — квантовые постулаты." },
    { rootIdx: 10, order: 2, title: "Постулаты Бора", content: "1. Атом существует в стационарных состояниях\n2. При переходе излучается фотон: $h\\nu = E_m - E_n$" },
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
}

seedTopicNodes().catch(console.error);

import { getDb } from "../api/queries/connection";
import { timelineEntries } from "./schema";

async function seedTimeline() {
  const db = getDb();

  const entries = [
    // Physicists
    {
      type: "physicist" as const,
      name: "Архимед",
      yearStart: -287,
      yearEnd: -212,
      description:
        "Древнегреческий математик, физик и инженер из Сиракуз. Заложил основы статики и гидростатики, сформулировал закон Архимеда, ввёл понятие центра тяжести, развил методы вычисления площадей и объёмов, предвосхитившие интегральное исчисление.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Domenico-Fetti_Archimedes_1620.jpg/440px-Domenico-Fetti_Archimedes_1620.jpg",
      color: "#f59e0b",
      sortOrder: 1,
    },
    {
      type: "physicist" as const,
      name: "Герон Александрийский",
      yearStart: 10,
      yearEnd: 75,
      description:
        "Александрийский инженер, механик и математик. Автор труда «Пневматика», в котором описал множество механических устройств, включая паровой шар — эолипил, первый паровой двигатель в истории. Заложил основы пневматики и прикладной механики.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Hero_of_Alexandria%2C_Belopoiika%2C_Paris%2C_Graec._2442.jpg/440px-Hero_of_Alexandria%2C_Belopoiika%2C_Paris%2C_Graec._2442.jpg",
      color: "#f97316",
      sortOrder: 2,
    },
    {
      type: "discovery" as const,
      name: "Эолипил — первый паровой двигатель",
      yearStart: 60,
      description:
        "Герон Александрийский описал «эолипил» — шар, вращающийся под действием пара, выходящего из сопел. Это первое в истории устройство, преобразовывающее тепловую энергию в механическое движение.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Greek_title_of_Hero_of_Alexandria%2C_16th_century.png/440px-Greek_title_of_Hero_of_Alexandria%2C_16th_century.png",
      color: "#f97316",
      sortOrder: 3,
    },
    {
      type: "physicist" as const,
      name: "Клавдий Птолемей",
      yearStart: 100,
      yearEnd: 170,
      description:
        "Александрийский астроном, математик и географ. Создал геоцентрическую систему мира, изложенную в «Альмагесте», которая доминировала в астрономии более тысячи лет. Развил тригонометрию и оптику, изучал преломление света.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Ptolemy_1476_with_armillary_sphere_model.jpg/440px-Ptolemy_1476_with_armillary_sphere_model.jpg",
      color: "#8b5cf6",
      sortOrder: 4,
    },
    {
      type: "discovery" as const,
      name: "Геоцентрическая система мира",
      yearStart: 150,
      description:
        "В «Альмагесте» Птолемей обосновал геоцентрическую модель Вселенной: Земля находится в центре, а Солнце, Луна и планеты движутся по сложным орбитам — эпициклам и деферентам.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Ptolemy_1476_with_armillary_sphere_model.jpg/440px-Ptolemy_1476_with_armillary_sphere_model.jpg",
      color: "#8b5cf6",
      sortOrder: 5,
    },
    {
      type: "physicist" as const,
      name: "Папп Александрийский",
      yearStart: 290,
      yearEnd: 350,
      description:
        "Александрийский математик и механик. В «Математическом собрании» систематизировал достижения древнегреческой геометрии и механики, ввёл понятия центра тяжести и теоремы, лёгшие в основу проективной геометрии.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Pappus_-_Mathematicae_collectiones%2C_1660.jpg/440px-Pappus_-_Mathematicae_collectiones%2C_1660.jpg",
      color: "#ec4899",
      sortOrder: 6,
    },
    {
      type: "physicist" as const,
      name: "Гипатия",
      yearStart: 360,
      yearEnd: 415,
      description:
        "Александрийский философ, математик и астроном. Одна из первых женщин-учёных в истории. Составляла комментарии к трудам по математике и астрономии, конструировала астрономические инструменты и преподавала в Александрийской школе.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Hypatia_portrait.png/440px-Hypatia_portrait.png",
      color: "#f472b6",
      sortOrder: 2,
    },
    {
      type: "physicist" as const,
      name: "Брахмагупта",
      yearStart: 598,
      yearEnd: 668,
      description:
        "Индийский математик и астроном. Сформулировал правила арифметических операций с нулём и отрицательными числами, развил тригонометрию и астрономию, изучал гравитацию и движение планет.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Bas-relief_of_Brahmagupta.jpg/440px-Bas-relief_of_Brahmagupta.jpg",
      color: "#f43f5e",
      sortOrder: 3,
    },
    {
      type: "physicist" as const,
      name: "Ариабхата",
      yearStart: 476,
      yearEnd: 550,
      description:
        "Индийский математик и астроном. Первым предположил, что Земля вращается вокруг своей оси, объяснил причины затмений и ввёл важные математические понятия, включая использование нуля и десятичной системы.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Aryabhata_476-550_CE.jpg/440px-Aryabhata_476-550_CE.jpg",
      color: "#3b82f6",
      sortOrder: 3,
    },
    {
      type: "physicist" as const,
      name: "Аль-Хорезми",
      yearStart: 780,
      yearEnd: 850,
      description:
        "Персидский математик, астроном и географ. Считается «отцом алгебры» благодаря систематизации решения уравнений. Его работы по арифметике способствовали распространению десятичной системы счисления.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Al-Khwarizmi_portrait.jpg/440px-Al-Khwarizmi_portrait.jpg",
      color: "#10b981",
      sortOrder: 4,
    },
    {
      type: "physicist" as const,
      name: "Аль-Фаргани",
      yearStart: 805,
      yearEnd: 880,
      description:
        "Арабский астроном и инженер. Составил «Книгу о движении небесных тел», которая вошла в средневековую Европу как основной астрономический учебник. Участвовал в строительстве Нилометра в Каире.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Statue_of_Al-Farghani_in_Fergana.jpg/440px-Statue_of_Al-Farghani_in_Fergana.jpg",
      color: "#06b6d4",
      sortOrder: 4,
    },
    {
      type: "physicist" as const,
      name: "Аль-Баттани",
      yearStart: 858,
      yearEnd: 929,
      description:
        "Арабский астроном и математик. Уточнил длительность солнечного года, измерил наклон эклиптики, составил точные астрономические таблицы. Его работы легли в основу европейской астрономии эпохи Возрождения.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Albategnius.jpeg/440px-Albategnius.jpeg",
      color: "#84cc16",
      sortOrder: 4,
    },
    {
      type: "physicist" as const,
      name: "Ибн аль-Хайсам",
      yearStart: 965,
      yearEnd: 1040,
      description:
        "Арабский физик, математик и астроном, известный как «отец оптики». Экспериментально исследовал преломление и отражение света, описал работу камеры-обскуры и впервые объяснил механизм зрения.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Al-Haytham.png/440px-Al-Haytham.png",
      color: "#eab308",
      sortOrder: 5,
    },
    {
      type: "physicist" as const,
      name: "Абу Райхан Бируни",
      yearStart: 973,
      yearEnd: 1048,
      description:
        "Персидский учёный-энциклопедист, физик, астроном и геодезист. Провёл первые научные измерения радиуса Земли, изучил плотность веществ, затмения и вращение Земли. Считается одним из крупнейших учёных средневековья.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Ab%C5%AB_Al-Ray%E1%B8%A5%C4%81n_Al-B%C4%ABr%C5%ABn%C4%AB%2C_Sayr_mulhimah_min_al-Sharq_wa_al-Gharb.png/440px-Ab%C5%AB_Al-Ray%E1%B8%A5%C4%81n_Al-B%C4%ABr%C5%ABn%C4%AB%2C_Sayr_mulhimah_min_al-Sharq_wa_al-Gharb.png",
      color: "#a855f7",
      sortOrder: 5,
    },
    {
      type: "physicist" as const,
      name: "Аль-Заркали",
      yearStart: 1028,
      yearEnd: 1087,
      description:
        "Андалузский астроном и инструментальщик. Создал точные астрономические таблицы, усовершенствовал астролябию и развил теорию движения планет. Его работы были широко известны в средневековой Европе.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Azarquiel_%28MUNCYT%2C_Eulogia_Merle%29.jpg/440px-Azarquiel_%28MUNCYT%2C_Eulogia_Merle%29.jpg",
      color: "#14b8a6",
      sortOrder: 5,
    },
    {
      type: "physicist" as const,
      name: "Омар Хайям",
      yearStart: 1048,
      yearEnd: 1131,
      description:
        "Персидский математик, астроном и поэт. Руководил реформой календаря, составил точные астрономические таблицы, внёс важный вклад в алгебру и теорию параллельных прямых.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Omar_Khayyam2.JPG/440px-Omar_Khayyam2.JPG",
      color: "#f97316",
      sortOrder: 5,
    },
    {
      type: "physicist" as const,
      name: "Моисей Маймонид",
      yearStart: 1135,
      yearEnd: 1204,
      description:
        "Испанский философ, врач и учёный. Автор медицинских трактатов, в которых систематизировал знания о болезнях и лечении. Его работы оказали большое влияние на развитие медицины и естественных наук.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Maim%C3%B2nides.jpg/440px-Maim%C3%B2nides.jpg",
      color: "#84cc16",
      sortOrder: 5,
    },
    {
      type: "physicist" as const,
      name: "Насир ад-Дин ат-Туси",
      yearStart: 1201,
      yearEnd: 1274,
      description:
        "Персидский астроном, математик и философ. Создал «Зидж-и Илхани» — точные астрономические таблицы, развил тригонометрию как самостоятельную науку, построил обсерваторию в Мараге.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Nasir_al-Din_Tusi.jpg/440px-Nasir_al-Din_Tusi.jpg",
      color: "#8b5cf6",
      sortOrder: 5,
    },
    {
      type: "physicist" as const,
      name: "Ибн аль-Шатир",
      yearStart: 1304,
      yearEnd: 1375,
      description:
        "Дамаскский астроном и часовщик. Создал точные модели движения Луны и планет, независимо открывший идеи, близкие к работам Коперника. Усовершенствовал астрономические инструменты.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Ibn-al-shatir2.gif/440px-Ibn-al-shatir2.gif",
      color: "#ec4899",
      sortOrder: 5,
    },
    {
      type: "physicist" as const,
      name: "Улугбек",
      yearStart: 1394,
      yearEnd: 1449,
      description:
        "Тимуридский правитель, астроном и математик. Основал обсерваторию в Самарканде, где были составлены «Зидж-и Джадид-и Гургани» — одни из самых точных астрономических таблиц того времени.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Ulugh_Beg_Observatory_Museum_02.jpg/440px-Ulugh_Beg_Observatory_Museum_02.jpg",
      color: "#06b6d4",
      sortOrder: 5,
    },
    {
      type: "discovery" as const,
      name: "Самаркандская обсерватория",
      yearStart: 1420,
      description:
        "Улугбек построил в Самарканде одну из крупнейших обсерваторий средневековья. С её помощью астрономы получили высокоточные измерения положений звёзд и планет.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Ulugh_Beg_Observatory_Museum_02.jpg/440px-Ulugh_Beg_Observatory_Museum_02.jpg",
      color: "#06b6d4",
      sortOrder: 5,
    },
    {
      type: "physicist" as const,
      name: "Николай Кузанский",
      yearStart: 1401,
      yearEnd: 1464,
      description:
        "Немецкий философ, математик и кардинал. Выдвинул идею о бесконечности Вселенной и относительности движения, предвосхитив гелиоцентрическую картину мира. Изучал математику бесконечного.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Nicholas_of_Cusa.jpg/440px-Nicholas_of_Cusa.jpg",
      color: "#d946ef",
      sortOrder: 5,
    },
    {
      type: "physicist" as const,
      name: "Региомонтан",
      yearStart: 1436,
      yearEnd: 1476,
      description:
        "Немецкий астроном и математик. Возродил европейскую тригонометрию, составил точные эфемериды и таблицы, подготовил издание «Альмагеста», заложив основы современной астрономии.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Johannes_Regiomontanus.jpg/440px-Johannes_Regiomontanus.jpg",
      color: "#f43f5e",
      sortOrder: 5,
    },
    {
      type: "physicist" as const,
      name: "Николай Коперник",
      yearStart: 1473,
      yearEnd: 1543,
      description:
        "Польский астроном, математик и каноник. Создал гелиоцентрическую систему мира, в которой Солнце, а не Земля, находится в центре. Его труд «О вращении небесных сфер» (1543) стал одним из важнейших этапов научной революции.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Nikolaus_Kopernikus.jpg/440px-Nikolaus_Kopernikus.jpg",
      color: "#a78bfa",
      sortOrder: 6,
    },
    {
      type: "physicist" as const,
      name: "Вильям Гильберт",
      yearStart: 1544,
      yearEnd: 1603,
      description:
        "Английский врач и физик, основоположник научного учения о магнетизме. В 1600 году опубликовал труд «О магните, магнитных телах и о большом магните — Земле», где показал, что Земля ведёт себя как гигантский магнит.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/William_Gilbert_45626.jpg/440px-William_Gilbert_45626.jpg",
      color: "#8b5cf6",
      sortOrder: 7,
    },
    {
      type: "physicist" as const,
      name: "Иоганн Кеплер",
      yearStart: 1571,
      yearEnd: 1630,
      description:
        "Немецкий математик, астроном и оптик. Открыл три закона движения планет, заложивших основу небесной механики. Его работы позволили Ньютону сформулировать закон всемирного тяготения.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Johannes_Kepler_1610.jpg/440px-Johannes_Kepler_1610.jpg",
      color: "#06b6d4",
      sortOrder: 8,
    },
    {
      type: "physicist" as const,
      name: "Галилео Галилей",
      yearStart: 1564,
      yearEnd: 1642,
      description:
        "Итальянский физик, астроном и математик, основоположник экспериментального метода в физике. Создал первый телескоп, открыл спутники Юпитера, фазы Венеры, горы на Луне и солнечные пятна. Сформулировал закон инерции и закон свободного падения.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Justus_Sustermans_-_Portrait_of_Galileo_Galilei%2C_1636.jpg/440px-Justus_Sustermans_-_Portrait_of_Galileo_Galilei%2C_1636.jpg",
      color: "#87CEEB",
      sortOrder: 9,
    },
    {
      type: "physicist" as const,
      name: "Блез Паскаль",
      yearStart: 1623,
      yearEnd: 1662,
      description:
        "Французский математик, физик и философ. Сформулировал закон равновесия жидкостей и газов, изучил атмосферное давление, создал первые образцы гидравлического пресса и счётной машины.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Blaise_Pascal_Versailles.jpg/440px-Blaise_Pascal_Versailles.jpg",
      color: "#14b8a6",
      sortOrder: 10,
    },
    {
      type: "physicist" as const,
      name: "Христиан Гюйгенс",
      yearStart: 1629,
      yearEnd: 1695,
      description:
        "Голландский физик, математик и астроном. Создал волновую теорию света, изобрёл маятниковые часы, открыл спутник Сатурна — Титан, исследовал центробежную силу и столкновения тел.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Christiaan_Huygens.jpg/440px-Christiaan_Huygens.jpg",
      color: "#0ea5e9",
      sortOrder: 11,
    },
    {
      type: "physicist" as const,
      name: "Роберт Бойль",
      yearStart: 1627,
      yearEnd: 1691,
      description:
        "Английский физик и химик, один из основателей современной химии. Сформулировал закон, связывающий давление и объём газа при постоянной температуре. Исследовал свойства воздуха, вакуума и эластичности.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Robert_Boyle_0001.jpg/440px-Robert_Boyle_0001.jpg",
      color: "#84cc16",
      sortOrder: 12,
    },
    {
      type: "physicist" as const,
      name: "Исаак Ньютон",
      yearStart: 1643,
      yearEnd: 1727,
      description:
        "Английский физик, математик и астроном. Сформулировал законы движения и универсального тяготения, развил исчисление, создал первый зеркальный телескоп. Его «Математические начала натуральной философии» (1687) стали фундаментом классической механики.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Portrait_of_Sir_Isaac_Newton%2C_1689.jpg/440px-Portrait_of_Sir_Isaac_Newton%2C_1689.jpg",
      color: "#87CEEB",
      sortOrder: 13,
    },
    {
      type: "physicist" as const,
      name: "Бенджамин Франклин",
      yearStart: 1706,
      yearEnd: 1790,
      description:
        "Американский политический деятель, изобретатель и учёный. Проводил опыты с электричеством, доказал грозовую природу молнии, ввёл понятия положительного и отрицательного заряда, изобрёл молниеотвод.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/BenFranklinDuplessis.jpg/440px-BenFranklinDuplessis.jpg",
      color: "#eab308",
      sortOrder: 14,
    },
    {
      type: "physicist" as const,
      name: "Леонард Эйлер",
      yearStart: 1707,
      yearEnd: 1783,
      description:
        "Швейцарский и российский математик, механик и физик. Внёс огромный вклад в механику, гидродинамику, оптику и астрономию. Его работы по аналитической механике легли в основу современной физики.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Leonhard_Euler_-_edit1.jpg/440px-Leonhard_Euler_-_edit1.jpg",
      color: "#f43f5e",
      sortOrder: 15,
    },
    {
      type: "physicist" as const,
      name: "Андре-Мари Ампер",
      yearStart: 1775,
      yearEnd: 1836,
      description:
        "Французский физик и математик, основоположник электродинамики. Сформулировал закон силы, действующей между проводниками с током, и ввёл понятие электрического тока как физической величины.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Andre-Marie_Ampere.jpg/440px-Andre-Marie_Ampere.jpg",
      color: "#d946ef",
      sortOrder: 16,
    },
    {
      type: "physicist" as const,
      name: "Михаил Ломоносов",
      yearStart: 1711,
      yearEnd: 1765,
      description:
        "Русский учёный-естествоиспытатель, химик и физик. Сформулировал закон сохранения массы вещества в химических реакциях, заложил основы физической химии, изучал атмосферное электричество и тепловые явления.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Mikhail_Lomonosov_1757.jpg/440px-Mikhail_Lomonosov_1757.jpg",
      color: "#01acff",
      sortOrder: 17,
    },
    {
      type: "physicist" as const,
      name: "Майкл Фарадей",
      yearStart: 1791,
      yearEnd: 1867,
      description:
        "Английский физик и химик, один из основоположников электродинамики. Открыл явление электромагнитной индукции, ввёл понятия магнитного поля и силовых линий, создал первые электродвигатели и генераторы.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Faraday-Millikan-Gale-1913.jpg/440px-Faraday-Millikan-Gale-1913.jpg",
      color: "#22c55e",
      sortOrder: 18,
    },
    {
      type: "physicist" as const,
      name: "Джеймс Клерк Максвелл",
      yearStart: 1831,
      yearEnd: 1879,
      description:
        "Шотландский физик, создатель классической электродинамики. Система уравнений Максвелла описывает электромагнитное поле и предсказала существование электромагнитных волн, распространяющихся со скоростью света.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/James_Clerk_Maxwell_seated.jpg/440px-James_Clerk_Maxwell_seated.jpg",
      color: "#22c55e",
      sortOrder: 19,
    },
    {
      type: "physicist" as const,
      name: "Мария Склодовская-Кюри",
      yearStart: 1867,
      yearEnd: 1934,
      description:
        "Польско-французский физик и химик, пионер исследований радиоактивности. Дважды лауреат Нобелевской премии: по физике (1903, совместно с Пьером Кюри и Анри Беккерелем) и по химии (1911). Открыла элементы полоний и радий.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Marie_Curie_c1920.jpg/440px-Marie_Curie_c1920.jpg",
      color: "#a855f7",
      sortOrder: 20,
    },
    {
      type: "physicist" as const,
      name: "Эрнест Резерфорд",
      yearStart: 1871,
      yearEnd: 1937,
      description:
        "Новозеландский и британский физик, основоположник ядерной физики. В 1911 году предложил планетарную модель атома с положительно заряженным ядром. Лауреат Нобелевской премии по химии (1908) за исследования распада элементов.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Ernest_Rutherford_1908.jpg/440px-Ernest_Rutherford_1908.jpg",
      color: "#f97316",
      sortOrder: 21,
    },
    {
      type: "physicist" as const,
      name: "Нильс Бор",
      yearStart: 1885,
      yearEnd: 1962,
      description:
        "Датский физик-теоретик, основоположник квантовой теории атома. В 1913 году предложил модель атома, в которой электроны движутся по стационарным орбитам и излучают энергию при переходах между ними. Лауреат Нобелевской премии по физике (1922).",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Niels_Bohr.jpg/440px-Niels_Bohr.jpg",
      color: "#ec4899",
      sortOrder: 22,
    },
    {
      type: "physicist" as const,
      name: "Альберт Эйнштейн",
      yearStart: 1879,
      yearEnd: 1955,
      description:
        "Немецкий физик-теоретик, автор специальной и общей теорий относительности. В 1905 году объяснил фотоэффект, ввёл понятие кванта света и получил Нобелевскую премию по физике (1921). Его знаменитая формула E = mc² связала массу и энергию.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Einstein_1921_by_F_Schmutzer_-_restoration.jpg/440px-Einstein_1921_by_F_Schmutzer_-_restoration.jpg",
      color: "#f97316",
      sortOrder: 23,
    },
    {
      type: "physicist" as const,
      name: "Ричард Фейнман",
      yearStart: 1918,
      yearEnd: 1988,
      description:
        "Американский физик-теоретик, один из основателей квантовой электродинамики. Лауреат Нобелевской премии (1965). Известен диаграммами Фейнмана, интегралом по траекториям и ясным стилем преподавания физики.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/PSM_V78_D483_Richard_Phillips_Feynman.jpg/440px-PSM_V78_D483_Richard_Phillips_Feynman.jpg",
      color: "#fdba74",
      sortOrder: 24,
    },
    // Discoveries
    {
      type: "discovery" as const,
      name: "Вращение Земли вокруг оси",
      yearStart: 500,
      description:
        "Ариабхата в своём труде «Ариабхатия» (около 500 года) предположил, что Земля вращается вокруг своей оси, объяснил смену дня и ночи и дал первые научные объяснения лунных и солнечных затмений.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Aryabhata_476-550_CE.jpg/440px-Aryabhata_476-550_CE.jpg",
      color: "#3b82f6",
      sortOrder: 25,
    },
    {
      type: "discovery" as const,
      name: "Основы алгебры",
      yearStart: 820,
      description:
        "Аль-Хорезми в труде «Краткая книга об исчислении алгебры и альмукабалы» систематизировал решение линейных и квадратных уравнений. От его имени произошло слово «алгоритм», а от названия книги — «алгебра».",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Al-Khwarizmi_portrait.jpg/440px-Al-Khwarizmi_portrait.jpg",
      color: "#10b981",
      sortOrder: 26,
    },
    {
      type: "discovery" as const,
      name: "Книга об оптике",
      yearStart: 1021,
      description:
        "Ибн аль-Хайсам написал семитомный труд «Книга об оптике», в котором экспериментально доказал, что свет распространяется прямолинейно, исследовал преломление и отражение, описал работу камеры-обскуры и объяснил механизм зрения.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Al-Haytham.png/440px-Al-Haytham.png",
      color: "#eab308",
      sortOrder: 27,
    },
    {
      type: "discovery" as const,
      name: "Гелиоцентрическая система мира",
      yearStart: 1543,
      description:
        "В 1543 году Николай Коперник опубликовал работу «О вращении небесных сфер», в которой поместил Солнце в центр мира. Это положило начало научной революции и радикально изменило представления о месте Земли во Вселенной.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Nikolaus_Kopernikus.jpg/440px-Nikolaus_Kopernikus.jpg",
      color: "#a78bfa",
      sortOrder: 28,
    },
    {
      type: "discovery" as const,
      name: "Магнетизм Земли",
      yearStart: 1600,
      description:
        "Вильям Гильберт в 1600 году показал, что Земля ведёт себя как гигантский магнит, а магнитное притяжение зависит от природы тела, а не от его движения. Его работа стала первым научным исследованием магнетизма.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/William_Gilbert_45626.jpg/440px-William_Gilbert_45626.jpg",
      color: "#8b5cf6",
      sortOrder: 29,
    },
    {
      type: "discovery" as const,
      name: "Законы Кеплера",
      yearStart: 1609,
      description:
        "Иоганн Кеплер открыл три закона движения планет: орбиты эллиптичны, радиус-вектор заметает равные площади за равные промежутки времени, период обращения связан с размером орбиты. Эти законы легли в основу небесной механики.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Johannes_Kepler_1610.jpg/440px-Johannes_Kepler_1610.jpg",
      color: "#06b6d4",
      sortOrder: 30,
    },
    {
      type: "discovery" as const,
      name: "Телескоп Галилея",
      yearStart: 1609,
      description:
        "В 1609 году Галилей собрал свой первый телескоп и направил его на небо. Он открыл горы на Луне, четыре крупнейших спутника Юпитера, фазы Венеры и многочисленные звёзды Млечного Пути — революционные доказательства в пользу гелиоцентрической системы мира.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Justus_Sustermans_-_Portrait_of_Galileo_Galilei%2C_1636.jpg/440px-Justus_Sustermans_-_Portrait_of_Galileo_Galilei%2C_1636.jpg",
      color: "#87CEEB",
      sortOrder: 31,
    },
    {
      type: "discovery" as const,
      name: "Закон Паскаля",
      yearStart: 1653,
      description:
        "Блез Паскаль сформулировал закон передачи давления в жидкости и газе: давление, приложенное к поверхности жидкости, передаётся одинаково во все стороны. Этот принцип лёг в основу гидравлических механизмов.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Blaise_Pascal_Versailles.jpg/440px-Blaise_Pascal_Versailles.jpg",
      color: "#14b8a6",
      sortOrder: 32,
    },
    {
      type: "discovery" as const,
      name: "Закон Бойля-Мариотта",
      yearStart: 1662,
      description:
        "Роберт Бойль установил, что при постоянной температуре произведение давления и объёма газа остаётся постоянным. Этот закон стал одним из первых количественных соотношений в физике газов.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Robert_Boyle_0001.jpg/440px-Robert_Boyle_0001.jpg",
      color: "#84cc16",
      sortOrder: 33,
    },
    {
      type: "discovery" as const,
      name: "Волновая теория света",
      yearStart: 1678,
      description:
        "Христиан Гюйгенс предложил волновую теорию света, согласно которой свет распространяется в виде волн в эфире. Его идеи объяснили законы отражения, преломления и двойного лучепреломления.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Christiaan_Huygens.jpg/440px-Christiaan_Huygens.jpg",
      color: "#0ea5e9",
      sortOrder: 34,
    },
    {
      type: "discovery" as const,
      name: "«Математические начала натуральной философии»",
      yearStart: 1687,
      description:
        "Книга Исаака Ньютона, в которой изложены три закона движения и закон всемирного тяготения. Этот труд объединил земную и небесную механику и стал основой физики на следующие два с половиной века.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Portrait_of_Sir_Isaac_Newton%2C_1689.jpg/440px-Portrait_of_Sir_Isaac_Newton%2C_1689.jpg",
      color: "#87CEEB",
      sortOrder: 35,
    },
    {
      type: "discovery" as const,
      name: "Молния как электричество",
      yearStart: 1752,
      description:
        "Бенджамин Франклин в 1752 году провёл знаменитый опыт с воздушным змеем и доказал, что молния — это разряд статического электричества. Это открытие привело к изобретению молниеотвода.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/BenFranklinDuplessis.jpg/440px-BenFranklinDuplessis.jpg",
      color: "#eab308",
      sortOrder: 36,
    },
    {
      type: "discovery" as const,
      name: "Закон сохранения массы вещества",
      yearStart: 1748,
      description:
        "В 1748 году Михаил Ломоносов сформулировал фундаментальный закон: масса веществ, участвующих в химической реакции, остаётся неизменной. Этот закон лёг в основу стехиометрии и химической термодинамики.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Mikhail_Lomonosov_1757.jpg/440px-Mikhail_Lomonosov_1757.jpg",
      color: "#01acff",
      sortOrder: 37,
    },
    {
      type: "discovery" as const,
      name: "Закон Ампера",
      yearStart: 1820,
      description:
        "В 1820 году Андре-Мари Ампер установил закон взаимодействия проводников с электрическим током и заложил основы электродинамики. Он также ввёл понятие электрического тока как направленного движения зарядов.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Andre-Marie_Ampere.jpg/440px-Andre-Marie_Ampere.jpg",
      color: "#d946ef",
      sortOrder: 38,
    },
    {
      type: "discovery" as const,
      name: "Электромагнитная индукция",
      yearStart: 1831,
      description:
        "В 1831 году Майкл Фарадей открыл явление электромагнитной индукции: изменение магнитного потока в проводящем контуре порождает электрический ток. Это открытие привело к созданию генераторов и трансформаторов.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Faraday-Millikan-Gale-1913.jpg/440px-Faraday-Millikan-Gale-1913.jpg",
      color: "#22c55e",
      sortOrder: 39,
    },
    {
      type: "discovery" as const,
      name: "Уравнения Максвелла",
      yearStart: 1865,
      description:
        "Джеймс Клерк Максвелл объединил электричество, магнетизм и оптику в единую теорию электромагнитного поля. Его уравнения предсказали электромагнитные волны и показали, что свет — это электромагнитная волна.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/James_Clerk_Maxwell_seated.jpg/440px-James_Clerk_Maxwell_seated.jpg",
      color: "#22c55e",
      sortOrder: 40,
    },
    {
      type: "discovery" as const,
      name: "Рентгеновские лучи",
      yearStart: 1895,
      description:
        "Вильгельм Рентген открыл X-лучи — проникающее излучение, способное проходить через мягкие ткани человека. Открытие произвело революцию в медицине и физике и принесло Рентгену первую Нобелевскую премию по физике (1901).",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Wilhelm_R%C3%B6ntgen_%281845-1923%29.jpg/440px-Wilhelm_R%C3%B6ntgen_%281845-1923%29.jpg",
      color: "#a855f7",
      sortOrder: 41,
    },
    {
      type: "discovery" as const,
      name: "Планетарная модель атома",
      yearStart: 1911,
      description:
        "В 1911 году Эрнест Резерфорд на основе опытов по рассеянию α-частиц предложил модель атома, в котором почти вся масса и положительный заряд сосредоточены в крошечном ядре, а электроны обращаются вокруг него.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Ernest_Rutherford_1908.jpg/440px-Ernest_Rutherford_1908.jpg",
      color: "#f97316",
      sortOrder: 42,
    },
    {
      type: "discovery" as const,
      name: "Квантовая модель атома Бора",
      yearStart: 1913,
      description:
        "В 1913 году Нильс Бор предложил модель атома, в которой электроны могут находиться только на определённых стационарных орбитах. При переходе между ними атом излучает или поглощает кванты света с энергией hν.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Niels_Bohr.jpg/440px-Niels_Bohr.jpg",
      color: "#ec4899",
      sortOrder: 43,
    },
    {
      type: "discovery" as const,
      name: "Специальная теория относительности",
      yearStart: 1905,
      description:
        "В 1905 году Альберт Эйнштейн опубликовал работу «К электродинамике движущихся тел», положившую начало СТО. Она пересмотрела понятия пространства и времени, ввела постулат постоянства скорости света и привела к знаменитой формуле E = mc².",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Einstein_1921_by_F_Schmutzer_-_restoration.jpg/440px-Einstein_1921_by_F_Schmutzer_-_restoration.jpg",
      color: "#f97316",
      sortOrder: 44,
    },
    {
      type: "discovery" as const,
      name: "Фотоэффект",
      yearStart: 1905,
      description:
        "Эйнштейн объяснил фотоэффект, предположив, что свет состоит из квантов (фотонов). Работа положила начало квантовой теории и была отмечена Нобелевской премией 1921 года. Уравнение hν = A + Ek связывает энергию фотона с работой выхода и кинетической энергией электрона.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Einstein_1921_by_F_Schmutzer_-_restoration.jpg/440px-Einstein_1921_by_F_Schmutzer_-_restoration.jpg",
      color: "#f97316",
      sortOrder: 45,
    },
    {
      type: "discovery" as const,
      name: "Квантовая механика",
      yearStart: 1925,
      description:
        "В 1920-е годы Шрёдингер, Гейзенберг, Борн, Дирак и другие создали квантовую механику — фундаментальную теорию поведения микрочастиц. Были введены волновая функция, принцип неопределённости и матричная механика.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Erwin_Schr%C3%B6dinger_%281933%29.jpg/440px-Erwin_Schr%C3%B6dinger_%281933%29.jpg",
      color: "#a855f7",
      sortOrder: 46,
    },
    {
      type: "discovery" as const,
      name: "Бозон Хиггса",
      yearStart: 2012,
      description:
        "4 июля 2012 года коллаборации ATLAS и CMS на Большом адронном коллайдере объявили об открытии новой элементарной частицы — бозона Хиггса. Его существование подтвердило механизм придания массы другим частицам и завершило Стандартную модель.",
      portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/ATLAS_Higgs-Produktion.svg/500px-ATLAS_Higgs-Produktion.svg.png",
      color: "#fbbf24",
      sortOrder: 47,
    },
  ];

  // Sort chronologically and assign sortOrder automatically
  entries.sort((a, b) => a.yearStart - b.yearStart);
  entries.forEach((entry, index) => {
    entry.sortOrder = index + 1;
  });

  // Clear existing timeline entries to avoid duplicates during re-runs
  await db.delete(timelineEntries);
  await db.insert(timelineEntries).values(entries);
  console.log(`Inserted ${entries.length} timeline entries`);
}

seedTimeline().catch(console.error);

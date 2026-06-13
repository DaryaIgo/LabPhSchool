import { trpc } from "@/providers/trpc";
import { Link, Navigate, useParams } from "react-router";
import { ArrowLeft, FlaskConical, Clock, BookOpen, Search, ChevronRight } from "lucide-react";

const difficultyLabel: Record<string, string> = {
  easy: "Лёгкая",
  medium: "Средняя",
  hard: "Сложная",
};

const difficultyColor: Record<string, string> = {
  easy: "bg-green-500/10 text-green-400",
  medium: "bg-yellow-500/10 text-yellow-400",
  hard: "bg-red-500/10 text-red-400",
};

const LEGACY_CATEGORY_SLUGS = new Set(["electricity", "magnetism"]);

export default function LabCategoryPage() {
  const { slug } = useParams<{ slug: string }>();

  if (slug && LEGACY_CATEGORY_SLUGS.has(slug)) {
    return <Navigate to="/labs/category/electrodynamics" replace />;
  }

  const { data: category } = trpc.virtualLab.categoryBySlug.useQuery(
    { slug: slug! },
    { enabled: !!slug }
  );
  const { data: labs } = trpc.virtualLab.listLabWorks.useQuery(
    { categoryId: category?.id, status: "published" },
    { enabled: !!category?.id }
  );

  if (!category && !labs) {
    return (
      <div className="pt-24 text-center text-[#798389]">
        <div className="animate-pulse h-8 w-48 bg-[#2a3237] rounded mx-auto mb-4" />
        <div className="animate-pulse h-4 w-32 bg-[#2a3237] rounded mx-auto" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="pt-24 text-center text-[#798389]">Раздел не найден</div>
    );
  }

  const subcategories = category.subcategories ?? [];

  // Group labs by subcategory
  const labsBySubcategory = new Map<number | null, typeof labs>();
  labsBySubcategory.set(null, []);
  subcategories.forEach((sub) => labsBySubcategory.set(sub.id, []));

  labs?.forEach((lab) => {
    const list = labsBySubcategory.get(lab.subcategoryId ?? null) ?? [];
    list.push(lab);
    labsBySubcategory.set(lab.subcategoryId ?? null, list);
  });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#262e33]">
      {/* Header */}
      <div className="bg-[#1a1f22] border-b border-[#37474f]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Link
              to="/labs"
              className="inline-flex items-center gap-1 text-[#798389] hover:text-[#2eff8c] text-sm transition-colors"
            >
              <ArrowLeft size={16} />
              Все лабораторные
            </Link>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${category.color ?? "#2eff8c"}20`,
                color: category.color ?? "#2eff8c",
              }}
            >
              <FlaskConical size={14} />
              {category.grade}
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            {category.title}
          </h1>
          <p className="text-[#c8cdd1] mt-2 max-w-2xl">
            {category.description}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        {/* Subcategories */}
        {subcategories.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <BookOpen size={22} className="text-[#2eff8c]" />
              Темы раздела
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subcategories.map((sub) => {
                const subLabs = labsBySubcategory.get(sub.id) ?? [];
                return (
                  <div
                    key={sub.id}
                    className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5 hover:border-[#2eff8c]/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">{sub.title}</h3>
                      <span className="text-xs text-[#798389]">
                        {subLabs.length} лаб.
                      </span>
                    </div>
                    <p className="text-sm text-[#c8cdd1] mb-3">{sub.description}</p>
                    {subLabs.length > 0 && (
                      <div className="space-y-2">
                        {subLabs.map((lab) => (
                          <Link
                            key={lab.id}
                            to={`/labs/work/${lab.slug}`}
                            className="flex items-center justify-between p-2 bg-[#1a1f22] rounded-lg hover:bg-[#1e2529] transition-colors"
                          >
                            <span className="text-sm text-[#c8cdd1]">{lab.title}</span>
                            <ChevronRight size={14} className="text-[#798389]" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* All Labs in Category */}
        {labs && labs.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <FlaskConical size={22} className="text-[#2eff8c]" />
              Все лабораторные работы
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {labs.map((lab) => (
                <Link
                  key={lab.id}
                  to={`/labs/work/${lab.slug}`}
                  className="group bg-[#2a3237] border border-[#434e54] rounded-2xl p-6 transition-all duration-300 hover:border-[#2eff8c]/50 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        difficultyColor[lab.difficulty || "medium"]
                      }`}
                    >
                      {difficultyLabel[lab.difficulty || "medium"]}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#798389]">
                      <Clock size={12} />
                      {lab.duration || 30} мин
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#2eff8c] transition-colors">
                    {lab.title}
                  </h3>
                  <p className="text-sm text-[#798389] mb-3">
                    Изучаемый закон: <span className="text-[#c8cdd1]">{lab.law}</span>
                  </p>
                  <p className="text-sm text-[#c8cdd1] line-clamp-2 mb-4">
                    {lab.skills}
                  </p>
                  {lab.subcategoryTitle && (
                    <p className="text-xs text-[#798389] mb-3">
                      {lab.subcategoryTitle}
                    </p>
                  )}

                  <div className="pt-4 border-t border-white/5">
                    <span className="inline-flex items-center gap-1 text-[#2eff8c] text-sm font-medium group-hover:gap-2 transition-all">
                      Начать работу
                      <ArrowLeft size={14} className="rotate-180" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Research Tasks */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <Search size={22} className="text-[#2eff8c]" />
            Исследовательские задания
          </h2>
          <div className="bg-[#2a3237] border border-[#434e54] rounded-2xl p-6 space-y-4">
            {getResearchTasks(slug!).map((task, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 bg-[#1a1f22] rounded-xl border border-[#37474f]/50"
              >
                <div className="w-8 h-8 rounded-full bg-[#2eff8c]/10 flex items-center justify-center text-[#2eff8c] text-sm font-bold shrink-0">
                  {i + 1}
                </div>
                <div>
                  {task.url ? (
                    <a
                      href={task.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-[#2eff8c] hover:underline mb-1 inline-block"
                    >
                      {task.title}
                    </a>
                  ) : (
                    <h4 className="font-medium text-white mb-1">{task.title}</h4>
                  )}
                  <p className="text-sm text-[#c8cdd1]">{task.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function getResearchTasks(slug: string): Array<{ title: string; description: string; url?: string }> {
  const map: Record<string, Array<{ title: string; description: string; url?: string }>> = {
    mechanics: [
      { title: "Массы и пружины", description: "Интерактивная симуляция для изучения колебаний пружинного маятника", url: "https://phet.colorado.edu/sims/html/masses-and-springs/latest/masses-and-springs_all.html" },
      { title: "Интерференция волн", description: "Интерактивная симуляция для изучения интерференции волн", url: "https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_ru.html" },
      { title: "Звуковые волны", description: "Интерактивная симуляция для изучения звуковых волн", url: "https://phet.colorado.edu/sims/html/sound-waves/latest/sound-waves_all.html" },
    ],
    "molecular-thermodynamics": [
      { title: "Состояния веществ: Основы", description: "Интерактивная симуляция для изучения агрегатных состояний вещества", url: "https://phet.colorado.edu/sims/html/states-of-matter-basics/latest/states-of-matter-basics_en.html" },
      { title: "Газы: Введение", description: "Интерактивная симуляция для изучения поведения газов на молекулярном уровне", url: "https://phet.colorado.edu/sims/html/gases-intro/latest/gases-intro_ru.html" },
    ],
    electrodynamics: [
      { title: "Заряды и поля", description: "Интерактивная симуляция для изучения электрических зарядов и напряжённости электрического поля", url: "https://phet.colorado.edu/sims/html/charges-and-fields/latest/charges-and-fields_ru.html" },
      { title: "Интерактивная карта потребления и генерации электроэнергии", description: "Изучите в реальном времени, как различные страны производят и потребляют электроэнергию", url: "https://app.electricitymaps.com/map/live/fifteen_minutes" },
      { title: "Электрическая цепь постоянного тока", description: "Виртуальная лаборатория для сборки и исследования электрических цепей постоянного тока", url: "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc-virtual-lab/latest/circuit-construction-kit-dc-virtual-lab_ru.html" },
      { title: "Магнит и компас", description: "Исследуйте магнитное поле постоянного магнита и его влияние на компас", url: "https://phet.colorado.edu/sims/html/magnet-and-compass/latest/magnet-and-compass_all.html" },
      { title: "Закон электромагнитной индукции Фарадея", description: "Изучите явление электромагнитной индукции при движении магнита в катушке", url: "https://phet.colorado.edu/sims/html/faradays-law/latest/faradays-law_all.html" },
      { title: "Электромагнитная лаборатория Фарадея", description: "Соберите электромагнит и исследуйте магнитное поле соленоида и катушки", url: "https://phet.colorado.edu/sims/html/faradays-electromagnetic-lab/latest/faradays-electromagnetic-lab_all.html" },
    ],
    optics: [
      { title: "Геометрическая оптика", description: "Интерактивная симуляция для изучения поведения света при прохождении через линзы", url: "https://phet.colorado.edu/sims/html/geometric-optics/latest/geometric-optics_ru.html" },
      { title: "Преломление света", description: "Интерактивная симуляция для изучения преломления света", url: "https://phet.colorado.edu/sims/html/geometric-optics/latest/geometric-optics_ru.html" },
      { title: "Интерференция волн", description: "Интерактивная симуляция для изучения интерференции волн", url: "https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_ru.html" },
    ],
    "nuclear-physics": [
      { title: "Определение периода полураспада", description: "По кривой распада радиоактивного изотопа определите период полураспада." },
      { title: "Исследование фотоэффекта", description: "Изучите зависимость фототока от частоты падающего света и материала катода." },
      { title: "Построй атом", description: "Интерактивная симуляция для изучения строения атома", url: "https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom_ru.html" },
      { title: "Модели атома водорода", description: "Интерактивная симуляция для изучения моделей атома водорода", url: "https://phet.colorado.edu/sims/html/models-of-the-hydrogen-atom/latest/models-of-the-hydrogen-atom_all.html" },
    ],
    "atomic-nuclear": [
      { title: "Определение периода полураспада", description: "По кривой распада радиоактивного изотопа определите период полураспада." },
      { title: "Исследование фотоэффекта", description: "Изучите зависимость фототока от частоты падающего света и материала катода." },
    ],
    "pressure-archimedes": [
      { title: "Под давлением (PhET)", description: "Исследуйте, как меняется давление в жидкости с глубиной, плотностью и формой сосуда", url: "https://phet.colorado.edu/sims/html/under-pressure/latest/under-pressure_all.html" },
      { title: "Плавание тел (PhET)", description: "Изучите условия плавания тел, силу Архимеда и выталкивающую силу", url: "https://phet.colorado.edu/sims/html/buoyancy/latest/buoyancy_all.html" },
      { title: "Плавание тел: основы (PhET)", description: "Простая симуляция для знакомства с плаванием тел и архимедовой силой", url: "https://phet.colorado.edu/sims/html/buoyancy-basics/latest/buoyancy-basics_all.html" },
    ],
  };
  return map[slug] || [
    { title: "Открытое исследование", description: "Проведите самостоятельный эксперимент по изучению физических закономерностей данного раздела." },
  ];
}

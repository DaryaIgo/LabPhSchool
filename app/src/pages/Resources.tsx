import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Video,
  BookOpen,
  FileText,
  Box,
  ExternalLink,
} from "lucide-react";

const typeConfig = {
  video: { label: "Видео", icon: Video, color: "#01acff" },
  reference: { label: "Справочник", icon: BookOpen, color: "#2eff8c" },
  workbook: { label: "Задачник", icon: FileText, color: "#ffcb3d" },
  model: { label: "Модель", icon: Box, color: "#ff6b6b" },
};

const allTags = [
  { name: "Механика", size: "lg" },
  { name: "Электричество", size: "lg" },
  { name: "Оптика", size: "lg" },
  { name: "Термодинамика", size: "md" },
  { name: "Кванты", size: "md" },
  { name: "Колебания", size: "md" },
  { name: "Ядерная физика", size: "sm" },
  { name: "Астрофизика", size: "sm" },
  { name: "Гидростатика", size: "sm" },
];

const staticResources = [
  {
    id: -13,
    title: "Механическое движение",
    description: "Плейлист с теорией и разбором задач на механическое движение",
    type: "video" as const,
    url: "https://www.youtube.com/playlist?list=PL1Us50cZo25k0P5jsqx5FYgVMCkxNxMKC",
    tags: "Видео,Механическое движение,Кинематика,Механика",
  },
  {
    id: -12,
    title: "Электромагнитные волны",
    description: "Плейлист с теорией и разбором задач на электромагнитные волны",
    type: "video" as const,
    url: "https://youtube.com/playlist?list=PL1Us50cZo25meF0AqFID_fR0qwgYUkXY6&si=zXXmFvacNUJpXBPX",
    tags: "Видео,Электромагнитные волны,Оптика,Электричество",
  },
  {
    id: -11,
    title: "Давление твёрдых тел, жидкостей и газов",
    description: "Плейлист с теорией и разбором задач на давление в твёрдых телах, жидкостях и газах",
    type: "video" as const,
    url: "https://youtube.com/playlist?list=PL1Us50cZo25m3ozxGRcOFqsGM30UK4NQ5&si=vKRZJPoiqVBia2aF",
    tags: "Видео,Давление,Гидростатика,Механика",
  },
  {
    id: -10,
    title: "Электрические дуги в замедленной съёмке",
    description: "Сверхзамедленная съёмка высоковольтных электрических разрядов",
    type: "video" as const,
    url: "https://www.youtube.com/watch?v=HDzVD-cqiWM",
    tags: "Видео,Электричество,Разряды,Замедленная съёмка",
  },
  {
    id: -9,
    title: "Измерения. Теория погрешностей",
    description: "Плейлист с теорией измерений и обработки погрешностей в школьной физике",
    type: "video" as const,
    url: "https://youtube.com/playlist?list=PL1Us50cZo25n0s1gsVxipdJkc6EQoptM5&si=FGMT6P_c2y_65lhB",
    tags: "Видео,Измерения,Погрешности,Теория",
  },
  {
    id: -8,
    title: "Удивительная физика капель воды",
    description: "Захватывающее видео о физике капель воды в замедленной съёмке",
    type: "video" as const,
    url: "https://youtu.be/yFvEl3TTD38?si=1pRtjunepib92Qan",
    tags: "Видео,Молекулярная физика,Поверхностное натяжение",
  },
  {
    id: -1,
    title: "Океаны и волны (живой 3D-глобус)",
    description: "Интерактивная визуализация глобальных погодных условий, океанских течений и волн в реальном времени",
    type: "model" as const,
    url: "https://earth.nullschool.net/",
    tags: "Гидростатика,Астрофизика,Модель,3D",
  },
  {
    id: -2,
    title: "Интерактивная карта потребления и генерации электроэнергии",
    description: "Изучите в реальном времени, как различные страны производят и потребляют электроэнергию",
    type: "model" as const,
    url: "https://app.electricitymaps.com/map/live/fifteen_minutes",
    tags: "Электричество,Энергетика,Модель",
  },
  {
    id: -3,
    title: "Виртуальное исследование планет (NASA Trek)",
    description: "Интерактивный портал NASA для исследования поверхностей планет и спутников Солнечной системы",
    type: "model" as const,
    url: "https://trek.nasa.gov/#",
    tags: "Астрофизика,Модель,3D,NASA",
  },
  {
    id: -4,
    title: "Решение задач с блоками",
    description: "Методика решения физических задач с использованием блок-схем и алгоритмов",
    type: "reference" as const,
    url: "https://dzen.ru/a/Y3JLbjrHUzKhBVRi",
    tags: "Справочник,Задачи,Блоки",
  },
  {
    id: -5,
    title: "Инженеры будущего",
    description: "Образовательный портал по физике и инженерии для школьников",
    type: "reference" as const,
    url: "https://physics-engineers.ru/",
    tags: "Справочник,Инженерия,Образование",
  },
  {
    id: -6,
    title: "Stellarium (виртуальный планетарий)",
    description: "Онлайн-планетарий для наблюдения за звёздным небом в реальном времени",
    type: "model" as const,
    url: "https://stellarium-web.org/",
    tags: "Астрофизика,Модель,3D,Планетарий",
  },
  {
    id: -7,
    title: "Интерактивная таблица Менделеева (Ptable)",
    description: "Интерактивная периодическая таблица химических элементов с подробными свойствами",
    type: "model" as const,
    url: "https://ptable.com/?lang=ru#%D0%A1%D0%B2%D0%BE%D0%B9%D1%81%D1%82%D0%B2%D0%B0",
    tags: "Химия,Модель,Таблица,Атом",
  },
  {
    id: -16,
    title: "1001 задача по физике с решениями",
    description: "Сборник задач по физике с подробными решениями. Авторы: И.М. Гельфгат, Л.Э. Генденштейн, Л.А. Кирик",
    type: "workbook" as const,
    url: "https://lib.brsu.by/sites/default/files/books/%D0%93%D0%B5%D0%BB%D1%8C%D1%84%D0%B3%D0%B0%D1%82%20%D0%98.%D0%9C.%2C%20%D0%9B.%D0%AD.%D0%93%D0%B5%D0%BD%D0%B4%D0%B5%D0%BD%D1%88%D1%82%D0%B5%D0%B9%D0%BD%2C%20%D0%9B.%D0%90.%D0%9A%D0%B8%D1%80%D0%B8%D0%BA%20-%201001%20%D0%B7%D0%B0%D0%B4%D0%B0%D1%87%D0%B0%20%D0%BF%D0%BE%20%D1%84%D0%B8%D0%B7%D0%B8%D0%BA%D0%B5%20%D1%81%20%D1%80%D0%B5%D1%88%D0%B5%D0%BD%D0%B8%D1%8F%D0%BC%D0%B8_.pdf",
    tags: "Задачник,1001 задача,PDF,Решения",
  },
  {
    id: -15,
    title: "Решу ЕГЭ по физике",
    description: "Банк заданий ЕГЭ по физике с разбором решений и тренировочными вариантами",
    type: "workbook" as const,
    url: "https://phys-ege.sdamgia.ru/",
    tags: "ЕГЭ,Задачник,Экзамен,Тренировка",
  },
  {
    id: -14,
    title: "Тренажёр по решению задач (7–9 класс)",
    description: "Интерактивный тренажёр по решению физических задач для учащихся 7–9 классов",
    type: "workbook" as const,
    url: "https://physics-engineers.ru/page/tasks",
    tags: "Задачник,Задачи,7–9 класс,Тренажёр",
  },
];

export default function Resources() {
  const { data: resources, isLoading } = trpc.course.resources.useQuery();
  const [filter, setFilter] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  const allResources = [
    ...(resources?.filter(
      (r) =>
        !(r.type === "reference" && r.url === "#") &&
        !(r.type === "video" && r.url === "#") &&
        !(r.type === "workbook" && r.url === "#")
    ) || []),
    ...staticResources,
  ];
  const filtered = allResources.filter((r) => {
    if (filter && r.type !== filter) return false;
    if (tagFilter && r.tags) {
      const tags = r.tags.split(",").map((t) => t.trim());
      if (!tags.some((t) => t.toLowerCase().includes(tagFilter.toLowerCase())))
        return false;
    }
    return true;
  });

  const filters = [
    { key: null, label: "Все" },
    { key: "video", label: "Видео" },
    { key: "reference", label: "Справочники" },
    { key: "workbook", label: "Задачники" },
    { key: "model", label: "Модели" },
  ];

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative bg-[#262e33] py-24 lg:py-32 overflow-hidden">
        {/* Diffraction pattern background */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs>
              <linearGradient id="lightGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2eff8c" stopOpacity="0" />
                <stop offset="100%" stopColor="#2eff8c" stopOpacity="1" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3, 4].map((i) => (
              <ellipse
                key={i}
                cx="60%"
                cy="50%"
                rx={80 + i * 40}
                ry={30 + i * 15}
                fill="none"
                stroke="url(#lightGrad)"
                strokeWidth="1"
                opacity={0.3 - i * 0.05}
              />
            ))}
          </svg>
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <p className="formula-text text-sm mb-4">усталость - это иллюзия</p>
          <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tight mb-6">
            Дополнительные ресурсы
          </h1>
          <p className="text-[#c8cdd1] max-w-2xl mx-auto">
            Видеолекции, справочники, задачники и интерактивные модели для
            углублённого изучения физики
          </p>
        </div>
      </section>

      {/* Resources */}
      <section className="section-dark py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-6">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
            {/* Type Filters */}
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f.label}
                  onClick={() => setFilter(f.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filter === f.key
                      ? "bg-[#2eff8c] text-black"
                      : "bg-[#2a3237] border border-[#434e54] text-[#c8cdd1] hover:border-[#2eff8c]/50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Tag Cloud */}
            <div className="flex flex-col items-start lg:items-end gap-2 max-w-md">
              <span className="text-xs text-[#798389] uppercase tracking-wider">
                Темы
              </span>
              <div className="flex flex-wrap gap-1.5 justify-start lg:justify-end">
                {allTags.map((tag) => {
                  const isActive = tagFilter === tag.name;
                  return (
                    <button
                      key={tag.name}
                      onClick={() =>
                        setTagFilter(isActive ? null : tag.name)
                      }
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        isActive
                          ? "bg-[#2eff8c] text-black border-[#2eff8c] font-medium"
                          : "bg-[#2a3237] text-[#c8cdd1] border-[#434e54] hover:border-[#2eff8c]/50 hover:text-[#2eff8c]"
                      }`}
                    >
                      {tag.name}
                    </button>
                  );
                })}
                {tagFilter && (
                  <button
                    onClick={() => setTagFilter(null)}
                    className="text-xs text-[#798389] hover:text-[#2eff8c] px-2 py-1 transition-colors"
                  >
                    Сбросить
                  </button>
                )}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-48 bg-[#2a3237] rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered?.map((resource) => {
                const config =
                  typeConfig[resource.type as keyof typeof typeConfig];
                const Icon = config?.icon || BookOpen;
                return (
                  <div
                    key={resource.id}
                    className="bg-[#2a3237] border border-[#434e54] rounded-xl p-6 transition-all hover:border-[#2eff8c]/30 hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{
                          backgroundColor: `${config?.color}15`,
                        }}
                      >
                        <Icon
                          size={24}
                          style={{ color: config?.color }}
                        />
                      </div>
                      <span
                        className="text-xs font-medium px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: `${config?.color}15`,
                          color: config?.color,
                        }}
                      >
                        {config?.label}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold mb-2">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-[#798389] mb-4">
                      {resource.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {resource.tags?.split(",").map((tag, i) => (
                          <span
                            key={i}
                            className="text-[10px] text-[#798389] bg-[#262e33] px-2 py-1 rounded-full"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                      {resource.url && resource.url !== "#" ? (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#2eff8c] hover:scale-110 transition-transform inline-block"
                        >
                          <ExternalLink size={16} />
                        </a>
                      ) : (
                        <span className="text-[#434e54]">
                          <ExternalLink size={16} />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>


    </div>
  );
}

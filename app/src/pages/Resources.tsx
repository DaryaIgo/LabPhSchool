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
];

export default function Resources() {
  const { data: resources, isLoading } = trpc.course.resources.useQuery();
  const [filter, setFilter] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  const allResources = [
    ...(resources?.filter((r) => !(r.type === "reference" && r.url === "#")) || []),
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
          <p className="formula-text text-sm mb-4">E = hν | материалы</p>
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
          {/* Type Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
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

      {/* Universal Algorithm */}
      <section className="section-dark py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">
              Универсальный алгоритм
            </h2>
            <p className="text-[#c8cdd1]">
              Шесть шагов для решения любой физической задачи
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { num: "1", title: "Прочитать", desc: "Внимательно прочитать условие, выделить вопрос" },
              { num: "2", title: "Записать данные", desc: "Выписать известные величины, перевести в СИ" },
              { num: "3", title: "Определить тип", desc: "Классифицировать задачу по теме и типу" },
              { num: "4", title: "Найти формулу", desc: "Выбрать закон или формулу из справочника" },
              { num: "5", title: "Решить", desc: "Подставить данные, вычислить ответ" },
              { num: "6", title: "Проверить", desc: "Проверить размерность и адекватность" },
            ].map((step) => (
              <div
                key={step.num}
                className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5"
              >
                <span className="font-mono-phys text-3xl font-bold text-[#2eff8c]">
                  {step.num}
                </span>
                <h3 className="font-semibold mt-2">{step.title}</h3>
                <p className="text-sm text-[#798389] mt-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tag Cloud */}
      <section className="section-light py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-8">
            Темы ресурсов
          </h2>

          <div className="flex flex-wrap justify-center gap-3">
            {allTags.map((tag) => {
              const sizeMap = {
                sm: "text-sm px-3 py-1.5",
                md: "text-base px-4 py-2",
                lg: "text-lg px-5 py-2.5",
              };
              const isActive = tagFilter === tag.name;
              return (
                <button
                  key={tag.name}
                  onClick={() =>
                    setTagFilter(isActive ? null : tag.name)
                  }
                  className={`${sizeMap[tag.size as keyof typeof sizeMap]} rounded-full transition-all ${
                    isActive
                      ? "bg-[#2eff8c] text-black font-medium"
                      : "bg-white text-[#434e54] border border-gray-200 hover:border-[#2eff8c] hover:text-[#2eff8c]"
                  }`}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>

          {tagFilter && (
            <button
              onClick={() => setTagFilter(null)}
              className="mt-6 text-sm text-[#798389] hover:text-[#1a1a1a] transition-colors"
            >
              Сбросить фильтр
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

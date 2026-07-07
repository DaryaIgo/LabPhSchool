import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Video, BookOpen, FileText, Box, ExternalLink } from "lucide-react";

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

export default function Resources() {
  const { data: resources, isLoading } = trpc.course.resources.useQuery();
  const [filter, setFilter] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  const allResources = resources ?? [];
  const filtered = allResources.filter(r => {
    if (filter && r.type !== filter) return false;
    if (tagFilter && r.tags) {
      const tags = r.tags.split(",").map(t => t.trim());
      if (!tags.some(t => t.toLowerCase().includes(tagFilter.toLowerCase())))
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
      <section className="section-dark pt-8 pb-16 lg:pt-12 lg:pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3 flex items-center gap-3">
              Дополнительные ресурсы
            </h2>
            <p className="text-[#c8cdd1] max-w-2xl">
              Отфильтруйте материалы по типу или теме
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
            {/* Type Filters */}
            <div className="flex flex-wrap gap-2">
              {filters.map(f => (
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
                {allTags.map(tag => {
                  const isActive = tagFilter === tag.name;
                  return (
                    <button
                      key={tag.name}
                      onClick={() => setTagFilter(isActive ? null : tag.name)}
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
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="h-48 bg-[#2a3237] rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered?.map(resource => {
                const config =
                  typeConfig[resource.type as keyof typeof typeConfig];
                const Icon = config?.icon || BookOpen;
                return (
                  <div
                    key={resource.id}
                    className="group bg-[#2a3237] border border-[#434e54] rounded-2xl p-6 transition-all duration-300 hover:border-[#2eff8c]/50 hover:-translate-y-1 hover:shadow-xl flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{
                          backgroundColor: `${config?.color}15`,
                        }}
                      >
                        <Icon size={24} style={{ color: config?.color }} />
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

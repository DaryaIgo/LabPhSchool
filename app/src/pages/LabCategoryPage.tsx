import { trpc } from "@/providers/trpc";
import { Link, Navigate, useParams } from "react-router";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ArrowLeft } from "lucide-react";

const LEGACY_CATEGORY_SLUGS = new Set(["electricity", "magnetism"]);

const LAB_THEMES = [
  { bg: "bg-[#0ea5e9]/10", border: "border-[#0ea5e9]/30", text: "text-[#7dd3fc]" },
  { bg: "bg-[#22c55e]/10", border: "border-[#22c55e]/30", text: "text-[#86efac]" },
  { bg: "bg-[#f59e0b]/10", border: "border-[#f59e0b]/30", text: "text-[#fcd34d]" },
  { bg: "bg-[#f43f5e]/10", border: "border-[#f43f5e]/30", text: "text-[#fda4af]" },
  { bg: "bg-[#8b5cf6]/10", border: "border-[#8b5cf6]/30", text: "text-[#c4b5fd]" },
  { bg: "bg-[#ec4899]/10", border: "border-[#ec4899]/30", text: "text-[#f9a8d4]" },
];

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
  subcategories.forEach(sub => labsBySubcategory.set(sub.id, []));

  labs?.forEach(lab => {
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
              <CategoryIcon iconKey={category.iconType} size={14} />
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
            <div className="space-y-16">
              {subcategories.map((sub, index) => {
                const subLabs = labsBySubcategory.get(sub.id) ?? [];
                return (
                  <div
                    key={sub.id}
                    className="flex flex-col md:flex-row gap-6 md:gap-10"
                  >
                    {/* Topic label */}
                    <div className="md:w-72 shrink-0 md:pr-10">
                      <div className="md:text-right">
                        <span className="text-sm font-medium tracking-wider text-[#798389] uppercase">
                          Тема {index + 1}
                        </span>
                        <h3 className="text-xl font-bold text-white mt-2">
                          {sub.title}
                        </h3>
                        {sub.description && (
                          <p className="text-base text-[#c8cdd1] mt-2 leading-relaxed">
                            {sub.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Labs */}
                    <div className="flex-1 min-w-0">
                      {subLabs.length > 0 ? (
                        <div className="flex flex-wrap gap-5">
                          {subLabs.map((lab, labIndex) => {
                            const theme =
                              LAB_THEMES[labIndex % LAB_THEMES.length];
                            return (
                              <span
                                key={lab.id}
                                className="inline-block animate-float"
                                style={{
                                  animationDelay: `${(labIndex * 0.35) % 3}s`,
                                }}
                              >
                                <Link
                                  to={`/labs/work/${lab.slug}`}
                                  className={`
                                    group inline-flex items-center
                                    px-5 py-3 rounded-xl border text-base font-medium
                                    transition-all duration-300 ease-out
                                    hover:-translate-y-1 hover:shadow-lg
                                    ${theme.bg} ${theme.border} ${theme.text}
                                  `}
                                >
                                  {lab.title}
                                </Link>
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-base text-[#798389] italic">
                          Лабораторные работы появятся позже
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

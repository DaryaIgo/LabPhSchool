import { trpc } from "@/providers/trpc";
import { Link, Navigate, useParams } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { CategoryIcon } from "@/components/CategoryIcon";
import {
  ArrowLeft,
  FlaskConical,
  BookOpen,
  ChevronRight,
} from "lucide-react";

const LEGACY_CATEGORY_SLUGS = new Set(["electricity", "magnetism"]);

export default function LabCategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

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
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <BookOpen size={22} className="text-[#2eff8c]" />
              Темы раздела
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subcategories.map(sub => {
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
                    <p className="text-sm text-[#c8cdd1] mb-3">
                      {sub.description}
                    </p>
                    {subLabs.length > 0 && (
                      <div className="space-y-2">
                        {subLabs.map(lab => (
                          <Link
                            key={lab.id}
                            to={`/labs/work/${lab.slug}`}
                            className="flex items-center justify-between p-2 bg-[#1a1f22] rounded-lg hover:bg-[#1e2529] transition-colors"
                          >
                            <span className="text-sm text-[#c8cdd1]">
                              {lab.title}
                            </span>
                            <ChevronRight
                              size={14}
                              className="text-[#798389]"
                            />
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
              Лабораторные работы раздела
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {labs.map(lab => (
                <Link
                  key={lab.id}
                  to={`/labs/work/${lab.slug}`}
                  className="group bg-[#2a3237] border border-[#434e54] rounded-2xl p-6 transition-all duration-300 hover:border-[#2eff8c]/50 hover:-translate-y-1 hover:shadow-xl flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4">
                    {isAdmin && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          lab.status === "published"
                            ? "bg-green-500/10 text-green-400"
                            : "bg-yellow-500/10 text-yellow-400"
                        }`}
                      >
                        {lab.status === "published"
                          ? "Опубликовано"
                          : "Черновик"}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#2eff8c] transition-colors">
                    {lab.title}
                  </h3>
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

      </div>
    </div>
  );
}

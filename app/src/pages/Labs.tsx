import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { FlaskConical, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { CategoryIcon } from "@/components/CategoryIcon";

export default function Labs() {
  const { user } = useAuth();
  const isStudent = user?.type === "student" && user?.role === "student";

  const { data: categories, isLoading } =
    trpc.virtualLab.listCategories.useQuery();
  const { data: myProgress } = trpc.virtualLab.getMyLabProgress.useQuery(
    undefined,
    {
      retry: false,
      enabled: isStudent,
    }
  );

  function getCategoryProgress(categoryId: number, labCount: number) {
    if (!myProgress || !Array.isArray(myProgress) || labCount === 0) return 0;
    let score = 0;
    myProgress.forEach(p => {
      if (p.categoryId !== categoryId) return;
      if (p.status === "completed" || p.status === "submitted") {
        score += 100;
      } else if (p.status === "in_progress") {
        score += 50;
      }
    });
    return Math.round(score / labCount);
  }

  return (
    <div className="pt-16">
      <section className="section-dark pt-8 pb-16 lg:pt-12 lg:pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3 flex items-center gap-3">
              <span className="w-2 h-8 bg-[#2eff8c] rounded-full" />
              Разделы физики
            </h2>
            <p className="text-[#c8cdd1] max-w-2xl">
              Выберите раздел, чтобы перейти к виртуальным лабораторным работам
            </p>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div
                  key={i}
                  className="h-72 bg-[#2a3237] rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories?.map(cat => {
                const progress = getCategoryProgress(cat.id, cat.labCount || 0);

                return (
                  <Link
                    key={cat.id}
                    to={`/labs/category/${cat.slug}`}
                    className="group bg-[#2a3237] border border-[#434e54] rounded-2xl p-6 transition-all duration-300 hover:border-[#2eff8c]/50 hover:-translate-y-1 hover:shadow-xl flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        <CategoryIcon iconKey={cat.iconType} size={40} />
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#2eff8c]/10 text-[#2eff8c] text-xs font-medium">
                        <FlaskConical size={12} />
                        {cat.labCount} лаб.
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#2eff8c] transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-[#798389] mb-3">{cat.grade}</p>
                    <p className="text-sm text-[#c8cdd1] mb-4 line-clamp-2 flex-1">
                      {cat.shortDesc || cat.description}
                    </p>

                    {isStudent && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#798389]">Прогресс</span>
                          <span className="text-white font-medium">
                            {progress}%
                          </span>
                        </div>
                        <Progress
                          value={progress}
                          className="h-1.5 bg-[#1a1f22]"
                        />
                      </div>
                    )}

                    <div className="pt-4 mt-4 border-t border-white/5">
                      <span className="inline-flex items-center gap-1 text-[#2eff8c] text-sm font-medium group-hover:gap-2 transition-all">
                        Перейти к разделу
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

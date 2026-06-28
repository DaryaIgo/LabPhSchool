import { useMemo, useCallback } from "react";
import { trpc } from "@/providers/trpc";
import SnakeTimeline from "@/components/SnakeTimeline";
import { useAuth } from "@/hooks/useAuth";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Progress } from "@/components/ui/progress";
import { FlaskConical, Loader2 } from "lucide-react";

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

  const getCategoryProgress = useCallback(
    (categoryId: number, labCount: number) => {
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
    },
    [myProgress]
  );

  const items = useMemo(() => {
    if (!categories) return [];
    return categories.map(cat => {
      const progress = getCategoryProgress(cat.id, cat.labCount || 0);
      return {
        id: cat.id,
        title: cat.title,
        subtitle: cat.grade ?? undefined,
        description: cat.shortDesc || cat.description || "",
        color: cat.color || "#2eff8c",
        order: cat.order,
        icon: <CategoryIcon iconKey={cat.iconType} size={24} />,
        href: `/labs/category/${cat.slug}`,
        meta: isStudent ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#798389]">Прогресс</span>
              <span className="text-white font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-[#1a1f22]" />
          </div>
        ) : undefined,
        details: (
          <div className="flex items-center gap-2 text-xs">
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full font-medium"
              style={{
                backgroundColor: `${cat.color || "#2eff8c"}15`,
                color: cat.color || "#2eff8c",
              }}
            >
              <FlaskConical size={12} />
              {cat.labCount} лаб.
            </span>
          </div>
        ),
      };
    });
  }, [categories, isStudent, getCategoryProgress]);

  return (
    <div className="pt-16 min-h-screen bg-[#262e33]">
      <section className="section-dark pt-8 pb-16 lg:pt-12 lg:pb-20 rocket-cursor">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12 lg:mb-16 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              Лабораторные{" "}
              <span className="relative inline-block">
                <span
                  className="relative z-10"
                  style={{
                    background:
                      "linear-gradient(90deg, #71c7ff, #58a7ff, #2f7cff)",
                    backgroundSize: "200% auto",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  симуляции
                </span>
                <span
                  className="absolute -inset-1 rounded-lg blur-xl opacity-30"
                  style={{ backgroundColor: "#58a7ff" }}
                />
              </span>
            </h2>
            <p className="text-[#a0a8ad] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Исследуйте виртуальные лабораторные работы по разделам физики.
              <br />
              Каждая точка — путь к интерактивным работам и симуляциям.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-[#2eff8c]" size={32} />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center text-[#a0a8ad] py-12">
              Пока нет разделов. Добавьте их в панели администратора.
            </div>
          ) : (
            <SnakeTimeline items={items} columns={4} baseSize="lg" />
          )}
        </div>
      </section>
    </div>
  );
}

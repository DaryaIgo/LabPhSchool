import { trpc } from "@/providers/trpc";
import { Link, Navigate, useParams, useLocation } from "react-router";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const LEGACY_CATEGORY_SLUGS = new Set(["electricity", "magnetism"]);

const LAB_THEMES = [
  {
    bg: "bg-[#0ea5e9]/10",
    border: "border-[#0ea5e9]/30",
    text: "text-[#7dd3fc]",
    dot: "#7dd3fc",
    shadow: "hover:shadow-[0_0_24px_rgba(14,165,233,0.25)]",
  },
  {
    bg: "bg-[#22c55e]/10",
    border: "border-[#22c55e]/30",
    text: "text-[#86efac]",
    dot: "#86efac",
    shadow: "hover:shadow-[0_0_24px_rgba(34,197,94,0.25)]",
  },
  {
    bg: "bg-[#f59e0b]/10",
    border: "border-[#f59e0b]/30",
    text: "text-[#fcd34d]",
    dot: "#fcd34d",
    shadow: "hover:shadow-[0_0_24px_rgba(245,158,11,0.25)]",
  },
  {
    bg: "bg-[#f43f5e]/10",
    border: "border-[#f43f5e]/30",
    text: "text-[#fda4af]",
    dot: "#fda4af",
    shadow: "hover:shadow-[0_0_24px_rgba(244,63,94,0.25)]",
  },
  {
    bg: "bg-[#8b5cf6]/10",
    border: "border-[#8b5cf6]/30",
    text: "text-[#c4b5fd]",
    dot: "#c4b5fd",
    shadow: "hover:shadow-[0_0_24px_rgba(139,92,246,0.25)]",
  },
  {
    bg: "bg-[#ec4899]/10",
    border: "border-[#ec4899]/30",
    text: "text-[#f9a8d4]",
    dot: "#f9a8d4",
    shadow: "hover:shadow-[0_0_24px_rgba(236,72,153,0.25)]",
  },
];

export default function LabCategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const fromLabs = location.state?.fromLabs === true;

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
      <div className="min-h-screen pt-24 text-center text-[#798389] bg-[#262e33]">
        <div className="animate-pulse h-8 w-48 bg-[#2a3237] rounded mx-auto mb-4" />
        <div className="animate-pulse h-4 w-32 bg-[#2a3237] rounded mx-auto" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen pt-24 text-center text-[#798389] bg-[#262e33]">
        Раздел не найден
      </div>
    );
  }

  const subcategories = category.subcategories ?? [];
  const accent = category.color ?? "#2eff8c";

  // Group labs by subcategory
  const labsBySubcategory = new Map<number | null, typeof labs>();
  labsBySubcategory.set(null, []);
  subcategories.forEach(sub => labsBySubcategory.set(sub.id, []));

  labs?.forEach(lab => {
    const list = labsBySubcategory.get(lab.subcategoryId ?? null) ?? [];
    list.push(lab);
    labsBySubcategory.set(lab.subcategoryId ?? null, list);
  });

  const nodeVariants = {
    hidden: { opacity: 0, y: fromLabs ? -120 : -40, scale: 0.75 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 120,
        damping: 14,
        delay: 0.05,
      },
    },
  } satisfies import("framer-motion").Variants;

  const textVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay },
    }),
  };

  const topicVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.5 + index * 0.15,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    }),
  } satisfies import("framer-motion").Variants;

  const labCardVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.45,
        delay,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    }),
  } satisfies import("framer-motion").Variants;

  return (
    <div className="min-h-screen bg-[#262e33] overflow-x-hidden">
      {/* Top hero area */}
      <section className="relative pt-28 pb-10 md:pt-32 md:pb-14">
        {/* Soft radial glow behind the node */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none opacity-40"
          style={{
            background: `radial-gradient(ellipse at center top, ${accent}22 0%, transparent 60%)`,
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              to="/labs"
              className="inline-flex items-center gap-1.5 text-sm text-[#a0a8ad] hover:text-[#2eff8c] transition-colors"
            >
              <ArrowLeft size={16} />
              Все лабораторные
            </Link>
          </motion.div>

          <div className="mt-8 flex flex-col items-center text-center">
            {/* Floating category node */}
            <motion.div
              variants={nodeVariants}
              initial="hidden"
              animate="visible"
              className="relative animate-snake-float"
            >
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-40"
                style={{ backgroundColor: accent }}
              />
              <div
                className="relative flex items-center justify-center w-28 h-28 md:w-36 md:h-36 rounded-full border-2"
                style={{
                  borderColor: `${accent}55`,
                  backgroundColor: `${accent}14`,
                  boxShadow: `0 0 60px ${accent}20, inset 0 0 40px ${accent}10`,
                }}
              >
                <div
                  className="absolute inset-0 rounded-full opacity-60"
                  style={{
                    background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.25) 0%, transparent 45%)`,
                  }}
                />
                <div className="relative z-10" style={{ color: accent }}>
                  <CategoryIcon iconKey={category.iconType} size={64} />
                </div>
              </div>
            </motion.div>

            <motion.div
              custom={0.35}
              variants={textVariants}
              initial="hidden"
              animate="visible"
              className="mt-6"
            >
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `${accent}18`,
                  color: accent,
                }}
              >
                <CategoryIcon iconKey={category.iconType} size={12} />
                {category.grade}
              </span>
            </motion.div>

            <motion.h1
              custom={0.45}
              variants={textVariants}
              initial="hidden"
              animate="visible"
              className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight"
            >
              {category.title}
            </motion.h1>

            <motion.p
              custom={0.55}
              variants={textVariants}
              initial="hidden"
              animate="visible"
              className="mt-3 text-base md:text-lg text-[#a0a8ad] max-w-2xl leading-relaxed"
            >
              {category.description}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Subcategories */}
      <section className="max-w-7xl mx-auto px-6 pb-24 md:pb-32">
        {subcategories.length > 0 ? (
          <div className="relative space-y-16 md:space-y-20">
            {/* Vertical connecting line */}
            <div className="absolute left-4 md:left-[15rem] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#37474f]/60 to-transparent hidden md:block" />

            {subcategories.map((sub, index) => {
              const subLabs = labsBySubcategory.get(sub.id) ?? [];
              const topicColor = accent;

              return (
                <motion.div
                  key={sub.id}
                  custom={index}
                  variants={topicVariants}
                  initial="hidden"
                  animate="visible"
                  className="relative flex flex-col md:flex-row gap-8 md:gap-12"
                >
                  {/* Topic node on the timeline */}
                  <div className="md:w-72 shrink-0 md:pr-8">
                    <div className="flex md:flex-col items-start md:items-end gap-4 md:gap-2 md:text-right">
                      <div
                        className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full shrink-0 border"
                        style={{
                          borderColor: `${topicColor}50`,
                          backgroundColor: `${topicColor}18`,
                          boxShadow: `0 0 20px ${topicColor}20`,
                        }}
                      >
                        <span
                          className="text-xs font-bold font-mono-phys"
                          style={{ color: topicColor }}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-medium tracking-wider text-[#798389] uppercase">
                          Тема {index + 1}
                        </span>
                        <h3 className="text-xl md:text-2xl font-bold text-white mt-1">
                          {sub.title}
                        </h3>
                        {sub.description && (
                          <p className="text-sm md:text-base text-[#a0a8ad] mt-2 leading-relaxed">
                            {sub.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Labs */}
                  <div className="flex-1 min-w-0">
                    {subLabs.length > 0 ? (
                      <div className="flex flex-wrap gap-4">
                        {subLabs.map((lab, labIndex) => {
                          const theme =
                            LAB_THEMES[labIndex % LAB_THEMES.length];
                          return (
                            <motion.span
                              key={lab.id}
                              custom={0.6 + index * 0.15 + labIndex * 0.08}
                              variants={labCardVariants}
                              initial="hidden"
                              animate="visible"
                              className="inline-block"
                            >
                              <Link
                                to={`/labs/work/${lab.slug}`}
                                className={`
                                  group inline-flex items-center
                                  px-5 py-3 rounded-xl border text-base font-medium
                                  transition-all duration-300 ease-out
                                  hover:-translate-y-1
                                  ${theme.bg} ${theme.border} ${theme.text} ${theme.shadow}
                                `}
                              >
                                <span
                                  className="w-2 h-2 rounded-full mr-3"
                                  style={{ backgroundColor: theme.dot }}
                                />
                                {lab.title}
                              </Link>
                            </motion.span>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-base text-[#798389] italic">
                        Лабораторные работы появятся позже
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-[#798389] py-16"
          >
            В этом разделе пока нет тем.
          </motion.div>
        )}
      </section>
    </div>
  );
}

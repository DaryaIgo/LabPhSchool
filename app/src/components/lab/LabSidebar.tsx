import { useState } from "react";
import { BookOpen, Play, TrendingUp, CheckCircle2 } from "lucide-react";

const allNavItems = [
  { id: "theory", icon: BookOpen, label: "Теория", color: "#2eff8c" },
  { id: "experiment", icon: Play, label: "Эксперимент", color: "#01acff" },
  { id: "graphs", icon: TrendingUp, label: "Графики", color: "#ffc832" },
  { id: "conclusion", icon: CheckCircle2, label: "Вывод", color: "#ff7043" },
];

interface LabSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  showConclusion?: boolean;
}

export default function LabSidebar({
  activeTab,
  onTabChange,
  showConclusion = true,
}: LabSidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const navItems = showConclusion
    ? allNavItems
    : allNavItems.filter(item => item.id !== "conclusion");

  return (
    <aside className="w-[64px] flex-shrink-0 bg-[#1e2428] flex flex-col items-center sticky top-[80px] self-start h-fit rounded-2xl py-3 gap-2 mx-3 my-2 relative z-20 shadow-lg shadow-black/20">
      <nav className="flex flex-col gap-1 w-full px-1.5">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          const isHovered = hoveredId === item.id;
          const Icon = item.icon;

          return (
            <div key={item.id} className="relative">
              {isHovered && !isActive && (
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 pointer-events-none z-50 bg-[#1e2529] border border-[#37474f]/60 text-[#c8cdd1] text-xs px-2.5 py-1 rounded-md whitespace-nowrap shadow-lg shadow-black/20">
                  {item.label}
                </div>
              )}

              <button
                onClick={() => onTabChange(item.id)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="relative w-full h-11 rounded-xl flex items-center justify-center transition-colors duration-200 outline-none focus:outline-none"
                aria-label={item.label}
              >
                {isActive && (
                  <div
                    className="absolute inset-0 rounded-xl"
                    style={{ backgroundColor: `${item.color}15` }}
                  />
                )}
                {!isActive && isHovered && (
                  <div className="absolute inset-0 rounded-xl bg-white/[0.03]" />
                )}
                {isActive && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-5 rounded-r-full"
                    style={{ backgroundColor: item.color }}
                  />
                )}

                <div
                  style={{
                    transform: isActive
                      ? "scale(1.1)"
                      : isHovered
                        ? "scale(1.08)"
                        : "scale(1)",
                    color: isActive
                      ? item.color
                      : isHovered
                        ? "#c8cdd1"
                        : "#5c6b73",
                    transition: "all 0.2s",
                  }}
                >
                  <Icon size={18} />
                </div>
              </button>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

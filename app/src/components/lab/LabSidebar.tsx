import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Play,
  TrendingUp,
  CheckCircle2,
  Save,
  Send,
} from "lucide-react";

interface NavItem {
  id: string;
  icon: React.FC<{ size?: number; className?: string }>;
  label: string;
  color: string;
}

const navItems: NavItem[] = [
  { id: "theory", icon: BookOpen, label: "Теория", color: "#2eff8c" },
  { id: "experiment", icon: Play, label: "Эксперимент", color: "#01acff" },
  { id: "graphs", icon: TrendingUp, label: "Графики", color: "#ffc832" },
  { id: "conclusion", icon: CheckCircle2, label: "Вывод", color: "#ff7043" },
];

interface LabSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSave: () => void;
  onSubmit: () => void;
}

export default function LabSidebar({
  activeTab,
  onTabChange,
  onSave,
  onSubmit,
}: LabSidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <aside className="w-[72px] flex-shrink-0 bg-[#13171a]/80 backdrop-blur-xl border-r border-[#2a3237]/60 flex flex-col items-center py-5 gap-1 relative z-20">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#2eff8c]/30 to-transparent" />

      {/* Nav items */}
      <nav className="flex flex-col gap-1 w-full px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const isHovered = hoveredId === item.id;
          const Icon = item.icon;

          return (
            <div key={item.id} className="relative">
              {/* Tooltip */}
              <AnimateTooltip visible={isHovered && !isActive} label={item.label} />

              <button
                onClick={() => onTabChange(item.id)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="relative w-full h-12 rounded-xl flex items-center justify-center transition-colors duration-200 outline-none focus:outline-none"
                aria-label={item.label}
              >
                {/* Active background pill */}
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 rounded-xl"
                    style={{ backgroundColor: `${item.color}15` }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Hover background */}
                {!isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-white/[0.03]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.15 }}
                  />
                )}

                {/* Active left indicator */}
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                    style={{ backgroundColor: item.color }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : isHovered ? 1.08 : 1,
                    color: isActive ? item.color : isHovered ? "#c8cdd1" : "#5c6b73",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon size={20} />
                </motion.div>
              </button>
            </div>
          );
        })}
      </nav>

      <div className="flex-1 min-h-[20px]" />

      {/* Divider */}
      <div className="w-8 h-px bg-[#2a3237]/80 mb-3" />

      {/* Action buttons */}
      <div className="flex flex-col gap-2 px-2 pb-2">
        <ActionButton
          icon={Save}
          label="Сохранить"
          onClick={onSave}
          color="#2eff8c"
        />
        <ActionButton
          icon={Send}
          label="Отправить"
          onClick={onSubmit}
          color="#ffc832"
        />
      </div>
    </aside>
  );
}

function AnimateTooltip({
  visible,
  label,
}: {
  visible: boolean;
  label: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : -4 }}
      transition={{ duration: 0.15 }}
      className="absolute left-full ml-3 top-1/2 -translate-y-1/2 pointer-events-none z-50"
    >
      <div className="bg-[#1e2529] border border-[#37474f]/60 text-[#c8cdd1] text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg shadow-black/20">
        {label}
        <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-1.5 h-1.5 bg-[#1e2529] border-l border-b border-[#37474f]/60 rotate-45" />
      </div>
    </motion.div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  color,
}: {
  icon: React.FC<{ size?: number; className?: string }>;
  label: string;
  onClick: () => void;
  color: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative">
      <AnimateTooltip visible={hovered} label={label} />
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 outline-none focus:outline-none group"
        aria-label={label}
      >
        <motion.div
          className="absolute inset-0 rounded-xl border"
          style={{ borderColor: hovered ? `${color}40` : "transparent" }}
          animate={{ backgroundColor: hovered ? `${color}10` : "transparent" }}
          transition={{ duration: 0.15 }}
        />
        <motion.div
          animate={{
            scale: hovered ? 1.1 : 1,
            color: hovered ? color : "#5c6b73",
          }}
          transition={{ duration: 0.2 }}
        >
          <Icon size={18} />
        </motion.div>
      </button>
    </div>
  );
}

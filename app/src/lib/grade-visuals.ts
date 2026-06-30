import { Gem, Coins, CircleDollarSign } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type GradeVisualConfig = {
  icon: LucideIcon;
  iconColor: string;
  glowColor: string;
  hasGlow: boolean;
};

export const GRADE_VISUALS: Partial<Record<number, GradeVisualConfig>> = {
  5: {
    icon: Gem,
    iconColor: "#10b981",
    glowColor: "rgba(16, 185, 129, 0.5)",
    hasGlow: true,
  },
  4: {
    icon: Coins,
    iconColor: "#fbbf24",
    glowColor: "rgba(251, 191, 36, 0.5)",
    hasGlow: true,
  },
  3: {
    icon: CircleDollarSign,
    iconColor: "#94a3b8",
    glowColor: "transparent",
    hasGlow: false,
  },
};

export function getGradeVisuals(
  grade: number | null | undefined
): GradeVisualConfig | null {
  if (!grade) return null;
  return GRADE_VISUALS[grade] ?? null;
}

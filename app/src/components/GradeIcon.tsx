import { getGradeVisuals } from "@/lib/grade-visuals";

export function GradeIcon({
  grade,
  size = 16,
}: {
  grade: number | null | undefined;
  size?: number;
}) {
  const config = getGradeVisuals(grade);
  if (!config) return null;
  const Icon = config.icon;
  return <Icon size={size} style={{ color: config.iconColor }} />;
}

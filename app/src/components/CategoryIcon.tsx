import { getCategoryIcon } from "@/lib/lab-icons";

export function CategoryIcon({
  iconKey,
  size = 24,
  className,
  color,
}: {
  iconKey: string | null | undefined;
  size?: number;
  className?: string;
  color?: string;
}) {
  const def = getCategoryIcon(iconKey);
  const Icon = def.component;
  return (
    <Icon
      size={size}
      className={className}
      style={{ color: color ?? def.color }}
    />
  );
}

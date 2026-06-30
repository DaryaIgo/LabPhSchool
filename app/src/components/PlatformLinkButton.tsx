import { cn } from "@/lib/utils";
import {
  resolvePlatformForUrl,
  getPlatformDisplayTitle,
} from "@/lib/platformLinks";
import { ExternalLink } from "lucide-react";

interface PlatformLinkButtonProps {
  url: string;
  title?: string | null;
  size?: "sm" | "md";
  showExternalIcon?: boolean;
  className?: string;
}

export function PlatformLinkButton({
  url,
  title,
  size = "md",
  showExternalIcon = true,
  className,
}: PlatformLinkButtonProps) {
  const platform = resolvePlatformForUrl(url);
  const displayTitle = getPlatformDisplayTitle(url, title);
  const { Icon, colorClass, textClass, hoverClass } = platform;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={url}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg font-medium transition-colors",
        colorClass,
        textClass,
        hoverClass,
        size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm",
        className
      )}
    >
      <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      <span className="max-w-[180px] truncate">{displayTitle}</span>
      {showExternalIcon && (
        <ExternalLink className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      )}
    </a>
  );
}

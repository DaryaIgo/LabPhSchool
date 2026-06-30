import type { LucideIcon } from "lucide-react";
import { Video, Users, MessageCircle, Send, Phone, Link } from "lucide-react";
import {
  detectPlatform,
  getPlatformDisplayTitle,
  PLATFORM_META,
  type PlatformInfo,
} from "@contracts/platformLinks";

const ICON_MAP: Record<string, LucideIcon> = {
  Video,
  Users,
  MessageCircle,
  Send,
  Phone,
  Link,
};

export function resolvePlatformIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? Link;
}

export function resolvePlatformForUrl(url: string): PlatformInfo & {
  Icon: LucideIcon;
} {
  const platform = detectPlatform(url);
  return {
    ...platform,
    Icon: resolvePlatformIcon(platform.iconName),
  };
}

export {
  detectPlatform,
  getPlatformDisplayTitle,
  PLATFORM_META,
  type PlatformInfo,
};

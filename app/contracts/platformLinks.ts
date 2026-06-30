/**
 * Shared platform detection for student personal links.
 * No React dependencies — safe to import on both client and server.
 */

export interface PlatformInfo {
  key: string;
  name: string;
  colorClass: string; // Tailwind background class
  textClass: string; // Tailwind text class
  hoverClass: string; // Tailwind hover background class
  iconName: string; // Maps to a lucide-react icon on the client
}

export const PLATFORM_META: Record<string, PlatformInfo> = {
  zoom: {
    key: "zoom",
    name: "Zoom",
    colorClass: "bg-[#2d8cff]",
    textClass: "text-white",
    hoverClass: "hover:bg-[#1a7bf5]",
    iconName: "Video",
  },
  yandex_telemost: {
    key: "yandex_telemost",
    name: "Яндекс Телемост",
    colorClass: "bg-[#fc3f1d]",
    textClass: "text-white",
    hoverClass: "hover:bg-[#e63312]",
    iconName: "Video",
  },
  google_meet: {
    key: "google_meet",
    name: "Google Meet",
    colorClass: "bg-[#00832d]",
    textClass: "text-white",
    hoverClass: "hover:bg-[#006d25]",
    iconName: "Video",
  },
  microsoft_teams: {
    key: "microsoft_teams",
    name: "Microsoft Teams",
    colorClass: "bg-[#6264a7]",
    textClass: "text-white",
    hoverClass: "hover:bg-[#4f5191]",
    iconName: "Users",
  },
  discord: {
    key: "discord",
    name: "Discord",
    colorClass: "bg-[#5865f2]",
    textClass: "text-white",
    hoverClass: "hover:bg-[#4752c4]",
    iconName: "MessageCircle",
  },
  telegram: {
    key: "telegram",
    name: "Telegram",
    colorClass: "bg-[#229ed9]",
    textClass: "text-white",
    hoverClass: "hover:bg-[#1b87b8]",
    iconName: "Send",
  },
  skype: {
    key: "skype",
    name: "Skype",
    colorClass: "bg-[#00aff0]",
    textClass: "text-white",
    hoverClass: "hover:bg-[#0099d2]",
    iconName: "Phone",
  },
  webex: {
    key: "webex",
    name: "Webex",
    colorClass: "bg-[#00bcf2]",
    textClass: "text-white",
    hoverClass: "hover:bg-[#00a5d4]",
    iconName: "Video",
  },
  jitsi: {
    key: "jitsi",
    name: "Jitsi Meet",
    colorClass: "bg-[#00a8e8]",
    textClass: "text-white",
    hoverClass: "hover:bg-[#0092c9]",
    iconName: "Video",
  },
  other: {
    key: "other",
    name: "Ссылка",
    colorClass: "bg-[#455a64]",
    textClass: "text-white",
    hoverClass: "hover:bg-[#546e7a]",
    iconName: "Link",
  },
};

interface PlatformRule {
  platformKey: string;
  domainPatterns: string[];
}

const PLATFORM_RULES: PlatformRule[] = [
  { platformKey: "zoom", domainPatterns: ["zoom.us", "zoom.com", "zoomgov.com"] },
  {
    platformKey: "yandex_telemost",
    domainPatterns: ["telemost.yandex.ru", "telemost.yandex.com"],
  },
  {
    platformKey: "google_meet",
    domainPatterns: [
      "meet.google.com",
      "hangouts.google.com",
      "meet.googleapis.com",
    ],
  },
  {
    platformKey: "microsoft_teams",
    domainPatterns: ["teams.microsoft.com", "teams.live.com"],
  },
  {
    platformKey: "discord",
    domainPatterns: ["discord.com", "discord.gg", "discordapp.com"],
  },
  {
    platformKey: "telegram",
    domainPatterns: ["web.telegram.org", "t.me", "telegram.me"],
  },
  {
    platformKey: "skype",
    domainPatterns: ["web.skype.com", "skype.com", "join.skype.com"],
  },
  {
    platformKey: "webex",
    domainPatterns: ["webex.com", "meet.webex.com", "signin.webex.com"],
  },
  {
    platformKey: "jitsi",
    domainPatterns: ["meet.jit.si", "jitsi.org", "8x8.vc"],
  },
];

export function extractHostname(url: string): string | null {
  try {
    const trimmed = url.trim();
    const withProtocol = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    return new URL(withProtocol).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function detectPlatform(url: string): PlatformInfo {
  const hostname = extractHostname(url);
  if (!hostname) return PLATFORM_META.other;

  for (const rule of PLATFORM_RULES) {
    for (const pattern of rule.domainPatterns) {
      const lowerPattern = pattern.toLowerCase();
      if (
        hostname === lowerPattern ||
        hostname.endsWith(`.${lowerPattern}`)
      ) {
        return PLATFORM_META[rule.platformKey] ?? PLATFORM_META.other;
      }
    }
  }

  return PLATFORM_META.other;
}

export function getPlatformDisplayTitle(
  url: string,
  customTitle?: string | null
): string {
  if (customTitle && customTitle.trim()) return customTitle.trim();

  const platform = detectPlatform(url);
  if (platform.key !== "other") return platform.name;

  const hostname = extractHostname(url);
  if (hostname) return hostname.replace(/^www\./, "");
  return "Ссылка";
}

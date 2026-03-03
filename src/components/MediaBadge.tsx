import { cn } from "@/lib/utils";

type MediaBadgeProps = {
  type: string;
  className?: string;
};

const BADGE_CONFIG: Record<string, { icon: string; label: string; className: string }> = {
  Film: { icon: "🎬", label: "Film", className: "badge-film" },
  "Film Collection": { icon: "📀", label: "Collection", className: "badge-film-collection" },
  Documentary: { icon: "🎥", label: "Documentary", className: "badge-documentary" },
  "Concert Film": { icon: "🎵", label: "Concert", className: "badge-concert" },
  TV: { icon: "📺", label: "TV", className: "badge-tv" },
};

export const MEDIA_TYPES = Object.keys(BADGE_CONFIG);

export function MediaBadge({ type, className }: MediaBadgeProps) {
  const config = BADGE_CONFIG[type] ?? BADGE_CONFIG["Film"];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider",
        config.className,
        className
      )}
    >
      {config.icon} {config.label}
    </span>
  );
}

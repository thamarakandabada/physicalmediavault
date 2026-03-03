import { cn } from "@/lib/utils";

type MediaBadgeProps = {
  type: string;
  className?: string;
};

export function MediaBadge({ type, className }: MediaBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider",
        type === "Film" ? "badge-film" : "badge-tv",
        className
      )}
    >
      {type === "Film" ? "🎬 Film" : "📺 TV"}
    </span>
  );
}

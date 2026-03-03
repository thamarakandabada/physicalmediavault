import { cn } from "@/lib/utils";

const REGION_FLAGS: Record<string, string> = {
  UK: "🇬🇧",
  US: "🇺🇸",
  France: "🇫🇷",
};

function getRegionKeys(region: string): string[] {
  const r = region.toUpperCase().replace(/\s/g, "");
  if (r === "UK/US" || r === "US/UK") return ["UK", "US"];
  if (r.includes("UK") || r.includes("GB")) return ["UK"];
  if (r.includes("US") || r.includes("USA")) return ["US"];
  if (r.includes("FRAN")) return ["France"];
  return [];
}

export function RegionIcon({ region, className }: { region: string; className?: string }) {
  const keys = getRegionKeys(region);
  if (keys.length === 0) return null;

  return (
    <span className={cn("inline-flex items-center gap-0.5 text-sm", className)}>
      {keys.map((key) => (
        <span key={key} role="img" aria-label={key}>
          {REGION_FLAGS[key]}
        </span>
      ))}
    </span>
  );
}

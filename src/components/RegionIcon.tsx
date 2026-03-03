import { cn } from "@/lib/utils";

// Simplified country silhouette paths
const REGION_PATHS: Record<string, { paths: string[]; viewBox: string }> = {
  UK: {
    viewBox: "0 0 32 48",
    paths: [
      // Great Britain simplified silhouette
      "M18 2c-1 1-3 2-4 4-1 1 0 3 1 4 0 2-2 3-2 5 1 2 0 4-1 5-1 2-3 3-3 5 0 2 1 3 0 5-1 1-2 3-3 4 0 2 1 3 2 4 1 2 0 4-1 5 1 1 2 1 3 0 1-1 3-1 4 0 1 1 2 2 3 1 1-1 1-3 2-4 0-2-1-3-1-5 1-2 2-3 2-5 0-2-1-4-1-6-1-2 0-4 0-6 0-2-1-3 0-5 0-2 1-3 0-5 1-2 0-3-1-4z",
    ],
  },
  US: {
    viewBox: "0 0 60 36",
    paths: [
      // Continental US simplified silhouette
      "M2 12c2-2 5-3 8-4 3 0 6 0 9-1 2-1 4-2 7-2 3 0 5 1 8 1 3-1 5-2 8-3 3 0 5 1 7 2 2 1 3 2 5 3 1 1 2 3 3 4 0 2-1 3-1 5-1 2-2 3-4 4-2 1-4 1-6 2-2 1-4 2-6 2-3 0-5 0-8-1-2-1-4-2-6-2-3 0-5 1-7 1-3 0-5-1-7-2-2-1-4-2-5-3-2-1-3-3-4-4 0-1-1-2-1-3z",
    ],
  },
  France: {
    viewBox: "0 0 36 40",
    paths: [
      // France simplified silhouette (hexagonal shape)
      "M18 2c3 1 6 3 8 5 2 3 4 6 5 9 0 3-1 6-2 9-2 3-4 5-7 7-2 2-5 3-8 4-3 0-5-1-7-3-2-2-4-5-5-8-1-3-1-6 0-9 1-3 3-6 5-8 3-3 6-5 9-6z",
    ],
  },
};

// Map region strings to country keys
function getRegionKeys(region: string): string[] {
  const r = region.toUpperCase().replace(/\s/g, "");
  if (r === "UK/US" || r === "US/UK") return ["UK", "US"];
  if (r.includes("UK") || r.includes("GB") || r.includes("BRITAIN")) return ["UK"];
  if (r.includes("US") || r.includes("USA") || r.includes("AMERICA")) return ["US"];
  if (r.includes("FRAN")) return ["France"];
  if (r.includes("A") || r.includes("B") || r.includes("C")) {
    // Region A/B/C mapping
    if (r === "A" || r === "REGIONA") return ["US"];
    if (r === "B" || r === "REGIONB") return ["UK"];
    if (r === "C" || r === "REGIONC") return ["France"];
  }
  return [];
}

export function RegionIcon({ region, className }: { region: string; className?: string }) {
  const keys = getRegionKeys(region);
  if (keys.length === 0) return null;

  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {keys.map((key) => {
        const shape = REGION_PATHS[key];
        if (!shape) return null;
        return (
          <svg
            key={key}
            viewBox={shape.viewBox}
            className="h-4 w-auto fill-current opacity-60"
            aria-label={key}
          >
            {shape.paths.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </svg>
        );
      })}
    </span>
  );
}

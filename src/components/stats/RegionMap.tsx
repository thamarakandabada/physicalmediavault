import { useMemo, useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { MapPin } from "lucide-react";
import type { Title } from "@/hooks/useTitles";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Map region strings from titles to ISO 3166-1 numeric codes used by world-atlas
const REGION_TO_CODES: Record<string, string[]> = {
  UK: ["826"],
  US: ["840"],
  "UK/US": ["826", "840"],
  France: ["250"],
};

function getCountryCounts(titles: Title[]): Record<string, number> {
  const counts: Record<string, number> = {};
  titles.forEach((t) => {
    if (!t.region) return;
    const r = t.region.trim();
    const codes = REGION_TO_CODES[r];
    if (codes) {
      codes.forEach((code) => {
        counts[code] = (counts[code] || 0) + 1;
      });
    }
  });
  return counts;
}

function getColor(count: number, max: number): string {
  if (count === 0) return "hsl(210, 14%, 16%)";
  const ratio = count / max;
  // Interpolate from dim green to bright green
  const l = 20 + ratio * 24;
  const s = 40 + ratio * 60;
  return `hsl(145, ${s}%, ${l}%)`;
}

export function RegionMap({ titles }: { titles: Title[] }) {
  const countryCounts = useMemo(() => getCountryCounts(titles), [titles]);
  const maxCount = useMemo(() => Math.max(1, ...Object.values(countryCounts)), [countryCounts]);

  const [tooltip, setTooltip] = useState<{ name: string; count: number } | null>(null);

  // Region breakdown for legend
  const regionBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;
    titles.forEach((t) => {
      if (t.region) {
        counts[t.region] = (counts[t.region] || 0) + 1;
        total++;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ label, count, percent: total ? Math.round((count / total) * 100) : 0 }));
  }, [titles]);

  if (regionBreakdown.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-gold" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Disc Regions</h3>
        </div>
        <p className="text-sm text-muted-foreground">No data yet</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-4 h-4 text-gold" />
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Disc Regions</h3>
      </div>

      <div className="relative">
        <div className="w-full aspect-[2/1] max-h-[420px]">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 120, center: [10, 30] }}
            style={{ width: "100%", height: "100%" }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const id = geo.id;
                  const count = countryCounts[id] || 0;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={count > 0 ? getColor(count, maxCount) : "hsl(210, 14%, 16%)"}
                      stroke="hsl(210, 12%, 22%)"
                      strokeWidth={0.5}
                      onMouseEnter={() => {
                        setTooltip({ name: geo.properties.name, count });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      style={{
                        default: { outline: "none" },
                        hover: { outline: "none", fill: count > 0 ? "hsl(145, 100%, 44%)" : "hsl(210, 14%, 20%)" },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
        </div>

        {tooltip && (
          <div className="absolute top-2 right-2 bg-popover border border-border rounded-lg px-3 py-2 text-sm pointer-events-none">
            <span className="text-foreground font-medium">{tooltip.name}</span>
            {tooltip.count > 0 && (
              <span className="text-muted-foreground ml-2">
                {tooltip.count} title{tooltip.count !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        {regionBreakdown.map((item) => (
          <div key={item.label} className="flex items-center gap-2 sm:gap-3">
            <span className="text-sm text-foreground w-24 sm:w-28 shrink-0 truncate">{item.label}</span>
            <div className="flex-1 min-w-0 h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-primary/70 transition-all duration-500"
                style={{ width: `${item.percent}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground shrink-0 text-right tabular-nums whitespace-nowrap">
              {item.count} ({item.percent}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

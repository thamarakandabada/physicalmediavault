import { useMemo, useRef, useState, useEffect } from "react";
import { Sankey, Tooltip, Layer, Rectangle } from "recharts";
import { Building2 } from "lucide-react";
import type { Title } from "@/hooks/useTitles";

const NODE_COLORS = [
  "hsl(145, 100%, 44%)",
  "hsl(200, 70%, 45%)",
  "hsl(30, 90%, 52%)",
  "hsl(340, 65%, 50%)",
  "hsl(270, 50%, 55%)",
  "hsl(50, 85%, 50%)",
  "hsl(170, 60%, 40%)",
  "hsl(15, 75%, 50%)",
];

function SankeyNode({ x, y, width, height, index, payload }: any) {
  const color = NODE_COLORS[index % NODE_COLORS.length];
  const isLeft = x < 200;
  return (
    <Layer>
      <Rectangle x={x} y={y} width={width} height={height} fill={color} fillOpacity={0.85} radius={[2, 2, 2, 2]} />
      <text
        x={isLeft ? x - 6 : x + width + 6}
        y={y + height / 2}
        textAnchor={isLeft ? "end" : "start"}
        dominantBaseline="middle"
        fill="hsl(210, 10%, 88%)"
        fontSize={12}
      >
        {payload.name}
      </text>
    </Layer>
  );
}

function SankeyLink({ sourceX, sourceY, sourceControlX, targetX, targetY, targetControlX, linkWidth, index }: any) {
  const color = NODE_COLORS[index % NODE_COLORS.length];
  return (
    <Layer>
      <path
        d={`M${sourceX},${sourceY}C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`}
        fill="none"
        stroke={color}
        strokeWidth={linkWidth}
        strokeOpacity={0.3}
      />
    </Layer>
  );
}

export function PublisherSankey({ titles }: { titles: Title[] }) {
  const sankeyData = useMemo(() => {
    const pairs: Record<string, number> = {};
    titles.forEach((t) => {
      if (t.publisher && t.media_type) {
        const key = `${t.publisher}|||${t.media_type}`;
        pairs[key] = (pairs[key] || 0) + 1;
      }
    });

    const publisherSet = new Set<string>();
    const mediaSet = new Set<string>();
    Object.keys(pairs).forEach((k) => {
      const [pub, media] = k.split("|||");
      publisherSet.add(pub);
      mediaSet.add(media);
    });

    // Limit to top publishers by total count
    const pubCounts: Record<string, number> = {};
    Object.entries(pairs).forEach(([k, v]) => {
      const pub = k.split("|||")[0];
      pubCounts[pub] = (pubCounts[pub] || 0) + v;
    });
    const topPubs = Object.entries(pubCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([p]) => p);

    const publishers = topPubs;
    const mediaTypes = Array.from(mediaSet);
    const nodes = [
      ...publishers.map((name) => ({ name })),
      ...mediaTypes.map((name) => ({ name })),
    ];

    const links: { source: number; target: number; value: number }[] = [];
    Object.entries(pairs).forEach(([k, v]) => {
      const [pub, media] = k.split("|||");
      const si = publishers.indexOf(pub);
      if (si === -1) return;
      const ti = publishers.length + mediaTypes.indexOf(media);
      links.push({ source: si, target: ti, value: v });
    });

    if (links.length === 0) return null;
    return { nodes, links };
  }, [titles]);

  if (!sankeyData) {
    return (
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4 text-gold" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Publisher → Media Type</h3>
        </div>
        <p className="text-sm text-muted-foreground">No data yet</p>
      </div>
    );
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(900);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-4 h-4 text-gold" />
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Publisher → Media Type</h3>
      </div>
      <div ref={containerRef} className="h-[400px] w-full overflow-hidden">
        <Sankey
          width={width}
          height={380}
          data={sankeyData}
          node={<SankeyNode />}
          link={<SankeyLink />}
          nodePadding={14}
          nodeWidth={8}
          margin={{ top: 10, right: 160, bottom: 10, left: 160 }}
        >
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(210, 18%, 11%)",
              border: "1px solid hsl(210, 14%, 20%)",
              borderRadius: 8,
              color: "hsl(210, 10%, 88%)",
            }}
            formatter={(value: number) => [`${value} title${value !== 1 ? "s" : ""}`, "Count"]}
          />
        </Sankey>
      </div>
    </div>
  );
}

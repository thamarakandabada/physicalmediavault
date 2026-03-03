import { useMemo } from "react";
import { useTitles } from "@/hooks/useTitles";

import { Film, Monitor, Volume2, Package, Building2, MapPin, Award, BarChart3, Disc3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

type StatBreakdown = { label: string; count: number; percent: number };

function computeBreakdown(items: (string | null | undefined)[]): StatBreakdown[] {
  const counts: Record<string, number> = {};
  let total = 0;
  items.forEach((v) => {
    if (v) {
      counts[v] = (counts[v] || 0) + 1;
      total++;
    }
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count, percent: total ? Math.round((count / total) * 100) : 0 }));
}

function StatCard({
  title,
  icon: Icon,
  items,
  accentClass = "text-gold",
}: {
  title: string;
  icon: React.ElementType;
  items: StatBreakdown[];
  accentClass?: string;
}) {
  const top = items[0];
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`w-4 h-4 ${accentClass}`} />
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</h3>
      </div>

      {top ? (
        <>
          <div className="mb-4">
            <span className="text-2xl font-display text-foreground">{top.label}</span>
            <span className="text-sm text-muted-foreground ml-2">
              {top.count} title{top.count !== 1 ? "s" : ""} · {top.percent}%
            </span>
          </div>

          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-sm text-foreground w-28 truncate">{item.label}</span>
                <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gold/70 transition-all duration-500"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-14 text-right tabular-nums">
                  {item.count} ({item.percent}%)
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">No data yet</p>
      )}
    </div>
  );
}

const DIRECTOR_PALETTE = [
  { bg: "hsl(145, 100%, 44%)", text: "hsl(210, 20%, 7%)" },   // Letterboxd green
  { bg: "hsl(200, 70%, 45%)", text: "hsl(210, 20%, 98%)" },    // Blue
  { bg: "hsl(30, 90%, 52%)", text: "hsl(210, 20%, 7%)" },      // Orange
  { bg: "hsl(340, 65%, 50%)", text: "hsl(0, 0%, 98%)" },       // Pink/red
  { bg: "hsl(270, 50%, 55%)", text: "hsl(0, 0%, 98%)" },       // Purple
  { bg: "hsl(50, 85%, 50%)", text: "hsl(210, 20%, 7%)" },      // Yellow
  { bg: "hsl(170, 60%, 40%)", text: "hsl(210, 20%, 98%)" },    // Teal
  { bg: "hsl(15, 75%, 50%)", text: "hsl(0, 0%, 98%)" },        // Burnt orange
];

function DirectorTiles({ items }: { items: StatBreakdown[] }) {
  const maxCount = items[0]?.count ?? 1;
  const visible = items.slice(0, 15);
  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-1">
        <Film className="w-4 h-4 text-gold" />
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Top Directors</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3 sm:mb-4">
        {items.length} with 2+ titles — sized by count
      </p>
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {visible.map((item, i) => {
          const ratio = item.count / maxCount;
          const palette = DIRECTOR_PALETTE[i % DIRECTOR_PALETTE.length];
          const opacity = 0.65 + ratio * 0.35;
          return (
            <div
              key={item.label}
              className="rounded transition-all hover:scale-105 cursor-default"
              style={{
                fontSize: `${0.7 + ratio * 0.45}rem`,
                padding: `${3 + ratio * 4}px ${6 + ratio * 6}px`,
                backgroundColor: palette.bg,
                color: palette.text,
                opacity,
                fontWeight: ratio > 0.5 ? 700 : 500,
                lineHeight: 1.3,
              }}
              title={`${item.count} title${item.count !== 1 ? "s" : ""}`}
            >
              {item.label}
              <span className="ml-1 text-[0.65em] opacity-70">{item.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HeadlineStat({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
  return (
    <div className="bg-card border border-border rounded-lg p-5 flex flex-col items-center text-center gap-2">
      <Icon className="w-5 h-5 text-gold" />
      <span className="text-3xl font-display text-foreground tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
}

function DecadeChart({ data }: { data: StatBreakdown[] }) {
  const sorted = [...data].sort((a, b) => a.label.localeCompare(b.label));
  const ACCENT = "hsl(145, 100%, 44%)";
  return (
    <div className="bg-card border border-border rounded-lg p-5 col-span-1 md:col-span-2">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-gold" />
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Titles by Decade</h3>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sorted} margin={{ top: 20, right: 8, bottom: 4, left: 8 }}>
            <XAxis dataKey="label" tick={{ fill: 'hsl(210, 8%, 50%)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'hsl(210, 8%, 50%)', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(210, 18%, 11%)', border: '1px solid hsl(210, 14%, 20%)', borderRadius: 8, color: 'hsl(210, 10%, 88%)' }}
              cursor={{ fill: 'hsl(210, 14%, 16%)' }}
              formatter={(value: number) => [`${value} title${value !== 1 ? 's' : ''}`, 'Count']}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: 'hsl(210, 8%, 50%)', fontSize: 11 }}>
              {sorted.map((_, i) => (
                <Cell key={i} fill={ACCENT} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const Stats = () => {
  const { data: allTitles, isLoading } = useTitles();

  const stats = useMemo(() => {
    if (!allTitles || allTitles.length === 0) return null;

    const parentIds = new Set(allTitles.filter((t) => t.parent_id).map((t) => t.parent_id));
    const leafTitles = allTitles.filter((t) => t.parent_id || !parentIds.has(t.id));
    const parents = allTitles.filter((t) => !t.parent_id);
    const totalDiscs = leafTitles.length;
    const totalCollections = parents.length;

    const directors = computeBreakdown(
      leafTitles.flatMap((t) =>
        t.director ? t.director.split(/,\s*/).map((d) => d.trim()).filter(Boolean) : []
      )
    );
    const videoQualities = computeBreakdown(leafTitles.map((t) => t.video_quality));
    const audioTypes = computeBreakdown(leafTitles.map((t) => t.audio_type));
    const packageTypes = computeBreakdown(leafTitles.map((t) => t.package_type));
    const publishers = computeBreakdown(leafTitles.map((t) => t.publisher));
    const regions = computeBreakdown(leafTitles.map((t) => t.region));
    const mediaTypes = computeBreakdown(leafTitles.map((t) => t.media_type));
    const hdrTypes = computeBreakdown(leafTitles.map((t) => t.hdr_type));

    const years = leafTitles.map((t) => t.year).filter(Boolean) as number[];
    const decades = computeBreakdown(
      years.map((y) => `${Math.floor(y / 10) * 10}s`)
    );

    const uniqueDirectors = new Set(
      leafTitles.flatMap((t) =>
        t.director ? t.director.split(/,\s*/).map((d) => d.trim()).filter(Boolean) : []
      )
    ).size;

    return {
      totalDiscs,
      totalCollections,
      uniqueDirectors,
      directors,
      videoQualities,
      audioTypes,
      packageTypes,
      publishers,
      regions,
      mediaTypes,
      hdrTypes,
      decades,
    };
  }, [allTitles]);

  return (
    <>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Collection <span className="text-gold">Stats</span>
        </h1>
        <p className="text-muted-foreground mb-8">A breakdown of my physical media vault</p>

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Loading...</div>
        ) : !stats ? (
          <div className="text-center py-20 text-muted-foreground">No titles in your collection yet.</div>
        ) : (
          <div className="space-y-8">
            {/* Headline numbers */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <HeadlineStat label="Total Discs" value={stats.totalDiscs} icon={Disc3} />
              <HeadlineStat label="Top-Level Titles" value={stats.totalCollections} icon={BarChart3} />
              <HeadlineStat label="Unique Directors" value={stats.uniqueDirectors} icon={Award} />
            </div>

            {/* Decade chart */}
            {stats.decades.length > 0 && (
              <DecadeChart data={stats.decades} />
            )}

            {/* Director tiles */}
            {stats.directors.length > 0 && (
              <DirectorTiles items={stats.directors.filter((d) => d.count >= 2)} />
            )}

            {/* Detailed breakdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard title="Video Quality" icon={Monitor} items={stats.videoQualities} />
              <StatCard title="Audio Format" icon={Volume2} items={stats.audioTypes} />
              <StatCard title="HDR Type" icon={Monitor} items={stats.hdrTypes} />
              <StatCard title="Package Type" icon={Package} items={stats.packageTypes} />
              <StatCard title="Publisher" icon={Building2} items={stats.publishers.slice(0, 8)} />
              <StatCard title="Disc Region" icon={MapPin} items={stats.regions} />
              <StatCard title="Media Type" icon={Film} items={stats.mediaTypes} />
            </div>
          </div>
        )}
    </>
  );
};

export default Stats;
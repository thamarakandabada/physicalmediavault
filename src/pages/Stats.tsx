import { useMemo } from "react";
import { useTitles } from "@/hooks/useTitles";
import { useLetterboxdSync } from "@/hooks/useLetterboxdSync";
import { PageMeta } from "@/components/PageMeta";

import { Film, Monitor, Volume2, MapPin, Award, BarChart3, Disc3, Clock, Calendar, Eye } from "lucide-react";
import { RegionIcon } from "@/components/RegionIcon";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Sankey } from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
  renderItemIcon,
}: {
  title: string;
  icon: React.ElementType;
  items: StatBreakdown[];
  accentClass?: string;
  renderItemIcon?: (label: string) => React.ReactNode;
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
              <div key={item.label} className="flex items-center gap-2 sm:gap-3">
                <span className="text-sm text-foreground w-24 sm:w-28 shrink-0 truncate flex items-center gap-1.5">
                  {renderItemIcon?.(item.label)}
                  {item.label}
                </span>
                <div className="flex-1 min-w-0 h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gold/70 transition-all duration-500"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground shrink-0 text-right tabular-nums whitespace-nowrap">
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

function HeadlineStat({ label, value, icon: Icon, sublabel }: { label: string; value: string | number; icon: React.ElementType; sublabel?: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-5 flex flex-col items-center text-center gap-2">
      <Icon className="w-5 h-5 text-gold" />
      <span className="text-3xl font-display text-foreground tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
      {sublabel && (
        <span className="text-[11px] text-muted-foreground/80 tabular-nums">{sublabel}</span>
      )}
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
              labelStyle={{ color: 'hsl(210, 10%, 88%)' }}
              itemStyle={{ color: 'hsl(210, 10%, 88%)' }}
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

const PIE_COLORS = [
  "hsl(145, 100%, 44%)",
  "hsl(200, 70%, 45%)",
  "hsl(30, 90%, 52%)",
  "hsl(340, 65%, 50%)",
  "hsl(270, 50%, 55%)",
  "hsl(50, 85%, 50%)",
  "hsl(170, 60%, 40%)",
  "hsl(15, 75%, 50%)",
];

function PieBreakdown({ data }: { data: StatBreakdown[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-6">
      <div className="w-full aspect-square max-w-[280px] md:max-w-[320px] mx-auto">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius="80%"
              innerRadius="30%"
              strokeWidth={1}
              stroke="hsl(210, 18%, 11%)"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} fillOpacity={0.85} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(210, 18%, 11%)', border: '1px solid hsl(210, 14%, 20%)', borderRadius: 8, color: 'hsl(210, 10%, 88%)' }}
              labelStyle={{ color: 'hsl(210, 10%, 88%)' }}
              itemStyle={{ color: 'hsl(210, 10%, 88%)' }}
              formatter={(value: number, name: string) => [`${value}`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-1.5 min-w-0">
        {data.map((item, i) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
            <span className="text-sm text-foreground truncate">{item.label}</span>
            <span className="text-xs text-muted-foreground ml-auto shrink-0 tabular-nums">{item.count} ({item.percent}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AVTabs({ videoData, audioData, hdrData }: { videoData: StatBreakdown[]; audioData: StatBreakdown[]; hdrData: StatBreakdown[] }) {
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <Tabs defaultValue="video">
        <div className="flex items-center gap-3 mb-4">
          <TabsList>
            <TabsTrigger value="video" className="gap-1.5">
              <Monitor className="w-3.5 h-3.5" /> Video
            </TabsTrigger>
            <TabsTrigger value="audio" className="gap-1.5">
              <Volume2 className="w-3.5 h-3.5" /> Audio
            </TabsTrigger>
            <TabsTrigger value="hdr" className="gap-1.5">
              <Monitor className="w-3.5 h-3.5" /> HDR
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="video">
          {videoData.length > 0 ? <PieBreakdown data={videoData} /> : <p className="text-sm text-muted-foreground">No data yet</p>}
        </TabsContent>
        <TabsContent value="audio">
          {audioData.length > 0 ? <PieBreakdown data={audioData} /> : <p className="text-sm text-muted-foreground">No data yet</p>}
        </TabsContent>
        <TabsContent value="hdr">
          {hdrData.length > 0 ? <PieBreakdown data={hdrData} /> : <p className="text-sm text-muted-foreground">No data yet</p>}
        </TabsContent>
      </Tabs>
    </div>
  );
}

const SANKEY_COLORS = [
  "hsl(145, 100%, 44%)",
  "hsl(200, 70%, 45%)",
  "hsl(30, 90%, 52%)",
  "hsl(340, 65%, 50%)",
  "hsl(270, 50%, 55%)",
  "hsl(50, 85%, 50%)",
  "hsl(170, 60%, 40%)",
  "hsl(15, 75%, 50%)",
  "hsl(220, 60%, 55%)",
  "hsl(160, 50%, 45%)",
];

function PublisherPackageSankey({ titles }: { titles: { publisher?: string | null; package_type?: string | null }[] }) {
  const sankeyData = useMemo(() => {
    // Count flows from publisher → package_type
    const flowCounts: Record<string, number> = {};
    const publisherCounts: Record<string, number> = {};
    const packageCounts: Record<string, number> = {};

    titles.forEach((t) => {
      const pub = t.publisher || "Unknown";
      const pkg = t.package_type || "Unknown";
      const key = `${pub}|||${pkg}`;
      flowCounts[key] = (flowCounts[key] || 0) + 1;
      publisherCounts[pub] = (publisherCounts[pub] || 0) + 1;
      packageCounts[pkg] = (packageCounts[pkg] || 0) + 1;
    });

    // Top 10 publishers by count
    const topPublishers = Object.entries(publisherCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name]) => name);

    const packageNames = Object.entries(packageCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);

    // Build nodes: publishers first, then package types
    const nodes = [
      ...topPublishers.map((name) => ({ name })),
      ...packageNames.map((name) => ({ name })),
    ];

    // Build links
    const links: { source: number; target: number; value: number }[] = [];
    Object.entries(flowCounts).forEach(([key, value]) => {
      const [pub, pkg] = key.split("|||");
      const sourceIdx = topPublishers.indexOf(pub);
      if (sourceIdx === -1) return;
      const targetIdx = topPublishers.length + packageNames.indexOf(pkg);
      if (targetIdx < topPublishers.length) return;
      links.push({ source: sourceIdx, target: targetIdx, value });
    });

    return { nodes, links, publisherCount: topPublishers.length };
  }, [titles]);

  if (sankeyData.links.length === 0) return null;

  const CustomNode = ({ x, y, width, height, index, payload }: any) => {
    const isPublisher = index < sankeyData.publisherCount;
    const colorIdx = isPublisher ? index : index - sankeyData.publisherCount;
    const fill = SANKEY_COLORS[colorIdx % SANKEY_COLORS.length];
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill={fill} fillOpacity={0.85} rx={2} />
        <text
          x={isPublisher ? x - 6 : x + width + 6}
          y={y + height / 2}
          textAnchor={isPublisher ? "end" : "start"}
          dominantBaseline="central"
          className="text-[11px]"
          fill="hsl(210, 10%, 88%)"
        >
          {payload.name}
        </text>
      </g>
    );
  };

  const CustomLink = (props: any) => {
    const { sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth } = props;
    return (
      <path
        d={`
          M${sourceX},${sourceY + linkWidth / 2}
          C${sourceControlX},${sourceY + linkWidth / 2}
            ${targetControlX},${targetY + linkWidth / 2}
            ${targetX},${targetY + linkWidth / 2}
          L${targetX},${targetY - linkWidth / 2}
          C${targetControlX},${targetY - linkWidth / 2}
            ${sourceControlX},${sourceY - linkWidth / 2}
            ${sourceX},${sourceY - linkWidth / 2}
          Z
        `}
        fill="hsl(145, 100%, 44%)"
        fillOpacity={0.15}
        stroke="hsl(145, 100%, 44%)"
        strokeOpacity={0.3}
        strokeWidth={0.5}
      />
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-gold" />
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Publisher → Package Type
        </h3>
        <span className="text-xs text-muted-foreground ml-auto">Top 10 publishers · top-level titles only</span>
      </div>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={sankeyData}
            nodeWidth={10}
            nodePadding={14}
            margin={{ top: 10, right: 120, bottom: 10, left: 120 }}
            link={<CustomLink />}
            node={<CustomNode />}
          >
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(210, 18%, 11%)',
                border: '1px solid hsl(210, 14%, 20%)',
                borderRadius: 8,
                color: 'hsl(210, 10%, 88%)',
                zIndex: 50,
              }}
              wrapperStyle={{ zIndex: 50 }}
              formatter={(value: number, name: string) => [`${value} title${value !== 1 ? 's' : ''}`, name]}
              labelStyle={{ color: 'hsl(210, 10%, 88%)', fontWeight: 600 }}
              itemStyle={{ color: 'hsl(210, 10%, 88%)' }}
            />
          </Sankey>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const Stats = () => {
  const { data: allTitles, isLoading } = useTitles();
  useLetterboxdSync(allTitles);

  const stats = useMemo(() => {
    if (!allTitles || allTitles.length === 0) return null;

    const parentIds = new Set(allTitles.filter((t) => t.parent_id).map((t) => t.parent_id));
    const leafTitles = allTitles.filter((t) => t.parent_id || !parentIds.has(t.id));
    const parents = allTitles.filter((t) => !t.parent_id);
    const totalDiscs = leafTitles.length;
    const totalCollections = parents.length;
    const watchedCount = leafTitles.filter((t) => (t as any).watched).length;
    const watchedPercent = totalDiscs > 0 ? Math.round((watchedCount / totalDiscs) * 100) : 0;

    const directors = computeBreakdown(
      leafTitles.flatMap((t) =>
        t.director ? t.director.split(/,\s*/).map((d) => d.trim()).filter(Boolean) : []
      )
    );
    const videoQualities = computeBreakdown(leafTitles.map((t) => t.video_quality));
    const audioTypes = computeBreakdown(leafTitles.map((t) => t.audio_type));
    const packageTypes = computeBreakdown(parents.map((t) => t.package_type));
    const publishers = computeBreakdown(parents.map((t) => t.publisher));
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

    const withYear = leafTitles.filter((t) => t.year != null);
    const oldest = withYear.length ? withYear.reduce((a, b) => (a.year! < b.year! ? a : b)) : null;
    const newest = withYear.length ? withYear.reduce((a, b) => (a.year! > b.year! ? a : b)) : null;

    const withRuntime = leafTitles.filter((t) => t.runtime != null && t.runtime > 0);
    const longest = withRuntime.length ? withRuntime.reduce((a, b) => (a.runtime! > b.runtime! ? a : b)) : null;
    const shortest = withRuntime.length ? withRuntime.reduce((a, b) => (a.runtime! < b.runtime! ? a : b)) : null;

    return {
      totalDiscs,
      totalCollections,
      uniqueDirectors,
      watchedCount,
      watchedPercent,
      directors,
      videoQualities,
      audioTypes,
      packageTypes,
      publishers,
      regions,
      mediaTypes,
      hdrTypes,
      decades,
      oldest,
      newest,
      longest,
      shortest,
    };
  }, [allTitles]);

  return (
    <>
        <PageMeta
          title="Thamara's Physical Media Vault - Stats"
          description="Collection statistics and breakdown."
          path="/stats"
        />
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Collection <span className="text-gold">Stats</span>
        </h1>
        <p className="text-muted-foreground mb-8">A statistical breakdown of currently owned titles</p>

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Loading...</div>
        ) : !stats ? (
          <div className="text-center py-20 text-muted-foreground">No titles in your collection yet.</div>
        ) : (
          <div className="space-y-8">
            {/* Headline numbers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <HeadlineStat label="Total Discs" value={stats.totalDiscs} icon={Disc3} />
              <HeadlineStat label="Top-Level Titles" value={stats.totalCollections} icon={BarChart3} />
              <HeadlineStat label="Unique Directors" value={stats.uniqueDirectors} icon={Award} />
              <HeadlineStat
                label="Watched"
                value={`${stats.watchedPercent}%`}
                icon={Eye}
                sublabel={`${stats.watchedCount} of ${stats.totalDiscs}`}
              />
            </div>

            {/* Decade chart */}
            {stats.decades.length > 0 && (
              <div className="space-y-4">
                <DecadeChart data={stats.decades} />
                {(stats.oldest || stats.newest) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {stats.oldest && (
                      <div className="bg-card border border-border rounded-lg p-5 flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">Oldest Title</span>
                          <p className="text-foreground font-display text-lg leading-tight mt-1">{stats.oldest.title}</p>
                          <span className="text-sm text-muted-foreground">{stats.oldest.year}</span>
                        </div>
                      </div>
                    )}
                    {stats.newest && (
                      <div className="bg-card border border-border rounded-lg p-5 flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">Newest Title</span>
                          <p className="text-foreground font-display text-lg leading-tight mt-1">{stats.newest.title}</p>
                          <span className="text-sm text-muted-foreground">{stats.newest.year}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Runtime extremes */}
            {(stats.longest || stats.shortest) && (
              <div className="bg-card border border-border rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-gold" />
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Runtime Extremes</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {stats.longest && (
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Longest</span>
                      <p className="text-foreground font-display text-lg leading-tight mt-1">{stats.longest.title}</p>
                      <span className="text-sm text-muted-foreground">
                        {Math.floor(stats.longest.runtime! / 60)}h {stats.longest.runtime! % 60}m ({stats.longest.runtime} min)
                      </span>
                    </div>
                  )}
                  {stats.shortest && (
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Shortest</span>
                      <p className="text-foreground font-display text-lg leading-tight mt-1">{stats.shortest.title}</p>
                      <span className="text-sm text-muted-foreground">
                        {stats.shortest.runtime! >= 60
                          ? `${Math.floor(stats.shortest.runtime! / 60)}h ${stats.shortest.runtime! % 60}m (${stats.shortest.runtime} min)`
                          : `${stats.shortest.runtime} min`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Director tiles */}
            {stats.directors.length > 0 && (
              <DirectorTiles items={stats.directors.filter((d) => d.count >= 2)} />
            )}

            {/* Video & Audio combined */}
            <AVTabs videoData={stats.videoQualities} audioData={stats.audioTypes} hdrData={stats.hdrTypes} />

            {/* Publisher → Package Sankey */}
            {(stats.publishers.length > 0 || stats.packageTypes.length > 0) && (
              <PublisherPackageSankey titles={allTitles?.filter((t) => !t.parent_id) ?? []} />
            )}

            {/* Detailed breakdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard title="Disc Region" icon={MapPin} items={stats.regions} renderItemIcon={(label) => <RegionIcon region={label} />} />
              <StatCard title="Media Type" icon={Film} items={stats.mediaTypes} />
            </div>
          </div>
        )}
    </>
  );
};

export default Stats;
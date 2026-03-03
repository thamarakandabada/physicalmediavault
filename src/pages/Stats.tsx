import { useMemo } from "react";
import { useTitles } from "@/hooks/useTitles";
import { AppHeader } from "@/components/AppHeader";
import { Film, Monitor, Volume2, Package, Building2, MapPin, Award, BarChart3, Disc3 } from "lucide-react";

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

function HeadlineStat({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
  return (
    <div className="bg-card border border-border rounded-lg p-5 flex flex-col items-center text-center gap-2">
      <Icon className="w-5 h-5 text-gold" />
      <span className="text-3xl font-display text-foreground tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
}

const Stats = () => {
  const { data: allTitles, isLoading } = useTitles();

  const stats = useMemo(() => {
    if (!allTitles || allTitles.length === 0) return null;

    const parents = allTitles.filter((t) => !t.parent_id);
    const totalDiscs = allTitles.length;
    const totalCollections = parents.length;

    const directors = computeBreakdown(
      allTitles.flatMap((t) =>
        t.director ? t.director.split(/,\s*/).map((d) => d.trim()).filter(Boolean) : []
      )
    );
    const videoQualities = computeBreakdown(allTitles.map((t) => t.video_quality));
    const audioTypes = computeBreakdown(allTitles.map((t) => t.audio_type));
    const packageTypes = computeBreakdown(allTitles.map((t) => t.package_type));
    const publishers = computeBreakdown(allTitles.map((t) => t.publisher));
    const regions = computeBreakdown(allTitles.map((t) => t.region));
    const mediaTypes = computeBreakdown(allTitles.map((t) => t.media_type));
    const hdrTypes = computeBreakdown(allTitles.map((t) => t.hdr_type));

    const years = allTitles.map((t) => t.year).filter(Boolean) as number[];
    const decades = computeBreakdown(
      years.map((y) => `${Math.floor(y / 10) * 10}s`)
    );

    const uniqueDirectors = new Set(
      allTitles.flatMap((t) =>
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
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-8">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <HeadlineStat label="Total Discs" value={stats.totalDiscs} icon={Disc3} />
              <HeadlineStat label="Top-Level Titles" value={stats.totalCollections} icon={BarChart3} />
              <HeadlineStat label="Unique Directors" value={stats.uniqueDirectors} icon={Award} />
            </div>

            {/* Detailed breakdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard title="Top Directors" icon={Film} items={stats.directors.slice(0, 8)} />
              <StatCard title="Video Quality" icon={Monitor} items={stats.videoQualities} />
              <StatCard title="Audio Format" icon={Volume2} items={stats.audioTypes} />
              <StatCard title="HDR Type" icon={Monitor} items={stats.hdrTypes} />
              <StatCard title="Package Type" icon={Package} items={stats.packageTypes} />
              <StatCard title="Publisher" icon={Building2} items={stats.publishers.slice(0, 8)} />
              <StatCard title="Region" icon={MapPin} items={stats.regions} />
              <StatCard title="Media Type" icon={Film} items={stats.mediaTypes} />
              <StatCard title="Decade" icon={BarChart3} items={stats.decades} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Stats;

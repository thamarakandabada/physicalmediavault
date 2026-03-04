import { useState } from "react";
import { useTitlesGrouped } from "@/hooks/useTitles";

import { MediaBadge, MEDIA_TYPES } from "@/components/MediaBadge";
import { MetadataTag } from "@/components/MetadataTag";
import { sortableTitle } from "@/lib/utils";

const FILTER_TABS = ["All", ...MEDIA_TYPES];

const Alphabetical = () => {
  const { data: titles, isLoading } = useTitlesGrouped();
  const [activeFilter, setActiveFilter] = useState("All");

  // Only parent titles, sorted alphabetically (ignoring leading articles)
  const sorted = [...titles].sort((a, b) =>
    sortableTitle(a.title).localeCompare(sortableTitle(b.title), undefined, { sensitivity: "base" })
  );

  const allTitles = activeFilter === "All"
    ? sorted
    : sorted.filter((t) => t.media_type === activeFilter);

  // Group by first letter of sortable title
  const grouped = allTitles.reduce<Record<string, typeof allTitles>>((acc, t) => {
    const st = sortableTitle(t.title);
    const letter = st[0]?.toUpperCase().match(/[A-Z]/) ? st[0].toUpperCase() : "#";
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(t);
    return acc;
  }, {});

  const letters = Object.keys(grouped).sort();

  return (
    <div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Alphabetical <span className="text-gold">Index</span>
        </h1>
        <p className="text-muted-foreground mb-8">My shelves are currently organised in alphabetical order. Criterion titles are sorted on their own shelf, in ascending order of spine number.</p>

        {/* Media type filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeFilter === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {tab === "Film Collection" ? "Collection" : tab}
            </button>
          ))}
        </div>

        {/* Letter nav */}
        <div className="flex flex-wrap gap-1 mb-8">
          {letters.map((letter) => (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="w-8 h-8 flex items-center justify-center rounded text-sm font-mono text-muted-foreground hover:text-gold hover:bg-secondary transition-colors"
            >
              {letter}
            </a>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-8 max-w-3xl">
            {letters.map((letter) => (
              <div key={letter} id={`letter-${letter}`}>
                <h2 className="font-display text-2xl font-bold text-gold mb-3 sticky top-16 bg-background/90 backdrop-blur-sm py-2 z-10">
                  {letter}
                </h2>
                <div className="space-y-1">
                  {grouped[letter].map((t) => (
                    <div key={t.id} className="flex items-center gap-4 py-2 px-3 rounded-md hover:bg-secondary/50 transition-colors">
                      <MediaBadge type={t.media_type} className="shrink-0" />
                      <span className="font-medium text-foreground flex-1 truncate">{t.title}</span>
                      <span className="text-sm text-muted-foreground w-12 text-right tabular-nums">{t.year}</span>
                      <span className="text-sm text-muted-foreground w-40 truncate hidden sm:block">{t.director}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default Alphabetical;

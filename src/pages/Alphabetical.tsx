import { useTitlesGrouped } from "@/hooks/useTitles";
import { AppHeader } from "@/components/AppHeader";
import { MediaBadge } from "@/components/MediaBadge";
import { MetadataTag } from "@/components/MetadataTag";

const Alphabetical = () => {
  const { data: titles, isLoading } = useTitlesGrouped();

  // Flatten all titles (parents + children) and sort alphabetically
  const allTitles = titles.flatMap((t) => [t, ...t.children]).sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
  );

  // Group by first letter
  const grouped = allTitles.reduce<Record<string, typeof allTitles>>((acc, t) => {
    const letter = t.title[0]?.toUpperCase().match(/[A-Z]/) ? t.title[0].toUpperCase() : "#";
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(t);
    return acc;
  }, {});

  const letters = Object.keys(grouped).sort();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Alphabetical <span className="text-gold">Index</span>
        </h1>
        <p className="text-muted-foreground mb-8">Organise your shelves — {allTitles.length} titles</p>

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
                      <MediaBadge type={t.media_type} />
                      <span className="font-medium text-foreground flex-1 truncate">{t.title}</span>
                      <span className="text-sm text-muted-foreground shrink-0">{t.year}</span>
                      <span className="text-sm text-muted-foreground shrink-0 hidden sm:block">{t.director}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Alphabetical;

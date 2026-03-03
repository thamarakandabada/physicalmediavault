import { useTitlesGrouped } from "@/hooks/useTitles";

import { MetadataTag } from "@/components/MetadataTag";

const Criterion = () => {
  const { data: titles, isLoading } = useTitlesGrouped();

  // Get all titles with spine numbers, flatten children too
  const criterionTitles = titles
    .flatMap((t) => [t, ...t.children])
    .filter((t) => t.spine_number != null)
    .sort((a, b) => (a.spine_number ?? 0) - (b.spine_number ?? 0));

  return (
    <>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Criterion <span className="text-gold">Collection</span>
        </h1>
        <p className="text-muted-foreground mb-8">
          Sorted by spine number — {criterionTitles.length} titles
        </p>

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Loading...</div>
        ) : criterionTitles.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No Criterion titles yet. Add titles with spine numbers to see them here.
          </div>
        ) : (
          <div className="max-w-3xl">
            {/* Desktop header */}
            <div className="hidden sm:grid grid-cols-[60px_1fr_80px_1fr] gap-x-4 items-center text-xs uppercase tracking-widest text-muted-foreground mb-3 px-3">
              <span>Spine</span>
              <span>Title</span>
              <span>Year</span>
              <span>Director</span>
            </div>
            <div className="space-y-1">
              {criterionTitles.map((t) => (
                <div
                  key={t.id}
                  className="py-3 px-3 rounded-md hover:bg-secondary/50 transition-colors border-b border-border/50"
                >
                  {/* Desktop row */}
                  <div className="hidden sm:grid grid-cols-[60px_1fr_80px_1fr] gap-x-4 items-center">
                    <span className="font-mono text-gold font-bold">#{t.spine_number}</span>
                    <span className="font-medium text-foreground truncate">{t.title}</span>
                    <span className="text-sm text-muted-foreground">{t.year}</span>
                    <span className="text-sm text-muted-foreground truncate">{t.director}</span>
                  </div>
                  {/* Mobile row */}
                  <div className="sm:hidden flex items-start gap-3">
                    <span className="font-mono text-gold font-bold shrink-0 w-14">#{t.spine_number}</span>
                    <div className="min-w-0">
                      <span className="font-medium text-foreground block">{t.title}</span>
                      <span className="text-sm text-muted-foreground">
                        {t.year}{t.year && t.director ? " · " : ""}{t.director}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </>
  );
};

export default Criterion;

import { useState, useMemo, useEffect, useCallback } from "react";
import { useTitles, type Title } from "@/hooks/useTitles";
import { PageMeta } from "@/components/PageMeta";
import { TitleCard } from "@/components/TitleCard";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TitleWithChildren } from "@/hooks/useTitles";

const Oracle = () => {
  const { data: allTitles, isLoading } = useTitles();

  const [maxRuntime, setMaxRuntime] = useState(180);
  const [fourKOnly, setFourKOnly] = useState(false);

  const [pool, setPool] = useState<Title[]>([]);
  const [result, setResult] = useState<Title | null>(null);
  const [phase, setPhase] = useState<"idle" | "shuffling" | "revealed">("idle");
  const [shuffleTitle, setShuffleTitle] = useState<Title | null>(null);

  // Build eligible pool: films + children of film collections, exclude TV/docs/concerts
  const eligible = useMemo(() => {
    if (!allTitles) return [];
    const films: Title[] = [];

    for (const t of allTitles) {
      // Include standalone films
      if (t.media_type === "Film" && !t.parent_id) {
        films.push(t);
      }
      // Include children of film collections (individual films inside a collection)
      if (t.parent_id) {
        const parent = allTitles.find((p) => p.id === t.parent_id);
        if (parent?.media_type === "Film Collection") {
          films.push(t);
        }
      }
    }

    return films.filter((t) => {
      if (fourKOnly && t.video_quality !== "4K") return false;
      if (t.runtime && t.runtime > maxRuntime) return false;
      return true;
    });
  }, [allTitles, maxRuntime, fourKOnly]);

  const pickRandom = useCallback(
    (exclude?: string) => {
      const candidates = exclude ? eligible.filter((t) => t.id !== exclude) : eligible;
      if (candidates.length === 0) return null;
      return candidates[Math.floor(Math.random() * candidates.length)];
    },
    [eligible]
  );

  const consult = () => {
    if (eligible.length === 0) return;
    setPhase("shuffling");
    setResult(null);

    // Rapid shuffle effect
    let count = 0;
    const interval = setInterval(() => {
      setShuffleTitle(eligible[Math.floor(Math.random() * eligible.length)]);
      count++;
      if (count >= 12) {
        clearInterval(interval);
        const picked = pickRandom();
        setResult(picked);
        setPhase("revealed");
      }
    }, 120);
  };

  const veto = () => {
    if (!result || eligible.length <= 1) return;
    const next = pickRandom(result.id);
    setResult(next);
  };

  const reset = () => {
    setResult(null);
    setPhase("idle");
    setShuffleTitle(null);
  };

  // Wrap result as TitleWithChildren for TitleCard
  const resultCard: TitleWithChildren | null = result
    ? { ...result, children: [] }
    : null;

  const shuffleCard: TitleWithChildren | null = shuffleTitle
    ? { ...shuffleTitle, children: [] }
    : null;

  return (
    <>
      <PageMeta
        title="The Oracle — Physical Media Vault"
        description="Let The Oracle choose what to watch from your physical media collection."
        path="/oracle"
      />

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-2 inline-flex items-center justify-center w-full gap-3">
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-gold" />
            <span>
              Consult <span className="text-gold">The Oracle</span>
            </span>
          </h1>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            Can't decide what to watch? Let fate choose for you.
          </p>
        </div>

        {/* Filters */}
        {phase === "idle" && (
          <div className="bg-card border border-border rounded-md p-6 mb-8 space-y-6 animate-fade-in">
            {/* Runtime slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground">
                  Time Available
                </Label>
                <span className="text-sm font-mono text-gold">{maxRuntime} min</span>
              </div>
              <Slider
                min={60}
                max={300}
                step={5}
                value={[maxRuntime]}
                onValueChange={([v]) => setMaxRuntime(v)}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 hr</span>
                <span>5 hrs</span>
              </div>
            </div>

            {/* 4K toggle */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">
                4K Titles Only
              </Label>
              <Switch checked={fourKOnly} onCheckedChange={setFourKOnly} />
            </div>

            {/* Pool count */}
            <p className="text-xs text-muted-foreground text-center">
              {eligible.length} {eligible.length === 1 ? "film" : "films"} in the pool
            </p>

            {/* Consult button */}
            <Button
              onClick={consult}
              disabled={eligible.length === 0 || isLoading}
              className="w-full h-12 text-base font-semibold gold-glow"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Consult the Oracle
            </Button>
          </div>
        )}

        {/* Shuffling state */}
        {phase === "shuffling" && shuffleCard && (
          <div className="animate-pulse">
            <div className="opacity-50 pointer-events-none">
              <TitleCard title={shuffleCard} />
            </div>
          </div>
        )}

        {/* Revealed result */}
        {phase === "revealed" && resultCard && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center text-sm text-muted-foreground mb-2">
              The Oracle has spoken:
            </div>
            <TitleCard title={resultCard} />

            <div className="flex items-center justify-center gap-4">
              <Button onClick={reset} className="gap-2">
                <Check className="w-4 h-4" />
                Accept
              </Button>
              <Button
                variant="outline"
                onClick={veto}
                disabled={eligible.length <= 1}
                className="gap-2 border-gold-dim text-gold hover:bg-secondary"
              >
                <RotateCcw className="w-4 h-4" />
                Veto
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Oracle;

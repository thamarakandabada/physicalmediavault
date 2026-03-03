import { useState, useMemo } from "react";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { useTitles } from "@/hooks/useTitles";
import { useWishlist, useAddWishlistItem, useTogglePurchased, useDeleteWishlistItem } from "@/hooks/useWishlist";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Trash2, ExternalLink, Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

function findSimilarTitles(wishlistTitle: string, collectionTitles: string[]): string[] {
  if (!wishlistTitle) return [];
  const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const norm = normalise(wishlistTitle);
  return collectionTitles.filter((t) => {
    const nt = normalise(t);
    return nt.includes(norm) || norm.includes(nt) || levenshteinClose(norm, nt);
  });
}

function levenshteinClose(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 3) return false;
  let dist = 0;
  const maxLen = Math.max(a.length, b.length);
  for (let i = 0; i < maxLen; i++) {
    if (a[i] !== b[i]) dist++;
    if (dist > 3) return false;
  }
  return dist <= 3;
}

const Wishlist = () => {
  const { user } = useAuth();
  const { data: titles } = useTitles();
  const { data: wishlist, isLoading } = useWishlist();
  const addItem = useAddWishlistItem();
  const togglePurchased = useTogglePurchased();
  const deleteItem = useDeleteWishlistItem();

  const [url, setUrl] = useState("");
  const [scraping, setScraping] = useState(false);

  const collectionTitleNames = useMemo(
    () => (titles || []).map((t) => t.title),
    [titles]
  );

  const handleAdd = async () => {
    if (!user) {
      toast.error("Please log in to add wishlist items");
      return;
    }
    const trimmed = url.trim();
    if (!trimmed) return;

    // Check for duplicate URL
    if (wishlist?.some((w) => w.url === trimmed)) {
      toast.error("This URL is already in your wishlist");
      return;
    }

    setScraping(true);
    try {
      const { data, error } = await supabase.functions.invoke("scrape-wishlist-url", {
        body: { url: trimmed },
      });

      if (error) throw error;

      const scraped = data?.data || {};
      const title = scraped.title || null;
      const price = scraped.price || null;
      const retailer = scraped.retailer || null;
      const image_url = scraped.image_url || null;

      await addItem.mutateAsync({
        user_id: user.id,
        url: trimmed,
        title,
        price,
        retailer,
        image_url,
      });

      // Check for similar titles in collection
      if (title) {
        const similar = findSimilarTitles(title, collectionTitleNames);
        if (similar.length > 0) {
          toast.warning(
            `Heads up — you may already own "${similar[0]}" in your collection`,
            { duration: 6000 }
          );
        } else {
          toast.success("Added to wishlist");
        }
      } else {
        toast.success("Added to wishlist");
      }

      setUrl("");
    } catch (err: any) {
      console.error("Wishlist add error:", err);
      // Still add with just the URL if scraping fails
      try {
        await addItem.mutateAsync({
          user_id: user.id,
          url: trimmed,
        });
        toast.info("Added to wishlist (couldn't fetch details)");
        setUrl("");
      } catch {
        toast.error("Failed to add to wishlist");
      }
    } finally {
      setScraping(false);
    }
  };

  const activeItems = useMemo(
    () => (wishlist || []).filter((w) => !w.purchased),
    [wishlist]
  );
  const purchasedItems = useMemo(
    () => (wishlist || []).filter((w) => w.purchased),
    [wishlist]
  );

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          <span className="text-gold">Wishlist</span>
        </h1>
        <p className="text-muted-foreground mb-8">
          Paste retailer links to track titles you want to pick up
        </p>

        {/* URL input */}
        {user && (
          <div className="flex gap-2 mb-8 max-w-2xl">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a link from HMV, Zavvi, Arrow, Amazon…"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
              disabled={scraping}
            />
            <Button onClick={handleAdd} disabled={scraping || !url.trim()}>
              {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Loading...</div>
        ) : !wishlist || wishlist.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            {user ? "Your wishlist is empty — paste a link above to get started." : "Log in to manage your wishlist."}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active items */}
            {activeItems.length > 0 && (
              <div className="space-y-2">
                {activeItems.map((item) => (
                  <WishlistCard
                    key={item.id}
                    item={item}
                    collectionTitles={collectionTitleNames}
                    onToggle={() => togglePurchased.mutate({ id: item.id, purchased: true })}
                    onDelete={() => deleteItem.mutate(item.id)}
                    isOwner={!!user}
                  />
                ))}
              </div>
            )}

            {/* Purchased items */}
            {purchasedItems.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Purchased ({purchasedItems.length})
                </h2>
                <div className="space-y-2">
                  {purchasedItems.map((item) => (
                    <WishlistCard
                      key={item.id}
                      item={item}
                      collectionTitles={collectionTitleNames}
                      onToggle={() => togglePurchased.mutate({ id: item.id, purchased: false })}
                      onDelete={() => deleteItem.mutate(item.id)}
                      isOwner={!!user}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

function WishlistCard({
  item,
  collectionTitles,
  onToggle,
  onDelete,
  isOwner,
}: {
  item: ReturnType<typeof useWishlist>["data"] extends (infer T)[] | undefined ? T : never;
  collectionTitles: string[];
  onToggle: () => void;
  onDelete: () => void;
  isOwner: boolean;
}) {
  const similar = useMemo(
    () => (item.title ? findSimilarTitles(item.title, collectionTitles) : []),
    [item.title, collectionTitles]
  );

  return (
    <div
      className={cn(
        "group bg-card border border-border rounded-md p-4 transition-all duration-500 flex items-start gap-4",
        item.purchased && "opacity-40"
      )}
    >
      {/* Image */}
      {item.image_url && (
        <img
          src={item.image_url}
          alt={item.title || ""}
          className="w-14 h-20 rounded object-cover shrink-0 shadow-sm"
          loading="lazy"
        />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          {item.retailer && (
            <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
              {item.retailer}
            </span>
          )}
          {item.price && (
            <span className="text-sm font-mono text-gold">{item.price}</span>
          )}
        </div>
        <h3
          className={cn(
            "font-display text-base font-semibold text-foreground truncate",
            item.purchased && "line-through"
          )}
        >
          {item.title || item.url}
        </h3>
        {!item.title && (
          <p className="text-xs text-muted-foreground truncate">{item.url}</p>
        )}

        {/* Similarity warning */}
        {similar.length > 0 && !item.purchased && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-destructive/80">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>
              Similar to <span className="font-medium">"{similar[0]}"</span> in your collection
            </span>
          </div>
        )}
      </div>

      {isOwner && (
        <div className="flex items-center gap-1 shrink-0">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={onToggle}
            className={cn(
              "p-2 rounded-md transition-colors",
              item.purchased
                ? "text-gold hover:text-foreground"
                : "text-muted-foreground hover:text-gold"
            )}
            title={item.purchased ? "Mark as not purchased" : "Mark as purchased"}
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-md text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default Wishlist;

import { useState, useMemo } from "react";
import { PageMeta } from "@/components/PageMeta";
import { useAuth } from "@/hooks/useAuth";
import { useTitles } from "@/hooks/useTitles";
import { useWishlist, useAddWishlistItem, useTogglePurchased, useDeleteWishlistItem } from "@/hooks/useWishlist";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Trash2, ExternalLink, Check, AlertTriangle, Download } from "lucide-react";
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
        body: { url: trimmed }
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
        image_url
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
          url: trimmed
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
    <>
        <PageMeta
          title="Thamara's Physical Media Vault - Wishlist"
          description="Titles I want to pick up in the near future."
          path="/wishlist"
        />
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          <span className="text-gold">Wishlist</span>
        </h1>
        <p className="text-muted-foreground mb-8">Titles I want to pick up in the near future

        </p>

        {/* URL input */}
        {user &&
        <div className="flex gap-2 mb-8 max-w-2xl">
            <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a link from HMV, Zavvi, Arrow, Amazon…"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
            disabled={scraping} />
          
            <Button onClick={handleAdd} disabled={scraping || !url.trim()}>
              {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const items = wishlist || [];
                const rows = items.map((w) => ({
                  title: w.title ?? "",
                  url: w.url,
                  price: w.price ?? "",
                  retailer: w.retailer ?? "",
                  purchased: w.purchased ? "Yes" : "No",
                }));
                const headers = Object.keys(rows[0] || {});
                const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => `"${String((r as any)[h]).replace(/"/g, '""')}"`).join(","))].join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "wishlist.csv";
                a.click();
                toast.success("Wishlist exported");
              }}
              title="Export wishlist as CSV"
              disabled={!wishlist || wishlist.length === 0}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        }

        {isLoading ?
        <div className="text-center py-20 text-muted-foreground">Loading...</div> :
        !wishlist || wishlist.length === 0 ?
        <div className="text-center py-20 text-muted-foreground">
            {user ? "Your wishlist is empty — paste a link above to get started." : "Log in to manage your wishlist."}
          </div> :

        <div className="space-y-8">
            {/* Active items */}
            {activeItems.length > 0 &&
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-3">
                {activeItems.map((item) =>
            <WishlistCard
              key={item.id}
              item={item}
              collectionTitles={collectionTitleNames}
              wishlistItems={activeItems}
              onToggle={() => togglePurchased.mutate({ id: item.id, purchased: true })}
              onDelete={() => deleteItem.mutate(item.id)}
              isOwner={!!user} />

            )}
              </div>
          }

            {/* Purchased items */}
            {purchasedItems.length > 0 &&
          <div>
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Purchased ({purchasedItems.length})
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-3">
                  {purchasedItems.map((item) =>
              <WishlistCard
                key={item.id}
                item={item}
                collectionTitles={collectionTitleNames}
                wishlistItems={activeItems}
                onToggle={() => togglePurchased.mutate({ id: item.id, purchased: false })}
                onDelete={() => deleteItem.mutate(item.id)}
                isOwner={!!user} />

              )}
                </div>
              </div>
          }
          </div>
        }
    </>);

};

function WishlistCard({
  item,
  collectionTitles,
  wishlistItems,
  onToggle,
  onDelete,
  isOwner







}: {item: ReturnType<typeof useWishlist>["data"] extends (infer T)[] | undefined ? T : never;collectionTitles: string[];wishlistItems: ReturnType<typeof useWishlist>["data"] extends (infer T)[] | undefined ? T[] : never;onToggle: () => void;onDelete: () => void;isOwner: boolean;}) {
  const collectionMatch = useMemo(
    () => item.title ? findSimilarTitles(item.title, collectionTitles) : [],
    [item.title, collectionTitles]
  );

  const wishlistDupes = useMemo(() => {
    if (!item.title) return [];
    return wishlistItems.
    filter((w) => w.id !== item.id && w.title).
    filter((w) => {
      const similar = findSimilarTitles(item.title!, [w.title!]);
      return similar.length > 0;
    }).
    map((w) => w.title!);
  }, [item.id, item.title, wishlistItems]);

  return (
    <div
      className={cn(
        "group bg-card border border-border rounded-md overflow-hidden transition-all duration-500 flex flex-col",
        item.purchased && "opacity-40"
      )}>
      
      {/* Image */}
      {item.image_url ?
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="block">
          <img
          src={item.image_url}
          alt={item.title || ""}
          className="w-full aspect-[3/4] object-contain bg-secondary"
          loading="lazy" />
        
        </a> :

      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full aspect-[3/4] bg-secondary flex items-center justify-center">
        
          <ExternalLink className="w-6 h-6 text-muted-foreground" />
        </a>
      }

      <div className="p-2.5 flex-1 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          {item.retailer &&
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
              {item.retailer}
            </span>
          }
          {item.price &&
          <span className="text-xs font-mono text-gold">{item.price}</span>
          }
        </div>

        <h3
          className={cn(
            "font-display text-xs font-semibold text-foreground line-clamp-2 leading-tight",
            item.purchased && "line-through"
          )}>
          
          {item.title || "Untitled"}
        </h3>

        {/* Warnings — owner only */}
        {isOwner && !item.purchased && collectionMatch.length > 0 &&
        <div className="flex items-start gap-1 text-[10px] text-destructive/80 leading-tight">
            <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
            <span>Already own "{collectionMatch[0]}"</span>
          </div>
        }
        {isOwner && !item.purchased && wishlistDupes.length > 0 &&
        <div className="flex items-start gap-1 text-[10px] text-muted-foreground leading-tight">
            <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
            <span>Also in wishlist as "{wishlistDupes[0]}"</span>
          </div>
        }

        {/* Actions */}
        {isOwner &&
        <div className="flex items-center gap-1 mt-auto pt-1.5 border-t border-border">
            <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors">
            
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
            onClick={onToggle}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              item.purchased ?
              "text-gold hover:text-foreground" :
              "text-muted-foreground hover:text-gold"
            )}
            title={item.purchased ? "Mark as not purchased" : "Mark as purchased"}>
            
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
            onClick={onDelete}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 ml-auto">
            
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        }
      </div>
    </div>);

}

export default Wishlist;
import { useState, useMemo } from "react";
import { useTitlesGrouped, useDeleteTitle, type TitleWithChildren, type Title } from "@/hooks/useTitles";
import { useAuth } from "@/hooks/useAuth";

import { TitleCard } from "@/components/TitleCard";
import { TitleFormDialog } from "@/components/TitleFormDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Disc3, SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import { sortableTitle } from "@/lib/utils";

type SortOption = "title-asc" | "title-desc" | "year-asc" | "year-desc" | "newest" | "oldest";

const Index = () => {
  const { user } = useAuth();
  const { data: titles, isLoading } = useTitlesGrouped();
  const deleteTitle = useDeleteTitle();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTitle, setEditTitle] = useState<Title | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filterPublisher, setFilterPublisher] = useState<string>("all");
  const [filterVideoQuality, setFilterVideoQuality] = useState<string>("all");
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const [filterPackage, setFilterPackage] = useState<string>("all");
  const [filterMediaType, setFilterMediaType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("title-asc");

  // Derive unique filter options from the data
  const filterOptions = useMemo(() => {
    const publishers = new Set<string>();
    const videoQualities = new Set<string>();
    const regions = new Set<string>();
    const packages = new Set<string>();

    titles.forEach((t) => {
      if (t.publisher) publishers.add(t.publisher);
      if (t.video_quality) videoQualities.add(t.video_quality);
      if (t.region) regions.add(t.region);
      if (t.package_type) packages.add(t.package_type);
    });

    return {
      publishers: Array.from(publishers).sort(),
      videoQualities: Array.from(videoQualities).sort(),
      regions: Array.from(regions).sort(),
      packages: Array.from(packages).sort(),
    };
  }, [titles]);

  const activeFilterCount = [filterPublisher, filterVideoQuality, filterRegion, filterPackage, filterMediaType]
    .filter((f) => f !== "all").length;

  const clearFilters = () => {
    setFilterPublisher("all");
    setFilterVideoQuality("all");
    setFilterRegion("all");
    setFilterPackage("all");
    setFilterMediaType("all");
  };

  const filtered = useMemo(() => {
    let result = titles.filter((t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.director?.toLowerCase().includes(search.toLowerCase()) ||
      t.publisher?.toLowerCase().includes(search.toLowerCase())
    );

    if (filterPublisher !== "all") result = result.filter((t) => t.publisher === filterPublisher);
    if (filterVideoQuality !== "all") result = result.filter((t) => t.video_quality === filterVideoQuality);
    if (filterRegion !== "all") result = result.filter((t) => t.region === filterRegion);
    if (filterPackage !== "all") result = result.filter((t) => t.package_type === filterPackage);
    if (filterMediaType !== "all") result = result.filter((t) => t.media_type === filterMediaType);

    // Sort
    result = [...result].sort((a, b) => {
      const sa = sortableTitle(a.title), sb = sortableTitle(b.title);
      switch (sortBy) {
        case "title-asc": return sa.localeCompare(sb);
        case "title-desc": return sb.localeCompare(sa);
        case "year-asc": return (a.year ?? 0) - (b.year ?? 0);
        case "year-desc": return (b.year ?? 0) - (a.year ?? 0);
        case "newest": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest": return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default: return 0;
      }
    });

    return result;
  }, [titles, search, filterPublisher, filterVideoQuality, filterRegion, filterPackage, filterMediaType, sortBy]);

  const filmCount = titles.filter((t) => ["Film", "Film Collection", "Documentary", "Concert Film"].includes(t.media_type)).length;
  const tvCount = titles.filter((t) => t.media_type === "TV").length;
  const totalDiscs = titles.reduce((acc, t) => acc + 1 + t.children.length, 0);

  const handleEdit = (title: TitleWithChildren) => {
    setEditTitle(title);
    setParentId(title.parent_id ?? null);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTitle.mutateAsync(id);
      toast.success("Title deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleAddChild = (parentId: string) => {
    setEditTitle(null);
    setParentId(parentId);
    setFormOpen(true);
  };

  return (
    <>
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-2">
            Physical Media <span className="text-gold">Vault</span>
          </h1>
          <p className="text-muted-foreground text-base max-w-lg mx-auto">A showcase of my small but growing physical media collection. Includes both films and TV.</p>
          <div className="flex items-center justify-center gap-6 mt-5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Disc3 className="w-4 h-4 text-gold" />{totalDiscs} discs</span>
            <span className="text-border">•</span>
            <span>{filmCount} films</span>
            <span className="text-border">•</span>
            <span>{tvCount} TV</span>
          </div>
        </div>

        {/* Search + Filter Toggle + Add */}
        <div className="flex items-center gap-3 mb-4 max-w-3xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search titles, directors, publishers..."
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={activeFilterCount > 0 ? "border-gold text-gold" : ""}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-gold text-background text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
          {user && (
            <Button
              onClick={() => { setEditTitle(null); setParentId(null); setFormOpen(true); }}
              className="shrink-0"
            >
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          )}
        </div>

        {/* Filter Bar */}
        {showFilters && (
          <div className="max-w-3xl mx-auto mb-6 animate-fade-in">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">Filters & Sort</span>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-gold transition-colors flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear all
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Sort by</label>
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="title-asc">Title A–Z</SelectItem>
                      <SelectItem value="title-desc">Title Z–A</SelectItem>
                      <SelectItem value="year-desc">Year (newest)</SelectItem>
                      <SelectItem value="year-asc">Year (oldest)</SelectItem>
                      <SelectItem value="newest">Recently added</SelectItem>
                      <SelectItem value="oldest">First added</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                  <Select value={filterMediaType} onValueChange={setFilterMediaType}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="Film">Film</SelectItem>
                      <SelectItem value="Film Collection">Film Collection</SelectItem>
                      <SelectItem value="Documentary">Documentary</SelectItem>
                      <SelectItem value="Concert Film">Concert Film</SelectItem>
                      <SelectItem value="TV">TV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Video Quality</label>
                  <Select value={filterVideoQuality} onValueChange={setFilterVideoQuality}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All qualities</SelectItem>
                      {filterOptions.videoQualities.map((v) => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Region</label>
                  <Select value={filterRegion} onValueChange={setFilterRegion}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All regions</SelectItem>
                      {filterOptions.regions.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Package</label>
                  <Select value={filterPackage} onValueChange={setFilterPackage}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All packages</SelectItem>
                      {filterOptions.packages.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Publisher</label>
                  <Select value={filterPublisher} onValueChange={setFilterPublisher}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All publishers</SelectItem>
                      {filterOptions.publishers.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results count when filtered */}
        {(activeFilterCount > 0 || search) && !isLoading && (
          <div className="max-w-3xl mx-auto mb-3 text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "title" : "titles"} found
          </div>
        )}

        {/* List */}
        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Loading collection...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            {search || activeFilterCount > 0 ? "No titles match your filters." : "No titles yet. Add your first disc!"}
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl mx-auto">
            {filtered.map((title) => (
              <div key={title.id}>
                <TitleCard
                  title={title}
                  isOwner={!!user}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
                {user && (
                  <button
                    onClick={() => handleAddChild(title.id)}
                    className="ml-6 mt-1 text-xs text-muted-foreground hover:text-gold transition-colors"
                  >
                    + Add nested title
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      

      <TitleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editTitle={editTitle}
        parentId={parentId}
      />
    </>
  );
};

export default Index;

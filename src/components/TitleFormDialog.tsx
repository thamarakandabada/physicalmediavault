import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInsertTitle, useUpdateTitle, type Title, type TitleInsert } from "@/hooks/useTitles";
import { searchBluray, getBlurayDetail, type BluraySearchResult } from "@/lib/bluray-api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Search, Loader2, Link } from "lucide-react";

type TitleFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTitle?: Title | null;
  parentId?: string | null;
};

const EMPTY_FORM = {
  title: "",
  year: "",
  director: "",
  spine_number: "",
  video_quality: "",
  hdr_type: "",
  audio_type: "",
  package_type: "",
  publisher: "",
  media_type: "Film",
  region: "",
  cover_url: "",
};

export function TitleFormDialog({ open, onOpenChange, editTitle, parentId }: TitleFormDialogProps) {
  const { user } = useAuth();
  const insertTitle = useInsertTitle();
  const updateTitle = useUpdateTitle();
  const [form, setForm] = useState(EMPTY_FORM);

  // Blu-ray.com search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCountry, setSearchCountry] = useState("US");
  const [searchResults, setSearchResults] = useState<BluraySearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (editTitle) {
      setForm({
        title: editTitle.title,
        year: editTitle.year?.toString() ?? "",
        director: editTitle.director ?? "",
        spine_number: editTitle.spine_number?.toString() ?? "",
        video_quality: editTitle.video_quality ?? "",
        hdr_type: editTitle.hdr_type ?? "",
        audio_type: editTitle.audio_type ?? "",
        package_type: editTitle.package_type ?? "",
        publisher: editTitle.publisher ?? "",
        media_type: editTitle.media_type,
        region: editTitle.region ?? "",
        cover_url: (editTitle as any).cover_url ?? "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setSearchResults([]);
    setSearchQuery("");
  }, [editTitle, open]);

  const isBlurayUrl = (text: string) =>
    /^https?:\/\/(www\.)?blu-ray\.com\/movies\//i.test(text.trim());

  const handlePasteUrl = async (url: string) => {
    const trimmed = url.trim();
    if (!isBlurayUrl(trimmed)) {
      toast.error("Not a valid blu-ray.com listing URL");
      return;
    }
    setImporting(true);
    try {
      // Extract cover URL from the product page URL
      const idMatch = trimmed.match(/\/(\d+)\//);
      const coverUrl = idMatch ? `https://images.static-bluray.com/movies/covers/${idMatch[1]}_medium.jpg` : "";

      const detail = await getBlurayDetail(trimmed);
      if (detail) {
        setForm({
          title: detail.title || "",
          year: detail.year?.toString() ?? "",
          director: detail.director ?? "",
          spine_number: "",
          video_quality: detail.video_quality ?? "",
          hdr_type: detail.hdr_type ?? "",
          audio_type: detail.audio_type ?? "",
          package_type: detail.package_type ?? "",
          publisher: detail.publisher ?? "",
          media_type: detail.media_type ?? "Film",
          region: detail.region ?? "",
          cover_url: coverUrl,
        });
        toast.success("Imported from blu-ray.com — review and save");
      } else {
        toast.error("Couldn't extract details from that page");
      }
    } catch {
      toast.error("Failed to scrape — page may be blocked");
    } finally {
      setImporting(false);
    }
  };

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    // Auto-detect pasted URLs
    if (isBlurayUrl(value)) {
      handlePasteUrl(value);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    // If it's a URL, import directly
    if (isBlurayUrl(searchQuery)) {
      handlePasteUrl(searchQuery);
      return;
    }
    setSearching(true);
    try {
      const results = await searchBluray(searchQuery, searchCountry);
      setSearchResults(results);
      if (results.length === 0) {
        toast.info("No results found on blu-ray.com");
      }
    } catch {
      toast.error("Search failed — blu-ray.com may be blocking requests");
    } finally {
      setSearching(false);
    }
  };

  const handleImport = async (result: BluraySearchResult) => {
    setImporting(true);
    try {
      const detail = await getBlurayDetail(result.url);
      if (detail) {
        setForm({
          title: detail.title || result.title,
          year: detail.year?.toString() ?? result.year ?? "",
          director: detail.director ?? "",
          spine_number: "",
          video_quality: detail.video_quality ?? "",
          hdr_type: detail.hdr_type ?? "",
          audio_type: detail.audio_type ?? "",
          package_type: detail.package_type ?? "",
          publisher: detail.publisher ?? "",
          media_type: detail.media_type ?? "Film",
          region: detail.region ?? searchCountry,
          cover_url: result.coverUrl ?? "",
        });
        toast.success("Data imported — review and edit as needed");
      } else {
        setForm((prev) => ({
          ...prev,
          title: result.title,
          year: result.year,
          region: searchCountry,
          cover_url: result.coverUrl ?? "",
        }));
        toast.info("Basic info imported — detail page may have been blocked");
      }
    } catch {
      setForm((prev) => ({
        ...prev,
        title: result.title,
        year: result.year,
        region: searchCountry,
        cover_url: result.coverUrl ?? "",
      }));
      toast.info("Basic info imported — couldn't fetch full details");
    } finally {
      setImporting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    const payload: any = {
      title: form.title.trim(),
      year: form.year ? parseInt(form.year) : null,
      director: form.director || null,
      spine_number: form.spine_number ? parseInt(form.spine_number) : null,
      video_quality: form.video_quality || null,
      hdr_type: form.hdr_type || null,
      audio_type: form.audio_type || null,
      package_type: form.package_type || null,
      publisher: form.publisher || null,
      media_type: form.media_type,
      region: form.region || null,
      cover_url: form.cover_url || null,
      parent_id: parentId ?? null,
    };

    try {
      if (editTitle) {
        await updateTitle.mutateAsync({ id: editTitle.id, ...payload });
        toast.success("Title updated");
      } else {
        await insertTitle.mutateAsync({ ...payload, user_id: user.id } as TitleInsert);
        toast.success("Title added");
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    }
  };

  const set = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-gold">
            {editTitle ? "Edit Title" : parentId ? "Add Nested Title" : "Add Title"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={editTitle ? "manual" : "search"} className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="search" className="flex-1">Search blu-ray.com</TabsTrigger>
            <TabsTrigger value="manual" className="flex-1">Manual Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-3">
            <div className="flex gap-2">
              <Select value={searchCountry} onValueChange={setSearchCountry}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">🇺🇸 US</SelectItem>
                  <SelectItem value="UK">🇬🇧 UK</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Input
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  placeholder="Search or paste blu-ray.com URL..."
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
                />
              </div>
              <Button type="button" size="icon" variant="outline" onClick={handleSearch} disabled={searching || importing}>
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={result.blurayId}
                    type="button"
                    onClick={() => handleImport(result)}
                    disabled={importing}
                    className="flex flex-col items-center gap-1 p-2 rounded-md border border-border hover:border-gold-dim hover:bg-secondary/50 transition-colors text-center"
                  >
                    <img
                      src={result.coverUrl}
                      alt={result.title}
                      className="w-16 h-20 object-cover rounded"
                      loading="lazy"
                    />
                    <span className="text-xs font-medium text-foreground line-clamp-2 leading-tight">
                      {result.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{result.year}</span>
                  </button>
                ))}
              </div>
            )}

            {importing && (
              <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Importing details...
              </div>
            )}
          </TabsContent>

          <TabsContent value="manual">
            {/* Empty — form below always shows */}
          </TabsContent>
        </Tabs>

        <form onSubmit={handleSubmit} className="space-y-4 border-t border-border pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Blade Runner 2049" />
            </div>
            <div>
              <Label>Year</Label>
              <Input value={form.year} onChange={(e) => set("year", e.target.value)} placeholder="2017" type="number" />
            </div>
            <div>
              <Label>Director(s)</Label>
              <Input value={form.director} onChange={(e) => set("director", e.target.value)} placeholder="e.g. Joel Coen, Ethan Coen" />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={form.media_type} onValueChange={(v) => set("media_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Film">Film</SelectItem>
                  <SelectItem value="Film Collection">Film Collection</SelectItem>
                  <SelectItem value="Documentary">Documentary</SelectItem>
                  <SelectItem value="Concert Film">Concert Film</SelectItem>
                  <SelectItem value="TV">TV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Region</Label>
              <Select value={form.region} onValueChange={(v) => set("region", v)}>
                <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="UK">UK</SelectItem>
                  <SelectItem value="US">US</SelectItem>
                  <SelectItem value="UK/US">UK/US</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Spine #</Label>
              <Input value={form.spine_number} onChange={(e) => set("spine_number", e.target.value)} placeholder="1000" type="number" />
            </div>
            <div>
              <Label>Video Quality</Label>
              <Select value={form.video_quality} onValueChange={(v) => set("video_quality", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="4K">4K</SelectItem>
                  <SelectItem value="1080p">1080p</SelectItem>
                  <SelectItem value="720p">720p</SelectItem>
                  <SelectItem value="DVD">DVD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>HDR Type</Label>
              <Select value={form.hdr_type} onValueChange={(v) => set("hdr_type", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dolby Vision">Dolby Vision</SelectItem>
                  <SelectItem value="HDR10+">HDR10+</SelectItem>
                  <SelectItem value="HDR10">HDR10</SelectItem>
                  <SelectItem value="SDR">SDR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Audio Type</Label>
              <Select value={form.audio_type} onValueChange={(v) => set("audio_type", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dolby Atmos">Dolby Atmos</SelectItem>
                  <SelectItem value="DTS:X">DTS:X</SelectItem>
                  <SelectItem value="7.1">7.1</SelectItem>
                  <SelectItem value="5.1">5.1</SelectItem>
                  <SelectItem value="Stereo">Stereo</SelectItem>
                  <SelectItem value="Mono">Mono</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Package</Label>
              <Select value={form.package_type} onValueChange={(v) => set("package_type", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Keep Case">Keep Case</SelectItem>
                  <SelectItem value="Steelbook">Steelbook</SelectItem>
                  <SelectItem value="Slipcover">Slipcover</SelectItem>
                  <SelectItem value="Slipbox">Slipbox</SelectItem>
                  <SelectItem value="Digipak">Digipak</SelectItem>
                  <SelectItem value="Mediabook">Mediabook</SelectItem>
                  <SelectItem value="Box Set">Box Set</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Publisher</Label>
              <Input value={form.publisher} onChange={(e) => set("publisher", e.target.value)} placeholder="e.g. Criterion, Arrow, Sony" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={insertTitle.isPending || updateTitle.isPending}>
              {editTitle ? "Save Changes" : "Add Title"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { useTitlesGrouped, useDeleteTitle, type TitleWithChildren, type Title } from "@/hooks/useTitles";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { TitleCard } from "@/components/TitleCard";
import { TitleFormDialog } from "@/components/TitleFormDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, Disc3 } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const { user } = useAuth();
  const { data: titles, isLoading } = useTitlesGrouped();
  const deleteTitle = useDeleteTitle();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTitle, setEditTitle] = useState<Title | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);

  const filtered = titles.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.director?.toLowerCase().includes(search.toLowerCase()) ||
    t.publisher?.toLowerCase().includes(search.toLowerCase())
  );

  const filmCount = titles.filter((t) => t.media_type === "Film").length;
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
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-2">
            The <span className="text-gold">Vault</span>
          </h1>
          <p className="text-muted-foreground text-lg">A curated physical media collection</p>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Disc3 className="w-4 h-4 text-gold" />{totalDiscs} discs</span>
            <span>🎬 {filmCount} films</span>
            <span>📺 {tvCount} TV</span>
          </div>
        </div>

        {/* Search + Add */}
        <div className="flex items-center gap-3 mb-6 max-w-xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search titles, directors, publishers..."
              className="pl-10"
            />
          </div>
          {user && (
            <Button
              onClick={() => { setEditTitle(null); setParentId(null); setFormOpen(true); }}
              className="shrink-0"
            >
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          )}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Loading collection...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            {search ? "No titles match your search." : "No titles yet. Add your first disc!"}
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
      </main>

      <TitleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editTitle={editTitle}
        parentId={parentId}
      />
    </div>
  );
};

export default Index;

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInsertTitle, useUpdateTitle, type Title, type TitleInsert } from "@/hooks/useTitles";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

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
};

export function TitleFormDialog({ open, onOpenChange, editTitle, parentId }: TitleFormDialogProps) {
  const { user } = useAuth();
  const insertTitle = useInsertTitle();
  const updateTitle = useUpdateTitle();
  const [form, setForm] = useState(EMPTY_FORM);

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
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editTitle, open]);

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
        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label>Director</Label>
              <Input value={form.director} onChange={(e) => set("director", e.target.value)} placeholder="Denis Villeneuve" />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={form.media_type} onValueChange={(v) => set("media_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Film">Film</SelectItem>
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
                  <SelectItem value="Plastic Case">Plastic Case</SelectItem>
                  <SelectItem value="Steelbook">Steelbook</SelectItem>
                  <SelectItem value="Slipcover">Slipcover</SelectItem>
                  <SelectItem value="Box Set">Box Set</SelectItem>
                  <SelectItem value="Digipak">Digipak</SelectItem>
                  <SelectItem value="Mediabook">Mediabook</SelectItem>
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

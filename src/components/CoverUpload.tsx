import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

type CoverUploadProps = {
  coverUrl: string;
  onCoverChange: (url: string) => void;
  userId: string;
};

export function CoverUpload({ coverUrl, onCoverChange, userId }: CoverUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;

      const { error } = await supabase.storage
        .from("title-covers")
        .upload(path, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("title-covers")
        .getPublicUrl(path);

      onCoverChange(urlData.publicUrl);
      toast.success("Cover uploaded");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-3">
      {coverUrl ? (
        <div className="relative group/cover">
          <img
            src={coverUrl}
            alt="Cover preview"
            className="w-16 h-22 rounded object-cover border border-border shadow-sm"
          />
          <button
            type="button"
            onClick={() => onCoverChange("")}
            className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover/cover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="gap-1.5"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ImagePlus className="w-4 h-4" />
          )}
          {uploading ? "Uploading…" : "Upload Cover"}
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
}

import { TitleWithChildren } from "@/hooks/useTitles";
import { MediaBadge } from "./MediaBadge";
import { MetadataTag } from "./MetadataTag";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type TitleCardProps = {
  title: TitleWithChildren;
  isOwner?: boolean;
  onEdit?: (title: TitleWithChildren) => void;
  onDelete?: (id: string) => void;
};

export function TitleCard({ title, isOwner, onEdit, onDelete }: TitleCardProps) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = title.children.length > 0;

  return (
    <div className="group animate-fade-in">
      <div className="bg-card border border-border rounded-lg p-4 hover:border-gold-dim transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <MediaBadge type={title.media_type} />
              {title.region && (
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                  {title.region}
                </span>
              )}
              {title.spine_number && (
                <span className="text-xs font-mono text-gold">#{title.spine_number}</span>
              )}
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground truncate">
              {title.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              {title.year && <span>{title.year}</span>}
              {title.year && title.director && <span>·</span>}
              {title.director && <span>{title.director}</span>}
            </div>

            <div className="flex flex-wrap gap-4 mt-3">
              <MetadataTag label="Video" value={title.video_quality} />
              <MetadataTag label="HDR" value={title.hdr_type} />
              <MetadataTag label="Audio" value={title.audio_type} />
              <MetadataTag label="Package" value={title.package_type} />
              <MetadataTag label="Publisher" value={title.publisher} />
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {isOwner && (
              <>
                <button
                  onClick={() => onEdit?.(title)}
                  className="p-2 rounded-md text-muted-foreground hover:text-gold transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete?.(title.id)}
                  className="p-2 rounded-md text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            {hasChildren && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronDown className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")} />
              </button>
            )}
          </div>
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="ml-6 mt-1 space-y-1 border-l-2 border-gold-dim pl-4">
          {title.children.map((child) => (
            <div key={child.id} className="bg-card/50 border border-border rounded-lg p-3 group/child">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-display text-base font-medium text-foreground truncate">
                    {child.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-sm text-muted-foreground">
                    {child.year && <span>{child.year}</span>}
                    {child.year && child.director && <span>·</span>}
                    {child.director && <span>{child.director}</span>}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <MetadataTag label="Video" value={child.video_quality} />
                    <MetadataTag label="HDR" value={child.hdr_type} />
                    <MetadataTag label="Audio" value={child.audio_type} />
                  </div>
                </div>
                {isOwner && (
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover/child:opacity-100">
                    <button
                      onClick={() => onEdit?.({ ...child, children: [] })}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-gold transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete?.(child.id)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

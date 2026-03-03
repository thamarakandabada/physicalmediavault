import { cn } from "@/lib/utils";

type MetadataTagProps = {
  label: string;
  value: string | number | null | undefined;
  className?: string;
};

export function MetadataTag({ label, value, className }: MetadataTagProps) {
  if (!value) return null;
  return (
    <div className={cn("flex flex-col gap-0", className)}>
      <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="text-xs sm:text-sm text-foreground truncate">{String(value)}</span>
    </div>
  );
}

import { Check } from "lucide-react";
import type { Archetype } from "@/hooks/useApi";
import { cn, formatArchetypeName } from "@/lib/utils";

interface ArchetypeCardProps {
  archetype: Archetype | null; // null = "Auto Style"
  selected: boolean;
  onClick: () => void;
}

export function ArchetypeCard({ archetype, selected, onClick }: ArchetypeCardProps) {
  const isAuto = archetype === null;
  const palette = archetype?.colorPalette;
  const title = isAuto ? "Auto" : formatArchetypeName(archetype.name);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      title={isAuto ? "AI picks a look that fits your topic" : archetype.artStyle}
      className={cn(
        "flex items-center gap-1.5 rounded-full border py-1 pl-1.5 pr-3 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        selected
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border bg-card/50 text-text-subtle hover:border-primary/40 hover:text-foreground",
      )}
    >
      <span
        className="flex size-4 items-center justify-center rounded-full text-white"
        style={{
          background: palette
            ? `linear-gradient(120deg, ${palette.background} 0%, ${palette.accent} 100%)`
            : "linear-gradient(120deg, #7c3aed, #d946ef, #fb7185)",
        }}
      >
        {selected && <Check className="size-2.5" />}
      </span>
      {title}
    </button>
  );
}

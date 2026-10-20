import { LayoutGrid, List, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Archetype } from "@/hooks/useApi";
import { cn, formatArchetypeName } from "@/lib/utils";

export type SortBy = "newest" | "oldest" | "cost" | "score";
export type StatusFilter = "all" | "completed" | "failed" | "running";
export type ViewMode = "grid" | "list";

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: "All statuses",
  completed: "Completed",
  failed: "Failed",
  running: "In progress",
};

const SORT_LABELS: Record<SortBy, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  cost: "Highest cost",
  score: "Highest score",
};

interface GalleryToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  archetypeFilter: string;
  onArchetypeChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  sortBy: SortBy;
  onSortChange: (value: SortBy) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  archetypes: Archetype[];
}

export function GalleryToolbar({
  searchQuery,
  onSearchChange,
  archetypeFilter,
  onArchetypeChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  archetypes,
}: GalleryToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Search */}
      <div className="relative flex-1 min-w-[180px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by topic..."
          aria-label="Search videos by topic"
          className="h-9 rounded-lg border-border bg-surface-inset pl-9 text-sm text-foreground placeholder:text-text-faint"
        />
      </div>

      {/* Archetype filter */}
      <Select value={archetypeFilter} onValueChange={(v) => v && onArchetypeChange(v)}>
        <SelectTrigger
          aria-label="Filter by visual style"
          className="h-9 w-auto min-w-[120px] rounded-lg border-border bg-surface-inset text-xs"
        >
          <SelectValue>
            {archetypeFilter === "all" ? "All styles" : formatArchetypeName(archetypeFilter)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Styles</SelectItem>
          {archetypes.map((a) => (
            <SelectItem key={a.name} value={a.name}>
              {formatArchetypeName(a.name)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status filter */}
      <Select value={statusFilter} onValueChange={(v) => onStatusChange(v as StatusFilter)}>
        <SelectTrigger
          aria-label="Filter by status"
          className="h-9 w-auto min-w-[110px] rounded-lg border-border bg-surface-inset text-xs"
        >
          <SelectValue>{STATUS_LABELS[statusFilter]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
          <SelectItem value="running">In progress</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortBy)}>
        <SelectTrigger
          aria-label="Sort videos"
          className="h-9 w-auto min-w-[100px] rounded-lg border-border bg-surface-inset text-xs"
        >
          <SelectValue>{SORT_LABELS[sortBy]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="oldest">Oldest</SelectItem>
          <SelectItem value="cost">Highest Cost</SelectItem>
          <SelectItem value="score">Highest Score</SelectItem>
        </SelectContent>
      </Select>

      {/* View toggle */}
      <div className="flex rounded-lg border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => onViewModeChange("grid")}
          aria-label="Show videos as a grid"
          aria-pressed={viewMode === "grid"}
          className={cn(
            "flex items-center justify-center size-9 transition-colors",
            viewMode === "grid"
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <LayoutGrid className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange("list")}
          aria-label="Show videos as a list"
          aria-pressed={viewMode === "list"}
          className={cn(
            "flex items-center justify-center size-9 border-l border-border transition-colors",
            viewMode === "list"
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <List className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

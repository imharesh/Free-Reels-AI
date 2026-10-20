import {
  AlertTriangle,
  Clock,
  DollarSign,
  Film,
  Layers,
  Loader2,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GalleryCard } from "@/components/GalleryCard";
import {
  GalleryToolbar,
  type SortBy,
  type StatusFilter,
  type ViewMode,
} from "@/components/GalleryToolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Archetype, api, type JobSummary } from "@/hooks/useApi";
import { cn, formatArchetypeName } from "@/lib/utils";

const PAGE_SIZE = 20;
const VIEW_MODE_KEY = "freereels_gallery_view";
const SKELETON_CARDS = Array.from({ length: 8 }, (_, index) => `skeleton-${index}`);

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function GalleryPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  // Toolbar state
  const [searchQuery, setSearchQuery] = useState("");
  const [archetypeFilter, setArchetypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem(VIEW_MODE_KEY) as ViewMode) || "grid";
  });

  // Archetype list for filter dropdown
  const [archetypes, setArchetypes] = useState<Archetype[]>([]);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<JobSummary | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const bulkMode = selectionMode;
  const hasActiveFilters =
    searchQuery.trim().length > 0 || archetypeFilter !== "all" || statusFilter !== "all";
  const completedCount = jobs.filter((job) => job.status === "completed").length;
  const activeCount = jobs.filter(
    (job) => job.status === "running" || job.status === "queued",
  ).length;
  const attentionCount = jobs.filter((job) => job.status === "failed").length;

  useEffect(() => {
    api
      .listArchetypes()
      .then(setArchetypes)
      .catch(() => {});
  }, []);

  const loadJobs = useCallback(async (offset = 0, append = false) => {
    try {
      const result = await api.listJobs(PAGE_SIZE, offset);
      if (append) {
        setJobs((prev) => [...prev, ...result.jobs]);
      } else {
        setJobs(result.jobs);
      }
      setTotal(result.total);
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to load videos.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const handleLoadMore = () => {
    setLoadingMore(true);
    void loadJobs(jobs.length, true);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem(VIEW_MODE_KEY, mode);
  };

  const toggleSelect = (jobId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    setDeleting(true);
    const ids = Array.from(selectedIds);
    let failCount = 0;
    for (const id of ids) {
      try {
        await api.deleteJob(id);
      } catch {
        failCount++;
      }
    }
    setSelectedIds(new Set());
    setSelectionMode(false);
    setDeleteDialogOpen(false);
    setDeleting(false);
    if (failCount > 0) {
      setDeleteError(`${failCount} of ${ids.length} deletions failed (jobs may still be active)`);
      setTimeout(() => setDeleteError(null), 5000);
    }
    // Reload
    setLoading(true);
    void loadJobs();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      await handleBulkDelete();
      return;
    }

    setDeleting(true);
    try {
      await api.deleteJob(deleteTarget.id);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
      setLoading(true);
      void loadJobs();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Unable to delete this video.");
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      setTimeout(() => setDeleteError(null), 5000);
    } finally {
      setDeleting(false);
    }
  };

  // Client-side filter + sort
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((j) => j.topic.toLowerCase().includes(q));
    }

    // Archetype filter
    if (archetypeFilter !== "all") {
      result = result.filter((j) => j.archetype === archetypeFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "running") {
        result = result.filter((j) => j.status === "running" || j.status === "queued");
      } else {
        result = result.filter((j) => j.status === statusFilter);
      }
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (a.createdAt ?? "").localeCompare(b.createdAt ?? "");
        case "cost": {
          const costA = a.actualCost?.totalCost ?? a.costEstimate?.totalCost ?? 0;
          const costB = b.actualCost?.totalCost ?? b.costEstimate?.totalCost ?? 0;
          return costB - costA;
        }
        case "score": {
          const scoreA = a.criticReview?.score ?? 0;
          const scoreB = b.criticReview?.score ?? 0;
          return scoreB - scoreA;
        }
        default: // newest
          return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
      }
    });

    return result;
  }, [jobs, searchQuery, archetypeFilter, statusFilter, sortBy]);

  if (loading) {
    return (
      <div className="py-8 px-4 sm:px-10">
        <div className="mb-5 h-8 w-24 animate-pulse rounded-lg bg-card" />
        <div className="mb-5 h-9 w-full animate-pulse rounded-lg bg-card" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SKELETON_CARDS.map((id) => (
            <div
              key={id}
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="h-[180px] animate-pulse bg-surface-inset" />
              <div className="p-3.5 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-surface-inset" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-surface-inset" />
                <div className="flex gap-3 pt-1">
                  <div className="h-3 w-8 animate-pulse rounded bg-surface-inset" />
                  <div className="h-3 w-10 animate-pulse rounded bg-surface-inset" />
                  <div className="ml-auto h-3 w-12 animate-pulse rounded bg-surface-inset" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-6xl flex-col px-4 py-8 sm:px-8 lg:px-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[1.5px] text-primary">
            Your workspace
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Video gallery</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your generated videos, creative styles, and production details will live here.
          </p>
        </div>
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-14">
          <div className="flex max-w-sm flex-col items-center text-center">
            <div
              className={cn(
                "mb-5 flex size-16 items-center justify-center rounded-2xl",
                loadError ? "bg-amber-500/10 text-amber-300" : "bg-primary/10 text-primary",
              )}
            >
              {loadError ? <AlertTriangle className="size-7" /> : <Film className="size-7" />}
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              {loadError ? "Couldn’t load your gallery" : "Your gallery is ready"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {loadError
                ? loadError
                : "Create your first reel to see its video, style, status, and cost details here."}
            </p>
            {loadError ? (
              <Button
                variant="outline"
                className="mt-6 rounded-xl"
                onClick={() => {
                  setLoading(true);
                  void loadJobs();
                }}
              >
                Try again
              </Button>
            ) : (
              <Button className="mt-6 gap-2 rounded-xl" onClick={() => navigate("/")}>
                <Plus className="size-4" />
                Create your first reel
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const hasMore = jobs.length < total;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 lg:px-10">
      <section className="relative mb-7 overflow-hidden rounded-[28px] border border-primary/15 bg-gradient-to-br from-primary/[0.12] via-card to-card p-5 sm:p-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[1.4px] text-primary">
              <Film className="size-3.5" />
              Creator studio
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Your creative library
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Every idea, in-progress render, and finished Short—together in one place.
            </p>
          </div>
          <Button
            onClick={() => navigate("/")}
            className="gap-2 self-start rounded-xl lg:self-auto"
          >
            <Plus className="size-4" />
            Create a new reel
          </Button>
        </div>
        <div className="relative mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <LibraryStat label="Projects" value={total} detail="total in your library" />
          <LibraryStat label="Ready to watch" value={completedCount} detail="finished · loaded" />
          <LibraryStat
            label="In production"
            value={activeCount}
            detail="active or queued · loaded"
          />
          <LibraryStat label="Needs attention" value={attentionCount} detail="failed · loaded" />
        </div>
      </section>

      <section className="mb-5 rounded-2xl border border-border bg-card/60 p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold">Find and organize videos</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Search by topic, narrow by style or status, then choose how results are displayed.
            </p>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setArchetypeFilter("all");
                setStatusFilter("all");
              }}
              className="h-8 gap-1.5 text-xs text-muted-foreground"
            >
              <X className="size-3.5" />
              Clear filters
            </Button>
          )}
        </div>
        <GalleryToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          archetypeFilter={archetypeFilter}
          onArchetypeChange={setArchetypeFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          archetypes={archetypes}
        />
        <p className="mt-3 text-[11px] text-muted-foreground">
          Showing {filteredJobs.length} matching {filteredJobs.length === 1 ? "video" : "videos"}{" "}
          from {jobs.length} loaded of {total} total.
        </p>
      </section>

      {/* Delete error banner */}
      {deleteError && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-destructive/20 bg-destructive/6 px-4 py-3 text-sm text-destructive"
        >
          {deleteError}
        </div>
      )}
      {loadError && (
        <div
          role="alert"
          className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-200"
        >
          <span>Could not refresh the gallery: {loadError}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLoading(true);
              void loadJobs();
            }}
          >
            Try again
          </Button>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Your videos</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {bulkMode
              ? "Select the checkboxes on videos you want to remove."
              : `${filteredJobs.length} shown · ${jobs.length} loaded${hasMore ? ` of ${total}` : ""}. Open any card to watch, download, or inspect its production details.`}
          </p>
        </div>
        {bulkMode ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium text-muted-foreground">
              {selectedIds.size} selected
            </span>
            <Button
              variant="destructive"
              size="sm"
              className="gap-1.5 rounded-lg"
              onClick={() => {
                setDeleteTarget(null);
                setDeleteDialogOpen(true);
              }}
              disabled={selectedIds.size === 0}
            >
              <Trash2 className="size-3.5" />
              Delete selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-text-subtle"
              onClick={() => {
                setSelectedIds(new Set());
                setSelectionMode(false);
              }}
            >
              <X className="size-3.5" />
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectionMode(true)}
            className="rounded-lg"
          >
            Select videos
          </Button>
        )}
      </div>

      {filteredJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-border bg-gradient-to-b from-card/60 to-card/20 px-6 py-16 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Film className="size-5" />
          </div>
          <h3 className="text-base font-semibold">No matching videos</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Try a different search or clear the filters to see more results.
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setArchetypeFilter("all");
                setStatusFilter("all");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* Grid view */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredJobs.map((job) => (
            <GalleryCard
              key={job.id}
              job={job}
              bulkMode={bulkMode}
              selected={selectedIds.has(job.id)}
              onToggleSelect={() => toggleSelect(job.id)}
              onDelete={() => {
                setDeleteTarget(job);
                setDeleteDialogOpen(true);
              }}
              timeAgo={job.createdAt ? timeAgo(job.createdAt) : ""}
            />
          ))}
        </div>
      ) : (
        /* List view */
        <div className="flex flex-col gap-2">
          {filteredJobs.map((job) => (
            <ListCard
              key={job.id}
              job={job}
              bulkMode={bulkMode}
              selected={selectedIds.has(job.id)}
              onToggleSelect={() => toggleSelect(job.id)}
              onDelete={() => {
                setDeleteTarget(job);
                setDeleteDialogOpen(true);
              }}
              timeAgo={job.createdAt ? timeAgo(job.createdAt) : ""}
            />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            className="rounded-lg border-border px-6"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              `Load more videos (${jobs.length} of ${total})`
            )}
          </Button>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deleteTarget
                ? `Delete "${deleteTarget.topic}"?`
                : `Delete ${selectedIds.size} video${selectedIds.size > 1 ? "s" : ""}?`}
            </DialogTitle>
            <DialogDescription>
              This will permanently delete {deleteTarget ? "this video" : "the selected videos"}{" "}
              and their artifacts. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LibraryStat({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/45 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-2xl font-semibold tabular-nums tracking-tight">{value}</span>
      </div>
      <p className="mt-0.5 text-[11px] text-text-faint">{detail}</p>
    </div>
  );
}

/* ─── List view card ─── */

function ListCard({
  job,
  bulkMode,
  selected,
  onToggleSelect,
  onDelete,
  timeAgo: timeAgoStr,
}: {
  job: JobSummary;
  bulkMode: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  onDelete: () => void;
  timeAgo: string;
}) {
  const isFailed = job.status === "failed";
  const isRunning = job.status === "running" || job.status === "queued";
  const score = job.score as { scenes?: { length: number }[] } | undefined;
  const sceneCount = score?.scenes?.length;
  const criticScore = job.criticReview?.score;
  const cost = job.actualCost?.totalCost ?? job.costEstimate?.totalCost;

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-lg border bg-card px-4 py-3 transition-all hover:border-primary/30",
        isFailed ? "border-destructive/20" : "border-border",
        selected && "ring-2 ring-primary ring-offset-1 ring-offset-background",
      )}
    >
      {bulkMode && (
        <input
          type="checkbox"
          aria-label={`Select ${job.topic}`}
          checked={selected}
          onChange={onToggleSelect}
          className="shrink-0"
        />
      )}

      <a href={`/jobs/${job.id}`} className="flex min-w-0 flex-1 items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{job.topic}</p>
          <div className="mt-1 flex items-center gap-2">
            {job.archetype && (
              <span className="text-[10px] text-muted-foreground">
                {formatArchetypeName(job.archetype)}
              </span>
            )}
            {isFailed && (
              <Badge variant="destructive" className="text-[9px] font-normal py-0">
                Failed
              </Badge>
            )}
            {isRunning && (
              <span className="flex items-center gap-1 text-[10px] text-status-info">
                <span className="size-1.5 rounded-full bg-status-info animate-pulse" />
                Running
              </span>
            )}
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-4 text-[11px] text-muted-foreground sm:flex">
          {sceneCount != null && (
            <span className="flex items-center gap-1">
              <Layers className="size-3" />
              {sceneCount}
            </span>
          )}
          {cost != null && (
            <span className="flex items-center gap-1">
              <DollarSign className="size-3" />${cost.toFixed(2)}
            </span>
          )}
          {criticScore != null && (
            <span className="flex items-center gap-1">
              <Star className="size-3" />
              {criticScore}
            </span>
          )}
          <span className="flex w-16 items-center justify-end gap-1">
            <Clock className="size-3" />
            {timeAgoStr}
          </span>
        </div>
      </a>

      {!bulkMode && (
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          aria-label={`Delete ${job.topic}`}
          title="Delete video"
          onClick={onDelete}
        >
          <Trash2 className="size-4" />
        </Button>
      )}
    </div>
  );
}

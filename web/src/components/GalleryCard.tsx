import { AlertTriangle, Clock, DollarSign, Layers, Play, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { DirectorScore, JobSummary } from "@/hooks/useApi";
import { getSceneAssetUrl } from "@/lib/scene-assets";
import { cn, formatArchetypeName } from "@/lib/utils";

/** Archetype visual config: Tailwind badge classes + accent hex for gradient backgrounds */
const ARCHETYPE_THEME: Record<string, { badge: string; accent: string }> = {
  editorial_caricature: {
    badge: "bg-orange-500/15 text-orange-400 border-orange-500/20",
    accent: "#F97316",
  },
  warm_narrative: {
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    accent: "#F59E0B",
  },
  studio_realism: {
    badge: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
    accent: "#6366F1",
  },
  infographic: { badge: "bg-teal-500/15 text-teal-400 border-teal-500/20", accent: "#14B8A6" },
  anime_illustration: {
    badge: "bg-pink-500/15 text-pink-400 border-pink-500/20",
    accent: "#EC4899",
  },
  pastoral_watercolor: {
    badge: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
    accent: "#06B6D4",
  },
  comic_book: { badge: "bg-lime-500/15 text-lime-400 border-lime-500/20", accent: "#84CC16" },
  gothic_fantasy: { badge: "bg-red-500/15 text-red-400 border-red-500/20", accent: "#EF4444" },
  vintage_snapshot: { badge: "bg-rose-500/15 text-rose-400 border-rose-500/20", accent: "#F43F5E" },
  surreal_dreamscape: {
    badge: "bg-violet-500/15 text-violet-400 border-violet-500/20",
    accent: "#8B5CF6",
  },
  warm_editorial: {
    badge: "bg-orange-500/15 text-orange-400 border-orange-500/20",
    accent: "#F97316",
  },
  cinematic_documentary: {
    badge: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    accent: "#3B82F6",
  },
  moody_cinematic: {
    badge: "bg-slate-500/15 text-slate-400 border-slate-500/20",
    accent: "#64748B",
  },
  bold_illustration: {
    badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
    accent: "#EAB308",
  },
};

interface GalleryCardProps {
  job: JobSummary;
  bulkMode: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  onDelete: () => void;
  timeAgo: string;
}

export function GalleryCard({
  job,
  bulkMode,
  selected,
  onToggleSelect,
  onDelete,
  timeAgo,
}: GalleryCardProps) {
  const isFailed = job.status === "failed";
  const isRunning = job.status === "running" || job.status === "queued";
  const isCompleted = job.status === "completed";
  const statusLabel = isRunning
    ? "In progress"
    : isFailed
      ? "Needs attention"
      : job.status === "completed"
        ? "Completed"
        : job.status.charAt(0).toUpperCase() + job.status.slice(1);
  const score = job.score as DirectorScore | undefined;
  const sceneCount = score?.scenes?.length;
  const criticScore = job.criticReview?.score;
  const cost = job.actualCost?.totalCost ?? job.costEstimate?.totalCost;
  const archetypeKey = job.archetype ?? "";
  const archTheme = ARCHETYPE_THEME[archetypeKey];
  const archetypeColor = archTheme?.badge ?? "bg-secondary text-secondary-foreground";

  // Try to get first scene thumbnail
  const firstScene = score?.scenes?.[0];
  const thumbnailUrl =
    job.runDir && firstScene && firstScene.visual_type !== "text_card"
      ? getSceneAssetUrl(job.id, job.runDir, firstScene, 0)
      : null;
  const [imgError, setImgError] = useState(false);

  const accentColor = archTheme?.accent ?? "#6366F1";

  return (
    <div className="relative group">
      {/* Checkbox overlay */}
      {bulkMode && (
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={selected}
            onCheckedChange={onToggleSelect}
            className="border-white/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>
      )}
      {!bulkMode && (
        <Button
          variant="destructive"
          size="icon-sm"
          className="absolute right-2 top-2 z-10 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
          aria-label={`Delete ${job.topic}`}
          title="Delete video"
          onClick={onDelete}
        >
          <Trash2 className="size-3.5" />
        </Button>
      )}

      <Link
        to={`/jobs/${job.id}`}
        className={cn(
          "flex flex-col overflow-hidden rounded-[12px] border bg-card transition-all hover:border-primary/30",
          isFailed ? "border-destructive/20" : "border-border",
          selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        )}
      >
        {/* Thumbnail area */}
        <div
          className="relative flex h-[190px] items-center justify-center overflow-hidden"
          style={{
            background:
              thumbnailUrl && !imgError
                ? undefined
                : `linear-gradient(135deg, #0D1526 0%, ${accentColor}20 100%)`,
          }}
        >
          {thumbnailUrl && !imgError ? (
            <img
              src={thumbnailUrl}
              alt={job.topic}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : isFailed ? (
            <AlertTriangle className="size-8 text-destructive" />
          ) : isRunning ? (
            <div className="flex flex-col items-center gap-2">
              <div className="size-6 animate-spin rounded-full border-2 border-border border-t-status-info" />
              <span className="text-[10px] text-muted-foreground">Generating...</span>
            </div>
          ) : (
            <Layers className="size-8 text-border" />
          )}

          <span className="absolute bottom-2 right-2 flex size-8 items-center justify-center rounded-full bg-black/55 text-white opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <Play className="ml-0.5 size-3.5 fill-current" />
          </span>
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
            {job.topic}
          </h3>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className={cn(
                "border text-[10px] font-medium",
                isFailed
                  ? "border-destructive/20 bg-destructive/10 text-destructive"
                  : isRunning
                    ? "border-sky-500/20 bg-sky-500/10 text-sky-300"
                    : isCompleted
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                      : "border-border bg-muted text-muted-foreground",
              )}
            >
              {statusLabel}
            </Badge>
            {job.archetype && (
              <Badge
                variant="outline"
                className={cn("text-[10px] font-normal border", archetypeColor)}
              >
                {formatArchetypeName(job.archetype)}
              </Badge>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-border/70 pt-3 text-[11px] text-muted-foreground">
            {sceneCount != null && (
              <span className="flex items-center gap-1.5">
                <Layers className="size-3.5 text-text-faint" />
                <span>{sceneCount} scenes</span>
              </span>
            )}
            {cost != null && (
              <span className="flex items-center gap-1.5">
                <DollarSign className="size-3.5 text-text-faint" />
                <span>${cost.toFixed(2)} cost</span>
              </span>
            )}
            {criticScore != null && (
              <span className="flex items-center gap-1.5">
                <Star className="size-3.5 text-amber-300" />
                <span>{criticScore}/10 score</span>
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-text-faint" />
              {timeAgo}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

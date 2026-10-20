import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import type { CostBreakdown, CriticReview, DirectorScore, JobSummary } from "@/hooks/useApi";
import { CostBreakdownCard } from "./CostBreakdownCard";
import { CriticScoreCard } from "./CriticScoreCard";
import { formatArchetypeName } from "@/lib/utils";

interface CompletedPanelProps {
  job: JobSummary;
  score: DirectorScore | null;
  criticReview: CriticReview | null;
  costEstimate: CostBreakdown | null;
  totalDuration: number;
}

const STAGE_ORDER = ["research", "director", "tts", "visuals", "assembly", "critic"] as const;
const STAGE_COLORS: Record<string, string> = {
  research: "#818CF8",
  director: "#22D3EE",
  tts: "#A78BFA",
  visuals: "#34D399",
  assembly: "#F59E0B",
  critic: "#FB923C",
};

export function CompletedPanel({
  job,
  score,
  criticReview,
  costEstimate,
  totalDuration,
}: CompletedPanelProps) {
  const videoUrl = job.videoPath ? `/api/v1/jobs/${job.id}/artifacts/${job.videoPath}` : null;
  const totalCost = job.actualCost?.totalCost ?? job.costEstimate?.totalCost;

  // Fetch score.json for completed jobs if not already available from SSE
  const [fetchedScore, setFetchedScore] = useState<DirectorScore | null>(null);
  useEffect(() => {
    if (score || !job.runDir) return;
    fetch(`/api/v1/jobs/${job.id}/artifacts/${job.runDir}/score.json`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setFetchedScore(data as DirectorScore);
      })
      .catch(() => {});
  }, [score, job.id, job.runDir]);

  const displayScore = score ?? fetchedScore;
  const displayCritic = criticReview ?? job.criticReview;
  const sceneCount = displayScore?.scenes.length ?? null;

  return (
    <div className="flex flex-col gap-4">
      {/* Top row: Video + Stats */}
      <div className="grid gap-5 lg:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.7fr)]">
        {/* Video Player */}
        <div className="relative mx-auto flex aspect-[9/16] w-full max-w-[320px] flex-col items-center justify-center overflow-hidden rounded-[22px] border border-primary/20 bg-gradient-to-br from-primary/10 via-surface-sunken to-black shadow-xl shadow-primary/5 lg:mx-0">
          {videoUrl ? (
            <>
              <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[1.4px] text-white/90 backdrop-blur">
                Final cut
              </span>
              <video src={videoUrl} controls playsInline className="h-full w-full object-contain">
                <track kind="captions" />
              </video>
            </>
          ) : (
            <>
              <Play className="size-10 text-primary" />
              <span className="mt-2.5 text-xs text-text-subtle">Video not available</span>
            </>
          )}
        </div>

        {/* Right column: Stats + Music + Cost */}
        <div className="min-w-0 flex flex-col gap-3">
          <div className="rounded-2xl border border-border bg-gradient-to-r from-card to-card/50 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[1.5px] text-status-success">
                  Your Short is ready
                </p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight">
                  Watch your finished video
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Preview it here, or download the MP4 from the page header.
                </p>
              </div>
              {sceneCount != null && (
                <span className="rounded-xl border border-border bg-background/60 px-3 py-2 text-center">
                  <span className="block text-lg font-semibold tabular-nums">{sceneCount}</span>
                  <span className="text-[10px] text-muted-foreground">scenes</span>
                </span>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <StatCard label="Production time" value={formatDuration(totalDuration)} />
            <StatCard
              label="Total Cost"
              value={totalCost != null ? `$${totalCost.toFixed(2)}` : "—"}
              highlight
            />
            <StatCard
              label="Creative style"
              value={formatArchetypeName(displayScore?.archetype ?? job.archetype ?? "—")}
            />
          </div>

          {/* Emotional arc + archetype badges */}
          {displayScore && (
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-[5px] border border-primary/20 bg-primary/8 px-2 py-0.5 text-xs font-medium text-primary/80">
                {displayScore.emotional_arc}
              </span>
              {displayScore.archetype && (
                <span className="rounded-[5px] border border-status-info/20 bg-status-info/8 px-2 py-0.5 text-xs font-medium text-status-info/80">
                  {formatArchetypeName(displayScore.archetype)}
                </span>
              )}
              <span className="rounded-[5px] border border-primary/20 bg-primary/8 px-2 py-0.5 text-xs font-medium text-primary/80">
                {displayScore.music_mood}
              </span>
            </div>
          )}

          {/* Music Preview */}
          {job.runDir && <MusicPreview jobId={job.id} runDir={job.runDir} />}

          {/* Stage duration breakdown */}
          {totalDuration > 0 && (
            <StageDurationBar stages={job.stages} totalDuration={totalDuration} />
          )}

          {/* Cost comparison: estimated vs actual */}
          {costEstimate && job.actualCost && (
            <CostComparisonRow
              estimated={costEstimate.totalCost}
              actual={job.actualCost.totalCost}
            />
          )}
        </div>
      </div>

      {/* Quality Review */}
      {displayCritic && <CriticScoreCard review={displayCritic} />}

      {/* Cost Breakdown */}
      <CostBreakdownCard
        estimate={costEstimate ?? job.costEstimate}
        actual={job.actualCost}
        variant="full"
      />
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return remainingSeconds === 0 ? `${minutes}m` : `${minutes}m ${remainingSeconds}s`;
}

function MusicPreview({ jobId, runDir }: { jobId: string; runDir: string }) {
  const musicUrl = `/api/v1/jobs/${jobId}/artifacts/${runDir}/_remotion_public/music.mp3`;
  const [hasMusic, setHasMusic] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(musicUrl, { method: "HEAD" })
      .then((res) => setHasMusic(res.ok))
      .catch(() => setHasMusic(false));
  }, [musicUrl]);

  if (hasMusic === null || !hasMusic) return null;

  return (
    <div>
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[1.5px] text-muted-foreground">
        Background Music
      </span>
      <audio src={musicUrl} controls className="w-full h-8 rounded-lg" preload="metadata">
        <track kind="captions" />
      </audio>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col items-center rounded-[10px] border border-border bg-card px-3 py-3 sm:px-4 sm:py-3.5 gap-1">
      <span className={`text-lg font-bold ${highlight ? "text-status-info" : "text-foreground"}`}>
        {value}
      </span>
      <span className="text-[11px] text-text-subtle">{label}</span>
    </div>
  );
}

function StageDurationBar({
  stages,
  totalDuration,
}: {
  stages?: Record<string, { status: string; durationSec?: number }>;
  totalDuration: number;
}) {
  if (!stages || totalDuration <= 0) return null;

  return (
    <div>
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[1.5px] text-muted-foreground">
        STAGE TIMING
      </span>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface-inset">
        {STAGE_ORDER.map((s) => {
          const dur = stages[s]?.durationSec ?? 0;
          if (dur <= 0) return null;
          const pct = (dur / totalDuration) * 100;
          return (
            <div
              key={s}
              className="h-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                backgroundColor: STAGE_COLORS[s] ?? "#64748B",
                minWidth: pct > 0 ? "2px" : 0,
              }}
              title={`${s}: ${dur.toFixed(1)}s`}
            />
          );
        })}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
        {STAGE_ORDER.map((s) => {
          const dur = stages[s]?.durationSec ?? 0;
          if (dur <= 0) return null;
          return (
            <div key={s} className="flex items-center gap-1">
              <span
                className="inline-block size-2 rounded-full"
                style={{ backgroundColor: STAGE_COLORS[s] ?? "#64748B" }}
              />
              <span className="text-[10px] text-text-subtle">
                {s} {dur.toFixed(1)}s
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CostComparisonRow({ estimated, actual }: { estimated: number; actual: number }) {
  const maxCost = Math.max(estimated, actual, 0.01);
  const savedPct = estimated > 0 ? ((estimated - actual) / estimated) * 100 : 0;

  return (
    <div className="rounded-[10px] border border-border bg-card p-3">
      <span className="text-[10px] font-semibold uppercase tracking-[1.5px] text-muted-foreground">
        COST: ESTIMATED vs ACTUAL
      </span>
      <div className="mt-2 flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="w-16 text-[10px] text-muted-foreground">Estimated</span>
          <div className="flex-1 h-2 rounded-full bg-surface-inset overflow-hidden">
            <div
              className="h-full rounded-full bg-muted-foreground"
              style={{ width: `${(estimated / maxCost) * 100}%` }}
            />
          </div>
          <span className="w-12 text-right text-[11px] text-text-subtle">
            ${estimated.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-16 text-[10px] text-muted-foreground">Actual</span>
          <div className="flex-1 h-2 rounded-full bg-surface-inset overflow-hidden">
            <div
              className="h-full rounded-full bg-status-info"
              style={{ width: `${(actual / maxCost) * 100}%` }}
            />
          </div>
          <span className="w-12 text-right text-[11px] font-semibold text-status-info">
            ${actual.toFixed(2)}
          </span>
        </div>
        {Math.abs(savedPct) >= 1 && (
          <span
            className={`text-[10px] text-right ${savedPct > 0 ? "text-status-success" : "text-status-warning"}`}
          >
            {savedPct > 0
              ? `${savedPct.toFixed(0)}% under estimate`
              : `${Math.abs(savedPct).toFixed(0)}% over estimate`}
          </span>
        )}
      </div>
    </div>
  );
}

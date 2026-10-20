import {
  Activity,
  BarChart3,
  CheckCircle,
  Cpu,
  DollarSign,
  Film,
  KeyRound,
  Server,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api, type StatsResponse } from "@/hooks/useApi";
import { cn } from "@/lib/utils";

const API_KEY_GROUPS = [
  {
    title: "AI, search, and visuals",
    fields: [
      { key: "ANTHROPIC_API_KEY", label: "Anthropic", help: "Language model" },
      { key: "OPENAI_API_KEY", label: "OpenAI", help: "Language model, images, or voice" },
      { key: "GOOGLE_API_KEY", label: "Google AI", help: "Gemini, images, video, music, or voice" },
      { key: "OPENROUTER_API_KEY", label: "OpenRouter", help: "Language model gateway" },
      {
        key: "FREEREELS_LLM_API_KEY",
        label: "Custom LLM",
        help: "Optional key for a custom endpoint; local Ollama needs none",
      },
      { key: "TAVILY_API_KEY", label: "Tavily", help: "Web search for compatible language models" },
    ],
  },
  {
    title: "Voice",
    fields: [
      { key: "ELEVENLABS_API_KEY", label: "ElevenLabs", help: "Hosted voice generation" },
      { key: "INWORLD_TTS_API_KEY", label: "Inworld", help: "Hosted voice generation" },
    ],
  },
  {
    title: "Video and stock",
    fields: [
      { key: "FAL_API_KEY", label: "fal.ai", help: "Hosted video generation" },
      { key: "PEXELS_API_KEY", label: "Pexels", help: "Stock photo and video search" },
      { key: "PIXABAY_API_KEY", label: "Pixabay", help: "Stock photo and video search" },
    ],
  },
];

export function SettingsPage() {
  const [health, setHealth] = useState<Awaited<ReturnType<typeof api.getHealth>> | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [healthUnavailable, setHealthUnavailable] = useState(false);
  const [statsUnavailable, setStatsUnavailable] = useState(false);

  useEffect(() => {
    api
      .getHealth()
      .then(setHealth)
      .catch(() => setHealthUnavailable(true));
    api
      .getStats()
      .then(setStats)
      .catch(() => setStatsUnavailable(true));
  }, []);

  const avgCost = stats && stats.completedJobs > 0 ? stats.totalCost / stats.completedJobs : null;
  const healthLabel = healthUnavailable ? "Not connected" : "Checking connection";
  const serverLabel = health
    ? health.status === "healthy"
      ? "Connected"
      : "Needs attention"
    : healthLabel;
  const redisLabel = health
    ? health.redis === "connected"
      ? "Connected"
      : "Disconnected"
    : healthLabel;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 lg:px-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[1.5px] text-primary">Workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Settings &amp; setup</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Check that your services are running, see which provider keys are configured, and review
          your usage.
        </p>
      </header>

      <div className="flex flex-col gap-7">
        <section aria-labelledby="usage-heading">
          <div className="mb-3 flex items-center gap-2">
            <BarChart3 className="size-4 text-primary" />
            <h2 id="usage-heading" className="text-sm font-semibold">
              Usage overview
            </h2>
          </div>
          {stats ? (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatBox
                  icon={<Film className="size-4" />}
                  label="Videos created"
                  value={String(stats.totalJobs)}
                />
                <StatBox
                  icon={<CheckCircle className="size-4" />}
                  label="Completed"
                  value={String(stats.completedJobs)}
                  color="text-status-success"
                />
                <StatBox
                  icon={<XCircle className="size-4" />}
                  label="Failed"
                  value={String(stats.failedJobs)}
                  color="text-destructive"
                />
                <StatBox
                  icon={<DollarSign className="size-4" />}
                  label="Total spend"
                  value={`$${stats.totalCost.toFixed(2)}`}
                  color="text-status-info"
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {avgCost != null
                  ? `Average cost per completed video: $${avgCost.toFixed(2)}`
                  : "Costs are based on completed videos and provider usage."}
              </p>
            </>
          ) : (
            <div
              role={statsUnavailable ? "alert" : undefined}
              className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground"
            >
              {statsUnavailable
                ? "Usage data could not be loaded. Check that the API server is running."
                : "Loading your usage summary…"}
            </div>
          )}
        </section>

        <section aria-labelledby="system-heading">
          <div className="mb-3">
            <h2 id="system-heading" className="text-sm font-semibold">
              System health
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              These connections keep video jobs moving through the pipeline.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Server className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-medium">API server</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Receives and manages video jobs.
                    </p>
                  </div>
                </div>
                <StatusDot
                  ok={healthUnavailable ? false : health ? health.status === "healthy" : null}
                  label={serverLabel}
                />
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-300">
                    <Activity className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-medium">Redis queue</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Passes queued jobs to the worker.
                    </p>
                  </div>
                </div>
                <StatusDot
                  ok={healthUnavailable ? false : health ? health.redis === "connected" : null}
                  label={redisLabel}
                />
              </div>
            </div>
          </div>
          {healthUnavailable && (
            <p
              role="alert"
              className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-200"
            >
              Could not reach the API. Start the app with <code>docker compose up</code>, then
              refresh this page.
            </p>
          )}
        </section>

        <section aria-labelledby="keys-heading">
          <div className="mb-4 flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">
              <KeyRound className="size-4" />
            </span>
            <div>
              <h2 id="keys-heading" className="text-sm font-semibold">
                Provider keys
              </h2>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">
                Status only — secret values are never shown here. Add keys to the server&apos;s{" "}
                <code>.env</code> file and restart the API and worker.
              </p>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {API_KEY_GROUPS.map((group) => (
              <div key={group.title} className="rounded-xl border border-border bg-card p-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.title}
                </h3>
                <div className="flex flex-col gap-3">
                  {group.fields.map((field) => {
                    const isSet = health?.keys?.[field.key] ?? null;
                    const keyStatus = healthUnavailable ? false : isSet;
                    return (
                      <div
                        key={field.key}
                        className="flex items-start justify-between gap-2 border-t border-border/70 pt-3 first:border-0 first:pt-0"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{field.label}</p>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                            {field.help}
                          </p>
                          <code className="mt-1 block break-all text-[10px] text-text-faint">
                            {field.key}
                          </code>
                        </div>
                        <StatusDot
                          ok={keyStatus}
                          label={
                            healthUnavailable
                              ? "Unavailable"
                              : isSet !== null
                                ? isSet
                                  ? "Configured"
                                  : "Not set"
                                : health
                                  ? "Not reported"
                                  : "Checking"
                          }
                          colorBad="text-amber-300"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="local-heading"
          className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-card to-fuchsia-500/[0.04] p-4 sm:p-5"
        >
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Cpu className="size-4" />
            </span>
            <div>
              <h2 id="local-heading" className="text-sm font-semibold">
                Local options that need no API key
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Choose these in Advanced settings to avoid hosted text, voice, or music calls. AI
                image and video generation may still use paid hosted providers.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { title: "Ollama", detail: "Run an open LLM on your own computer." },
              { title: "Kokoro", detail: "Generate voice locally with no TTS key." },
              { title: "Bundled music", detail: "Use the included music library." },
            ].map((option) => (
              <div
                key={option.title}
                className="rounded-xl border border-border/70 bg-background/50 p-3"
              >
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="size-3.5 text-primary" />
                  {option.title}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {option.detail}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatusDot({
  ok,
  label,
  colorOk = "text-emerald-400",
  colorBad = "text-destructive",
}: {
  ok: boolean | null;
  label: string;
  colorOk?: string;
  colorBad?: string;
}) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 text-sm font-medium",
        ok === null ? "text-muted-foreground" : ok ? colorOk : colorBad,
      )}
    >
      <span
        className={cn(
          "inline-block size-2 rounded-full",
          ok === null ? "bg-muted-foreground/50" : ok ? "bg-emerald-400" : "bg-current",
        )}
      />
      {label}
    </span>
  );
}

function StatBox({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex size-8 items-center justify-center rounded-lg bg-surface-inset text-muted-foreground">
        {icon}
      </div>
      <span
        className={cn("block text-xl font-semibold tracking-tight", color ?? "text-foreground")}
      >
        {value}
      </span>
      <span className="mt-1 block text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

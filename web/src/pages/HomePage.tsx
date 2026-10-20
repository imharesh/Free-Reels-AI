import {
  ArrowRight,
  Gauge,
  Info,
  Lightbulb,
  MonitorPlay,
  Shuffle,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArchetypeCard } from "@/components/ArchetypeCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { type Archetype, api, type Platform, type ProviderOptions } from "@/hooks/useApi";
import { cn, formatArchetypeName } from "@/lib/utils";

const TOPIC_CATEGORIES: Record<string, string[]> = {
  History: [
    "How coffee changed history",
    "Ancient Rome's greatest inventions",
    "The fall of the Berlin Wall",
    "5 forgotten civilizations",
  ],
  Science: [
    "Black holes explained",
    "Why do we dream?",
    "CRISPR gene editing in 2026",
    "The science of time perception",
  ],
  Culture: [
    "How anime conquered the world",
    "The psychology of music",
    "Street food capitals of the world",
    "Why we love horror movies",
  ],
  Technology: [
    "Top 5 AI advancements in 2026",
    "How quantum computing works",
    "The future of space tourism",
    "Inside a data center",
  ],
};

const CATEGORY_KEYS = Object.keys(TOPIC_CATEGORIES);

const DISPLAY_NAMES: Record<string, string> = {
  // Platforms
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
  // LLM
  anthropic: "Anthropic (Claude)",
  openai: "OpenAI (GPT)",
  gemini: "Google Gemini",
  openrouter: "OpenRouter",
  "openai-compatible": "Custom (OpenAI-compatible)",
  // TTS
  elevenlabs: "ElevenLabs",
  inworld: "Inworld",
  kokoro: "Kokoro (Local)",
  "gemini-tts": "Gemini TTS",
  "openai-tts": "OpenAI TTS",
  // Image
  // gemini/openai already covered above
  // Music
  bundled: "Bundled (Free)",
  lyria: "Lyria 3 Pro",
  // Video
  fal: "fal.ai (Kling)",
};

function displayName(key: string): string {
  return DISPLAY_NAMES[key] ?? key;
}

export function HomePage() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [archetype, setArchetype] = useState("");
  const [platform, setPlatform] = useState("youtube");
  const [llmProvider, setLlmProvider] = useState("anthropic");
  const [llmModel, setLlmModel] = useState("");
  const [llmBaseUrl, setLlmBaseUrl] = useState("");
  const [searchProvider, setSearchProvider] = useState("");
  const [ttsProvider, setTtsProvider] = useState("elevenlabs");
  const [imageProvider, setImageProvider] = useState("gemini");
  const [musicProvider, setMusicProvider] = useState("bundled");
  const [pacing, setPacing] = useState("");
  const [dryRun, setDryRun] = useState(false);
  const [directionText, setDirectionText] = useState("");
  const [scoreJson, setScoreJson] = useState<Record<string, unknown> | null>(null);
  const [scoreFileName, setScoreFileName] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [archetypes, setArchetypes] = useState<Archetype[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [providers, setProviders] = useState<ProviderOptions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const topicRef = useRef<HTMLTextAreaElement>(null);

  // Topic inspiration
  const [activeCategory, setActiveCategory] = useState(CATEGORY_KEYS[0] ?? "History");
  const [shuffledTopics, setShuffledTopics] = useState<string[]>([]);

  useEffect(() => {
    api
      .listArchetypes()
      .then(setArchetypes)
      .catch(() => {});
    api
      .listPlatforms()
      .then(setPlatforms)
      .catch(() => {});
    api
      .listProviders()
      .then(setProviders)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setShuffledTopics(TOPIC_CATEGORIES[activeCategory] ?? []);
  }, [activeCategory]);

  useEffect(() => {
    const el = topicRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [topic]);

  const handleShuffle = () => {
    setShuffledTopics((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || loading) return;

    setLoading(true);
    setError("");

    try {
      const result = await api.createJob({
        topic: topic.trim(),
        archetype: archetype || undefined,
        pacing: pacing || undefined,
        platform,
        dryRun,
        ...(directionText.trim() ? { direction: directionText.trim() } : {}),
        ...(scoreJson ? { score: scoreJson } : {}),
        providers: {
          llm: llmProvider,
          tts: ttsProvider,
          image: imageProvider,
          music: musicProvider,
          ...(llmModel ? { llmModel } : {}),
          ...(llmBaseUrl ? { llmBaseUrl } : {}),
          ...(searchProvider ? { searchProvider } : {}),
        },
      });
      navigate(`/jobs/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create job");
      setLoading(false);
    }
  };

  const hasTopic = topic.trim().length > 0;

  return (
    <div className="relative flex min-h-screen flex-col items-center px-4 pb-10 pt-10 sm:px-6 sm:pt-[12vh] lg:px-12">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 size-[520px] -translate-x-1/2 rounded-full bg-violet-500/[0.07] blur-[120px]" />
      <div className="flex w-full max-w-[820px] flex-col items-stretch gap-6">
        {/* Input Card */}
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-8 text-center">
            <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">
              What story should we tell?
            </h1>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Describe a topic and we&apos;ll turn it into a fully rendered Short.
            </p>
          </div>
          <div
            className={cn(
              "rounded-2xl border bg-card/90 px-4 pb-4 pt-4 shadow-xl shadow-black/10 backdrop-blur-sm transition-all sm:px-5",
              hasTopic ? "border-primary/40 ring-1 ring-primary/10" : "border-border/80",
            )}
          >
            {/* Topic Input */}
            <label htmlFor="topic" className="sr-only">
              Start with a topic
            </label>
            <textarea
              id="topic"
              ref={topicRef}
              rows={2}
              value={topic}
              onChange={(e) => setTopic(e.target.value.replace(/\n/g, " "))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
              maxLength={200}
              placeholder="The science of black holes, how coffee changed history…"
              className="max-h-[260px] min-h-[64px] w-full resize-none bg-transparent text-sm leading-relaxed text-foreground placeholder:text-text-faint focus:outline-none sm:text-base"
            />

            {/* Controls Row */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {/* Platform selector */}
              <Select value={platform} onValueChange={(v) => v && setPlatform(v)}>
                <SelectTrigger
                  size="sm"
                  className="h-auto gap-1.5 rounded-lg border-border bg-transparent px-3 py-1.5 text-xs font-medium text-text-subtle"
                >
                  <MonitorPlay className="size-3.5 text-muted-foreground" />
                  <SelectValue>{displayName(platform)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => (
                    <SelectItem key={p.name} value={p.name}>
                      {displayName(p.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Pacing selector */}
              <Select value={pacing} onValueChange={(v) => setPacing(v ?? "")}>
                <SelectTrigger
                  size="sm"
                  className="h-auto gap-1.5 rounded-lg border-border bg-transparent px-3 py-1.5 text-xs font-medium text-text-subtle"
                >
                  <Gauge className="size-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Auto Pace" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Auto Pace</SelectItem>
                  <SelectItem value="fast">Fast</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="cinematic">Cinematic</SelectItem>
                </SelectContent>
              </Select>

              {/* Advanced toggle */}
              <button
                type="button"
                aria-expanded={showAdvanced}
                aria-controls="advanced-options"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                  showAdvanced
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-transparent text-text-subtle hover:text-foreground",
                )}
              >
                <SlidersHorizontal className="size-3.5 text-muted-foreground" />
                Advanced
              </button>

              {/* Generate */}
              <Button
                type="submit"
                disabled={!hasTopic || loading}
                className="ml-auto h-9 gap-2 rounded-lg px-6 text-xs font-semibold"
              >
                {loading ? "Starting..." : "Generate"}
                {!loading && <ArrowRight className="size-4" />}
              </Button>
            </div>

            {/* Advanced Options Panel */}
            {showAdvanced && (
              <div id="advanced-options" className="mt-5 border-t border-border pt-5">
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/[0.06] px-3 py-2.5">
                  <Info className="size-4 shrink-0 text-primary" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Defaults are ready to use.</span>{" "}
                    Hosted services may charge; keys live in server <code>.env</code>. Stock/video
                    can activate automatically.
                  </p>
                </div>

                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-subtle">
                  Reel services
                </h3>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-xl border border-border/80 bg-background/30 p-3">
                    <label
                      htmlFor="llm-provider"
                      className="mb-1.5 block text-xs font-medium text-muted-foreground"
                    >
                      Script & planning
                    </label>
                    <Select value={llmProvider} onValueChange={(v) => v && setLlmProvider(v)}>
                      <SelectTrigger id="llm-provider" className="h-9 w-full rounded-lg">
                        <SelectValue>{displayName(llmProvider)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {providers?.llm.map((p) => (
                          <SelectItem key={p.key} value={p.key}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldHint>Creates the story. Ollama works through Custom.</FieldHint>
                  </div>

                  <div className="rounded-xl border border-border/80 bg-background/30 p-3">
                    <label
                      htmlFor="tts-provider"
                      className="mb-1.5 block text-xs font-medium text-muted-foreground"
                    >
                      Voiceover
                    </label>
                    <Select value={ttsProvider} onValueChange={(v) => v && setTtsProvider(v)}>
                      <SelectTrigger id="tts-provider" className="h-9 w-full rounded-lg">
                        <SelectValue>{displayName(ttsProvider)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {providers?.tts.map((p) => (
                          <SelectItem key={p.key} value={p.key}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldHint>Narrates the script. Kokoro runs locally.</FieldHint>
                  </div>

                  <div className="rounded-xl border border-border/80 bg-background/30 p-3">
                    <label
                      htmlFor="image-provider"
                      className="mb-1.5 block text-xs font-medium text-muted-foreground"
                    >
                      Scene images
                    </label>
                    <Select value={imageProvider} onValueChange={(v) => v && setImageProvider(v)}>
                      <SelectTrigger id="image-provider" className="h-9 w-full rounded-lg">
                        <SelectValue>{displayName(imageProvider)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {providers?.image.map((p) => (
                          <SelectItem key={p.key} value={p.key}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldHint>Creates visuals. Hosted image generation may cost.</FieldHint>
                  </div>

                  <div className="rounded-xl border border-border/80 bg-background/30 p-3">
                    <label
                      htmlFor="music-provider"
                      className="mb-1.5 block text-xs font-medium text-muted-foreground"
                    >
                      Background music
                    </label>
                    <Select value={musicProvider} onValueChange={(v) => v && setMusicProvider(v)}>
                      <SelectTrigger id="music-provider" className="h-9 w-full rounded-lg">
                        <SelectValue>{displayName(musicProvider)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bundled">Bundled (Free)</SelectItem>
                        <SelectItem value="lyria">Lyria 3 Pro ($0.08)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldHint>Bundled is free; Lyria may cost.</FieldHint>
                  </div>

                  {/* Conditional LLM config fields */}
                  {(llmProvider === "openrouter" || llmProvider === "openai-compatible") && (
                    <div className="rounded-xl border border-border/80 bg-background/30 p-3">
                      <label
                        htmlFor="llm-model"
                        className="mb-1.5 block text-xs font-medium text-muted-foreground"
                      >
                        Model ID
                      </label>
                      <Input
                        id="llm-model"
                        className="h-9 rounded-lg text-sm"
                        placeholder={
                          llmProvider === "openrouter" ? "anthropic/claude-sonnet-4" : "llama3:8b"
                        }
                        value={llmModel}
                        onChange={(e) => setLlmModel(e.target.value)}
                      />
                      <FieldHint>Use the model ID from your provider or Ollama.</FieldHint>
                    </div>
                  )}

                  {llmProvider === "openai-compatible" && (
                    <div className="rounded-xl border border-border/80 bg-background/30 p-3">
                      <label
                        htmlFor="llm-base-url"
                        className="mb-1.5 block text-xs font-medium text-muted-foreground"
                      >
                        Base URL
                      </label>
                      <Input
                        id="llm-base-url"
                        className="h-9 rounded-lg text-sm"
                        placeholder="http://host.docker.internal:11434/v1"
                        value={llmBaseUrl}
                        onChange={(e) => setLlmBaseUrl(e.target.value)}
                      />
                      <FieldHint>
                        Docker: <code>http://host.docker.internal:11434/v1</code> · Local app:{" "}
                        <code>http://localhost:11434/v1</code>
                      </FieldHint>
                    </div>
                  )}

                  <div className="rounded-xl border border-border/80 bg-background/30 p-3">
                    <label
                      htmlFor="search-provider"
                      className="mb-1.5 block text-xs font-medium text-muted-foreground"
                    >
                      Web research
                    </label>
                    <Select
                      value={searchProvider}
                      onValueChange={(v) => setSearchProvider(v ?? "")}
                    >
                      <SelectTrigger id="search-provider" className="h-9 w-full rounded-lg">
                        <SelectValue placeholder="Auto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Auto</SelectItem>
                        {providers?.search?.map((p) => (
                          <SelectItem key={p.key} value={p.key}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldHint>Auto is recommended. Tavily needs a server key.</FieldHint>
                  </div>
                </div>

                {/* Dry Run */}
                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-border bg-background/40 p-3">
                  <div className="min-w-0">
                    <h3 className="text-xs font-medium text-foreground">Plan only</h3>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      No voice, images, music, or video. Text services may still cost.
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Switch
                      checked={dryRun}
                      onCheckedChange={setDryRun}
                      size="sm"
                      aria-label="Dry run: plan only"
                    />
                    <span className="min-w-7 text-xs text-muted-foreground">
                      {dryRun ? "On" : "Off"}
                    </span>
                  </div>
                </div>

                {/* Direction & Replay */}
                <div className="mt-3 grid grid-cols-1 gap-2.5 border-t border-border pt-3 lg:grid-cols-2">
                  <div className="rounded-xl border border-border bg-background/40 p-3">
                    <label
                      htmlFor="creative-direction"
                      className="block text-sm font-medium text-foreground"
                    >
                      Creative direction{" "}
                      <span className="font-normal text-muted-foreground">(optional)</span>
                    </label>
                    <p className="mb-2 mt-1 text-[11px] text-muted-foreground">
                      Set the tone or tell it what to avoid.
                    </p>
                    <textarea
                      id="creative-direction"
                      className="min-h-[100px] w-full resize-y rounded-lg border border-border bg-transparent px-3 py-2 text-sm placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-primary/40"
                      placeholder="Friendly tone, simple language, warm visuals..."
                      value={directionText}
                      onChange={(e) => {
                        const bytes = new TextEncoder().encode(e.target.value).length;
                        if (bytes <= 10240) setDirectionText(e.target.value);
                      }}
                      rows={3}
                    />
                    <p className="mt-1 text-right text-[10px] text-muted-foreground">
                      {new TextEncoder().encode(directionText).length.toLocaleString()} / 10,240
                      bytes
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-background/40 p-3">
                    <label
                      htmlFor="replay-score"
                      className="block text-sm font-medium text-foreground"
                    >
                      Reuse a scene plan{" "}
                      <span className="font-normal text-muted-foreground">(optional)</span>
                    </label>
                    <p className="mb-2 mt-1 text-[11px] text-muted-foreground">
                      Upload a <code>score.json</code> to rebuild its voice, visuals, and video.
                      Hosted services may cost.
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        id="replay-score"
                        type="file"
                        accept=".json"
                        className="h-9 rounded-lg text-sm file:mr-2 file:rounded-md file:border-0 file:bg-primary/10 file:px-2 file:py-1 file:text-xs file:font-medium file:text-primary"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) {
                            setScoreJson(null);
                            setScoreFileName("");
                            return;
                          }
                          try {
                            const text = await file.text();
                            setScoreJson(JSON.parse(text));
                            setScoreFileName(file.name);
                          } catch {
                            setError("Invalid JSON in score file");
                            setScoreJson(null);
                            setScoreFileName("");
                          }
                        }}
                      />
                      {scoreFileName && (
                        <span className="max-w-[120px] truncate text-xs text-muted-foreground">
                          {scoreFileName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            Hosted providers may charge. The job page shows an estimate after the script is planned.
          </p>

          {/* Error */}
          {error && (
            <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </form>

        {/* Visual Style */}
        {archetypes.length > 0 && (
          <div className="w-full">
            <div className="mb-2 flex items-center justify-between gap-3 px-1">
              <h2 className="text-xs font-semibold tracking-tight text-text-subtle">
                Choose a visual style
              </h2>
              <span className="text-[11px] text-muted-foreground">
                {archetype ? formatArchetypeName(archetype) : "AI picks for you"}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <ArchetypeCard
                archetype={null}
                selected={archetype === ""}
                onClick={() => setArchetype("")}
              />
              {archetypes.map((a) => (
                <ArchetypeCard
                  key={a.name}
                  archetype={a}
                  selected={archetype === a.name}
                  onClick={() => setArchetype(a.name)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Topic Inspiration */}
        <div className="w-full">
          <div className="mb-3 flex items-center gap-3">
            {CATEGORY_KEYS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  activeCategory === cat
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {cat}
              </button>
            ))}
            <button
              type="button"
              onClick={handleShuffle}
              className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Shuffle className="size-3" />
              Shuffle
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {shuffledTopics.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setTopic(s)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/50 px-3.5 py-1.5 text-xs font-normal text-text-subtle transition-colors hover:bg-accent hover:text-accent-foreground whitespace-nowrap"
              >
                <Lightbulb className="size-3.5 text-primary" />
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{children}</p>;
}

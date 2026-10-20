import fs from "node:fs";
import path from "node:path";

interface RunLog {
  topic: string;
  startedAt: string;
  stages: { name: string; duration: number; status: string; error?: string }[];
  totalCost?: { estimated: number; actual?: number };
}

interface RunEntry {
  dir: string;
  topic: string;
  date: string;
  stages: { done: number; total: number };
  totalDuration: number;
  estimated: number | null;
  actual: number | null;
}

/**
 * Scan the output directory for log.json files and display aggregated cost usage.
 */
export function showUsageReport(outputDir: string): void {
  const resolved = path.resolve(outputDir);

  if (!fs.existsSync(resolved)) {
    console.log(`\nNo output directory found at: ${resolved}`);
    console.log("Run the pipeline first to generate output.\n");
    return;
  }

  const entries: RunEntry[] = [];
  let dirs: string[];
  try {
    dirs = fs.readdirSync(resolved).sort();
  } catch {
    console.log(`\nCannot read output directory: ${resolved}\n`);
    return;
  }

  for (const dir of dirs) {
    const logPath = path.join(resolved, dir, "log.json");
    if (!fs.existsSync(logPath)) continue;

    try {
      const raw = fs.readFileSync(logPath, "utf-8");
      const log: RunLog = JSON.parse(raw);

      const doneStages = log.stages.filter((s) => s.status === "done").length;
      const totalDuration = log.stages.reduce((sum, s) => sum + (s.duration ?? 0), 0);

      entries.push({
        dir,
        topic: log.topic,
        date: log.startedAt,
        stages: { done: doneStages, total: log.stages.length },
        totalDuration,
        estimated: log.totalCost?.estimated ?? null,
        actual: log.totalCost?.actual ?? null,
      });
    } catch {
      // Skip malformed log files
    }
  }

  if (entries.length === 0) {
    console.log(`\nNo run logs found in: ${resolved}`);
    console.log("Runs without log.json files (e.g. deleted or incomplete) are not included.\n");
    return;
  }

  // Aggregate totals
  const totalEstimated = entries.reduce((sum, e) => sum + (e.estimated ?? 0), 0);
  const totalActual = entries.reduce((sum, e) => sum + (e.actual ?? 0), 0);
  const runsWithActual = entries.filter((e) => e.actual !== null).length;
  const runsWithEstimate = entries.filter((e) => e.estimated !== null).length;

  const BOLD = "\x1b[1m";
  const DIM = "\x1b[2m";
  const RESET = "\x1b[0m";
  const CYAN = "\x1b[36m";
  const GREEN = "\x1b[32m";
  const YELLOW = "\x1b[33m";

  // Header
  console.log();
  console.log(`${BOLD}Free Reels AI Usage Report${RESET}`);
  console.log(`${DIM}${"─".repeat(60)}${RESET}`);
  console.log(`${DIM}Source: ${resolved}${RESET}`);
  console.log(`${DIM}Runs found: ${entries.length} (from log.json files in output directories)${RESET}`);
  console.log();

  // Summary box
  console.log(`${BOLD}  Total Cost Summary${RESET}`);
  console.log(`${DIM}  ${"─".repeat(40)}${RESET}`);
  if (runsWithActual > 0) {
    console.log(`  ${GREEN}Actual cost:${RESET}    ${BOLD}$${totalActual.toFixed(4)}${RESET}  ${DIM}(${runsWithActual} runs)${RESET}`);
  }
  if (runsWithEstimate > 0) {
    console.log(`  ${CYAN}Estimated cost:${RESET} ${BOLD}$${totalEstimated.toFixed(4)}${RESET}  ${DIM}(${runsWithEstimate} runs)${RESET}`);
  }
  if (runsWithActual === 0 && runsWithEstimate === 0) {
    console.log(`  ${DIM}No cost data recorded in any run.${RESET}`);
  }
  console.log();

  // Per-run table
  console.log(`${BOLD}  Run Details${RESET}`);
  console.log(`${DIM}  ${"─".repeat(40)}${RESET}`);

  for (const entry of entries) {
    const dateStr = formatDate(entry.date);
    const topicDisplay = truncate(entry.topic, 50);
    const stageStr = `${entry.stages.done}/${entry.stages.total} stages`;
    const durationStr = formatDuration(entry.totalDuration);

    console.log();
    console.log(`  ${BOLD}${topicDisplay}${RESET}`);
    console.log(`  ${DIM}${dateStr}  |  ${stageStr}  |  ${durationStr}${RESET}`);

    if (entry.actual !== null) {
      console.log(`  ${GREEN}Actual: $${entry.actual.toFixed(4)}${RESET}`);
    } else if (entry.estimated !== null) {
      console.log(`  ${CYAN}Estimated: $${entry.estimated.toFixed(4)}${RESET}  ${DIM}(pipeline did not complete)${RESET}`);
    } else {
      console.log(`  ${DIM}No cost data${RESET}`);
    }
  }

  // Footer
  console.log();
  console.log(`${DIM}${"─".repeat(60)}${RESET}`);
  console.log(`${YELLOW}Note:${RESET} This report is based on log.json files in the output directory.`);
  console.log(`If you delete a run folder, its cost data will no longer appear here.`);
  console.log();
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs.toFixed(0)}s`;
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + "…";
}

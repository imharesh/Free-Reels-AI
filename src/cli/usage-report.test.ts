import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { showUsageReport } from "./usage-report.js";

describe("showUsageReport", () => {
  let tmpDir: string;
  let logs: string[];

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "freereels-usage-test-"));
    logs = [];
    vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => {
      logs.push(args.map(String).join(" "));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("handles nonexistent output directory", () => {
    showUsageReport(path.join(tmpDir, "nope"));
    const output = logs.join("\n");
    expect(output).toContain("No output directory found");
  });

  it("handles empty output directory", () => {
    showUsageReport(tmpDir);
    const output = logs.join("\n");
    expect(output).toContain("No run logs found");
  });

  it("handles run dirs without log.json", () => {
    fs.mkdirSync(path.join(tmpDir, "2026-04-07-120000-test"));
    showUsageReport(tmpDir);
    const output = logs.join("\n");
    expect(output).toContain("No run logs found");
  });

  it("displays cost summary from log.json files", () => {
    // Create two run directories with log.json
    const run1 = path.join(tmpDir, "2026-04-06-120000-topic-one");
    fs.mkdirSync(run1);
    fs.writeFileSync(
      path.join(run1, "log.json"),
      JSON.stringify({
        topic: "topic one",
        startedAt: "2026-04-06T12:00:00.000Z",
        stages: [
          { name: "research", duration: 10, status: "done" },
          { name: "director", duration: 15, status: "done" },
        ],
        totalCost: { estimated: 0.5, actual: 0.3 },
      }),
    );

    const run2 = path.join(tmpDir, "2026-04-07-120000-topic-two");
    fs.mkdirSync(run2);
    fs.writeFileSync(
      path.join(run2, "log.json"),
      JSON.stringify({
        topic: "topic two",
        startedAt: "2026-04-07T12:00:00.000Z",
        stages: [{ name: "research", duration: 5, status: "done" }],
        totalCost: { estimated: 0.8 },
      }),
    );

    showUsageReport(tmpDir);
    const output = logs.join("\n");

    expect(output).toContain("Usage Report");
    expect(output).toContain("Runs found: 2");
    expect(output).toContain("$0.3000"); // actual from run1
    expect(output).toContain("$1.3000"); // total estimated (0.5 + 0.8)
    expect(output).toContain("topic one");
    expect(output).toContain("topic two");
    expect(output).toContain("log.json");
  });

  it("skips malformed log.json files", () => {
    const run1 = path.join(tmpDir, "2026-04-06-120000-bad");
    fs.mkdirSync(run1);
    fs.writeFileSync(path.join(run1, "log.json"), "not valid json");

    const run2 = path.join(tmpDir, "2026-04-07-120000-good");
    fs.mkdirSync(run2);
    fs.writeFileSync(
      path.join(run2, "log.json"),
      JSON.stringify({
        topic: "good run",
        startedAt: "2026-04-07T12:00:00.000Z",
        stages: [{ name: "research", duration: 5, status: "done" }],
        totalCost: { estimated: 0.25, actual: 0.2 },
      }),
    );

    showUsageReport(tmpDir);
    const output = logs.join("\n");
    expect(output).toContain("Runs found: 1");
    expect(output).toContain("good run");
  });

  it("shows note about deleted runs", () => {
    const run1 = path.join(tmpDir, "2026-04-06-120000-test");
    fs.mkdirSync(run1);
    fs.writeFileSync(
      path.join(run1, "log.json"),
      JSON.stringify({
        topic: "test",
        startedAt: "2026-04-06T12:00:00.000Z",
        stages: [],
      }),
    );

    showUsageReport(tmpDir);
    const output = logs.join("\n");
    expect(output).toContain("delete a run folder");
    expect(output).toContain("no longer appear");
  });
});

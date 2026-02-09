#!/usr/bin/env node

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const TAB_PRIORITY = [
  "home",
  "career",
  "catalog",
  "collection",
  "upgrades",
  "workshop",
  "maison",
  "nostalgia",
  "stats",
  "save",
  "misc",
];

const RUBRIC_ORDER = ["nav", "cta", "overlay", "density", "gating", "meta"];

function parseArgs(argv) {
  const args = [...argv];
  let root = null;

  while (args.length > 0) {
    const current = args.shift();
    if (current === "--root") {
      if (args.length === 0) {
        throw new Error("Missing value for --root");
      }
      root = args.shift();
      continue;
    }
    throw new Error(`Unknown flag: ${current}`);
  }

  return { root };
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function compareTabIds(left, right) {
  const leftIndex = TAB_PRIORITY.indexOf(left);
  const rightIndex = TAB_PRIORITY.indexOf(right);
  const leftRank = leftIndex === -1 ? TAB_PRIORITY.length + 1 : leftIndex;
  const rightRank = rightIndex === -1 ? TAB_PRIORITY.length + 1 : rightIndex;
  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }
  return left.localeCompare(right);
}

function inferTabId(label) {
  const normalized = String(label ?? "").toLowerCase();
  for (const tabId of TAB_PRIORITY) {
    if (tabId === "misc") {
      continue;
    }
    if (normalized.startsWith(`${tabId}-`) || normalized.includes(`-${tabId}-`)) {
      return tabId;
    }
  }
  return "misc";
}

function inferRubricTags(tabId, label) {
  const text = `${tabId} ${String(label ?? "")}`.toLowerCase();
  const tags = new Set();

  if (
    /\b(tab|entry-full|home-shell|visible-tabs|navigation|career|catalog|collection|upgrades|workshop|maison|nostalgia|stats|save)\b/.test(
      text,
    )
  ) {
    tags.add("nav");
  }
  if (/\b(button|buy|import|export|run|upgrade|open|review|confirm|cancel|clear|toggle|action)\b/.test(text)) {
    tags.add("cta");
  }
  if (/\b(overlay|modal|sheet|help|dialog)\b/.test(text)) {
    tags.add("overlay");
  }
  if (/\b(expanded-full|entry-full|final-full|compact|density|details|board|summary)\b/.test(text)) {
    tags.add("density");
  }
  if (/\b(lock|unlock|gating|blocked|danger|reset|prestige|affordable|ready)\b/.test(text)) {
    tags.add("gating");
  }
  if (/\b(workshop|maison|nostalgia|prestige|heritage|meta|resets?)\b/.test(text)) {
    tags.add("meta");
  }

  if (tags.size === 0) {
    tags.add("cta");
  }

  return RUBRIC_ORDER.filter((tag) => tags.has(tag));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function resolveRoot(inputRoot) {
  if (inputRoot) {
    return path.resolve(inputRoot);
  }

  const playwrightDir = path.resolve("output/playwright");
  const entries = await readdir(playwrightDir, { withFileTypes: true });
  const candidates = entries
    .filter((entry) => entry.isDirectory() && /^full-ui-coverage-audit-\d{8}$/.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  if (candidates.length === 0) {
    throw new Error("No full-ui-coverage-audit-* directory found under output/playwright");
  }

  return path.join(playwrightDir, candidates[candidates.length - 1]);
}

function toPathWithinRoot(rootDir, recordedPath) {
  const rootNormalized = path.resolve(rootDir);
  const absoluteRecorded = path.isAbsolute(recordedPath)
    ? path.normalize(recordedPath)
    : path.resolve(recordedPath);

  if (absoluteRecorded.startsWith(rootNormalized + path.sep)) {
    return toPosix(path.relative(rootNormalized, absoluteRecorded));
  }

  const rootAsPosix = toPosix(path.normalize(rootDir));
  const recordedAsPosix = toPosix(path.normalize(recordedPath));
  if (recordedAsPosix.startsWith(`${rootAsPosix}/`)) {
    return recordedAsPosix.slice(rootAsPosix.length + 1);
  }

  return toPosix(recordedPath.replace(/^\.\//, ""));
}

async function loadProjectData(rootDir, projectDirName) {
  const projectDir = path.join(rootDir, projectDirName);
  const tabsDir = path.join(projectDir, "tabs");

  const grouped = new Map();
  let coverageByTab = {};

  try {
    const tabEntries = await readdir(tabsDir, { withFileTypes: true });
    const tabFiles = tabEntries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".manifest.json"))
      .map((entry) => entry.name)
      .sort();

    for (const file of tabFiles) {
      const raw = await readFile(path.join(tabsDir, file), "utf8");
      const payload = JSON.parse(raw);
      const tabId = payload.tabId ?? file.replace(/\.manifest\.json$/, "");
      const records = Array.isArray(payload.records) ? payload.records : [];
      const coverage = payload.coverage ?? { candidateCount: 0, interactedCount: 0 };
      grouped.set(tabId, records);
      coverageByTab[tabId] = coverage;
    }
  } catch {
    // Tab manifests are optional; fallback to project manifest below.
  }

  if (grouped.size === 0) {
    const manifestPath = path.join(projectDir, "manifest.json");
    try {
      const raw = await readFile(manifestPath, "utf8");
      const records = JSON.parse(raw);
      if (Array.isArray(records)) {
        for (const record of records) {
          const tabId = inferTabId(record.label);
          const next = grouped.get(tabId) ?? [];
          next.push(record);
          grouped.set(tabId, next);
        }
      }
    } catch {
      return null;
    }
  }

  if (Object.keys(coverageByTab).length === 0) {
    try {
      const coverageRaw = await readFile(path.join(projectDir, "coverage.json"), "utf8");
      coverageByTab = JSON.parse(coverageRaw);
    } catch {
      coverageByTab = {};
    }
  }

  const tabs = Array.from(grouped.entries())
    .map(([tabId, records]) => ({
      tabId,
      records: records
        .map((record) => ({
          file: record.file,
          label: record.label,
          fullPage: Boolean(record.fullPage),
        }))
        .sort((left, right) => String(left.file).localeCompare(String(right.file))),
      coverage: coverageByTab[tabId] ?? { candidateCount: 0, interactedCount: 0 },
    }))
    .sort((left, right) => compareTabIds(left.tabId, right.tabId));

  return {
    project: projectDirName,
    projectDir,
    tabs,
  };
}

function buildChecklistMarkdown(project, tabId, rows) {
  const lines = [];
  lines.push(`# ${project} / ${tabId} review checklist`);
  lines.push("");
  lines.push("Rubric tags: `nav`, `cta`, `overlay`, `density`, `gating`, `meta`");
  lines.push("");

  for (const row of rows) {
    const tags = row.tags.map((tag) => `\`${tag}\``).join(" ");
    lines.push(`- [ ] ${tags} ${row.label} ([image](${row.reviewRelativePath}))`);
  }

  lines.push("");
  return `${lines.join("\n")}\n`;
}

function buildContactSheetHtml(title, rows) {
  const cards = rows
    .map(
      (row) => `\n      <figure class="shot">\n        <img src="${escapeHtml(row.reviewRelativePath)}" alt="${escapeHtml(row.label)}" loading="lazy" />\n        <figcaption>\n          <strong>${escapeHtml(row.label)}</strong><br />\n          <span>${escapeHtml(row.tags.join(", "))}</span>\n        </figcaption>\n      </figure>`,
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root { color-scheme: light dark; }
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 0; padding: 24px; }
      h1 { margin: 0 0 16px; font-size: 1.25rem; }
      .grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
      .shot { margin: 0; border: 1px solid rgba(128, 128, 128, 0.35); border-radius: 10px; overflow: hidden; }
      .shot img { width: 100%; display: block; }
      .shot figcaption { padding: 8px 10px; font-size: 0.8rem; line-height: 1.35; }
      .shot strong { font-size: 0.85rem; }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(title)}</h1>
    <section class="grid">${cards}
    </section>
  </body>
</html>
`;
}

function formatPercent(numerator, denominator) {
  if (denominator <= 0) {
    return "n/a";
  }
  return `${((numerator / denominator) * 100).toFixed(1)}%`;
}

async function writeProjectArtifacts(rootDir, projectData) {
  const reviewSheetsDir = path.join(rootDir, "review-sheets");
  await mkdir(reviewSheetsDir, { recursive: true });

  const tabSummaries = [];
  const combinedRows = [];

  for (const tab of projectData.tabs) {
    const rows = tab.records.map((record) => {
      const withinRoot = toPathWithinRoot(rootDir, record.file);
      const absolute = path.join(rootDir, withinRoot);
      const reviewRelativePath = toPosix(path.relative(reviewSheetsDir, absolute));
      return {
        ...record,
        withinRoot,
        reviewRelativePath,
        tags: inferRubricTags(tab.tabId, record.label),
      };
    });

    combinedRows.push(...rows.map((row) => ({ ...row, tabId: tab.tabId })));

    const checklistPath = path.join(reviewSheetsDir, `${projectData.project}-${tab.tabId}-checklist.md`);
    await writeFile(checklistPath, buildChecklistMarkdown(projectData.project, tab.tabId, rows), "utf8");

    const contactSheetPath = path.join(reviewSheetsDir, `${projectData.project}-${tab.tabId}.html`);
    await writeFile(
      contactSheetPath,
      buildContactSheetHtml(`${projectData.project} / ${tab.tabId} contact sheet`, rows),
      "utf8",
    );

    tabSummaries.push({
      tabId: tab.tabId,
      captures: rows.length,
      candidateCount: tab.coverage.candidateCount,
      interactedCount: tab.coverage.interactedCount,
      representedPercent: formatPercent(tab.coverage.interactedCount, tab.coverage.candidateCount),
      checklist: toPosix(path.relative(rootDir, checklistPath)),
      contactSheet: toPosix(path.relative(rootDir, contactSheetPath)),
    });
  }

  const allContactSheetPath = path.join(reviewSheetsDir, `${projectData.project}-all.html`);
  await writeFile(
    allContactSheetPath,
    buildContactSheetHtml(`${projectData.project} / all tabs contact sheet`, combinedRows),
    "utf8",
  );

  const combinedRecords = projectData.tabs
    .flatMap((tab) => tab.records)
    .sort((left, right) => String(left.file).localeCompare(String(right.file)));
  await writeFile(path.join(projectData.projectDir, "manifest.json"), JSON.stringify(combinedRecords, null, 2), "utf8");

  const coverageByTab = Object.fromEntries(
    projectData.tabs.map((tab) => [tab.tabId, tab.coverage]),
  );
  await writeFile(path.join(projectData.projectDir, "coverage.json"), JSON.stringify(coverageByTab, null, 2), "utf8");

  const tabsDir = path.join(projectData.projectDir, "tabs");
  await mkdir(tabsDir, { recursive: true });
  for (const tab of projectData.tabs) {
    await writeFile(
      path.join(tabsDir, `${tab.tabId}.manifest.json`),
      JSON.stringify(
        {
          project: projectData.project,
          tabId: tab.tabId,
          capturedAt: new Date().toISOString(),
          coverage: tab.coverage,
          records: tab.records,
        },
        null,
        2,
      ),
      "utf8",
    );
  }

  const projectCoverageNumerator = tabSummaries.reduce((sum, tab) => sum + tab.interactedCount, 0);
  const projectCoverageDenominator = tabSummaries.reduce((sum, tab) => sum + tab.candidateCount, 0);

  const projectIndex = {
    project: projectData.project,
    generatedAt: new Date().toISOString(),
    totalCaptures: combinedRecords.length,
    representedCoveragePercent: formatPercent(projectCoverageNumerator, projectCoverageDenominator),
    allContactSheet: toPosix(path.relative(rootDir, allContactSheetPath)),
    tabs: tabSummaries,
  };

  await writeFile(
    path.join(projectData.projectDir, "index.json"),
    JSON.stringify(projectIndex, null, 2),
    "utf8",
  );

  const projectIndexMdLines = [
    `# ${projectData.project} audit index`,
    "",
    `- Total captures: **${combinedRecords.length}**`,
    `- Represented interactive coverage: **${projectIndex.representedCoveragePercent}**`,
    `- Contact sheet: [all tabs](${toPosix(path.relative(projectData.projectDir, allContactSheetPath))})`,
    "",
    "| Tab | Captures | Coverage | Checklist | Contact sheet |",
    "| --- | ---: | ---: | --- | --- |",
  ];

  for (const tab of tabSummaries) {
    const checklistPath = toPosix(path.relative(projectData.projectDir, path.join(rootDir, tab.checklist)));
    const sheetPath = toPosix(path.relative(projectData.projectDir, path.join(rootDir, tab.contactSheet)));
    projectIndexMdLines.push(
      `| ${tab.tabId} | ${tab.captures} | ${tab.representedPercent} | [checklist](${checklistPath}) | [sheet](${sheetPath}) |`,
    );
  }

  projectIndexMdLines.push("", "");
  await writeFile(path.join(projectData.projectDir, "index.md"), `${projectIndexMdLines.join("\n")}`, "utf8");

  return projectIndex;
}

async function main() {
  const { root } = parseArgs(process.argv.slice(2));
  const rootDir = await resolveRoot(root);

  const entries = await readdir(rootDir, { withFileTypes: true });
  const projectDirs = entries
    .filter((entry) => entry.isDirectory() && entry.name !== "review-sheets")
    .map((entry) => entry.name)
    .sort();

  const projectIndexes = [];
  for (const project of projectDirs) {
    const data = await loadProjectData(rootDir, project);
    if (!data || data.tabs.length === 0) {
      continue;
    }
    const index = await writeProjectArtifacts(rootDir, data);
    projectIndexes.push(index);
  }

  if (projectIndexes.length === 0) {
    throw new Error(`No project manifests discovered under ${rootDir}`);
  }

  const totalCaptures = projectIndexes.reduce((sum, project) => sum + project.totalCaptures, 0);
  const rootSummary = {
    root: toPosix(path.relative(process.cwd(), rootDir) || "."),
    generatedAt: new Date().toISOString(),
    totalCaptures,
    projects: projectIndexes,
  };

  await writeFile(path.join(rootDir, "index.json"), JSON.stringify(rootSummary, null, 2), "utf8");

  const rootIndexLines = [
    `# Full UI Audit Index (${path.basename(rootDir)})`,
    "",
    `- Generated: ${rootSummary.generatedAt}`,
    `- Total captures: **${totalCaptures}**`,
    "",
    "| Project | Captures | Coverage | Project index |",
    "| --- | ---: | ---: | --- |",
  ];

  for (const project of projectIndexes) {
    const projectIndexPath = toPosix(path.join(project.project, "index.md"));
    rootIndexLines.push(
      `| ${project.project} | ${project.totalCaptures} | ${project.representedCoveragePercent} | [index](${projectIndexPath}) |`,
    );
  }

  rootIndexLines.push("", "## Review Sheets", "");
  for (const project of projectIndexes) {
    rootIndexLines.push(`- ${project.project}`);
    for (const tab of project.tabs) {
      rootIndexLines.push(
        `  - ${tab.tabId}: [checklist](review-sheets/${project.project}-${tab.tabId}-checklist.md), [sheet](review-sheets/${project.project}-${tab.tabId}.html)`,
      );
    }
    rootIndexLines.push(`  - all tabs: [sheet](review-sheets/${project.project}-all.html)`);
  }

  rootIndexLines.push("", "");
  await writeFile(path.join(rootDir, "index.md"), `${rootIndexLines.join("\n")}`, "utf8");

  for (const project of projectIndexes) {
    console.log(
      `${project.project}: captures=${project.totalCaptures}, representedCoverage=${project.representedCoveragePercent}`,
    );
  }
  console.log(`Wrote audit index: ${path.join(rootDir, "index.md")}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

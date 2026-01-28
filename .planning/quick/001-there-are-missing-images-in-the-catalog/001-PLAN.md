---
phase: quick-001-there-are-missing-images-in-the-catalog
plan: 001
type: execute
wave: 1
depends_on: []
files_modified:
  - tests/catalog-images.spec.ts
  - scripts/catalog/sync-catalog-images.js
  - public/catalog/**
autonomous: false

must_haves:
  truths:
    - "Catalog renders without image fallbacks for any entry"
    - "Missing catalog images fail CI via a dedicated Playwright E2E test"
    - "All catalog entries with Wikimedia-backed images have corresponding files under public/catalog"
  artifacts:
    - path: "tests/catalog-images.spec.ts"
      provides: "E2E regression: all catalog image URLs under BASE_URL return 200 + image content-type"
    - path: "scripts/catalog/sync-catalog-images.js"
      provides: "Local audit + optional download of missing catalog images"
    - path: "public/catalog/"
      provides: "Static catalog image files (mirrors Wikimedia commons relative paths)"
  key_links:
    - from: "src/game/catalog.ts"
      to: "public/catalog/<relative>"
      via: "getCatalogImageUrl maps Wikimedia URL -> `${import.meta.env.BASE_URL}catalog/<relative>`"
      pattern: "getCatalogImageUrl"
    - from: "tests/catalog-images.spec.ts"
      to: "playwright.config.ts baseURL"
      via: "page.request against the running dev server"
      pattern: "baseURL"
---

<objective>
Add an E2E regression test that fails on any missing catalog image, plus a small repo script to detect and (optionally) download any missing `public/catalog/**` assets.

Purpose: Prevent shipping builds where Catalog images silently fall back to placeholders.
Output: One Playwright spec + one sync script + any newly-downloaded images committed under `public/catalog/`.
</objective>

<execution_context>
@~/.opencode/get-shit-done/workflows/execute-plan.md
@~/.opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

@src/game/catalog.ts
@src/ui/tabs/CatalogTab.tsx
@playwright.config.ts
@vite.config.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add Playwright E2E that fails on any missing catalog image</name>
  <files>tests/catalog-images.spec.ts</files>
  <action>
Create a new Playwright spec that validates every catalog image resolved under the app base path exists and is an image.

Implementation requirements:
- Do NOT rely on rendering every image (lazy loading). Instead, request each expected image URL directly via Playwright's request API.
- Derive the expected image list by parsing `src/game/catalog.ts` as text (do not import it in Node; it uses `import.meta.env`).
- Extract Wikimedia relative paths from the `CATALOG_ENTRIES` `image.url` fields (pattern: `https://upload.wikimedia.org/wikipedia/commons/<relative>`), de-duplicate, and treat each `<relative>` as a required file under `public/catalog/<relative>`.
- Discover the runtime catalog base prefix by navigating to the Catalog UI and reading one rendered `img[src*="/catalog/"]` URL, then splitting at `/catalog/` to obtain `{catalogRoot}` (includes `import.meta.env.BASE_URL`, e.g. `/emilyidle/`).
- For each required `<relative>`:
  - Request `{catalogRoot}{relative}` (GET is fine; HEAD is optional)
  - Assert status is 200
  - Assert `content-type` starts with `image/`
- If any are missing, fail with an error message listing the missing relative paths (keep output compact).

Test setup:
- Seed localStorage save state using the same pattern as existing specs.
- Freeze the RAF runtime (see `tests/unlock-clarity.spec.ts`) so Catalog view is deterministic.
- Navigate to `/` then click the `Catalog` primary tab.
- Ensure the catalog grid renders before extracting the first image src.
  </action>
  <verify>pnpm test:e2e -- tests/catalog-images.spec.ts</verify>
  <done>
The new spec fails when any `public/catalog/<relative>` asset is missing and passes when all are present.
  </done>
</task>

<task type="auto">
  <name>Task 2: Add a local sync script to detect and optionally download missing catalog images</name>
  <files>scripts/catalog/sync-catalog-images.js</files>
  <action>
Create a small Node script (ESM) that:
- Reads `src/game/catalog.ts` as text and extracts all Wikimedia `commons/<relative>` image URLs used by `CATALOG_ENTRIES`.
- Checks for each `<relative>` whether `public/catalog/<relative>` exists.
- Prints a summary:
  - total referenced images
  - count missing
  - list of missing relative paths (one per line)
- Exits with code:
  - 0 if none missing
  - 1 if missing remain

Add an opt-in download mode:
- If invoked with `--download`, fetch `https://upload.wikimedia.org/wikipedia/commons/<relative>` for each missing asset and write bytes to `public/catalog/<relative>`.
- Ensure parent directories are created (`mkdir -p`).
- Validate responses:
  - status 200
  - `content-type` starts with `image/` (if not, treat as failure)
- Keep concurrency modest (e.g. 4) to avoid hammering the host.

Do NOT add new dependencies; rely on Node's built-in `fetch`, `fs/promises`, and `path`.
  </action>
  <verify>node scripts/catalog/sync-catalog-images.js</verify>
  <done>
Running the script prints the missing list (if any) and exits non-zero when missing assets exist.
  </done>
</task>

<task type="checkpoint:decision" gate="blocking">
  <decision>Allow external network fetches to download missing Wikimedia catalog images</decision>
  <context>
The repo should contain all catalog assets under `public/catalog/**`, but downloading requires outbound HTTP requests.
This checkpoint exists to explicitly confirm network access before fetching.
  </context>
  <options>
    <option id="download">
      <name>Download missing images (Recommended)</name>
      <pros>Fixes the repo immediately; E2E becomes green; local assets match catalog</pros>
      <cons>Performs outbound HTTP GETs to upload.wikimedia.org</cons>
    </option>
    <option id="no-download">
      <name>Do not download</name>
      <pros>No outbound network calls</pros>
      <cons>E2E will keep failing until images are added by another means</cons>
    </option>
  </options>
  <resume-signal>Select: download or no-download</resume-signal>
  <how-to-verify>
1. Run: `node scripts/catalog/sync-catalog-images.js` and note the missing list.
2. If you selected `download`, run: `node scripts/catalog/sync-catalog-images.js --download`.
3. Re-run: `node scripts/catalog/sync-catalog-images.js` (should exit 0).
4. Run: `pnpm test:e2e -- tests/catalog-images.spec.ts` (should pass).
  </how-to-verify>
</task>

</tasks>

<verification>
- `node scripts/catalog/sync-catalog-images.js` exits 0 (no missing assets)
- `pnpm test:e2e -- tests/catalog-images.spec.ts` passes
</verification>

<success_criteria>
- Catalog image URLs resolved under the runtime base path (`import.meta.env.BASE_URL`) return 200 for every catalog entry.
- Missing images are discoverable and fixable via `scripts/catalog/sync-catalog-images.js`.
</success_criteria>

<output>
After completion, create `.planning/quick/001-there-are-missing-images-in-the-catalog/001-SUMMARY.md` describing:
- how many images were missing
- which files were added under `public/catalog/`
- the final command outputs (high level)
</output>

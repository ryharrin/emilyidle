import { readFile, stat, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const CATALOG_FILE = path.resolve(process.cwd(), "src/game/catalog.ts");
const CATALOG_ROOT = path.resolve(process.cwd(), "public", "catalog");
const WIKIMEDIA_PREFIX = "https://upload.wikimedia.org/wikipedia/commons/";
const LOCAL_CATALOG_OVERRIDES = {
  "0/0f/Audemars_Piguet_Royal_Oak_in_oro_con_calendario_perpetuo%2C_met%C3%A0_anni_Novanta.jpg":
    "0/0f/Audemars_Piguet_Royal_Oak_in_oro_con_calendario_perpetuo,_meta_anni_Novanta.jpg",
  "b/b1/Rolex_Datejust_ref._16013%2C_seconda_met%C3%A0_anni_%2770-primi_%2780.jpg":
    "b/b1/Rolex_Datejust_ref._16013,_seconda_meta_anni_'70-primi_'80.jpg",
};

const hasDownload = process.argv.includes("--download");

const extractRelatives = (text) => {
  const matches = Array.from(
    text.matchAll(new RegExp(`${WIKIMEDIA_PREFIX}([^"']+)`, "g")),
    (match) => match[1],
  );
  return Array.from(new Set(matches)).sort();
};

const fileExists = async (filePath) => {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
};

const resolveCatalogPaths = (relative) => {
  const effective = LOCAL_CATALOG_OVERRIDES[relative] ?? relative;
  const decoded = decodeURIComponent(effective);
  const encodedPath = path.join(CATALOG_ROOT, effective);
  const decodedPath = path.join(CATALOG_ROOT, decoded);
  return { encodedPath, decodedPath };
};

const getMissing = async (relatives) => {
  const missing = [];
  for (const relative of relatives) {
    const { encodedPath, decodedPath } = resolveCatalogPaths(relative);
    const hasEncoded = await fileExists(encodedPath);
    const hasDecoded = encodedPath === decodedPath ? hasEncoded : await fileExists(decodedPath);
    if (!hasEncoded && !hasDecoded) {
      missing.push(relative);
    }
  }
  return missing;
};

const logSummary = (total, missing) => {
  console.log(`Catalog images referenced: ${total}`);
  console.log(`Missing: ${missing.length}`);
  if (missing.length > 0) {
    console.log("Missing paths:");
    for (const relative of missing) {
      console.log(relative);
    }
  }
};

const downloadMissing = async (missing) => {
  const failures = [];
  const concurrency = 4;
  let index = 0;

  const workers = Array.from({ length: Math.min(concurrency, missing.length) }, async () => {
    while (index < missing.length) {
      const current = missing[index];
      index += 1;

      const url = `${WIKIMEDIA_PREFIX}${current}`;
      const { encodedPath, decodedPath } = resolveCatalogPaths(current);
      const destination = encodedPath === decodedPath ? encodedPath : decodedPath;
      try {
        const response = await fetch(url);
        const contentType = response.headers.get("content-type") ?? "";
        if (!response.ok || !contentType.startsWith("image/")) {
          throw new Error(`Unexpected response for ${current}: ${response.status} ${contentType}`);
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        await mkdir(path.dirname(destination), { recursive: true });
        await writeFile(destination, buffer);
      } catch (error) {
        failures.push({ relative: current, error: error?.message ?? String(error) });
      }
    }
  });

  await Promise.all(workers);
  return failures;
};

const main = async () => {
  const text = await readFile(CATALOG_FILE, "utf8");
  const relatives = extractRelatives(text);
  const missing = await getMissing(relatives);

  logSummary(relatives.length, missing);

  if (missing.length === 0) {
    process.exitCode = 0;
    return;
  }

  if (!hasDownload) {
    process.exitCode = 1;
    return;
  }

  console.log(`Downloading ${missing.length} missing images...`);
  const failures = await downloadMissing(missing);

  if (failures.length > 0) {
    console.error(`Failed to download ${failures.length} images:`);
    for (const failure of failures.slice(0, 10)) {
      console.error(`${failure.relative}: ${failure.error}`);
    }
    if (failures.length > 10) {
      console.error(`...and ${failures.length - 10} more`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("Download complete.");
  process.exitCode = 0;
};

await main();

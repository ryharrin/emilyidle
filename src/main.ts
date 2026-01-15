import "./style.css";

import { formatMoneyFromCents, formatRateFromCentsPerSec } from "./game/format";
import {
  clearLocalStorageSave,
  decodeSaveString,
  encodeSaveString,
  loadSaveFromLocalStorage,
  persistSaveToLocalStorage,
} from "./game/persistence";
import {
  buyBasicWatch,
  canBuyBasicWatch,
  createInitialState,
  getBasicWatchPriceCents,
} from "./game/state";
import type { GameState } from "./game/state";
import { SIM_TICK_MS, step } from "./game/sim";

const MAX_FRAME_DELTA_MS = 250;
const AUTO_SAVE_INTERVAL_MS = 2_000;

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("Missing #app root element");
}

app.innerHTML = `
  <main class="container">
    <h1>Watch Idle</h1>
    <p class="muted">Phase 1: ticking economy + saving.</p>

    <section aria-label="Vault stats">
      <dl>
        <div>
          <dt>Vault cash</dt>
          <dd id="currency"></dd>
        </div>
        <div>
          <dt>Income</dt>
          <dd id="income"></dd>
        </div>
        <div>
          <dt>Basic watches</dt>
          <dd id="basic-watch-count"></dd>
        </div>
      </dl>
    </section>

    <section aria-label="Actions">
      <button id="buy-basic-watch" type="button">
        Buy basic watch (<span id="basic-watch-price"></span>)
      </button>
    </section>

    <section aria-label="Save">
      <h2>Save</h2>
      <div class="controls">
        <button id="export-save" type="button">Export</button>
      </div>

      <div class="controls">
        <label for="import-save-text">Import data</label>
        <textarea
          id="import-save-text"
          rows="3"
          placeholder="Paste exported data here"
          aria-describedby="save-status"
        ></textarea>
        <button id="import-save" type="button">Import</button>
      </div>

      <p id="save-status" role="status" aria-live="polite"></p>
    </section>
  </main>
`;

function requireElement<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Missing required element: ${selector}`);
  }
  return element;
}

const currencyEl = requireElement<HTMLElement>(app, "#currency");
const incomeEl = requireElement<HTMLElement>(app, "#income");
const basicWatchCountEl = requireElement<HTMLElement>(app, "#basic-watch-count");
const basicWatchPriceEl = requireElement<HTMLElement>(app, "#basic-watch-price");
const buyBasicWatchButton = requireElement<HTMLButtonElement>(app, "#buy-basic-watch");

const exportSaveButton = requireElement<HTMLButtonElement>(app, "#export-save");
const importSaveButton = requireElement<HTMLButtonElement>(app, "#import-save");
const importSaveText = requireElement<HTMLTextAreaElement>(app, "#import-save-text");
const saveStatusEl = requireElement<HTMLElement>(app, "#save-status");

let state: GameState = createInitialState();

const loadResult = loadSaveFromLocalStorage();
if (loadResult.ok) {
  state = loadResult.save.state;
  console.info(
    `Loaded save v${loadResult.save.version} from ${loadResult.save.savedAt} (last simulated at ${new Date(loadResult.save.lastSimulatedAtMs).toISOString()})`,
  );
} else if ("empty" in loadResult) {
  console.info("No save found; starting new game.");
} else {
  console.warn(`Save was invalid; resetting state. ${loadResult.error}`);
  const clearResult = clearLocalStorageSave();
  if (!clearResult.ok) {
    console.warn(`Failed to clear invalid save. ${clearResult.error}`);
  }
}

let saveDirty = false;
let lastSavedAtMs = 0;

function setSaveStatus(message: string): void {
  saveStatusEl.textContent = message;
}

function persistNow(reason: string): void {
  const nowMs = Date.now();
  const result = persistSaveToLocalStorage(state, nowMs);

  if (!result.ok) {
    console.warn(`Autosave failed (${reason}). ${result.error}`);
    setSaveStatus(`Save failed: ${result.error}`);
    return;
  }

  lastSavedAtMs = nowMs;
  saveDirty = false;
}

exportSaveButton.addEventListener("click", async () => {
  const saveString = encodeSaveString(state, Date.now());

  importSaveText.value = saveString;
  importSaveText.focus();
  importSaveText.select();

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(saveString);
      setSaveStatus("Exported and copied to clipboard.");
      return;
    } catch {
      setSaveStatus("Exported. Copy the text manually.");
      return;
    }
  }

  setSaveStatus("Exported. Copy the text manually.");
});

importSaveButton.addEventListener("click", () => {
  const raw = importSaveText.value.trim();
  if (!raw) {
    setSaveStatus("Paste an exported save string to import.");
    return;
  }

  const decoded = decodeSaveString(raw);
  if (!decoded.ok) {
    console.warn(`Import failed. ${decoded.error}`);
    setSaveStatus(`Import failed: ${decoded.error}`);
    return;
  }

  state = decoded.save.state;
  lastFrameAtMs = null;
  accumulatorMs = 0;

  saveDirty = true;
  persistNow("import");
  render(state);

  setSaveStatus(`Imported save from ${decoded.save.savedAt}.`);
});

buyBasicWatchButton.addEventListener("click", () => {
  const next = buyBasicWatch(state);

  if (next !== state) {
    state = next;
    saveDirty = true;
    persistNow("purchase");
    return;
  }

  state = next;
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden" && saveDirty) {
    persistNow("visibilitychange:hidden");
  }
});

window.addEventListener("pagehide", () => {
  if (saveDirty) {
    persistNow("pagehide");
  }
});

let lastFrameAtMs: number | null = null;
let accumulatorMs = 0;

function render(current: GameState) {
  const basicWatchPriceCents = getBasicWatchPriceCents(current);

  currencyEl.textContent = formatMoneyFromCents(current.currencyCents);
  incomeEl.textContent = formatRateFromCentsPerSec(current.incomeRateCentsPerSec);
  basicWatchCountEl.textContent = String(current.itemCount);
  basicWatchPriceEl.textContent = formatMoneyFromCents(basicWatchPriceCents);
  buyBasicWatchButton.disabled = !canBuyBasicWatch(current);
}

function frame(nowMs: number) {
  let stepped = false;

  if (lastFrameAtMs !== null) {
    const rawElapsedMs = nowMs - lastFrameAtMs;
    const elapsedMs = Math.max(0, Math.min(rawElapsedMs, MAX_FRAME_DELTA_MS));

    accumulatorMs += elapsedMs;

    while (accumulatorMs >= SIM_TICK_MS) {
      stepped = true;
      state = step(state, SIM_TICK_MS);
      accumulatorMs -= SIM_TICK_MS;
    }
  }

  lastFrameAtMs = nowMs;

  if (stepped) {
    saveDirty = true;
  }

  if (saveDirty && Date.now() - lastSavedAtMs >= AUTO_SAVE_INTERVAL_MS) {
    persistNow("interval");
  }

  render(state);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

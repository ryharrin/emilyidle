import "./style.css";

import { formatMoneyFromCents, formatRateFromCentsPerSec } from "./game/format";
import {
  buyBasicWatch,
  canBuyBasicWatch,
  createInitialState,
  getBasicWatchPriceCents,
} from "./game/state";
import type { GameState } from "./game/state";
import { SIM_TICK_MS, step } from "./game/sim";

const MAX_FRAME_DELTA_MS = 250;

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("Missing #app root element");
}

app.innerHTML = `
  <main class="container">
    <h1>Watch Idle</h1>
    <p class="muted">Phase 1: ticking economy (no saving yet).</p>

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

let state: GameState = createInitialState();

buyBasicWatchButton.addEventListener("click", () => {
  state = buyBasicWatch(state);
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
  if (lastFrameAtMs !== null) {
    const rawElapsedMs = nowMs - lastFrameAtMs;
    const elapsedMs = Math.max(0, Math.min(rawElapsedMs, MAX_FRAME_DELTA_MS));

    accumulatorMs += elapsedMs;

    while (accumulatorMs >= SIM_TICK_MS) {
      state = step(state, SIM_TICK_MS);
      accumulatorMs -= SIM_TICK_MS;
    }
  }

  lastFrameAtMs = nowMs;

  render(state);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

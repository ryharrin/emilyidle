import "./style.css";

import { formatMoneyFromCents, formatRateFromCentsPerSec } from "./game/format";
import type { GameState } from "./game/state";
import { createInitialState } from "./game/state";
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
      </dl>
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

let state: GameState = createInitialState();

let lastFrameAtMs: number | null = null;
let accumulatorMs = 0;

function render(current: GameState) {
  currencyEl.textContent = formatMoneyFromCents(current.currencyCents);
  incomeEl.textContent = formatRateFromCentsPerSec(current.incomeRateCentsPerSec);
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

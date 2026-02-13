/**
 * UX telemetry event catalog for low-risk interaction instrumentation.
 *
 * Integration contract for downstream consumers (C1/Z1):
 * - Event names are stable string literals in `TelemetryEventName`.
 * - Payload shapes are defined by `TelemetryEventPayloads`.
 * - `emitTelemetryEvent` is intentionally side-effect safe; missing/invalid backend is a no-op.
 */
export const TELEMETRY_EVENTS = {
  helpOpen: "ui.help.open",
  explainClick: "ui.help.explain_click",
  resetConfirm: "ui.reset.confirm",
  resetCancel: "ui.reset.cancel",
  nextActionCtaClick: "ui.next_action.cta_click",
} as const;

export type TelemetryEventName = (typeof TELEMETRY_EVENTS)[keyof typeof TELEMETRY_EVENTS];

export type HelpOpenSource = "header-help-button" | "explain-button" | "context";

export type TelemetryEventPayloads = {
  [TELEMETRY_EVENTS.helpOpen]: {
    source: HelpOpenSource;
    sectionId: string | null;
  };
  [TELEMETRY_EVENTS.explainClick]: {
    sectionId: string;
  };
  [TELEMETRY_EVENTS.resetConfirm]: {
    surface: "settings-save";
  };
  [TELEMETRY_EVENTS.resetCancel]: {
    surface: "settings-save";
  };
  [TELEMETRY_EVENTS.nextActionCtaClick]: {
    cueId: string;
    ctaId: "enter-program";
    nowMs: number;
  };
};

export type TelemetryBackend = {
  emit: <TEventName extends TelemetryEventName>(
    eventName: TEventName,
    payload: TelemetryEventPayloads[TEventName],
  ) => void;
};

export const TELEMETRY_BACKEND_KEY = "__WATCH_IDLE_TELEMETRY__" as const;

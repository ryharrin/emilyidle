import { render, screen, within, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "../src/App";
import { createInitialState } from "../src/game/state";
import { CareerNextActionCard } from "../src/ui/components/CareerNextActionCard";
import { ExplainButton } from "../src/ui/help/ExplainButton";
import { HelpProvider } from "../src/ui/help/helpContext";
import { emitTelemetryEvent } from "../src/ui/telemetry/emitter";
import {
  TELEMETRY_BACKEND_KEY,
  TELEMETRY_EVENTS,
  type TelemetryBackend,
} from "../src/ui/telemetry/events";

const getTelemetryBackend = () =>
  (window as Window & { [TELEMETRY_BACKEND_KEY]?: TelemetryBackend })[TELEMETRY_BACKEND_KEY];

const setTelemetryBackend = (backend: TelemetryBackend | undefined) => {
  (window as Window & { [TELEMETRY_BACKEND_KEY]?: TelemetryBackend })[TELEMETRY_BACKEND_KEY] = backend;
};


describe("telemetry instrumentation", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState({}, "", "/");
    setTelemetryBackend(undefined);
  });

  afterEach(() => {
    cleanup();
    setTelemetryBackend(undefined);
  });

  it("keeps emitter side-effect safe when backend is missing or throws", () => {
    expect(getTelemetryBackend()).toBeUndefined();

    expect(() => {
      emitTelemetryEvent(TELEMETRY_EVENTS.helpOpen, {
        source: "context",
        sectionId: "career-start",
      });
    }).not.toThrow();

    const throwingBackend: TelemetryBackend = {
      emit: () => {
        throw new Error("backend offline");
      },
    };
    setTelemetryBackend(throwingBackend);

    expect(() => {
      emitTelemetryEvent(TELEMETRY_EVENTS.explainClick, {
        sectionId: "career-start",
      });
    }).not.toThrow();
  });

  it("tracks explain clicks and preserves existing help open behavior", async () => {
    const emit = vi.fn();
    setTelemetryBackend({ emit });
    const openHelpTo = vi.fn();
    const user = userEvent.setup();

    render(
      <HelpProvider value={{ openHelpTo }}>
        <ExplainButton sectionId="career-start" label="Explain starting your career" />
      </HelpProvider>,
    );

    await user.click(screen.getByTestId("explain-career-start"));

    expect(emit).toHaveBeenCalledWith(TELEMETRY_EVENTS.explainClick, {
      sectionId: "career-start",
    });
    expect(openHelpTo).toHaveBeenCalledWith("career-start", "explain-button");
  });

  it("tracks next-action CTA clicks without changing purchase behavior", async () => {
    const emit = vi.fn();
    setTelemetryBackend({ emit });
    const onPurchase = vi.fn();
    const user = userEvent.setup();

    render(
      <HelpProvider value={{ openHelpTo: vi.fn() }}>
        <CareerNextActionCard
          state={createInitialState()}
          nowMs={1234}
          statusLabel="Start your career"
          onPurchase={onPurchase}
          onOpenProgressionChoices={vi.fn()}
        />
      </HelpProvider>,
    );

    await user.click(screen.getByTestId("career-next-action-start"));

    expect(emit).toHaveBeenCalledWith(TELEMETRY_EVENTS.nextActionCtaClick, {
      cueId: "start-career",
      ctaId: "enter-program",
      nowMs: 1234,
    });
    expect(onPurchase).toHaveBeenCalledTimes(1);
  });

  it("tracks help open and reset confirm/cancel from app surfaces", async () => {
    const emit = vi.fn();
    setTelemetryBackend({ emit });
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByTestId("help-open"));

    await waitFor(() => {
      expect(emit).toHaveBeenCalledWith(
        TELEMETRY_EVENTS.helpOpen,
        expect.objectContaining({ source: "header-help-button" }),
      );
    });

    await user.click(screen.getByTestId("help-close"));

    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    await user.click(within(tabList).getByRole("tab", { name: /Settings/i }));

    await user.click(screen.getByTestId("settings-clear-save"));
    await user.click(screen.getByTestId("settings-clear-save-cancel"));

    await waitFor(() => {
      expect(emit).toHaveBeenCalledWith(TELEMETRY_EVENTS.resetCancel, {
        surface: "settings-save",
      });
    });

    await user.click(screen.getByTestId("settings-clear-save"));
    await user.click(screen.getByTestId("settings-clear-save-confirm"));

    await waitFor(() => {
      expect(emit).toHaveBeenCalledWith(TELEMETRY_EVENTS.resetConfirm, {
        surface: "settings-save",
      });
    });
  });
});

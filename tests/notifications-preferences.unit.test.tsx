import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "../src/App";

async function openSaveTab() {
  const user = userEvent.setup();
  const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
  const saveTab = within(tabList).getByRole("tab", { name: /Settings/i });
  await user.click(saveTab);
}

describe("notification preferences", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    cleanup();
  });

  it("defaults all notification channels to enabled", async () => {
    render(<App />);
    await openSaveTab();

    expect((screen.getByTestId("settings-notify-sessions") as HTMLInputElement).checked).toBe(true);
    expect((screen.getByTestId("settings-notify-prestige") as HTMLInputElement).checked).toBe(true);
    expect((screen.getByTestId("settings-notify-achievements") as HTMLInputElement).checked).toBe(
      true,
    );
    expect((screen.getByTestId("settings-notify-events") as HTMLInputElement).checked).toBe(true);
  });

  it("persists notification preferences to settings storage", async () => {
    render(<App />);
    await openSaveTab();

    const user = userEvent.setup();
    await user.click(screen.getByTestId("settings-notify-achievements"));
    await user.click(screen.getByTestId("settings-notify-events"));

    const raw = localStorage.getItem("emily-idle:settings");
    expect(raw).not.toBeNull();
    const parsed = raw ? JSON.parse(raw) : null;
    expect(parsed.notificationPreferences.achievements).toBe(false);
    expect(parsed.notificationPreferences.events).toBe(false);

    cleanup();
    render(<App />);
    await openSaveTab();

    await waitFor(() => {
      expect((screen.getByTestId("settings-notify-achievements") as HTMLInputElement).checked).toBe(
        false,
      );
    });
    expect((screen.getByTestId("settings-notify-events") as HTMLInputElement).checked).toBe(false);
  });
});

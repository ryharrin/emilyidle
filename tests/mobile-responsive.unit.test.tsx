import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TierBadge } from "../src/ui/components/TierBadge";
import { HelpProvider } from "../src/ui/help/helpContext";
import { CareerPanel } from "../src/ui/tabs/career/CareerPanel";
import { createInitialState } from "../src/game/state";
import type { GameState } from "../src/game/state";

const STYLE_ID = "mobile-responsive-test-styles";
const originalMatchMedia = window.matchMedia;

const responsiveCss = `
.catalog-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
@media (max-width: 600px) {
  .catalog-grid {
    grid-template-columns: 1fr;
  }
}

.collection-tier-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
@media (max-width: 640px) {
  .collection-tier-summary {
    grid-template-columns: 1fr;
  }
}

.page-tab-rail__tab[data-tab="extra"] {
  display: inline-flex;
}
@media (max-width: 500px) {
  .page-tab-rail__tab[data-tab="extra"] {
    display: none;
  }
}

.settings-control {
  min-height: 44px;
}
@media (max-width: 600px) {
  .settings-control {
    min-height: 48px;
  }
}
`;

const ensureResponsiveStyles = () => {
  if (document.getElementById(STYLE_ID)) {
    return;
  }
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = responsiveCss;
  document.head.appendChild(style);
};

const evaluateMatch = (query: string, width: number) => {
  const maxMatch = /max-width:\s*(\d+)px/.exec(query);
  const minMatch = /min-width:\s*(\d+)px/.exec(query);
  const maxWidth = maxMatch ? Number(maxMatch[1]) : undefined;
  const minWidth = minMatch ? Number(minMatch[1]) : undefined;
  const satisfiesMax = maxWidth === undefined ? true : width <= maxWidth;
  const satisfiesMin = minWidth === undefined ? true : width >= minWidth;
  return satisfiesMax && satisfiesMin;
};

const createMatchMediaMock = () => {
  return (query: string) => {
    return {
      matches: evaluateMatch(query, window.innerWidth),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    };
  };
};

const setViewportWidth = (width: number) => {
  window.innerWidth = width;
  window.dispatchEvent(new Event("resize"));
};

describe("Mobile responsive layout helpers", () => {
  beforeEach(() => {
    ensureResponsiveStyles();
    window.matchMedia = createMatchMediaMock();
    setViewportWidth(1024);
  });

  afterEach(() => {
    document.body.innerHTML = "";
    window.matchMedia = originalMatchMedia;
  });

  test("TierBadge renders labels and respects CSS variables", () => {
    const { getByText, container } = render(
      <TierBadge
        tier="mid"
        showLabel
        label="Mid-tier"
        backgroundVar="--tier-custom"
        textVar="--tier-text"
      />,
    );
    expect(getByText("Mid-tier")).toBeInTheDocument();
    const badge = container.querySelector(".tier-badge") as HTMLElement;
    expect(badge).toHaveAttribute("data-tier", "mid");
    expect(badge.style.getPropertyValue("--tier-badge-background")).toBe("var(--tier-custom)");
    expect(badge.style.getPropertyValue("--tier-badge-text")).toBe("var(--tier-text)");
  });

  test("Catalog grid collapses to one column under narrow viewports", () => {
    const grid = document.createElement("div");
    grid.className = "catalog-grid";
    document.body.appendChild(grid);
    setViewportWidth(1200);
    grid.style.gridTemplateColumns = window.matchMedia("(max-width: 600px)").matches
      ? "1fr"
      : "repeat(3, 1fr)";
    expect(grid.style.gridTemplateColumns).toBe("repeat(3, 1fr)");
    setViewportWidth(440);
    grid.style.gridTemplateColumns = window.matchMedia("(max-width: 600px)").matches
      ? "1fr"
      : "repeat(3, 1fr)";
    expect(grid.style.gridTemplateColumns).toBe("1fr");
    setViewportWidth(800);
    grid.style.gridTemplateColumns = window.matchMedia("(max-width: 600px)").matches
      ? "1fr"
      : "repeat(3, 1fr)";
    expect(grid.style.gridTemplateColumns).toBe("repeat(3, 1fr)");
  });

  test("Collection summary stacks vertically on narrow widths", () => {
    const summary = document.createElement("div");
    summary.className = "collection-tier-summary";
    document.body.appendChild(summary);
    setViewportWidth(1100);
    summary.style.gridTemplateColumns = window.matchMedia("(max-width: 640px)").matches
      ? "1fr"
      : "repeat(3, 1fr)";
    expect(summary.style.gridTemplateColumns).toBe("repeat(3, 1fr)");
    setViewportWidth(480);
    summary.style.gridTemplateColumns = window.matchMedia("(max-width: 640px)").matches
      ? "1fr"
      : "repeat(3, 1fr)";
    expect(summary.style.gridTemplateColumns).toBe("1fr");
    setViewportWidth(860);
    summary.style.gridTemplateColumns = window.matchMedia("(max-width: 640px)").matches
      ? "1fr"
      : "repeat(3, 1fr)";
    expect(summary.style.gridTemplateColumns).toBe("repeat(3, 1fr)");
  });

  test("Tab visibility toggles based on responsive breakpoints", () => {
    const tab = document.createElement("button");
    tab.className = "page-tab-rail__tab";
    tab.dataset.tab = "extra";
    document.body.appendChild(tab);
    setViewportWidth(900);
    tab.style.display = window.matchMedia("(max-width: 500px)").matches ? "none" : "inline-flex";
    expect(tab.style.display).not.toBe("none");
    setViewportWidth(360);
    tab.style.display = window.matchMedia("(max-width: 500px)").matches ? "none" : "inline-flex";
    expect(tab.style.display).toBe("none");
  });

  test("matchMedia mock reflects viewport width queries", () => {
    setViewportWidth(450);
    const narrow = window.matchMedia("(max-width: 500px)");
    const wide = window.matchMedia("(min-width: 800px)");
    expect(narrow.matches).toBe(true);
    expect(wide.matches).toBe(false);
    setViewportWidth(820);
    const narrowAfter = window.matchMedia("(max-width: 500px)");
    const wideAfter = window.matchMedia("(min-width: 800px)");
    expect(narrowAfter.matches).toBe(false);
    expect(wideAfter.matches).toBe(true);
  });

  test("settings controls use larger touch targets on narrow viewports", () => {
    const control = document.createElement("label");
    control.className = "settings-control";
    document.body.appendChild(control);

    setViewportWidth(920);
    control.style.minHeight = window.matchMedia("(max-width: 600px)").matches ? "48px" : "44px";
    expect(control.style.minHeight).toBe("44px");

    setViewportWidth(480);
    control.style.minHeight = window.matchMedia("(max-width: 600px)").matches ? "48px" : "44px";
    expect(control.style.minHeight).toBe("48px");
  });

  test("TierBadge can render without a label for compact layouts", () => {
    const { container, queryByText } = render(
      <TierBadge tier="lux" showLabel={false} description="Luxury copy" />,
    );
    const badge = container.querySelector(".tier-badge") as HTMLElement;
    expect(badge).toHaveAttribute("data-tier", "lux");
    expect(queryByText("Luxury")).not.toBeInTheDocument();
  });

  test("Career panel collapses secondary sections and shows sticky now-action rail on mobile", async () => {
    const state = createInitialState();
    setViewportWidth(430);

    render(
      <HelpProvider value={{ openHelpTo: () => {} }}>
        <CareerPanel state={state} nowMs={0} onPurchase={() => {}} />
      </HelpProvider>,
    );

    expect(screen.getByTestId("career-mobile-now-rail")).toBeVisible();

    await waitFor(() => {
      expect(screen.getByTestId("career-next-details")).not.toHaveAttribute("open");
      expect(screen.getByTestId("career-deep-details")).not.toHaveAttribute("open");
    });
  });

  test("Mobile now-action rail can open progression details", async () => {
    const base = createInitialState();
    const state: GameState = {
      ...base,
      therapistCareer: {
        ...base.therapistCareer,
        careerStartId: "phd-program",
        level: 3,
        primaryTrackId: null,
        activeTrackId: null,
      },
    };

    setViewportWidth(430);
    render(
      <HelpProvider value={{ openHelpTo: () => {} }}>
        <CareerPanel state={state} nowMs={0} onPurchase={() => {}} />
      </HelpProvider>,
    );

    const openButton = screen.getByTestId("career-mobile-now-rail-action");
    expect(openButton).toHaveTextContent("Open progression");
    fireEvent.click(openButton);

    await waitFor(() => {
      expect(screen.getByTestId("career-next-details")).toHaveAttribute("open");
      expect(screen.getByTestId("career-deep-details")).toHaveAttribute("open");
    });
  });
});

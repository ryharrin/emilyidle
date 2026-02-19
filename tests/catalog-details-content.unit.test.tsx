import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { CATALOG_ENTRIES, type CatalogEntry } from "../src/game/catalog";
import {
  buildCatalogDecisionInfo,
  CatalogDetailsContent,
} from "../src/ui/tabs/catalog/CatalogDetailsContent";

type MutableCatalogEntry = CatalogEntry & {
  details: CatalogEntry["details"] & Record<string, unknown>;
};

const BASE_ENTRY_ID = "rolex-rolex-gmt-master-ii-ref-126713grnr";

const BASE_ENTRY = CATALOG_ENTRIES.find((entry) => entry.id === BASE_ENTRY_ID);

if (!BASE_ENTRY) {
  throw new Error(`Missing catalog entry fixture: ${BASE_ENTRY_ID}`);
}

const DECISION_INFO = buildCatalogDecisionInfo({
  tierId: BASE_ENTRY.movementType,
  movement: BASE_ENTRY.movementType,
  unlocked: true,
  ownedCount: 1,
  unlockRequirementLabel: null,
  unlockProgressLabel: null,
  gateReady: true,
  gateEtaLabel: null,
  duplicateMultiplier: 1.2,
});

const createEntryFixture = (): MutableCatalogEntry => ({
  ...BASE_ENTRY,
  tags: [...BASE_ENTRY.tags],
  facts: [...(BASE_ENTRY.facts ?? [])],
  image: { ...BASE_ENTRY.image },
  details: {
    ...BASE_ENTRY.details,
    featureHighlights: [...BASE_ENTRY.details.featureHighlights],
    technicalSpecifications: BASE_ENTRY.details.technicalSpecifications.map((spec) => ({ ...spec })),
    marketPricesUsd: BASE_ENTRY.details.marketPricesUsd.map((price) => ({ ...price })),
    sourceReferences: BASE_ENTRY.details.sourceReferences.map((source) => ({ ...source })),
  },
});

describe("catalog details content", () => {
  it("renders rich detail sections while suppressing source metadata rendering", () => {
    const entry = createEntryFixture();
    entry.details.features = [
      "Column wheel chronograph",
      "Ceramic bezel",
      "https://example.com/hidden-feature-source",
    ];
    entry.details.technicalSpecs = {
      caseSize: "40 mm",
      sourceUrl: "https://example.com/spec-source",
      citationLink: "https://example.com/spec-citation",
    };
    entry.details.pricing = [
      {
        label: "Secondary market",
        amountUsd: 15250,
        provider: "Chrono24",
        sourceUrl: "https://example.com/pricing-source",
      },
    ];
    entry.details.sourceReferences = [
      {
        label: "Manufacturer source",
        url: "https://example.com/manufacturer-source",
        authority: "manufacturer",
      },
    ];

    render(
      <CatalogDetailsContent
        entry={entry}
        tags={entry.tags}
        showFacts={false}
        decisionInfo={DECISION_INFO}
      />,
    );

    const featuresSection = screen.getByTestId("catalog-detail-features");
    const specsSection = screen.getByTestId("catalog-detail-specs");
    const pricingSection = screen.getByTestId("catalog-detail-pricing");

    expect(within(featuresSection).getByText("Column wheel chronograph")).toBeInTheDocument();
    expect(within(specsSection).getByText("Case Size")).toBeInTheDocument();
    expect(within(pricingSection).getByText("$15,250.00")).toBeInTheDocument();

    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryByText("Manufacturer source")).toBeNull();
    expect(screen.queryByText("https://example.com/hidden-feature-source")).toBeNull();
    expect(screen.queryByText("https://example.com/spec-source")).toBeNull();
    expect(screen.queryByText("https://example.com/pricing-source")).toBeNull();
  });

  it("suppresses literal price-as-of text while preserving USD display", () => {
    const entry = createEntryFixture();
    entry.details.pricing = [
      {
        label: "Observed market",
        amountUsd: 12345,
        asOf: "price as of 2025-01-15",
        provider: "Chrono24",
        note: "price as of 2025-01-15",
      },
    ];

    render(
      <CatalogDetailsContent
        entry={entry}
        tags={entry.tags}
        showFacts={false}
        decisionInfo={DECISION_INFO}
      />,
    );

    const pricingSection = screen.getByTestId("catalog-detail-pricing");

    expect(within(pricingSection).getByText("$12,345.00")).toBeInTheDocument();
    expect(within(pricingSection).getByText(/Sampled 2025-01-15/i)).toBeInTheDocument();
    expect(pricingSection.textContent?.toLowerCase()).not.toContain("price as of");
  });
});

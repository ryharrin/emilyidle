import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { CatalogTab } from "../src/ui/tabs/CatalogTab";

type UnlockHintCta = {
  label: string;
  onClick: () => void;
  testId?: string;
};

type UnlockHintProps = {
  eyebrow: string;
  title: string;
  detail: string;
  currentLabel: string;
  thresholdLabel: string;
  ratio: number;
  cta?: UnlockHintCta;
};

type NextUnlockItem = UnlockHintProps & {
  id: string;
};

type NextUnlockPanelProps = {
  items: ReadonlyArray<NextUnlockItem>;
};

type EmptyStateCTAProps = {
  title: string;
  body: string;
  ctaLabel: string;
  onCta: () => void;
  testId?: string;
};

async function importOrFail<T>(importer: () => Promise<T>): Promise<T> {
  try {
    return await importer();
  } catch (error) {
    expect.fail(`Failed to import module: ${String(error)}`);
  }
}

describe("unlock UI components", () => {
  it("renders NextUnlockPanel with stable test ids", async () => {
    const modulePath = "../src/ui/components/" + "NextUnlockPanel";
    const mod = await importOrFail(() => import(/* @vite-ignore */ modulePath));
    const NextUnlockPanel = (mod as unknown as { NextUnlockPanel: React.FC<NextUnlockPanelProps> })
      .NextUnlockPanel;

    render(
      <NextUnlockPanel
        items={[
          {
            id: "collector-shelf",
            eyebrow: "Locked",
            title: "Collector shelf",
            detail: "Own 5 total items",
            currentLabel: "3",
            thresholdLabel: "5",
            ratio: 0.6,
          },
          {
            id: "showcase",
            eyebrow: "Next unlock",
            title: "Vault showcase",
            detail: "Reach $25,000 Memories",
            currentLabel: "$10,000",
            thresholdLabel: "$25,000",
            ratio: 0.4,
          },
        ]}
      />,
    );

    expect(screen.queryByTestId("next-unlocks")).not.toBeNull();
    expect(screen.queryByTestId("next-unlock-collector-shelf")).not.toBeNull();
    expect(screen.queryByTestId("next-unlock-showcase")).not.toBeNull();
  });

  it("invokes UnlockHint CTA on click", async () => {
    const modulePath = "../src/ui/components/" + "UnlockHint";
    const mod = await importOrFail(() => import(/* @vite-ignore */ modulePath));
    const UnlockHint = (mod as unknown as { UnlockHint: React.FC<UnlockHintProps> }).UnlockHint;

    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <UnlockHint
        eyebrow="Locked"
        title="Collector shelf"
        detail="Own 5 total items"
        currentLabel="3"
        thresholdLabel="5"
        ratio={0.6}
        cta={{ label: "Go", onClick, testId: "unlock-cta" }}
      />,
    );

    await user.click(screen.getByTestId("unlock-cta"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("invokes EmptyStateCTA on click", async () => {
    const modulePath = "../src/ui/components/" + "EmptyStateCTA";
    const mod = await importOrFail(() => import(/* @vite-ignore */ modulePath));
    const EmptyStateCTA = (mod as unknown as { EmptyStateCTA: React.FC<EmptyStateCTAProps> })
      .EmptyStateCTA;

    const user = userEvent.setup();
    const onCta = vi.fn();

    render(
      <EmptyStateCTA
        title="Nothing here yet"
        body="Keep collecting to unlock this panel."
        ctaLabel="Back to Vault"
        onCta={onCta}
        testId="empty-state"
      />,
    );

    await user.click(screen.getByTestId("empty-state"));
    expect(onCta).toHaveBeenCalledTimes(1);
  });

  it("wires Catalog discovered empty state CTA to Vault navigation", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    render(
      <CatalogTab
        isActive={true}
        onNavigate={onNavigate}
        catalogSearch=""
        onCatalogSearchChange={() => undefined}
        catalogBrand="all"
        onCatalogBrandChange={() => undefined}
        catalogStyle="all"
        onCatalogStyleChange={() => undefined}
        catalogSort="default"
        onCatalogSortChange={() => undefined}
        catalogEra="all"
        onCatalogEraChange={() => undefined}
        catalogType="all"
        onCatalogTypeChange={() => undefined}
        catalogTab="unowned"
        onCatalogTabChange={() => undefined}
        catalogBrands={[]}
        filteredCatalogEntries={[]}
        discoveredCatalogEntries={[]}
        discoveredCatalogIds={[]}
        catalogEntries={[]}
        hasOwnedCatalogTiers={false}
      />,
    );

    expect(screen.queryByTestId("catalog-discovered-empty")).not.toBeNull();
    await user.click(screen.getByRole("button", { name: "Go to Vault" }));
    expect(onNavigate).toHaveBeenCalledWith("collection", "collection-list");
  });

  it("wires Catalog owned empty state CTA to Vault navigation", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    render(
      <CatalogTab
        isActive={true}
        onNavigate={onNavigate}
        catalogSearch=""
        onCatalogSearchChange={() => undefined}
        catalogBrand="all"
        onCatalogBrandChange={() => undefined}
        catalogStyle="all"
        onCatalogStyleChange={() => undefined}
        catalogSort="default"
        onCatalogSortChange={() => undefined}
        catalogEra="all"
        onCatalogEraChange={() => undefined}
        catalogType="all"
        onCatalogTypeChange={() => undefined}
        catalogTab="owned"
        onCatalogTabChange={() => undefined}
        catalogBrands={[]}
        filteredCatalogEntries={[]}
        discoveredCatalogEntries={[]}
        discoveredCatalogIds={[]}
        catalogEntries={[]}
        hasOwnedCatalogTiers={false}
      />,
    );

    expect(screen.queryByTestId("catalog-owned-empty")).not.toBeNull();
    await user.click(screen.getByRole("button", { name: "Build collection" }));
    expect(onNavigate).toHaveBeenCalledWith("collection", "collection-list");
  });
});

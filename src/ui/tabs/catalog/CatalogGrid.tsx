import React from "react";

import { EmptyStateCTA } from "../../components/EmptyStateCTA";
import { useStableCatalogEntries } from "../../hooks/useStableCatalogEntries";
import { useCatalogVirtualizer } from "../../hooks/useCatalogVirtualizer";
import type { CatalogVirtualizerResult } from "../../hooks/useCatalogVirtualizer";
import type { CatalogEntry } from "../../../game/catalog";
import { CATALOG_TIER_SEQUENCE } from "../../../game/catalog";
import type { CatalogTierId } from "../../../game/model/types";
import { getWatchModelOwnedCount, getWatchModelTierId } from "../../../game/state";
import type { GameState, WatchItemId } from "../../../game/state";
import { CatalogCard } from "./CatalogCard";
import {
  CATALOG_MOVEMENT_SECTIONS,
  CATALOG_VIRTUALIZATION_THRESHOLD,
  CATALOG_VIRTUALIZER_ESTIMATED_CARD_HEIGHT,
  CATALOG_VIRTUALIZER_OVERSCAN,
} from "./catalogPresentation";

export interface CatalogGridProps {
  entries: ReadonlyArray<CatalogEntry>;
  allEntries: ReadonlyArray<CatalogEntry>;
  state: GameState;
  isCompact: boolean;
  isExpertMode: boolean;
  showFacts: boolean;
  showLaneLayout: boolean;
  favoriteIds: ReadonlySet<string>;
  expandedCards: Record<string, boolean>;
  purchaseHighlights: Record<string, boolean>;
  nowMs?: number;
  effectiveCashRateCentsPerSec: number;
  effectiveEnjoymentRateCentsPerSec: number;
  craftingPartsPerWatch: Record<string, number>;
  atelierUnlocked: boolean;
  filterSignature: string;
  detailsSheetTarget: { entryId: string } | null;
  onPurchase: (nextState: GameState) => void;
  onToggleExpand: (entryId: string, isOpen: boolean) => void;
  onOpenDetails: (entryId: string, trigger: HTMLButtonElement | null) => void;
  onNavigate?: (tabId: string, scrollTargetId?: string) => void;
  onInteract?: (itemId: WatchItemId) => void;
  embeddedInVault?: boolean;
}

function CatalogLaneSection({
  section,
  entries,
  ...cardProps
}: {
  section: (typeof CATALOG_MOVEMENT_SECTIONS)[number];
  entries: CatalogEntry[];
  state: GameState;
  isCompact: boolean;
  isExpertMode: boolean;
  showFacts: boolean;
  favoriteIds: ReadonlySet<string>;
  expandedCards: Record<string, boolean>;
  purchaseHighlights: Record<string, boolean>;
  nowMs?: number;
  effectiveCashRateCentsPerSec: number;
  effectiveEnjoymentRateCentsPerSec: number;
  craftingPartsPerWatch: Record<string, number>;
  atelierUnlocked: boolean;
  detailsSheetTarget: { entryId: string } | null;
  onPurchase: (nextState: GameState) => void;
  onToggleExpand: (entryId: string, isOpen: boolean) => void;
  onOpenDetails: (entryId: string, trigger: HTMLButtonElement | null) => void;
  onInteract?: (itemId: WatchItemId) => void;
}): React.ReactElement {
  return (
    <section key={section.id} className="catalog-lane" data-testid={`catalog-tier-${section.id}`}>
      <header className="catalog-lane-header" data-testid={`catalog-tier-header-${section.id}`}>
        <div>
          <p className="catalog-lane-title">{section.title}</p>
          <p className="catalog-lane-description">{section.description}</p>
        </div>
        <span className="catalog-lane-note">{section.note}</span>
      </header>
      {entries.length > 0 ? (
        <div className="catalog-lane-grid">
          {entries.map((entry) => (
            <CatalogCard
              key={entry.id}
              entry={entry}
              state={cardProps.state}
              isCompact={cardProps.isCompact}
              isExpertMode={cardProps.isExpertMode}
              isHighlighted={cardProps.purchaseHighlights[entry.id] ?? false}
              isExpanded={cardProps.expandedCards[entry.id] ?? false}
              isDetailsOpen={cardProps.detailsSheetTarget?.entryId === entry.id}
              isFavorite={cardProps.favoriteIds.has(entry.id)}
              showFacts={cardProps.showFacts}
              nowMs={cardProps.nowMs}
              effectiveCashRateCentsPerSec={cardProps.effectiveCashRateCentsPerSec}
              effectiveEnjoymentRateCentsPerSec={cardProps.effectiveEnjoymentRateCentsPerSec}
              craftingPartsPerWatch={cardProps.craftingPartsPerWatch}
              atelierUnlocked={cardProps.atelierUnlocked}
              onPurchase={cardProps.onPurchase}
              onToggleExpand={(isOpen) => cardProps.onToggleExpand(entry.id, isOpen)}
              onOpenDetails={(trigger) => cardProps.onOpenDetails(entry.id, trigger)}
              onInteract={cardProps.onInteract}
            />
          ))}
        </div>
      ) : (
        <p className="catalog-lane-empty" data-testid={`catalog-tier-empty-${section.id}`}>
          No catalog entries match these filters.
        </p>
      )}
    </section>
  );
}

export function CatalogGrid({
  entries,
  allEntries,
  state,
  isCompact,
  isExpertMode,
  showFacts,
  showLaneLayout,
  favoriteIds,
  expandedCards,
  purchaseHighlights,
  nowMs,
  effectiveCashRateCentsPerSec,
  effectiveEnjoymentRateCentsPerSec,
  craftingPartsPerWatch,
  atelierUnlocked,
  filterSignature,
  detailsSheetTarget,
  onPurchase,
  onToggleExpand,
  onOpenDetails,
  onInteract,
}: CatalogGridProps): React.ReactElement {
  const stableEntries = useStableCatalogEntries({
    entries,
    allEntries,
    signature: filterSignature,
  });

  const virtualizer: CatalogVirtualizerResult | null = useCatalogVirtualizer({
    count: stableEntries.length,
    enabled: !showLaneLayout && stableEntries.length >= CATALOG_VIRTUALIZATION_THRESHOLD,
    estimateSize: CATALOG_VIRTUALIZER_ESTIMATED_CARD_HEIGHT,
    overscan: CATALOG_VIRTUALIZER_OVERSCAN,
  });

  if (showLaneLayout) {
    const sortedEntries = [...stableEntries].sort((a, b) => {
      const tierA = getWatchModelTierId(a.id);
      const tierB = getWatchModelTierId(b.id);
      const orderA = CATALOG_TIER_SEQUENCE.indexOf(tierA);
      const orderB = CATALOG_TIER_SEQUENCE.indexOf(tierB);

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return a.model.localeCompare(b.model);
    });

    const sectionMap = new Map<CatalogTierId, CatalogEntry[]>();
    for (const section of CATALOG_MOVEMENT_SECTIONS) {
      sectionMap.set(section.id, []);
    }

    for (const entry of sortedEntries) {
      const movementType = getWatchModelTierId(entry.id);
      const section = sectionMap.get(movementType);
      if (section) {
        section.push(entry);
      }
    }

    return (
      <div
        className={`catalog-grid catalog-lanes ${
          isCompact ? "catalog-grid-density-compact" : "catalog-grid-density-expanded"
        }`}
        data-testid="catalog-grid"
        data-density={isCompact ? "compact" : "expanded"}
        data-view-mode={isExpertMode ? "expert" : "novice"}
      >
        {CATALOG_MOVEMENT_SECTIONS.map((section) => (
          <CatalogLaneSection
            key={section.id}
            section={section}
            entries={sectionMap.get(section.id) ?? []}
            state={state}
            isCompact={isCompact}
            isExpertMode={isExpertMode}
            showFacts={showFacts}
            favoriteIds={favoriteIds}
            expandedCards={expandedCards}
            purchaseHighlights={purchaseHighlights}
            nowMs={nowMs}
            effectiveCashRateCentsPerSec={effectiveCashRateCentsPerSec}
            effectiveEnjoymentRateCentsPerSec={effectiveEnjoymentRateCentsPerSec}
            craftingPartsPerWatch={craftingPartsPerWatch}
            atelierUnlocked={atelierUnlocked}
            detailsSheetTarget={detailsSheetTarget}
            onPurchase={onPurchase}
            onToggleExpand={onToggleExpand}
            onOpenDetails={onOpenDetails}
            onInteract={onInteract}
          />
        ))}
      </div>
    );
  }

  if (virtualizer) {
    const { virtualItems, paddingTop, paddingBottom } = virtualizer;
    return (
      <div
        className={`catalog-grid catalog-grid-virtualized ${
          isCompact ? "catalog-grid-density-compact" : "catalog-grid-density-expanded"
        }`}
        data-testid="catalog-grid"
        data-density={isCompact ? "compact" : "expanded"}
        data-view-mode={isExpertMode ? "expert" : "novice"}
        style={{ paddingTop, paddingBottom }}
      >
        {virtualItems.map((virtualItem) => {
          const entry = stableEntries[virtualItem.index];
          return (
            <React.Fragment key={entry.id}>
              <CatalogCard
                entry={entry}
                state={state}
                isCompact={isCompact}
                isExpertMode={isExpertMode}
                isHighlighted={purchaseHighlights[entry.id] ?? false}
                isExpanded={expandedCards[entry.id] ?? false}
                isDetailsOpen={detailsSheetTarget?.entryId === entry.id}
                isFavorite={favoriteIds.has(entry.id)}
                showFacts={showFacts}
                nowMs={nowMs}
                effectiveCashRateCentsPerSec={effectiveCashRateCentsPerSec}
                effectiveEnjoymentRateCentsPerSec={effectiveEnjoymentRateCentsPerSec}
                craftingPartsPerWatch={craftingPartsPerWatch}
                atelierUnlocked={atelierUnlocked}
                onPurchase={onPurchase}
                onToggleExpand={(isOpen) => onToggleExpand(entry.id, isOpen)}
                onOpenDetails={(trigger) => onOpenDetails(entry.id, trigger)}
                onInteract={onInteract}
              />
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={`catalog-grid ${
        isCompact ? "catalog-grid-density-compact" : "catalog-grid-density-expanded"
      }`}
      data-testid="catalog-grid"
      data-density={isCompact ? "compact" : "expanded"}
      data-view-mode={isExpertMode ? "expert" : "novice"}
    >
      {stableEntries.map((entry) => (
        <CatalogCard
          key={entry.id}
          entry={entry}
          state={state}
          isCompact={isCompact}
          isExpertMode={isExpertMode}
          isHighlighted={purchaseHighlights[entry.id] ?? false}
          isExpanded={expandedCards[entry.id] ?? false}
          isDetailsOpen={detailsSheetTarget?.entryId === entry.id}
          isFavorite={favoriteIds.has(entry.id)}
          showFacts={showFacts}
          nowMs={nowMs}
          effectiveCashRateCentsPerSec={effectiveCashRateCentsPerSec}
          effectiveEnjoymentRateCentsPerSec={effectiveEnjoymentRateCentsPerSec}
          craftingPartsPerWatch={craftingPartsPerWatch}
          atelierUnlocked={atelierUnlocked}
          onPurchase={onPurchase}
          onToggleExpand={(isOpen) => onToggleExpand(entry.id, isOpen)}
          onOpenDetails={(trigger) => onOpenDetails(entry.id, trigger)}
          onInteract={onInteract}
        />
      ))}
    </div>
  );
}

export default CatalogGrid;

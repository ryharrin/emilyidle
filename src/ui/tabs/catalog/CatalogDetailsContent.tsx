import React from "react";

import type { CatalogEntry } from "../../../game/catalog";
import type { CatalogTierId } from "../../../game/model/types";

const TIER_SEQUENCE: readonly CatalogTierId[] = ["quartz", "automatic", "manual", "tourbillon"];

const TIER_LABELS: Record<CatalogTierId, string> = {
  quartz: "Quartz",
  automatic: "Automatic",
  manual: "Manual",
  tourbillon: "Tourbillon",
};

const MOVEMENT_DECISION_NOTES: Record<CatalogTierId, string> = {
  quartz: "Fastest onboarding lane for early reliability and low-friction scaling.",
  automatic: "Balanced lane with reserve management and steady progression pacing.",
  manual: "Hands-on lane that rewards interaction depth and crafted collecting.",
  tourbillon: "Prestige lane tuned for late progression and premium upside.",
};

export type CatalogDecisionInfo = {
  movementSummary: string;
  tierSummary: string;
  progressionSummary: string;
};

type BuildCatalogDecisionInfoArgs = {
  tierId: CatalogTierId;
  movement?: string;
  unlocked: boolean;
  ownedCount: number;
  unlockRequirementLabel: string | null;
  unlockProgressLabel: string | null;
  gateReady: boolean;
  gateEtaLabel: string | null;
  duplicateMultiplier: number;
};

type CatalogDetailsContentProps = {
  entry: CatalogEntry;
  tags: string[];
  showFacts: boolean;
  decisionInfo: CatalogDecisionInfo;
  viewMode: "novice" | "expert";
};

const formatMovementLabel = (movement?: string): string => {
  if (!movement) {
    return "Movement unavailable";
  }
  return `${movement.charAt(0).toUpperCase()}${movement.slice(1)} movement`;
};

const formatTierSummary = (tierId: CatalogTierId): string => {
  const tierIndex = TIER_SEQUENCE.indexOf(tierId);
  if (tierIndex < 0) {
    return "Tier progression data unavailable.";
  }
  const tierLabel = TIER_LABELS[tierId];
  return `Tier ${tierIndex + 1} of ${TIER_SEQUENCE.length} (${tierLabel}) progression lane.`;
};

export const buildCatalogDecisionInfo = ({
  tierId,
  movement,
  unlocked,
  ownedCount,
  unlockRequirementLabel,
  unlockProgressLabel,
  gateReady,
  gateEtaLabel,
  duplicateMultiplier,
}: BuildCatalogDecisionInfoArgs): CatalogDecisionInfo => {
  const movementSummary = `${formatMovementLabel(movement)}. ${MOVEMENT_DECISION_NOTES[tierId]}`;
  const tierSummary = formatTierSummary(tierId);

  let progressionSummary = "";
  if (!unlocked) {
    const requirementLabel = unlockRequirementLabel ?? "milestone progress";
    const progressLabel = unlockProgressLabel ? ` Progress: ${unlockProgressLabel}.` : "";
    progressionSummary = `Locked behind ${requirementLabel}.${progressLabel}`;
  } else if (gateReady) {
    const buyTimingLabel =
      ownedCount > 0
        ? "Buy-ready now for duplicate scaling."
        : "Buy-ready now for first acquisition.";
    progressionSummary = `${buyTimingLabel} Next duplicate bonus x${duplicateMultiplier.toFixed(2)}.`;
  } else if (gateEtaLabel) {
    progressionSummary = `Unlocked, but resources are still ramping. ${gateEtaLabel}.`;
  } else {
    progressionSummary = "Unlocked, but resources are not yet sufficient.";
  }

  return {
    movementSummary,
    tierSummary,
    progressionSummary,
  };
};

export function CatalogDetailsContent({
  entry,
  tags,
  showFacts,
  decisionInfo,
  viewMode,
}: CatalogDetailsContentProps) {
  const sourceLabel = entry.image.sourceUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const passport = entry.passport;
  const expertMode = viewMode === "expert";
  const passportFallback = "Unknown";
  const getPassportValue = (value: string | number | undefined): string => {
    if (typeof value === "number") {
      return Number.isFinite(value) ? String(value) : passportFallback;
    }
    if (typeof value !== "string") {
      return passportFallback;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : passportFallback;
  };
  const specs = [
    { label: "Year", value: entry.year },
    { label: "Tags", value: tags.join(" · ") },
    { label: "License", value: entry.image.licenseName },
    { label: "Author", value: entry.image.author },
    {
      label: "Source",
      value: (
        <a href={entry.image.sourceUrl} target="_blank" rel="noreferrer">
          {sourceLabel}
        </a>
      ),
    },
  ];
  const passportHighlights = [
    { label: "Reference", value: getPassportValue(passport.referenceFamily.value) },
    { label: "Complications", value: getPassportValue(passport.complications.value) },
    { label: "Movement origin", value: getPassportValue(passport.movementOrigin.value) },
    { label: "Archive year", value: getPassportValue(entry.year) },
  ];
  const passportSpecs = [
    { label: "Production era", value: getPassportValue(passport.productionEra.value) },
    { label: "Case material", value: getPassportValue(passport.caseMaterial.value) },
    { label: "Case diameter", value: getPassportValue(passport.caseDiameterMm.value) },
    { label: "Water resistance", value: getPassportValue(passport.waterResistance.value) },
  ];

  return (
    <div className="catalog-details-body">
      <p className="catalog-description">{entry.description}</p>
      <ul className="catalog-specs">
        {specs.map((spec) => (
          <li key={`${entry.id}-${spec.label}`}>
            <span className="catalog-spec-label">{spec.label}</span>
            <span className="catalog-spec-value">{spec.value}</span>
          </li>
        ))}
      </ul>
      <section className="catalog-facts catalog-watch-passport" data-testid="catalog-watch-passport">
        <p className="catalog-facts-title">Watch passport</p>
        <p className="muted">{getPassportValue(passport.headline)}</p>
        <ul className="catalog-specs">
          {passportHighlights.map((field) => (
            <li key={`${entry.id}-passport-highlight-${field.label}`}>
              <span className="catalog-spec-label">{field.label}</span>
              <span
                className="catalog-spec-value"
                data-testid={field.label === "Archive year" ? "watch-passport-year-value" : undefined}
              >
                {field.value}
              </span>
            </li>
          ))}
        </ul>
        <div data-testid="watch-passport-disclosure">
          <details
            className="catalog-passport-details"
            data-testid="catalog-watch-passport-details"
            open={expertMode}
          >
            <summary data-testid="watch-passport-toggle">
              {expertMode ? "Expert passport detail" : "Show full passport details and provenance"}
            </summary>
            <div className="catalog-passport-details__content">
              <ul className="catalog-specs">
                {passportSpecs.map((field) => (
                  <li key={`${entry.id}-passport-spec-${field.label}`}>
                    <span className="catalog-spec-label">{field.label}</span>
                    <span className="catalog-spec-value">{field.value}</span>
                  </li>
                ))}
              </ul>
              <div
                className="catalog-facts catalog-watch-passport-provenance"
                data-testid="catalog-watch-passport-provenance"
              >
                <p className="catalog-facts-title">Source provenance</p>
                <ul>
                  {passport.provenance.map((source, index) => (
                    <li key={`${entry.id}-passport-provenance-${index}`}>
                      {source.sourceUrl ? (
                        <a href={source.sourceUrl} target="_blank" rel="noreferrer">
                          {getPassportValue(source.sourceLabel)}
                        </a>
                      ) : (
                        getPassportValue(source.sourceLabel)
                      )}
                      {` · ${getPassportValue(source.provenance)}`}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </details>
        </div>
      </section>
      <div className="catalog-facts catalog-decision-summary" data-testid="catalog-decision-summary">
        <p className="catalog-facts-title">Decision signals</p>
        <ul className="catalog-specs">
          <li data-testid="catalog-decision-movement">
            <span className="catalog-spec-label">Movement fit</span>
            <span className="catalog-spec-value">{decisionInfo.movementSummary}</span>
          </li>
          <li data-testid="catalog-decision-tier">
            <span className="catalog-spec-label">Tier role</span>
            <span className="catalog-spec-value">{decisionInfo.tierSummary}</span>
          </li>
          <li data-testid="catalog-decision-progression">
            <span className="catalog-spec-label">Progression</span>
            <span className="catalog-spec-value">{decisionInfo.progressionSummary}</span>
          </li>
        </ul>
      </div>
      {showFacts && entry.facts && entry.facts.length > 0 ? (
        <div className="catalog-facts">
          <p className="catalog-facts-title">Collector notes</p>
          <ul data-testid="catalog-facts">
            {entry.facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

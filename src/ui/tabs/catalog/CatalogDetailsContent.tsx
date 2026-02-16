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

const USD_CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const PRICE_AS_OF_PATTERN = /\bprice as of\b/gi;

type UnknownRecord = Record<string, unknown>;
type CatalogSpecRow = { label: string; value: string };
type CatalogPriceRow = { label: string; value: string; note?: string };

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

const toRecord = (value: unknown): UnknownRecord | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as UnknownRecord;
};

const toDisplayLabel = (value: string): string =>
  value
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const isUrlLike = (value: string): boolean => /^https?:\/\//i.test(value.trim());

const sanitizeDisplayText = (value: string): string =>
  value.replace(PRICE_AS_OF_PATTERN, "Sampled").replace(/\s+/g, " ").trim();

const readString = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = sanitizeDisplayText(value);
  return trimmed.length > 0 ? trimmed : null;
};

const readStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => readString(item))
    .filter((item): item is string => item !== null)
    .filter((item) => !isUrlLike(item));
};

const readNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value
      .trim()
      .replace(/usd|us\$/gi, "")
      .replace(/\$/g, "")
      .replace(/,/g, "");
    if (!normalized) {
      return null;
    }
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const dedupeStrings = (items: string[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    const key = item.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(item);
  }

  return result;
};

const shouldSkipMetadataKey = (key: string): boolean =>
  /source|url|link|citation|license|author|attribution/i.test(key);

const formatMovementLabel = (movement?: string): string => {
  if (!movement) {
    return "Movement unavailable";
  }
  return `${movement.charAt(0).toUpperCase()}${movement.slice(1)} movement`;
};

const formatWindingSystemLabel = (value: string): string =>
  value
    .split("-")
    .map((chunk) => `${chunk.charAt(0).toUpperCase()}${chunk.slice(1)}`)
    .join(" ");

const formatTierSummary = (tierId: CatalogTierId): string => {
  const tierIndex = TIER_SEQUENCE.indexOf(tierId);
  if (tierIndex < 0) {
    return "Tier progression data unavailable.";
  }
  const tierLabel = TIER_LABELS[tierId];
  return `Tier ${tierIndex + 1} of ${TIER_SEQUENCE.length} (${tierLabel}) progression lane.`;
};

const formatUsd = (amount: number): string => USD_CURRENCY_FORMATTER.format(amount);

const readUsdAmountFromRecord = (record: UnknownRecord): number | null => {
  const dollarKeys = [
    "amountUsd",
    "priceUsd",
    "valueUsd",
    "msrpUsd",
    "marketUsd",
    "lowUsd",
    "highUsd",
    "amount",
    "price",
    "value",
  ] as const;
  for (const key of dollarKeys) {
    const parsed = readNumber(record[key]);
    if (parsed !== null) {
      return parsed;
    }
  }

  const centsKeys = [
    "amountUsdCents",
    "priceUsdCents",
    "valueUsdCents",
    "msrpUsdCents",
    "marketUsdCents",
    "amountCents",
    "priceCents",
    "valueCents",
  ] as const;
  for (const key of centsKeys) {
    const parsed = readNumber(record[key]);
    if (parsed !== null) {
      return parsed / 100;
    }
  }

  return null;
};

const normalizeSpecRows = (value: unknown): CatalogSpecRow[] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          const normalized = readString(item);
          return normalized ? { label: "Detail", value: normalized } : null;
        }
        const record = toRecord(item);
        if (!record) {
          return null;
        }
        const label =
          readString(record.label) ??
          readString(record.name) ??
          readString(record.key) ??
          readString(record.title);
        const rawValue =
          readString(record.value) ??
          readString(record.detail) ??
          readString(record.spec) ??
          readString(record.text);
        if (!label || !rawValue || isUrlLike(rawValue)) {
          return null;
        }
        return { label: toDisplayLabel(label), value: rawValue };
      })
      .filter((row): row is CatalogSpecRow => row !== null);
  }

  const record = toRecord(value);
  if (!record) {
    return [];
  }

  return Object.entries(record)
    .map(([key, rawValue]) => {
      if (shouldSkipMetadataKey(key)) {
        return null;
      }
      const normalizedValue = readString(rawValue);
      if (!normalizedValue || isUrlLike(normalizedValue)) {
        return null;
      }
      return { label: toDisplayLabel(key), value: normalizedValue };
    })
    .filter((row): row is CatalogSpecRow => row !== null);
};

const dedupeSpecs = (rows: CatalogSpecRow[]): CatalogSpecRow[] => {
  const seen = new Set<string>();
  const deduped: CatalogSpecRow[] = [];

  for (const row of rows) {
    const key = `${row.label.toLowerCase()}::${row.value.toLowerCase()}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(row);
  }

  return deduped;
};

const normalizePriceRow = (
  value: unknown,
  fallbackLabel: string,
  fallbackNote?: string,
): CatalogPriceRow | null => {
  if (typeof value === "number") {
    return { label: fallbackLabel, value: formatUsd(value), note: fallbackNote };
  }

  if (typeof value === "string") {
    const parsed = readNumber(value);
    if (parsed !== null) {
      return { label: fallbackLabel, value: formatUsd(parsed), note: fallbackNote };
    }
    const normalized = readString(value);
    if (!normalized || isUrlLike(normalized)) {
      return null;
    }
    return { label: fallbackLabel, value: normalized, note: fallbackNote };
  }

  const record = toRecord(value);
  if (!record) {
    return null;
  }

  const label =
    readString(record.label) ??
    readString(record.name) ??
    readString(record.title) ??
    readString(record.category) ??
    readString(record.type) ??
    fallbackLabel;

  const minAmount =
    readNumber(record.minUsd) ??
    readNumber(record.lowUsd) ??
    (() => {
      const cents = readNumber(record.minUsdCents) ?? readNumber(record.lowUsdCents);
      return cents === null ? null : cents / 100;
    })();
  const maxAmount =
    readNumber(record.maxUsd) ??
    readNumber(record.highUsd) ??
    (() => {
      const cents = readNumber(record.maxUsdCents) ?? readNumber(record.highUsdCents);
      return cents === null ? null : cents / 100;
    })();
  const directAmount = readUsdAmountFromRecord(record);

  const valueLabel =
    minAmount !== null && maxAmount !== null
      ? `${formatUsd(minAmount)} - ${formatUsd(maxAmount)}`
      : minAmount !== null
        ? formatUsd(minAmount)
        : maxAmount !== null
          ? formatUsd(maxAmount)
          : directAmount !== null
            ? formatUsd(directAmount)
            : (readString(record.display) ?? readString(record.value));

  if (!valueLabel || isUrlLike(valueLabel)) {
    return null;
  }

  const sampleDate =
    readString(record.sampledAt) ??
    readString(record.capturedAt) ??
    readString(record.observedAt) ??
    readString(record.updatedAt) ??
    readString(record.asOf) ??
    readString(record.priceDate);
  const provider =
    readString(record.provider) ?? readString(record.retailer) ?? readString(record.vendor);
  const rawNote = readString(record.note) ?? readString(record.notes);
  const note = [fallbackNote, provider, sampleDate ? `Sampled ${sampleDate}` : null, rawNote]
    .filter((part): part is string => part !== null && part !== undefined)
    .filter((part) => !isUrlLike(part))
    .join(" · ");

  return {
    label,
    value: valueLabel,
    note: note || undefined,
  };
};

const normalizePricingRows = (entry: CatalogEntry): CatalogPriceRow[] => {
  const entryRecord = entry as unknown as UnknownRecord;
  const detailsRecord =
    toRecord(entryRecord.details) ??
    toRecord(entryRecord.catalogDetails) ??
    toRecord(entryRecord.referenceDetails) ??
    null;

  const candidates: unknown[] = [
    detailsRecord?.pricing,
    detailsRecord?.priceEntries,
    detailsRecord?.prices,
    entryRecord.pricing,
    entryRecord.priceEntries,
    entryRecord.marketPricing,
    entryRecord.marketPrices,
  ];

  const rows: CatalogPriceRow[] = [];
  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    if (Array.isArray(candidate)) {
      candidate.forEach((item, index) => {
        const row = normalizePriceRow(item, `Price ${index + 1}`);
        if (row) {
          rows.push(row);
        }
      });
      continue;
    }

    const candidateRecord = toRecord(candidate);
    if (!candidateRecord) {
      const row = normalizePriceRow(candidate, "Price");
      if (row) {
        rows.push(row);
      }
      continue;
    }

    const nestedEntries =
      candidateRecord.entries ?? candidateRecord.samples ?? candidateRecord.data;
    if (nestedEntries && Array.isArray(nestedEntries)) {
      nestedEntries.forEach((item, index) => {
        const row = normalizePriceRow(item, `Price ${index + 1}`);
        if (row) {
          rows.push(row);
        }
      });
      continue;
    }

    const directRow = normalizePriceRow(candidateRecord, "Price");
    if (directRow) {
      rows.push(directRow);
    }

    Object.entries(candidateRecord).forEach(([key, rawValue]) => {
      if (["entries", "samples", "data"].includes(key)) {
        return;
      }
      if (shouldSkipMetadataKey(key)) {
        return;
      }
      const row = normalizePriceRow(rawValue, toDisplayLabel(key));
      if (row) {
        rows.push(row);
      }
    });
  }

  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = `${row.label.toLowerCase()}::${row.value.toLowerCase()}::${row.note?.toLowerCase() ?? ""}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const buildDetailDescription = (entry: CatalogEntry): string => {
  const entryRecord = entry as unknown as UnknownRecord;
  const detailsRecord =
    toRecord(entryRecord.details) ??
    toRecord(entryRecord.catalogDetails) ??
    toRecord(entryRecord.referenceDetails) ??
    null;

  return (
    readString(detailsRecord?.fullDescription) ??
    readString(detailsRecord?.description) ??
    readString(entryRecord.fullDescription) ??
    sanitizeDisplayText(entry.description)
  );
};

const buildFeatureList = (entry: CatalogEntry): string[] => {
  const entryRecord = entry as unknown as UnknownRecord;
  const detailsRecord =
    toRecord(entryRecord.details) ??
    toRecord(entryRecord.catalogDetails) ??
    toRecord(entryRecord.referenceDetails) ??
    null;

  const features = [
    ...readStringArray(detailsRecord?.features),
    ...readStringArray(detailsRecord?.keyFeatures),
    ...readStringArray(detailsRecord?.highlights),
    ...readStringArray(entryRecord.features),
    ...readStringArray(entryRecord.keyFeatures),
    ...readStringArray(entryRecord.highlights),
  ];

  if (features.length === 0 && entry.facts && entry.facts.length > 0) {
    return dedupeStrings(entry.facts.map((fact) => sanitizeDisplayText(fact)));
  }

  return dedupeStrings(features);
};

const buildSpecRows = (entry: CatalogEntry, tags: string[]): CatalogSpecRow[] => {
  const entryRecord = entry as unknown as UnknownRecord;
  const detailsRecord =
    toRecord(entryRecord.details) ??
    toRecord(entryRecord.catalogDetails) ??
    toRecord(entryRecord.referenceDetails) ??
    null;

  const movementFallbackRows: CatalogSpecRow[] = [
    { label: "Year", value: entry.year },
    { label: "Tags", value: tags.join(" · ") },
    { label: "Movement", value: toDisplayLabel(entry.movementType) },
    { label: "Caliber", value: entry.caliberName },
    { label: "Winding System", value: formatWindingSystemLabel(entry.windingSystem) },
    {
      label: "Frequency",
      value: entry.frequencyBph !== null ? `${entry.frequencyBph.toLocaleString()} bph` : "Unknown",
    },
    {
      label: "Power Reserve",
      value:
        entry.powerReserveHours !== null
          ? `${entry.powerReserveHours.toLocaleString()} h`
          : "Unknown",
    },
    {
      label: "Jewels",
      value: entry.jewelCount !== null ? entry.jewelCount.toLocaleString() : "Unknown",
    },
    { label: "Escapement", value: entry.escapement ?? "Unknown" },
  ];

  const richRows = [
    ...normalizeSpecRows(detailsRecord?.technicalSpecs),
    ...normalizeSpecRows(detailsRecord?.specs),
    ...normalizeSpecRows(detailsRecord?.expandedSpecs),
    ...normalizeSpecRows(entryRecord.technicalSpecs),
    ...normalizeSpecRows(entryRecord.specs),
    ...normalizeSpecRows(entryRecord.expandedSpecs),
  ];

  return dedupeSpecs(
    [...richRows, ...movementFallbackRows].filter((row) => {
      const label = sanitizeDisplayText(row.label);
      const value = sanitizeDisplayText(row.value);
      return Boolean(label) && Boolean(value) && !isUrlLike(value);
    }),
  );
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
  const description = buildDetailDescription(entry);
  const features = buildFeatureList(entry);
  const specs = buildSpecRows(entry, tags);
  const pricingRows = normalizePricingRows(entry);
  const collectorNotes = readStringArray(entry.facts);
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
      <section className="catalog-details-section">
        <p className="catalog-facts-title">Description</p>
        <p className="catalog-description">{description}</p>
      </section>
      <section className="catalog-details-section" data-testid="catalog-detail-features">
        <p className="catalog-facts-title">Features</p>
        {features.length > 0 ? (
          <ul className="catalog-feature-list">
            {features.map((feature) => (
              <li key={`${entry.id}-feature-${feature}`}>{feature}</li>
            ))}
          </ul>
        ) : (
          <p className="muted">Feature details are unavailable for this reference.</p>
        )}
      </section>
      <section className="catalog-details-section" data-testid="catalog-detail-specs">
        <p className="catalog-facts-title">Technical specs</p>
        <ul className="catalog-specs">
          {specs.map((spec) => (
            <li key={`${entry.id}-${spec.label}-${spec.value}`}>
              <span className="catalog-spec-label">{spec.label}</span>
              <span className="catalog-spec-value">{spec.value}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="catalog-details-section" data-testid="catalog-detail-pricing">
        <p className="catalog-facts-title">Market pricing (USD)</p>
        {pricingRows.length > 0 ? (
          <ul className="catalog-price-list">
            {pricingRows.map((price) => (
              <li key={`${entry.id}-price-${price.label}-${price.value}`}>
                <div className="catalog-price-list__row">
                  <span className="catalog-spec-label">{price.label}</span>
                  <span className="catalog-spec-value">{price.value}</span>
                </div>
                {price.note && <p className="catalog-price-list__note">{price.note}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">USD pricing metadata is unavailable for this reference.</p>
        )}
      </section>
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
                      {getPassportValue(source.sourceLabel)}
                      {` · ${getPassportValue(source.provenance)}`}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </details>
        </div>
      </section>
      <div
        className="catalog-facts catalog-decision-summary"
        data-testid="catalog-decision-summary"
      >
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
      {showFacts && collectorNotes.length > 0 && (
        <div className="catalog-facts">
          <p className="catalog-facts-title">Collector notes</p>
          <ul data-testid="catalog-facts">
            {collectorNotes.map((fact) => (
              <li key={`${entry.id}-fact-${fact}`}>{fact}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

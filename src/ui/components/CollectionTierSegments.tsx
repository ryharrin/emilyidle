import { TierBadge } from "./TierBadge";
import type { TierBadgeCategory, TierBadgeDefinition } from "../../game/tierBadges";

import "./collectionDepth.css";

export type TierSegmentSummary = {
  category: TierBadgeCategory;
  badge: TierBadgeDefinition;
  totalModels: number;
  ownedCount: number;
  discoveredCount: number;
};

type CollectionTierSegmentsProps = {
  segments: TierSegmentSummary[];
};

const formatPercentage = (owned: number, total: number) => {
  if (total <= 0) {
    return "0%";
  }
  return `${Math.round((owned / total) * 100)}%`;
};

export function CollectionTierSegments({ segments }: CollectionTierSegmentsProps) {
  return (
    <div className="collection-tier-segments" data-testid="collection-tier-segments">
      {segments.map((segment) => {
        const progressRatio =
          segment.totalModels > 0 ? segment.ownedCount / segment.totalModels : 0;
        return (
          <section
            key={segment.category}
            id={`collection-segment-${segment.category}`}
            className="collection-tier-segment"
            data-testid={`collection-segment-${segment.category}`}
          >
            <header>
              <TierBadge
                tier={segment.badge.category}
                showLabel
                label={segment.badge.label}
                description={segment.badge.description}
                backgroundVar={segment.badge.backgroundVar}
                textVar={segment.badge.textVar}
              />
              <div>
                <p className="eyebrow">{segment.badge.description}</p>
                <h4>{segment.badge.label}</h4>
              </div>
            </header>
            <div
              className="collection-tier-segment__progress"
              data-testid="collection-tier-progress"
            >
              <div
                className="collection-tier-segment__progress-bar"
                style={{ width: `${Math.round(progressRatio * 100)}%` }}
              />
            </div>
            <p>
              Owned {segment.ownedCount} / {segment.totalModels}
            </p>
            <p className="muted">
              Discovered {segment.discoveredCount} / {segment.totalModels} ·{" "}
              {formatPercentage(segment.ownedCount, segment.totalModels)}
            </p>
          </section>
        );
      })}
    </div>
  );
}

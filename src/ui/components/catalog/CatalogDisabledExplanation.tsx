import React from "react";

export type CatalogDisabledReason = {
  code: "funds" | "enjoyment" | "locked" | "prerequisite" | "undiscovered";
  label: string;
  detail: React.ReactNode;
  nextStep?: string;
};

type CatalogDisabledExplanationProps = {
  entryId: string;
  reasons: CatalogDisabledReason[];
};

export function CatalogDisabledExplanation({
  entryId,
  reasons,
}: CatalogDisabledExplanationProps): JSX.Element | null {
  if (reasons.length === 0) {
    return null;
  }

  return (
    <details className="catalog-disabled-explanation" data-testid={`catalog-explain-${entryId}`}>
      <summary data-testid={`catalog-why-${entryId}`}>Why can't I buy?</summary>
      <ul className="catalog-disabled-list">
        {reasons.map((reason) => (
          <li
            key={`${entryId}-${reason.code}`}
            className="catalog-disabled-reason"
            data-testid={`catalog-reason-${entryId}-${reason.code}`}
          >
            <p className="catalog-disabled-title">{reason.label}</p>
            <div className="catalog-disabled-body">{reason.detail}</div>
            {reason.nextStep ? (
              <p className="catalog-disabled-next">Next: {reason.nextStep}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </details>
  );
}

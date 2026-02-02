import React from "react";

export type CatalogDisabledReason = {
  title: string;
  body: React.ReactNode;
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
          <li key={`${entryId}-${reason.title}`} className="catalog-disabled-reason">
            <p className="catalog-disabled-title">{reason.title}</p>
            <div className="catalog-disabled-body">{reason.body}</div>
          </li>
        ))}
      </ul>
    </details>
  );
}

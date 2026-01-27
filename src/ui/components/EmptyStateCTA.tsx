import React from "react";

type EmptyStateCTAProps = {
  title: string;
  body: string;
  ctaLabel: string;
  onCta: () => void;
  testId?: string;
};

export function EmptyStateCTA({
  title,
  body,
  ctaLabel,
  onCta,
  testId,
}: EmptyStateCTAProps): JSX.Element {
  return (
    <div className="card">
      <h4>{title}</h4>
      <p className="muted">{body}</p>
      <div className="card-actions">
        <button type="button" onClick={onCta} data-testid={testId}>
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}

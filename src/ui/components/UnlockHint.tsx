import React from "react";

export type UnlockHintCta = {
  label: string;
  onClick: () => void;
  testId?: string;
};

export type UnlockHintProps = {
  eyebrow: string;
  title: string;
  detail: string;
  currentLabel: string;
  thresholdLabel: string;
  ratio: number;
  cta?: UnlockHintCta;
};

export function UnlockHint({
  eyebrow,
  title,
  detail,
  currentLabel,
  thresholdLabel,
  ratio,
  cta,
}: UnlockHintProps): JSX.Element {
  const clampedRatio = Math.max(0, Math.min(1, ratio));
  const percent = Math.round(clampedRatio * 100);

  return (
    <div className="unlock-hint">
      <p className="eyebrow">{eyebrow}</p>
      <div className="unlock-hint-header">
        <h4>{title}</h4>
        <span>{percent}%</span>
      </div>
      <p className="muted">{detail}</p>
      <div className="unlock-hint-progress">
        <span>
          {currentLabel} / {thresholdLabel} - {percent}%
        </span>
      </div>
      <div className="teaser-track" aria-hidden="true">
        <div className="teaser-fill" style={{ width: `${percent}%` }}></div>
      </div>
      {cta && (
        <div className="card-actions">
          <button
            type="button"
            className="secondary"
            data-testid={cta.testId}
            onClick={cta.onClick}
          >
            {cta.label}
          </button>
        </div>
      )}
    </div>
  );
}

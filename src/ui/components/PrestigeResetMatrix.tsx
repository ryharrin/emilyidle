import React from "react";

type PrestigeResetMatrixProps = {
  title?: string;
  resets: ReadonlyArray<string>;
  carries: ReadonlyArray<string>;
  testId: string;
};

export function PrestigeResetMatrix({
  title = "What resets vs what stays",
  resets,
  carries,
  testId,
}: PrestigeResetMatrixProps) {
  return (
    <section className="card prestige-reset-matrix" data-testid={testId} aria-label={title}>
      <h4>{title}</h4>
      <div className="prestige-reset-matrix__grid">
        <section className="prestige-reset-matrix__column" aria-label="What resets">
          <h5>What resets</h5>
          <ul>
            {resets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="prestige-reset-matrix__column" aria-label="What stays">
          <h5>What stays</h5>
          <ul>
            {carries.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}

import React from "react";

import type { PrestigeSummary as PrestigeSummaryData } from "../prestigeSummary";

type PrestigeSummaryProps = {
  summary: PrestigeSummaryData;
  testId?: string;
};

export function PrestigeSummary({ summary, testId }: PrestigeSummaryProps): JSX.Element {
  return (
    <div className="card-stack prestige-summary-grid" data-testid={testId}>
      <div
        className="card prestige-summary-card"
        data-testid={testId ? `${testId}-current` : undefined}
      >
        <h4>Current run</h4>
        <ul>
          {summary.current.map((entry, index) => (
            <li key={`${index}-${entry}`}>{entry}</li>
          ))}
        </ul>
      </div>
      <div
        className="card prestige-summary-card"
        data-testid={testId ? `${testId}-next` : undefined}
      >
        <h4>Next run keeps</h4>
        <ul>
          {summary.next.map((entry, index) => (
            <li key={`${index}-${entry}`}>{entry}</li>
          ))}
        </ul>
      </div>
      <div
        className="card prestige-summary-card"
        data-testid={testId ? `${testId}-delta` : undefined}
      >
        <h4>Delta</h4>
        <ul>
          {summary.delta.map((entry, index) => (
            <li key={`${index}-${entry}`}>{entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

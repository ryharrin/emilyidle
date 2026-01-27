import React from "react";

import type { PrestigeSummary as PrestigeSummaryData } from "../prestigeSummary";

type PrestigeSummaryProps = {
  summary: PrestigeSummaryData;
  testId?: string;
};

export function PrestigeSummary({ summary, testId }: PrestigeSummaryProps): JSX.Element {
  return (
    <div className="card-stack" data-testid={testId}>
      <div className="card" data-testid={testId ? `${testId}-gain` : undefined}>
        <h4>Gain</h4>
        <ul>
          {summary.gain.map((entry, index) => (
            <li key={`${index}-${entry}`}>{entry}</li>
          ))}
        </ul>
      </div>
      <div className="card" data-testid={testId ? `${testId}-keep` : undefined}>
        <h4>Keeps</h4>
        <ul>
          {summary.keep.map((entry, index) => (
            <li key={`${index}-${entry}`}>{entry}</li>
          ))}
        </ul>
      </div>
      <div className="card" data-testid={testId ? `${testId}-lose` : undefined}>
        <h4>Loses</h4>
        <ul>
          {summary.lose.map((entry, index) => (
            <li key={`${index}-${entry}`}>{entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

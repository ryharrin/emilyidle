import type { ReactNode } from "react";

type TabDisclosureProps = {
  title: string;
  summary: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  testId?: string;
};

function joinClassNames(...values: Array<string | undefined>): string {
  return values.filter((value) => Boolean(value)).join(" ");
}

export function TabDisclosure({
  title,
  summary,
  children,
  defaultOpen = false,
  className,
  testId,
}: TabDisclosureProps): JSX.Element {
  return (
    <details
      className={joinClassNames("tab-disclosure", className)}
      open={defaultOpen}
      data-testid={testId}
    >
      <summary className="tab-disclosure-summary">
        <span>{title}</span>
        <span className="muted">{summary}</span>
      </summary>
      <div className="tab-disclosure-body">{children}</div>
    </details>
  );
}

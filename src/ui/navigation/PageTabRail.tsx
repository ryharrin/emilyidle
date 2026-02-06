import type { KeyboardEvent } from "react";

import type { TabBucket, TabId, TabMeta } from "./tabMeta";

import "./pageTabRail.css";

type PageTabRailProps = {
  tabs: TabMeta[];
  activeTabId: TabId;
  focusedTabId: TabId;
  onTabClick: (tabId: TabId) => void;
  onTabFocus: (tabId: TabId) => void;
  onTabKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  onTabRef: (tabId: TabId, node: HTMLButtonElement | null) => void;
};

const BUCKET_LABELS: Record<TabBucket, string> = {
  primary: "Primary",
  progression: "Progression",
  system: "System",
};

export function PageTabRail({
  tabs,
  activeTabId,
  focusedTabId,
  onTabClick,
  onTabFocus,
  onTabKeyDown,
  onTabRef,
}: PageTabRailProps) {
  let lastBucket: TabBucket | null = null;

  return (
    <div className="page-tab-rail">
      <div className="page-tab-rail__scroll" role="tablist" aria-label="Primary navigation">
        {tabs.map((tab) => {
          const bucketStart = tab.bucket !== lastBucket;
          lastBucket = tab.bucket;
          const selected = tab.id === activeTabId;
          const focusable = tab.id === focusedTabId;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${tab.id}-tab`}
              aria-controls={tab.id}
              aria-selected={selected}
              tabIndex={focusable ? 0 : -1}
              className="page-tab-rail__tab"
              data-bucket={tab.bucket}
              data-bucket-label={BUCKET_LABELS[tab.bucket]}
              data-bucket-start={bucketStart ? "true" : undefined}
              data-testid={tab.testId}
              onClick={() => onTabClick(tab.id)}
              onFocus={() => onTabFocus(tab.id)}
              onKeyDown={onTabKeyDown}
              ref={(node) => onTabRef(tab.id, node)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

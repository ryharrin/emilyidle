import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";

import type { TabBucket, TabId, TabMeta } from "./tabMeta";
import type { TabReadinessMap } from "./tabReadiness";

import "./pageTabRail.css";

type PageTabRailProps = {
  tabs: TabMeta[];
  activeTabId: TabId;
  focusedTabId: TabId;
  onTabClick: (tabId: TabId) => void;
  onTabFocus: (tabId: TabId) => void;
  onTabKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  onTabRef: (tabId: TabId, node: HTMLButtonElement | null) => void;
  tabReadiness: TabReadinessMap;
};

const BUCKET_LABELS: Record<TabBucket, string> = {
  primary: "Vault",
  progression: "Atelier",
  system: "Ledger",
};

export function PageTabRail({
  tabs,
  activeTabId,
  focusedTabId,
  onTabClick,
  onTabFocus,
  onTabKeyDown,
  onTabRef,
  tabReadiness,
}: PageTabRailProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [hasOverflowStart, setHasOverflowStart] = useState(false);
  const [hasOverflowEnd, setHasOverflowEnd] = useState(false);

  const updateOverflowState = useCallback(() => {
    const scrollNode = scrollRef.current;
    if (!scrollNode) {
      return;
    }

    const maxScrollLeft = Math.max(0, scrollNode.scrollWidth - scrollNode.clientWidth);
    const edgeTolerance = 2;
    if (maxScrollLeft <= edgeTolerance) {
      setHasOverflowStart(false);
      setHasOverflowEnd(false);
      return;
    }

    setHasOverflowStart(scrollNode.scrollLeft > edgeTolerance);
    setHasOverflowEnd(scrollNode.scrollLeft < maxScrollLeft - edgeTolerance);
  }, []);

  useEffect(() => {
    updateOverflowState();
  }, [tabs, updateOverflowState]);

  useEffect(() => {
    const scrollNode = scrollRef.current;
    if (!scrollNode) {
      return;
    }

    const selectedTab = scrollNode.querySelector<HTMLButtonElement>(`#${activeTabId}-tab`);
    if (!selectedTab) {
      return;
    }

    const maxScrollLeft = Math.max(0, scrollNode.scrollWidth - scrollNode.clientWidth);
    const centeredLeft =
      selectedTab.offsetLeft - (scrollNode.clientWidth - selectedTab.offsetWidth) / 2;
    const nextLeft = Math.min(maxScrollLeft, Math.max(0, centeredLeft));

    if (Math.abs(scrollNode.scrollLeft - nextLeft) <= 2) {
      return;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (typeof scrollNode.scrollTo === "function") {
      scrollNode.scrollTo({
        left: nextLeft,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
      return;
    }

    scrollNode.scrollLeft = nextLeft;
  }, [activeTabId, tabs]);

  useEffect(() => {
    const scrollNode = scrollRef.current;
    if (!scrollNode) {
      return;
    }

    const handleScrollOrResize = () => {
      updateOverflowState();
    };

    scrollNode.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        handleScrollOrResize();
      });
      resizeObserver.observe(scrollNode);
    }

    return () => {
      scrollNode.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
      resizeObserver?.disconnect();
    };
  }, [updateOverflowState]);

  let lastBucket: TabBucket | null = null;

  return (
    <div
      className="page-tab-rail"
      data-overflow-start={hasOverflowStart ? "true" : "false"}
      data-overflow-end={hasOverflowEnd ? "true" : "false"}
    >
      <div
        className="page-tab-rail__scroll"
        role="tablist"
        aria-label="Primary navigation"
        ref={scrollRef}
      >
        {tabs.map((tab) => {
          const bucketStart = tab.bucket !== lastBucket;
          lastBucket = tab.bucket;
          const selected = tab.id === activeTabId;
          const focusable = tab.id === focusedTabId;
          const readiness = tabReadiness[tab.id];

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
              {readiness && (
                <span className="page-tab-rail__badge" data-testid={`tab-ready-${tab.id}`}>
                  <span className="page-tab-rail__badge-dot" aria-hidden="true" />
                  <span className="visually-hidden">{readiness.label}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

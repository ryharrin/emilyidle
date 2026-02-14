import { type MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { OnboardingCoachmark, type OnboardingCoachmarkDefinition } from "./OnboardingCoachmark";

export type CollectionSectionNavLink = {
  id: string;
  label: string;
  coachmark?: OnboardingCoachmarkDefinition;
};

type CollectionSectionNavProps = {
  sections: CollectionSectionNavLink[];
  onCoachmarkDismiss?: (coachmarkId: string) => void;
  activeSectionId?: string;
  onSectionSelect?: (sectionId: string) => void;
};

const NAV_OFFSET_FALLBACK = 120;
const SCROLL_BUFFER = 16;
const OVERFLOW_EDGE_TOLERANCE = 2;

const readNavOffset = () => {
  if (typeof window === "undefined") {
    return NAV_OFFSET_FALLBACK;
  }
  const rootStyles = getComputedStyle(document.documentElement).getPropertyValue(
    "--collection-nav-offset",
  );
  const parsed = Number(rootStyles);
  return Number.isFinite(parsed) ? parsed : NAV_OFFSET_FALLBACK;
};

const getScrollElement = (): HTMLElement | null => {
  if (typeof document === "undefined") {
    return null;
  }
  return (
    (document.scrollingElement as HTMLElement | null) ??
    (document.documentElement as HTMLElement | null) ??
    (document.body as HTMLElement | null)
  );
};

const getTargetTop = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (!element) {
    return null;
  }
  const scrollEl = getScrollElement();
  const scrollTop = scrollEl ? scrollEl.scrollTop : window.scrollY;
  return scrollTop + element.getBoundingClientRect().top;
};

const prefersReducedMotion = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export function CollectionSectionNav({
  sections,
  onCoachmarkDismiss,
  activeSectionId,
  onSectionSelect,
}: CollectionSectionNavProps) {
  const [internalActiveId, setInternalActiveId] = useState(sections[0]?.id ?? "");
  const [hasOverflowStart, setHasOverflowStart] = useState(false);
  const [hasOverflowEnd, setHasOverflowEnd] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const skipActiveUpdateRef = useRef(false);
  const activeUpdateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isControlled = typeof onSectionSelect === "function";
  const activeId = isControlled ? (activeSectionId ?? internalActiveId) : internalActiveId;

  const updateOverflowState = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }

    const maxScrollLeft = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    if (maxScrollLeft <= OVERFLOW_EDGE_TOLERANCE) {
      setHasOverflowStart(false);
      setHasOverflowEnd(false);
      return;
    }

    setHasOverflowStart(scroller.scrollLeft > OVERFLOW_EDGE_TOLERANCE);
    setHasOverflowEnd(scroller.scrollLeft < maxScrollLeft - OVERFLOW_EDGE_TOLERANCE);
  }, []);

  useEffect(() => {
    setInternalActiveId((currentId) => {
      if (currentId && sections.some((section) => section.id === currentId)) {
        return currentId;
      }
      return sections[0]?.id ?? "";
    });
  }, [sections]);

  useEffect(() => {
    if (!isControlled || !activeSectionId) {
      return;
    }
    if (!sections.some((section) => section.id === activeSectionId)) {
      return;
    }
    setInternalActiveId(activeSectionId);
  }, [activeSectionId, isControlled, sections]);

  useEffect(() => {
    updateOverflowState();
  }, [sections, updateOverflowState]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }

    const handleScrollOrResize = () => {
      updateOverflowState();
    };

    scroller.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        handleScrollOrResize();
      });
      resizeObserver.observe(scroller);
    }

    return () => {
      scroller.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
      resizeObserver?.disconnect();
    };
  }, [updateOverflowState]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !activeId) {
      return;
    }
    const activeButton = scroller.querySelector<HTMLButtonElement>(
      `[data-section-nav-id="${activeId}"]`,
    );
    if (!activeButton) {
      return;
    }
    activeButton.scrollIntoView({
      inline: "nearest",
      block: "nearest",
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, [activeId]);

  useEffect(() => {
    if (isControlled || sections.length === 0 || typeof window === "undefined") {
      return undefined;
    }

    let frame = 0;
    const offset = readNavOffset();

    const updateActiveSection = () => {
      if (skipActiveUpdateRef.current) {
        return;
      }
      frame = 0;
      const candidates = sections
        .map((section) => {
          const element = document.getElementById(section.id);
          if (!element) {
            return null;
          }
          return {
            id: section.id,
            top: element.getBoundingClientRect().top,
          };
        })
        .filter((entry): entry is { id: string; top: number } => entry !== null);

      if (candidates.length === 0) {
        return;
      }

      const nearTop =
        candidates.filter((entry) => entry.top <= offset + 24).sort((a, b) => b.top - a.top)[0] ??
        candidates[0];

      setInternalActiveId(nearTop.id);
    };

    const handleScroll = () => {
      if (skipActiveUpdateRef.current || frame) {
        return;
      }
      frame = requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame) {
        cancelAnimationFrame(frame);
      }
      if (activeUpdateTimerRef.current) {
        clearTimeout(activeUpdateTimerRef.current);
        activeUpdateTimerRef.current = null;
      }
    };
  }, [isControlled, sections]);

  const handleJump = useCallback(
    (event: MouseEvent<HTMLButtonElement>, sectionId: string) => {
      event.preventDefault();
      if (isControlled) {
        setInternalActiveId(sectionId);
        onSectionSelect?.(sectionId);
        return;
      }
      if (typeof window === "undefined") {
        return;
      }
      const targetTop = getTargetTop(sectionId);
      if (targetTop === null) {
        return;
      }
      const offset = readNavOffset() + SCROLL_BUFFER;
      const destination = Math.max(targetTop - offset, 0);
      const behavior = prefersReducedMotion() ? "auto" : "smooth";
      const scrollEl = getScrollElement();
      if (scrollEl) {
        scrollEl.scrollTo({ top: destination, behavior });
      } else {
        window.scrollTo({ top: destination, behavior });
      }
      setInternalActiveId(sectionId);
      skipActiveUpdateRef.current = true;
      if (activeUpdateTimerRef.current) {
        clearTimeout(activeUpdateTimerRef.current);
      }
      activeUpdateTimerRef.current = setTimeout(() => {
        skipActiveUpdateRef.current = false;
        activeUpdateTimerRef.current = null;
      }, 400);
    },
    [isControlled, onSectionSelect],
  );

  if (sections.length === 0) {
    return null;
  }

  return (
    <nav
      className="collection-section-nav"
      aria-label="Collection section navigation"
      data-testid="collection-section-nav"
      data-active-section={activeId || undefined}
      data-overflow-start={hasOverflowStart ? "true" : "false"}
      data-overflow-end={hasOverflowEnd ? "true" : "false"}
    >
      <div className="collection-section-nav__scroller" ref={scrollerRef}>
        {sections.map((section) => (
          <div
            key={section.id}
            className="collection-section-nav__item"
            data-testid={`collection-section-nav-item-${section.id}`}
          >
            <button
              type="button"
              className={`collection-section-nav__link ${activeId === section.id ? "is-active" : ""}`}
              onClick={(event) => handleJump(event, section.id)}
              aria-current={activeId === section.id ? "location" : undefined}
              data-section-nav-id={section.id}
            >
              {section.label}
            </button>
            {section.coachmark && onCoachmarkDismiss && (
              <OnboardingCoachmark {...section.coachmark} onDismiss={onCoachmarkDismiss} />
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}

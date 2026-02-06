import React from "react";

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
};

const NAV_OFFSET_FALLBACK = 120;
const SCROLL_BUFFER = 16;

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

export function CollectionSectionNav({ sections, onCoachmarkDismiss }: CollectionSectionNavProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const skipActiveUpdateRef = useRef(false);
  const activeUpdateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setActiveId(sections[0]?.id ?? "");
  }, [sections]);

  useEffect(() => {
    if (sections.length === 0 || typeof window === "undefined") {
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

      setActiveId(nearTop.id);
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
  }, [sections]);

  const handleJump = useCallback((event: MouseEvent<HTMLButtonElement>, sectionId: string) => {
    event.preventDefault();
    if (typeof window === "undefined") {
      return;
    }
    const targetTop = getTargetTop(sectionId);
    if (targetTop === null) {
      return;
    }
    const offset = readNavOffset() + SCROLL_BUFFER;
    const destination = Math.max(targetTop - offset, 0);
    const scrollEl = getScrollElement();
    if (scrollEl) {
      scrollEl.scrollTo({ top: destination, behavior: "smooth" });
    } else {
      window.scrollTo({ top: destination, behavior: "smooth" });
    }
    setActiveId(sectionId);
    skipActiveUpdateRef.current = true;
    if (activeUpdateTimerRef.current) {
      clearTimeout(activeUpdateTimerRef.current);
    }
    activeUpdateTimerRef.current = setTimeout(() => {
      skipActiveUpdateRef.current = false;
      activeUpdateTimerRef.current = null;
    }, 400);
  }, []);

  if (sections.length === 0) {
    return null;
  }

  return (
    <nav
      className="collection-section-nav"
      aria-label="Collection section navigation"
      data-testid="collection-section-nav"
      data-active-section={activeId || undefined}
    >
      <div className="collection-section-nav__scroller">
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

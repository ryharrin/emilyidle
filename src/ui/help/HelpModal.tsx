import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import type { HelpSection } from "./helpContent";
import { searchHelpSections } from "./helpSearch";

export const HELP_STORAGE_KEY = "emily-idle:help";

export type HelpStorageState = {
  lastSectionId: string;
};

export const loadHelpState = (): HelpStorageState | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(HELP_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    if (typeof parsed.lastSectionId !== "string") {
      return null;
    }

    return { lastSectionId: parsed.lastSectionId };
  } catch {
    return null;
  }
};

export const persistHelpState = (state: HelpStorageState) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(HELP_STORAGE_KEY, JSON.stringify(state));
};

type HelpModalProps = {
  open: boolean;
  sections: HelpSection[];
  activeSectionId: string | null;
  onSelectSectionId: (id: string) => void;
  onClose: () => void;
};

export function HelpModal({
  open,
  sections,
  activeSectionId,
  onSelectSectionId,
  onClose,
}: HelpModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const sectionButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const focusableSelector =
    "button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex='-1'])";

  const getFocusableElements = useCallback(() => {
    const modal = modalRef.current;
    if (!modal) {
      return [] as HTMLElement[];
    }
    return Array.from(modal.querySelectorAll<HTMLElement>(focusableSelector));
  }, []);

  const handleTopSentinel = () => {
    const focusables = getFocusableElements();
    focusables[focusables.length - 1]?.focus();
  };

  const handleBottomSentinel = () => {
    const focusables = getFocusableElements();
    focusables[0]?.focus();
  };

  const activeSection = useMemo(() => {
    if (sections.length === 0) {
      return null;
    }
    return sections.find((section) => section.id === activeSectionId) ?? sections[0];
  }, [activeSectionId, sections]);

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const filteredSections = useMemo(
    () => searchHelpSections(sections, searchTerm),
    [searchTerm, sections],
  );

  const relatedSections = useMemo(() => {
    if (!activeSection?.relatedSectionIds?.length) {
      return [] as HelpSection[];
    }
    return activeSection.relatedSectionIds
      .map((id) => sections.find((section) => section.id === id))
      .filter((section): section is HelpSection => Boolean(section));
  }, [activeSection, sections]);

  useEffect(() => {
    if (!open) {
      setSearchTerm("");
    }
  }, [open]);

  useEffect(() => {
    if (filteredSections.length === 0) {
      setHighlightedIndex(-1);
      return;
    }

    const activeIndex = filteredSections.findIndex((section) => section.id === activeSection?.id);
    setHighlightedIndex(activeIndex >= 0 ? activeIndex : 0);
  }, [activeSection, filteredSections]);

  const focusSectionButton = (index: number) => {
    const targetIndex = Math.min(filteredSections.length - 1, Math.max(0, index));
    const button = sectionButtonRefs.current[targetIndex];
    if (button) {
      button.focus();
      setHighlightedIndex(targetIndex);
    }
  };

  const selectSection = (index: number) => {
    if (index < 0 || index >= filteredSections.length) {
      return;
    }
    const section = filteredSections[index];
    setHighlightedIndex(index);
    onSelectSectionId(section.id);
    focusSectionButton(index);
  };

  const navigateToSectionById = (id: string) => {
    const existingIndex = filteredSections.findIndex((section) => section.id === id);
    if (existingIndex >= 0) {
      selectSection(existingIndex);
      return;
    }
    onSelectSectionId(id);
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredSections.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusSectionButton(Math.max(0, highlightedIndex));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusSectionButton(filteredSections.length - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      selectSection(highlightedIndex >= 0 ? highlightedIndex : 0);
    } else if (event.key === "Tab" && !event.shiftKey) {
      if (filteredSections.length > 0) {
        event.preventDefault();
        focusSectionButton(0);
      }
    }
  };

  const handleCloseKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Tab" && event.shiftKey) {
      event.preventDefault();
      searchInputRef.current?.focus();
    }
  };

  const handleSectionKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (filteredSections.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusSectionButton((index + 1) % filteredSections.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusSectionButton((index - 1 + filteredSections.length) % filteredSections.length);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectSection(index);
    }
  };

  useEffect(() => {
    if (!open || typeof document === "undefined") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  useEffect(() => {
    if (!open || typeof document === "undefined") {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open || typeof document === "undefined") {
      return;
    }

    const handleFocusIn = (event: FocusEvent) => {
      const modal = modalRef.current;
      if (!modal) {
        return;
      }
      const { target } = event;
      if (target instanceof Node && modal.contains(target)) {
        return;
      }
      modal.focus();
    };

    document.addEventListener("focusin", handleFocusIn);

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, [open]);

  useEffect(() => {
    if (!open || typeof document === "undefined") {
      return;
    }

    const handleFocusOut = () => {
      const modal = modalRef.current;
      if (!modal) {
        return;
      }

      window.requestAnimationFrame(() => {
        if (!modal.contains(document.activeElement)) {
          modal.focus();
        }
      });
    };

    document.addEventListener("focusout", handleFocusOut, true);

    return () => {
      document.removeEventListener("focusout", handleFocusOut, true);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open || typeof document === "undefined") {
      return;
    }

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    modalRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open || typeof document === "undefined") {
      return;
    }

    const appRoot =
      document.getElementById("app-shell") ??
      document.getElementById("app") ??
      document.getElementById("root");
    if (appRoot) {
      appRoot.setAttribute("inert", "");
      appRoot.setAttribute("aria-hidden", "true");
    }

    return () => {
      if (appRoot) {
        appRoot.removeAttribute("inert");
        appRoot.removeAttribute("aria-hidden");
      }
      const previousFocus = previouslyFocusedRef.current;
      previousFocus?.focus();
      previouslyFocusedRef.current = null;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  sectionButtonRefs.current = [];

  return (
    <div
      className="help-modal"
      data-testid="help-modal"
      data-overlay-kind="blocking"
      role="dialog"
      aria-modal="true"
    >
      <div className="help-modal-card" ref={modalRef} tabIndex={-1}>
        <button
          type="button"
          className="help-focus-sentinel visually-hidden"
          aria-label="Help modal focus guard"
          onFocus={handleTopSentinel}
        />
        <header className="help-modal-header">
          <div>
            <p className="eyebrow">Glossary</p>
            <h2>Help</h2>
          </div>
          <div className="help-modal-header-actions">
            <div className="help-modal-search">
              <label className="visually-hidden" htmlFor="help-search-input">
                Search help
              </label>
              <input
                id="help-search-input"
                data-testid="help-search"
                type="search"
                autoComplete="off"
                placeholder="Search help"
                aria-label="Search help"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                ref={searchInputRef}
                onKeyDown={handleSearchKeyDown}
              />
            </div>
            <button
              type="button"
              className="secondary action-priority-secondary"
              data-testid="help-close"
              onClick={onClose}
              onKeyDown={handleCloseKeyDown}
              ref={closeButtonRef}
            >
              Close
            </button>
          </div>
        </header>
        <div className="help-modal-meta" data-testid="help-search-count">
          <span>{filteredSections.length} sections</span>
          <span className="muted">
            {normalizedSearchTerm.length > 0
              ? `Filtered by “${searchTerm.trim()}”`
              : "Browse all guidance"}
          </span>
        </div>
        {filteredSections.length === 0 ? (
          <p className="help-modal-no-results">No help sections match your search.</p>
        ) : (
          <ul className="help-modal-sections">
            {filteredSections.map((section, index) => {
              const isActive = section.id === activeSection?.id;
              return (
                <li key={section.id}>
                  <button
                    type="button"
                    className={`help-section-button ${isActive ? "help-section-button-active" : ""}`}
                    onClick={() => selectSection(index)}
                    onKeyDown={(event) => handleSectionKeyDown(event, index)}
                    aria-current={isActive ? "true" : undefined}
                    ref={(node) => {
                      sectionButtonRefs.current[index] = node;
                    }}
                  >
                    <span className="help-section-button-title">{section.title}</span>
                    {isActive && <span className="help-section-button-state">Active</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <div className="help-modal-content">
          {relatedSections.length > 0 && (
            <div className="help-modal-related" data-testid="help-related-chips">
              {relatedSections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  className="help-related-chip"
                  data-testid={`help-related-chip-${section.id}`}
                  onClick={() => navigateToSectionById(section.id)}
                >
                  {section.title}
                </button>
              ))}
            </div>
          )}
          {activeSection ? (
            <div className="help-modal-body">
              <h3 data-testid="help-active-section">{activeSection.title}</h3>
              <ul>
                {activeSection.body.map((line) => (
                  <li className="help-modal-body-line" key={line}>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="muted">No help content available yet.</p>
          )}
        </div>
        <button
          type="button"
          className="help-focus-sentinel visually-hidden"
          aria-label="Help modal focus guard"
          onFocus={handleBottomSentinel}
        />
      </div>
    </div>
  );
}

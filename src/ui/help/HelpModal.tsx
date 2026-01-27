import React, { useEffect, useMemo } from "react";

import type { HelpSection } from "./helpContent";

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
  const activeSection = useMemo(() => {
    if (sections.length === 0) {
      return null;
    }
    return sections.find((section) => section.id === activeSectionId) ?? sections[0];
  }, [activeSectionId, sections]);

  useEffect(() => {
    if (!open) {
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

  if (!open) {
    return null;
  }

  return (
    <div className="help-modal" data-testid="help-modal" role="dialog" aria-modal="true">
      <div className="help-modal-card">
        <header className="help-modal-header">
          <div>
            <p className="eyebrow">Glossary</p>
            <h2>Help</h2>
          </div>
          <button type="button" className="secondary" data-testid="help-close" onClick={onClose}>
            Close
          </button>
        </header>
        <ul className="help-modal-sections">
          {sections.map((section) => {
            const isActive = section.id === activeSection?.id;
            return (
              <li key={section.id}>
                <button
                  type="button"
                  className={`help-section-button ${isActive ? "help-section-button-active" : ""}`}
                  onClick={() => onSelectSectionId(section.id)}
                >
                  {section.title}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="help-modal-content">
          {activeSection ? (
            <div className="help-modal-body">
              <h3 data-testid="help-active-section">{activeSection.title}</h3>
              <ul>
                {activeSection.body.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="muted">No help content available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

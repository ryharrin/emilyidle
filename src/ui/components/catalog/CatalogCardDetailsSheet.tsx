import React from "react";
import { createPortal } from "react-dom";
import type { CatalogEntry } from "../../../game/catalog";
import { useEffect, useRef, type ReactNode } from "react";

type CatalogCardDetailsSheetProps = {
  entry: CatalogEntry;
  tags: string[];
  show: boolean;
  onClose: () => void;
  children: ReactNode;
};

const SHEET_ID = "catalog-details-sheet";

export function CatalogCardDetailsSheet({
  entry,
  tags,
  show,
  onClose,
  children,
}: CatalogCardDetailsSheetProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!show || typeof document === "undefined") {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [show, onClose]);

  if (!show || typeof document === "undefined") {
    return null;
  }

  const content = (
    <>
      <button
        type="button"
        className="catalog-card-details-sheet-backdrop"
        aria-label="Close catalog details"
        onClick={onClose}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClose();
          }
        }}
        tabIndex={-1}
        data-testid="catalog-details-sheet"
        data-open="true"
      />
      <div
        className="catalog-card-details-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${SHEET_ID}-title`}
        id={SHEET_ID}
      >
        <div className="catalog-card-details-sheet__header">
          <div>
            <p className="catalog-card-details-sheet__brand">{entry.brand}</p>
            <h3 id={`${SHEET_ID}-title`}>{entry.model}</h3>
            <p className="catalog-card-details-sheet__tags">{tags.join(" · ")}</p>
          </div>
          <button
            type="button"
            className="catalog-card-details-sheet__close"
            onClick={onClose}
            ref={closeButtonRef}
            data-testid="catalog-details-sheet-close"
          >
            Close
          </button>
        </div>
        <div className="catalog-card-details-sheet__content">{children}</div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}

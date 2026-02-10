import React from "react";

import { createPortal } from "react-dom";
import { useModalAccessibility } from "./useModalAccessibility";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  confirmClassName?: string;
  confirmTestId?: string;
  cancelTestId?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  confirmClassName,
  confirmTestId,
  cancelTestId,
  onConfirm,
  onCancel,
}: ConfirmModalProps): JSX.Element | null {
  const modalRef = React.useRef<HTMLDivElement | null>(null);
  const modalId = React.useId();
  const titleId = `${modalId}-title`;
  const descriptionId = `${modalId}-description`;

  useModalAccessibility({
    open,
    modalRef,
    onClose: onCancel,
  });

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      className="nostalgia-modal confirm-modal"
      data-overlay-kind="blocking"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className="nostalgia-modal-card confirm-modal-card" ref={modalRef}>
        <header className="modal-panel-header confirm-modal-header">
          <p className="eyebrow">Confirmation</p>
          <h3 id={titleId}>{title}</h3>
        </header>
        <p id={descriptionId} className="muted modal-panel-description">
          {description}
        </p>
        <div className="card-actions modal-panel-actions confirm-modal-actions">
          <button
            type="button"
            className={[
              "action-priority-primary confirm-modal-confirm",
              confirmClassName,
            ]
              .filter(Boolean)
              .join(" ")}
            data-testid={confirmTestId}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            className="secondary action-priority-secondary"
            data-testid={cancelTestId}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

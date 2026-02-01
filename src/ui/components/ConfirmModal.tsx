import React from "react";

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
  if (!open) {
    return null;
  }

  return (
    <div className="nostalgia-modal confirm-modal" role="dialog" aria-modal="true">
      <div className="nostalgia-modal-card confirm-modal-card">
        <h3>{title}</h3>
        <p className="muted">{description}</p>
        <div className="card-actions">
          <button
            type="button"
            className={confirmClassName}
            data-testid={confirmTestId}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
          <button type="button" className="secondary" data-testid={cancelTestId} onClick={onCancel}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

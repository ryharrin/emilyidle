export type ToastMessage = {
  id: string;
  title: string;
  message: string;
  detail?: string;
};

type ToastStackProps = {
  toasts: ToastMessage[];
  onDismiss: (toastId: string) => void;
};

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  if (toasts.length === 0) {
    return null;
  }

  const [visibleToast] = toasts;

  return (
    <div
      className="toast-stack"
      data-testid="toast-stack"
      data-overlay-kind="non-blocking"
      data-overlay-queue-depth={String(toasts.length)}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <article key={visibleToast.id} className="toast-stack__toast" data-testid="toast-item">
        <div className="toast-stack__content">
          <p className="toast-stack__title">{visibleToast.title}</p>
          <p className="toast-stack__message">{visibleToast.message}</p>
          {visibleToast.detail && <p className="toast-stack__detail">{visibleToast.detail}</p>}
        </div>
        <button
          type="button"
          className="toast-stack__close action-priority-tertiary"
          aria-label={`Dismiss ${visibleToast.title.toLowerCase()} toast`}
          onClick={() => onDismiss(visibleToast.id)}
          data-testid={`toast-close-${visibleToast.id}`}
        >
          ×
        </button>
      </article>
    </div>
  );
}

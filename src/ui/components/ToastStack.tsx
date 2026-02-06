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

  return (
    <div className="toast-stack" data-testid="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <article key={toast.id} className="toast-stack__toast" data-testid="toast-item">
          <div className="toast-stack__content">
            <p className="toast-stack__title">{toast.title}</p>
            <p className="toast-stack__message">{toast.message}</p>
            {toast.detail && <p className="toast-stack__detail">{toast.detail}</p>}
          </div>
          <button
            type="button"
            className="toast-stack__close"
            aria-label={`Dismiss ${toast.title.toLowerCase()} toast`}
            onClick={() => onDismiss(toast.id)}
            data-testid={`toast-close-${toast.id}`}
          >
            ×
          </button>
        </article>
      ))}
    </div>
  );
}

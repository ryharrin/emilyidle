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

type ToastTone = "neutral" | "info" | "success" | "warning" | "critical";

function resolveToastTone(toast: ToastMessage): ToastTone {
  const haystack = `${toast.id} ${toast.title} ${toast.message} ${toast.detail ?? ""}`.toLowerCase();
  if (/(error|failed|failure|invalid|insufficient)/.test(haystack)) {
    return "critical";
  }
  if (/(warning|cooldown|locked|blocked)/.test(haystack)) {
    return "warning";
  }
  if (/(achievement|unlocked|milestone|prestige|complete|success)/.test(haystack)) {
    return "success";
  }
  if (/(tip|info|notice|saved|autosave)/.test(haystack)) {
    return "info";
  }
  return "neutral";
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  if (toasts.length === 0) {
    return null;
  }

  const [visibleToast] = toasts;
  const queueDepth = toasts.length;
  const toastTone = resolveToastTone(visibleToast);

  return (
    <div
      className="toast-stack"
      data-testid="toast-stack"
      data-overlay-kind="non-blocking"
      data-overlay-queue-depth={String(queueDepth)}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <article
        key={visibleToast.id}
        className={`toast-stack__toast toast-stack__toast-${toastTone}`}
        data-testid="toast-item"
        data-toast-tone={toastTone}
      >
        <div className="toast-stack__content">
          <p className="toast-stack__eyebrow">Vault alert</p>
          <p className="toast-stack__title">{visibleToast.title}</p>
          <p className="toast-stack__message">{visibleToast.message}</p>
          {visibleToast.detail && <p className="toast-stack__detail">{visibleToast.detail}</p>}
        </div>
        {queueDepth > 1 && (
          <span className="toast-stack__queue" aria-label={`${queueDepth} toast notifications queued`}>
            +{queueDepth - 1}
          </span>
        )}
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

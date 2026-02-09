import { useEffect, useRef, type RefObject } from "react";

type UseModalAccessibilityArgs = {
  open: boolean;
  modalRef: RefObject<HTMLElement | null>;
  onClose?: () => void;
  initialFocusRef?: RefObject<HTMLElement | null>;
  lockScroll?: boolean;
};

const FOCUSABLE_SELECTOR =
  "button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex='-1'])";

function getFocusableElements(modal: HTMLElement): HTMLElement[] {
  return Array.from(modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((element) => {
    if (element.hasAttribute("disabled")) {
      return false;
    }
    if (element.getAttribute("aria-hidden") === "true") {
      return false;
    }
    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden";
  });
}

function focusWithinModal(modal: HTMLElement, initialFocus: HTMLElement | null) {
  if (initialFocus) {
    initialFocus.focus();
    return;
  }

  const focusables = getFocusableElements(modal);
  if (focusables.length > 0) {
    focusables[0].focus();
    return;
  }

  if (modal.tabIndex < 0) {
    modal.tabIndex = -1;
  }
  modal.focus();
}

export function useModalAccessibility({
  open,
  modalRef,
  onClose,
  initialFocusRef,
  lockScroll = true,
}: UseModalAccessibilityArgs) {
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open || typeof document === "undefined") {
      return;
    }

    const modal = modalRef.current;
    if (!modal) {
      return;
    }

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    const previousOverflow = document.body.style.overflow;
    if (lockScroll) {
      document.body.style.overflow = "hidden";
    }

    window.requestAnimationFrame(() => {
      if (!open || !modalRef.current) {
        return;
      }
      focusWithinModal(modalRef.current, initialFocusRef?.current ?? null);
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      const currentModal = modalRef.current;
      if (!currentModal) {
        return;
      }

      if (event.key === "Escape") {
        if (!onClose) {
          return;
        }
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || event.defaultPrevented) {
        return;
      }

      const focusables = getFocusableElements(currentModal);
      if (focusables.length === 0) {
        event.preventDefault();
        focusWithinModal(currentModal, initialFocusRef?.current ?? null);
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (!(active instanceof HTMLElement) || !currentModal.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      const currentModal = modalRef.current;
      if (!currentModal) {
        return;
      }

      const target = event.target;
      if (target instanceof Node && currentModal.contains(target)) {
        return;
      }

      focusWithinModal(currentModal, initialFocusRef?.current ?? null);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);

      if (lockScroll) {
        document.body.style.overflow = previousOverflow;
      }

      const previouslyFocused = previouslyFocusedRef.current;
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus();
      }
      previouslyFocusedRef.current = null;
    };
  }, [initialFocusRef, lockScroll, modalRef, onClose, open]);
}

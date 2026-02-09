type FloatingDeltaProps = {
  visible: boolean;
  message: string;
  testId?: string;
};

export function FloatingDelta({ visible, message, testId }: FloatingDeltaProps) {
  if (!visible) {
    return null;
  }

  return (
    <span
      className="floating-delta"
      data-testid={testId}
      data-overlay-kind="non-blocking"
      aria-live="polite"
      aria-atomic="true"
    >
      {message}
    </span>
  );
}

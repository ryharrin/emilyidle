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
    <span className="floating-delta" data-testid={testId} aria-live="polite">
      {message}
    </span>
  );
}

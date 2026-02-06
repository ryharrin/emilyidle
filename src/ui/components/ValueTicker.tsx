import { useEffect, useRef, useState } from "react";

type ValueTickerProps = {
  value: number;
  formatValue: (value: number) => string;
  className?: string;
  ariaLive?: "off" | "polite" | "assertive";
  testId?: string;
};

export function ValueTicker({
  value,
  formatValue,
  className,
  ariaLive = "polite",
  testId,
}: ValueTickerProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const valueRef = useRef(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(value);
      valueRef.current = value;
      return;
    }

    if (valueRef.current === value) {
      setDisplayValue(value);
      return;
    }

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }

    const duration = 420;
    const startValue = valueRef.current;
    const startTime = typeof performance !== "undefined" ? performance.now() : Date.now();

    const step = (timestamp: number) => {
      const now = typeof timestamp === "number" ? timestamp : Date.now();
      const elapsed = Math.min(now - startTime, duration);
      const progress = elapsed / duration;
      const nextValue = Math.round(startValue + (value - startValue) * progress);

      setDisplayValue(nextValue);
      valueRef.current = nextValue;

      if (elapsed < duration) {
        frameRef.current = requestAnimationFrame(step);
        return;
      }

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      setDisplayValue(value);
      valueRef.current = value;
      frameRef.current = null;
    };

    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [value, prefersReducedMotion]);

  const classes = ["value-ticker", className].filter(Boolean).join(" ");

  return (
    <span className={classes} aria-live={ariaLive} data-testid={testId}>
      {formatValue(displayValue)}
    </span>
  );
}

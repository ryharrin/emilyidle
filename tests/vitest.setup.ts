import "@testing-library/jest-dom";
import { vi } from "vitest";

Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
  value: vi.fn(),
  writable: true,
  configurable: true,
});

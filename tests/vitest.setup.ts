import "@testing-library/jest-dom";
import { beforeEach, vi } from "vitest";

Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
  value: vi.fn(),
  writable: true,
  configurable: true,
});

const evaluateMediaQuery = (query: string): boolean => {
  if (/\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/i.test(query)) {
    return true;
  }

  const maxWidthMatch = /max-width:\s*(\d+)px/i.exec(query);
  const minWidthMatch = /min-width:\s*(\d+)px/i.exec(query);
  const width = window.innerWidth;
  const matchesMax = maxWidthMatch ? width <= Number(maxWidthMatch[1]) : true;
  const matchesMin = minWidthMatch ? width >= Number(minWidthMatch[1]) : true;

  return matchesMax && matchesMin;
};

const createMediaQueryList = (query: string): MediaQueryList =>
  ({
    get matches() {
      return evaluateMediaQuery(query);
    },
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList;

Object.defineProperty(window, "matchMedia", {
  writable: true,
  configurable: true,
  value: (query: string) => createMediaQueryList(query),
});

type StorageSurface = Pick<
  Storage,
  "clear" | "getItem" | "key" | "removeItem" | "setItem"
> & { length: number };

const isStorageSurface = (value: unknown): value is StorageSurface => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<StorageSurface>;
  return (
    typeof candidate.clear === "function" &&
    typeof candidate.getItem === "function" &&
    typeof candidate.key === "function" &&
    typeof candidate.removeItem === "function" &&
    typeof candidate.setItem === "function" &&
    typeof candidate.length === "number"
  );
};

const createStorageShim = (): Storage => {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear() {
      values.clear();
    },
    getItem(key: string) {
      const normalizedKey = String(key);
      return values.has(normalizedKey) ? values.get(normalizedKey)! : null;
    },
    key(index: number) {
      return Array.from(values.keys())[index] ?? null;
    },
    removeItem(key: string) {
      values.delete(String(key));
    },
    setItem(key: string, value: string) {
      values.set(String(key), String(value));
    },
  } as Storage;
};

const ensureStorageSurface = (storageKey: "localStorage" | "sessionStorage") => {
  if (isStorageSurface(window[storageKey])) {
    return;
  }

  Object.defineProperty(window, storageKey, {
    configurable: true,
    writable: true,
    value: createStorageShim(),
  });
};

beforeEach(() => {
  ensureStorageSurface("localStorage");
  ensureStorageSurface("sessionStorage");
});

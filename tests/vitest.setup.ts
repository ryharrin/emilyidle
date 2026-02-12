import "@testing-library/jest-dom";
import { vi } from "vitest";

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


const createMemoryStorage = (): Storage => {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => {
      store.clear();
    },
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
};

const hasStorageShape = (candidate: unknown): candidate is Storage => {
  if (!candidate || typeof candidate !== "object") return false;
  const value = candidate as Partial<Storage>;
  return (
    typeof value.getItem === "function" &&
    typeof value.setItem === "function" &&
    typeof value.removeItem === "function" &&
    typeof value.clear === "function"
  );
};

if (!hasStorageShape(window.localStorage)) {
  Object.defineProperty(window, "localStorage", {
    value: createMemoryStorage(),
    configurable: true,
    writable: true,
  });
}


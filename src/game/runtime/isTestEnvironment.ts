export const isTestEnvironment = () =>
  import.meta.env.MODE === "test" ||
  import.meta.env.VITEST ||
  (typeof navigator !== "undefined" && navigator.userAgent.includes("jsdom")) ||
  (typeof globalThis !== "undefined" && "__vitest_worker__" in globalThis);

export function isTestEnvironment(): boolean {
  return import.meta.env.MODE === 'test'
}


export const DEALERS = ['Ethan', 'Jason007', 'Lena', 'Michael Travis'] as const

export type DealerName = (typeof DEALERS)[number]

export function pickDealer(randomIndex: number = Math.random()): DealerName {
  const normalized = Math.max(0, Math.min(0.999999, randomIndex))
  const index = Math.floor(normalized * DEALERS.length)
  return DEALERS[index] ?? DEALERS[0]
}

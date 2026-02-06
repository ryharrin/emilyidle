const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export function formatMoneyFromCents(cents: number): string {
  const dollars = cents / 100;
  return currencyFormatter.format(dollars);
}

export function formatRateFromCentsPerSec(centsPerSec: number): string {
  return `${formatMoneyFromCents(centsPerSec)}/s`;
}

export function formatSoftcapEfficiency(efficiency: number): string {
  const percent = Math.max(0, Math.min(1, efficiency)) * 100;
  return `${percent.toFixed(0)}% efficiency`;
}

export function formatDurationFromMs(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1_000));
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (parts.length === 0) {
    parts.push(`${seconds}s`);
  }

  return parts.join(" ");
}

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

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

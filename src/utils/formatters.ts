import { CURRENCIES, CurrencyCode } from '../types';

export function formatCurrency(amount: number, currency: CurrencyCode = 'INR'): string {
  const conf = CURRENCIES[currency] || CURRENCIES.INR;
  const rounded = Math.round(amount);

  if (currency === 'INR') {
    // Format Indian Numbering System (e.g. 1,00,000)
    return `${conf.symbol}${rounded.toLocaleString('en-IN')}`;
  }

  return `${conf.symbol}${rounded.toLocaleString('en-US')}`;
}

export function calculateSavingsPercentage(budget: number, actual: number): number {
  if (budget <= 0) return 0;
  const diff = budget - actual;
  return Math.round((diff / budget) * 100);
}

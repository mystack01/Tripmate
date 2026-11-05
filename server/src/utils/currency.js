// Converts an amount using rates relative to a base currency.
// rates = { USD: 1, EUR: 0.9, ... } for the base currency.
export function convertAmount(amount, rates, target) {
  const rate = rates?.[target];
  if (typeof rate !== 'number' || typeof amount !== 'number') return null;
  return { rate, converted: Math.round(amount * rate * 100) / 100 };
}

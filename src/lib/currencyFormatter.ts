
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '';
  
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

export const parseCurrencyValue = (value: string): number | null => {
  // Remove $ sign and commas, then convert to number
  const numericValue = parseFloat(value.replace(/[$,]/g, ''));
  return isNaN(numericValue) ? null : numericValue;
};

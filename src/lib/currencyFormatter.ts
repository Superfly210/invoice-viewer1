
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

export const handleCurrencyInput = (value: string): string => {
  // Allow user to type freely, only format when they're done
  // Remove any non-numeric characters except decimal point and minus
  const cleanValue = value.replace(/[^0-9.-]/g, '');
  
  // Don't format while typing - just return the clean value
  return cleanValue;
};

export const formatCurrencyForDisplay = (value: string): string => {
  const numericValue = parseCurrencyValue(value);
  if (numericValue === null) return value;
  return formatCurrency(numericValue);
};

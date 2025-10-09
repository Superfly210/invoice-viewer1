import { useMemo } from 'react';

interface GstComparisonData {
  invoiceGstTotal: number | null;
  lineItemsGstSum: number | null;
}

export const useGstComparison = ({ invoiceGstTotal, lineItemsGstSum }: GstComparisonData) => {
  const comparison = useMemo(() => {
    // Convert null values to 0 for comparison
    const invoice = invoiceGstTotal || 0;
    const lineItems = lineItemsGstSum || 0;

    // Use a small tolerance for floating-point comparison (1 cent)
    const tolerance = 0.01;
    
    const isEqual = Math.abs(invoice - lineItems) <= tolerance;

    return {
      isEqual,
      invoice,
      lineItems,
      difference: Math.abs(invoice - lineItems),
      // Return CSS classes for conditional formatting
      highlightClass: isEqual 
        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" 
        : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
    };
  }, [invoiceGstTotal, lineItemsGstSum]);

  return comparison;
};

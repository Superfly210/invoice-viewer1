import { useMemo } from 'react';

interface SubtotalData {
  invoiceSubtotal: number | null;
  codingTotal: number | null;
  lineItemsTotal: number | null;
}

export const useSubtotalComparison = ({ invoiceSubtotal, codingTotal, lineItemsTotal }: SubtotalData) => {
  const comparison = useMemo(() => {
    // Convert null values to 0 for comparison
    const invoice = invoiceSubtotal || 0;
    const coding = codingTotal || 0;
    const lineItems = lineItemsTotal || 0;

    // Use a small tolerance for floating-point comparison (1 cent)
    const tolerance = 0.01;
    
    const allEqual = Math.abs(invoice - coding) <= tolerance && 
                     Math.abs(invoice - lineItems) <= tolerance && 
                     Math.abs(coding - lineItems) <= tolerance;

    return {
      allEqual,
      invoice,
      coding,
      lineItems,
      // Return CSS classes for conditional formatting
      highlightClass: allEqual 
        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" 
        : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
    };
  }, [invoiceSubtotal, codingTotal, lineItemsTotal]);

  return comparison;
};
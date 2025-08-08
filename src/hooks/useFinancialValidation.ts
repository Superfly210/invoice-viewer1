import { useMemo } from 'react';

interface FinancialValidationData {
  subTotal: number | null;
  gstTotal: number | null;
  total: number | null;
}

export const useFinancialValidation = ({ subTotal, gstTotal, total }: FinancialValidationData) => {
  const validation = useMemo(() => {
    // Convert null values to 0 for comparison
    const sub = subTotal || 0;
    const gst = gstTotal || 0;
    const tot = total || 0;

    // Use a small tolerance for floating-point comparison (1 cent)
    const tolerance = 0.01;
    
    // Check if GST is 5% of subtotal (within tolerance)
    const expectedGst = sub * 0.05;
    const isGstValid = Math.abs(gst - expectedGst) <= tolerance;
    
    // Check if total equals subtotal + GST (within tolerance)
    const expectedTotal = sub + gst;
    const isTotalValid = Math.abs(tot - expectedTotal) <= tolerance;

    return {
      isGstValid,
      isTotalValid,
      gstValidationClass: isGstValid 
        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" 
        : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
      totalValidationClass: isTotalValid 
        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" 
        : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
    };
  }, [subTotal, gstTotal, total]);

  return validation;
};
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

export const useAfeValidation = () => {
  // Fetch AFE numbers
  const { data: afeNumbers = [], isLoading: isAfeLoading } = useQuery<string[]>({
    queryKey: ['afe-numbers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('afe')
        .select('afe_number');
      
      if (error) throw error;
      return data.map(item => item.afe_number);
    },
  });

  // Fetch cost center codes
  const { data: costCenterCodes = [], isLoading: isCostCenterLoading } = useQuery<string[]>({
    queryKey: ['cost-center-codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cost_centers')
        .select('code');
      
      if (error) throw error;
      return data.map(item => item.code);
    },
  });

  const validationSets = useMemo(() => {
    if (isAfeLoading || isCostCenterLoading) return null;
    
    // Normalize AFE numbers and cost center codes for comparison
    const normalizedAfeNumbers = new Set(
      afeNumbers.map(afe => afe.toLowerCase().trim().replace(/[.\s-]/g, ''))
    );
    
    const normalizedCostCenterCodes = new Set(
      costCenterCodes.map(code => code.toLowerCase().trim().replace(/[.\s-]/g, ''))
    );

    return {
      afeNumbers: normalizedAfeNumbers,
      costCenterCodes: normalizedCostCenterCodes
    };
  }, [afeNumbers, costCenterCodes, isAfeLoading, isCostCenterLoading]);

  const validateAfeCostCenter = (afeCostCenter: string | null) => {
    if (!validationSets) return false; // Don't validate if data isn't ready
    if (!afeCostCenter || afeCostCenter === 'N/A') return true; // N/A is considered invalid
    
    const normalized = afeCostCenter.toLowerCase().trim().replace(/[.\s-]/g, '');
    
    // Check if it matches any AFE number or cost center code
    const isValidAfe = validationSets.afeNumbers.has(normalized);
    const isValidCostCenter = validationSets.costCenterCodes.has(normalized);
    
    return !(isValidAfe || isValidCostCenter); // Return true if invalid (for highlighting)
  };

  const getAfeCostCenterValidationClass = (afeCostCenter: string | null) => {
    const isInvalid = validateAfeCostCenter(afeCostCenter);
    return isInvalid 
      ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100" 
      : "";
  };

  return {
    validateAfeCostCenter,
    getAfeCostCenterValidationClass,
    isLoading: isAfeLoading || isCostCenterLoading
  };
};
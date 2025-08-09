import { useState, useCallback, useMemo } from "react";
import { useDebounce } from "./use-debounce";

export const useInvoiceFilters = () => {
  const [invoiceNumberFilter, setInvoiceNumberFilter] = useState("");
  const [invoiceDateFilter, setInvoiceDateFilter] = useState("");
  const [companyNameFilter, setCompanyNameFilter] = useState("");

  // Debounced values for API calls
  const debouncedInvoiceNumberFilter = useDebounce(invoiceNumberFilter, 500);
  const debouncedInvoiceDateFilter = useDebounce(invoiceDateFilter, 500);
  const debouncedCompanyNameFilter = useDebounce(companyNameFilter, 500);

  // Memoized setter functions to prevent unnecessary re-renders
  const setInvoiceNumberFilterCallback = useCallback((value: string) => {
    setInvoiceNumberFilter(value);
  }, []);

  const setInvoiceDateFilterCallback = useCallback((value: string) => {
    setInvoiceDateFilter(value);
  }, []);

  const setCompanyNameFilterCallback = useCallback((value: string) => {
    setCompanyNameFilter(value);
  }, []);

  const clearFilters = useCallback(() => {
    setInvoiceNumberFilter("");
    setInvoiceDateFilter("");
    setCompanyNameFilter("");
  }, []);

  // Memoized filter values object for stable references
  const filterValues = useMemo(() => ({
    invoiceNumberFilter,
    invoiceDateFilter,
    companyNameFilter
  }), [invoiceNumberFilter, invoiceDateFilter, companyNameFilter]);

  const debouncedFilterValues = useMemo(() => ({
    debouncedInvoiceNumberFilter,
    debouncedInvoiceDateFilter,
    debouncedCompanyNameFilter
  }), [debouncedInvoiceNumberFilter, debouncedInvoiceDateFilter, debouncedCompanyNameFilter]);

  const filterSetters = useMemo(() => ({
    setInvoiceNumberFilter: setInvoiceNumberFilterCallback,
    setInvoiceDateFilter: setInvoiceDateFilterCallback,
    setCompanyNameFilter: setCompanyNameFilterCallback,
    clearFilters
  }), [setInvoiceNumberFilterCallback, setInvoiceDateFilterCallback, setCompanyNameFilterCallback, clearFilters]);

  return {
    filterValues,
    debouncedFilterValues,
    filterSetters
  };
};
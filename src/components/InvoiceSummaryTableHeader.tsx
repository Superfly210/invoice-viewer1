import React, { useRef, useEffect } from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface InvoiceSummaryTableHeaderProps {
  invoiceNumberFilter: string;
  setInvoiceNumberFilter: (value: string) => void;
  invoiceDateFilter: string;
  setInvoiceDateFilter: (value: string) => void;
  companyNameFilter: string;
  setCompanyNameFilter: (value: string) => void;
}

// Custom comparison function for React.memo
const arePropsEqual = (prevProps: InvoiceSummaryTableHeaderProps, nextProps: InvoiceSummaryTableHeaderProps) => {
  return (
    prevProps.invoiceNumberFilter === nextProps.invoiceNumberFilter &&
    prevProps.invoiceDateFilter === nextProps.invoiceDateFilter &&
    prevProps.companyNameFilter === nextProps.companyNameFilter &&
    prevProps.setInvoiceNumberFilter === nextProps.setInvoiceNumberFilter &&
    prevProps.setInvoiceDateFilter === nextProps.setInvoiceDateFilter &&
    prevProps.setCompanyNameFilter === nextProps.setCompanyNameFilter
  );
};

export const InvoiceSummaryTableHeader = React.memo(
  ({ invoiceNumberFilter, setInvoiceNumberFilter, invoiceDateFilter, setInvoiceDateFilter, companyNameFilter, setCompanyNameFilter }: InvoiceSummaryTableHeaderProps) => {
    // Refs to maintain focus during re-renders
    const invoiceNumberRef = useRef<HTMLInputElement>(null);
    const invoiceDateRef = useRef<HTMLInputElement>(null);
    const companyNameRef = useRef<HTMLInputElement>(null);

    // Track which input was focused
    const lastFocusedRef = useRef<string | null>(null);

    useEffect(() => {
      // Restore focus after re-render if an input was previously focused
      if (lastFocusedRef.current) {
        const inputRef = lastFocusedRef.current === 'invoiceNumber' ? invoiceNumberRef :
                        lastFocusedRef.current === 'invoiceDate' ? invoiceDateRef :
                        lastFocusedRef.current === 'companyName' ? companyNameRef : null;
        
        if (inputRef?.current) {
          const currentValue = inputRef.current.value;
          inputRef.current.focus();
          // Restore cursor position to the end
          inputRef.current.setSelectionRange(currentValue.length, currentValue.length);
        }
      }
    });

    const handleFocus = (inputName: string) => {
      lastFocusedRef.current = inputName;
    };

    const handleBlur = () => {
      lastFocusedRef.current = null;
    };
    return (
      <TableHeader className="sticky top-0 z-10 bg-background">
        <TableRow>
          <TableHead>
            Invoice Number
            <Input
              ref={invoiceNumberRef}
              id="invoice-number-filter"
              placeholder="Filter by number..."
              value={invoiceNumberFilter}
              onChange={(e) => setInvoiceNumberFilter(e.target.value)}
              onFocus={() => handleFocus('invoiceNumber')}
              onBlur={handleBlur}
              className="mt-1"
              autoComplete="off"
            />
          </TableHead>
          <TableHead>
            Invoice Date
            <Input
              ref={invoiceDateRef}
              id="invoice-date-filter"
              placeholder="Filter by date..."
              value={invoiceDateFilter}
              onChange={(e) => setInvoiceDateFilter(e.target.value)}
              onFocus={() => handleFocus('invoiceDate')}
              onBlur={handleBlur}
              className="mt-1"
              autoComplete="off"
            />
          </TableHead>
          <TableHead>
            Company Name
            <Input
              ref={companyNameRef}
              id="company-name-filter"
              placeholder="Filter by company..."
              value={companyNameFilter}
              onChange={(e) => setCompanyNameFilter(e.target.value)}
              onFocus={() => handleFocus('companyName')}
              onBlur={handleBlur}
              className="mt-1"
              autoComplete="off"
            />
          </TableHead>
          <TableHead className="text-right">Subtotal</TableHead>
          <TableHead className="text-right">GST Total</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>Created At</TableHead>
        </TableRow>
      </TableHeader>
    );
  }, arePropsEqual
);
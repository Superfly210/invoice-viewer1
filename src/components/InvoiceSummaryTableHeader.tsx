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
  invoiceNumberRef?: React.RefObject<HTMLInputElement>;
  invoiceDateRef?: React.RefObject<HTMLInputElement>;
  companyNameRef?: React.RefObject<HTMLInputElement>;
  setLastFocusedRef?: (ref: React.RefObject<HTMLInputElement> | null) => void; // New prop
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
  ({
    invoiceNumberFilter,
    setInvoiceNumberFilter,
    invoiceDateFilter,
    setInvoiceDateFilter,
    companyNameFilter,
    setCompanyNameFilter,
    invoiceNumberRef,
    invoiceDateRef,
    companyNameRef,
    setLastFocusedRef,
  }: InvoiceSummaryTableHeaderProps) => {
    // Use passed refs or local fallbacks
    const localInvoiceNumberRef = invoiceNumberRef || useRef<HTMLInputElement>(null);
    const localInvoiceDateRef = invoiceDateRef || useRef<HTMLInputElement>(null);
    const localCompanyNameRef = companyNameRef || useRef<HTMLInputElement>(null);

    const handleFocus = (ref: React.RefObject<HTMLInputElement>) => {
      console.log("Handle focus called for:", ref.current?.id);
      if (setLastFocusedRef) {
        setLastFocusedRef(ref);
      }
    };

    return (
      <TableHeader className="sticky top-0 z-10 bg-background">
        <TableRow>
          <TableHead>
            Invoice Number
            <Input
              ref={localInvoiceNumberRef}
              id="invoice-number-filter"
              placeholder="Filter by number..."
              value={invoiceNumberFilter}
              onChange={(e) => setInvoiceNumberFilter(e.target.value)}
              onFocus={() => handleFocus(localInvoiceNumberRef)}
              className="mt-1"
              autoComplete="off"
            />
          </TableHead>
          <TableHead>
            Invoice Date
            <Input
              ref={localInvoiceDateRef}
              id="invoice-date-filter"
              placeholder="Filter by date..."
              value={invoiceDateFilter}
              onChange={(e) => setInvoiceDateFilter(e.target.value)}
              onFocus={() => handleFocus(localInvoiceDateRef)}
              className="mt-1"
              autoComplete="off"
            />
          </TableHead>
          <TableHead>
            Company Name
            <Input
              ref={localCompanyNameRef}
              id="company-name-filter"
              placeholder="Filter by company..."
              value={companyNameFilter}
              onChange={(e) => setCompanyNameFilter(e.target.value)}
              onFocus={() => handleFocus(localCompanyNameRef)}
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
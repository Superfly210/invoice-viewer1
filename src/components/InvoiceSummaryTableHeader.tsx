import React from "react";
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

export const InvoiceSummaryTableHeader = React.memo(
  ({ invoiceNumberFilter, setInvoiceNumberFilter, invoiceDateFilter, setInvoiceDateFilter, companyNameFilter, setCompanyNameFilter }: InvoiceSummaryTableHeaderProps) => {
    return (
      <TableHeader className="sticky top-0 z-10 bg-background">
        <TableRow>
          <TableHead>
            Invoice Number
            <Input
              key="invoice-number-filter"
              placeholder="Filter by number..."
              value={invoiceNumberFilter}
              onChange={(e) => setInvoiceNumberFilter(e.target.value)}
              className="mt-1"
            />
          </TableHead>
          <TableHead>
            Invoice Date
            <Input
              key="invoice-date-filter"
              placeholder="Filter by date..."
              value={invoiceDateFilter}
              onChange={(e) => setInvoiceDateFilter(e.target.value)}
              className="mt-1"
            />
          </TableHead>
          <TableHead>
            Company Name
            <Input
              key="company-name-filter"
              placeholder="Filter by company..."
              value={companyNameFilter}
              onChange={(e) => setCompanyNameFilter(e.target.value)}
              className="mt-1"
            />
          </TableHead>
          <TableHead className="text-right">Subtotal</TableHead>
          <TableHead className="text-right">GST Total</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>Created At</TableHead>
        </TableRow>
      </TableHeader>
    );
  }
);
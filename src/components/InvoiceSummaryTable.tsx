
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/currencyFormatter";
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { InvoiceSummaryTableHeader } from "./InvoiceSummaryTableHeader";

type AttachmentInfo = {
  id: number;
  Invoice_Number: string | null;
  Invoice_Date: string | null;
  Invoicing_Comp_Name: string | null;
  Sub_Total: number | null;
  GST_Total: number | null;
  Total: number | null;
  created_at: string;
};

export const InvoiceSummaryTable = React.memo(() => {
  const [invoiceNumberFilter, setInvoiceNumberFilter] = useState("");
  const [invoiceDateFilter, setInvoiceDateFilter] = useState("");
  const [companyNameFilter, setCompanyNameFilter] = useState("");

  const debouncedInvoiceNumberFilter = useDebounce(invoiceNumberFilter, 500);
  const debouncedInvoiceDateFilter = useDebounce(invoiceDateFilter, 500);
  const debouncedCompanyNameFilter = useDebounce(companyNameFilter, 500);

  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ['attachment-info-summary', debouncedInvoiceNumberFilter, debouncedInvoiceDateFilter, debouncedCompanyNameFilter],
    queryFn: async () => {
      let query = supabase
        .from('Attachment_Info')
        .select('id, Invoice_Number, Invoice_Date, Invoicing_Comp_Name, Sub_Total, GST_Total, Total, created_at');

      if (debouncedInvoiceNumberFilter) {
        query = query.ilike('Invoice_Number', `%${debouncedInvoiceNumberFilter}%`);
      }
      if (debouncedInvoiceDateFilter) {
        query = query.ilike('Invoice_Date', `%${debouncedInvoiceDateFilter}%`);
      }
      if (debouncedCompanyNameFilter) {
        query = query.ilike('Invoicing_Comp_Name', `%${debouncedCompanyNameFilter}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AttachmentInfo[];
    },
  });

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <p>Loading invoice summary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600">Error loading invoice summary</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-250px)] overflow-auto rounded-md border">
      <div className="p-4 flex justify-end">
        <Button onClick={() => {
          setInvoiceNumberFilter("");
          setInvoiceDateFilter("");
          setCompanyNameFilter("");
        }}>
          Clear Filters
        </Button>
      </div>
      <Table>
        <InvoiceSummaryTableHeader
          invoiceNumberFilter={invoiceNumberFilter}
          setInvoiceNumberFilter={setInvoiceNumberFilter}
          invoiceDateFilter={invoiceDateFilter}
          setInvoiceDateFilter={setInvoiceDateFilter}
          companyNameFilter={companyNameFilter}
          setCompanyNameFilter={setCompanyNameFilter}
        />
        <TableBody>
          {invoices && invoices.length > 0 ? (
            invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.Invoice_Number || 'N/A'}</TableCell>
                <TableCell>{invoice.Invoice_Date || 'N/A'}</TableCell>
                <TableCell>{invoice.Invoicing_Comp_Name || 'N/A'}</TableCell>
                <TableCell className="text-right">
                  {invoice.Sub_Total ? formatCurrency(invoice.Sub_Total) : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  {invoice.GST_Total ? formatCurrency(invoice.GST_Total) : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  {invoice.Total ? formatCurrency(invoice.Total) : 'N/A'}
                </TableCell>
                <TableCell>{new Date(invoice.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-500">
                No invoice data found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
});

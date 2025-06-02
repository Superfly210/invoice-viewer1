
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

export const InvoiceSummaryTable = () => {
  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ['attachment-info-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Attachment_Info')
        .select('id, Invoice_Number, Invoice_Date, Invoicing_Comp_Name, Sub_Total, GST_Total, Total, created_at')
        .order('created_at', { ascending: false });
      
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice Number</TableHead>
            <TableHead>Invoice Date</TableHead>
            <TableHead>Company Name</TableHead>
            <TableHead className="text-right">Subtotal</TableHead>
            <TableHead className="text-right">GST Total</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices && invoices.length > 0 ? (
            invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.Invoice_Number || 'N/A'}</TableCell>
                <TableCell>{invoice.Invoice_Date || 'N/A'}</TableCell>
                <TableCell>{invoice.Invoicing_Comp_Name || 'N/A'}</TableCell>
                <TableCell className="text-right">
                  {invoice.Sub_Total ? `$${invoice.Sub_Total.toFixed(2)}` : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  {invoice.GST_Total ? `$${invoice.GST_Total.toFixed(2)}` : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  {invoice.Total ? `$${invoice.Total.toFixed(2)}` : 'N/A'}
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
};

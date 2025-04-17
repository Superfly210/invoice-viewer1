
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

type AttachmentInfo = {
  id: number;
  Invoice_Number: string | null;
  Invoicing_Comp_Name: string | null;
  Invoicing_Comp_Street: any | null;
  Invoicing_Comp_City: string | null;
  Invoicing_Comp_State_Prov: string | null;
  Invoicing_Comp_Postal_Code: string | null;
  GST_Number: any | null;
  WCB_Number: any | null;
  Sub_Total: number | null;
  GST_Total: number | null;
  Total: number | null;
  created_at: string;
}

export const InvoiceData = () => {
  const [invoices, setInvoices] = useState<AttachmentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoiceData();
  }, []);

  const fetchInvoiceData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('Attachment Info')
        .select('*');

      if (error) throw error;

      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoice data:', error);
      toast({
        title: "Error",
        description: "Failed to load invoice data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading invoice data...</span>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">No Invoice Data Available</h2>
        <p className="text-slate-600 dark:text-slate-400">
          There are no invoices in the database. Try adding some data to the 'Attachment Info' table.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 overflow-hidden">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Invoice Data</h2>
      
      <div className="overflow-x-auto">
        <Table>
          <TableCaption>A list of all invoices in the database</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Invoice Number</TableHead>
              <TableHead>Company Name</TableHead>
              <TableHead>Company Address</TableHead>
              <TableHead>GST Number</TableHead>
              <TableHead>WCB Number</TableHead>
              <TableHead>Subtotal</TableHead>
              <TableHead>GST Total</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.id}</TableCell>
                <TableCell>{invoice.Invoice_Number || 'N/A'}</TableCell>
                <TableCell>{invoice.Invoicing_Comp_Name || 'N/A'}</TableCell>
                <TableCell>
                  {`${JSON.stringify(invoice.Invoicing_Comp_Street) || ''} 
                    ${invoice.Invoicing_Comp_City || ''} 
                    ${invoice.Invoicing_Comp_State_Prov || ''} 
                    ${invoice.Invoicing_Comp_Postal_Code || ''}`.trim() || 'N/A'}
                </TableCell>
                <TableCell>{invoice.GST_Number ? JSON.stringify(invoice.GST_Number) : 'N/A'}</TableCell>
                <TableCell>{invoice.WCB_Number ? JSON.stringify(invoice.WCB_Number) : 'N/A'}</TableCell>
                <TableCell>{invoice.Sub_Total?.toFixed(2) || 'N/A'}</TableCell>
                <TableCell>{invoice.GST_Total?.toFixed(2) || 'N/A'}</TableCell>
                <TableCell>{invoice.Total?.toFixed(2) || 'N/A'}</TableCell>
                <TableCell>{new Date(invoice.created_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

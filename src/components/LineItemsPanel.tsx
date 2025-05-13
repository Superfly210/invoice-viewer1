
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

type LineItem = {
  id: number;
  invoice_id: number;
  Description: any | null;
  Unit_of_Measure: any | null;
  AFE_number: any | null;
  Cost_Center: any | null;
  Cost_Code: any | null;
  Rate: any | null;
  Qauntity: any | null;
  Total: any | null;
  Date_of_Work: any | null;
  Ticket_Work_Order: any | null;
  created_at: string;
};

interface LineItemsPanelProps {
  currentInvoiceId: number | null;
}

export const LineItemsPanel = ({ currentInvoiceId }: LineItemsPanelProps) => {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (currentInvoiceId) {
      fetchLineItems(currentInvoiceId);
    } else {
      setLineItems([]);
      setIsLoading(false);
    }
  }, [currentInvoiceId]);

  const fetchLineItems = async (invoiceId: number) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('Line Items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('id', { ascending: true });

      if (error) throw error;
      
      setLineItems(data || []);
    } catch (error) {
      console.error('Error fetching line items:', error);
      toast({
        title: "Error",
        description: "Failed to load line items",
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
        <span className="ml-2">Loading line items...</span>
      </div>
    );
  }

  if (!currentInvoiceId) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8 text-center h-full">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">No Invoice Selected</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Select an invoice to view its line items.
        </p>
      </div>
    );
  }

  if (lineItems.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8 text-center h-full">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">No Line Items Available</h2>
        <p className="text-slate-600 dark:text-slate-400">
          This invoice doesn't have any line items recorded.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 h-full overflow-auto">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
        Line Items for Invoice #{currentInvoiceId}
      </h2>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Work Date</TableHead>
              <TableHead>Ticket/Order</TableHead>
              <TableHead>AFE Number</TableHead>
              <TableHead>Cost Center</TableHead>
              <TableHead>Cost Code</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.Description ? JSON.stringify(item.Description) : 'N/A'}</TableCell>
                <TableCell>{item.Date_of_Work ? JSON.stringify(item.Date_of_Work) : 'N/A'}</TableCell>
                <TableCell>{item.Ticket_Work_Order ? JSON.stringify(item.Ticket_Work_Order) : 'N/A'}</TableCell>
                <TableCell>{item.AFE_number ? JSON.stringify(item.AFE_number) : 'N/A'}</TableCell>
                <TableCell>{item.Cost_Center ? JSON.stringify(item.Cost_Center) : 'N/A'}</TableCell>
                <TableCell>{item.Cost_Code ? JSON.stringify(item.Cost_Code) : 'N/A'}</TableCell>
                <TableCell>{item.Unit_of_Measure ? JSON.stringify(item.Unit_of_Measure) : 'N/A'}</TableCell>
                <TableCell className="text-right">{item.Qauntity ? JSON.stringify(item.Qauntity) : 'N/A'}</TableCell>
                <TableCell className="text-right">{item.Rate ? JSON.stringify(item.Rate) : 'N/A'}</TableCell>
                <TableCell className="text-right">{item.Total ? JSON.stringify(item.Total) : 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

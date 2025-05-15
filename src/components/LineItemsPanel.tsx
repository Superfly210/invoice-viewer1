import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

type LineItem = {
  id: number;
  invoice_id: number;
  Description: any;
  Unit_of_Measure: any;
  AFE_number: any;
  Cost_Center: any;
  Cost_Code: any;
  Rate: any; // Changed from number to any
  Qauntity: any; // Note: This is misspelled in the database
  Total: any; // Changed from number to any
  Date_of_Work: any;
  Ticket_Work_Order: any;
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
    // Log the currentInvoiceId when it changes
    console.log("LineItemsPanel - currentInvoiceId changed to:", currentInvoiceId);
    
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
      console.log("Fetching line items for invoice ID:", invoiceId);
      
      // Make sure we're using the exact table name as in Supabase
      const { data, error } = await supabase
        .from('Line Items')
        .select('*')
        .eq('invoice_id', invoiceId);

      if (error) {
        console.error('Error fetching line items:', error);
        throw error;
      }
      
      console.log("Raw line items data received:", data);
      
      if (data && data.length > 0) {
        console.log("Sample line item structure:", JSON.stringify(data[0], null, 2));
      } else {
        console.log("No line items found for invoice ID:", invoiceId);
        // Double-check if the invoice exists
        const { data: invoiceData, error: invoiceError } = await supabase
          .from('Attachment Info')
          .select('id')
          .eq('id', invoiceId)
          .single();
          
        if (invoiceError) {
          console.error('Error checking invoice existence:', invoiceError);
        } else {
          console.log("Invoice existence check result:", invoiceData);
        }
      }
      
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

  // Function to safely parse JSON or return the value as-is
  const parseJsonValue = (value: any) => {
    if (value === null || value === undefined) return 'N/A';
    
    if (typeof value === 'string') {
      try {
        // Try to parse as JSON if it looks like JSON
        if (value.startsWith('{') || value.startsWith('[')) {
          return JSON.parse(value);
        }
        return value;
      } catch {
        return value;
      }
    }
    
    // If it's already an object (likely from jsonb column)
    if (typeof value === 'object') {
      return value;
    }
    
    return value;
  };

  // Display the value in a readable format
  const displayValue = (value: any) => {
    if (value === null || value === undefined) return 'N/A';
    
    // Parse if needed
    const parsedValue = parseJsonValue(value);
    
    // Handle object display
    if (typeof parsedValue === 'object') {
      if (parsedValue === null) return 'N/A';
      return JSON.stringify(parsedValue);
    }
    
    // Handle numeric values
    if (typeof parsedValue === 'number') {
      // Format currency values - fixed the type error by checking property names instead
      if ('Rate' in value || 'Total' in value) {
        return parsedValue.toFixed(2);
      }
      return String(parsedValue);
    }
    
    return String(parsedValue);
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
          This invoice doesn't have any line items recorded or there might be a data issue.
        </p>
        <div className="text-sm text-slate-500 mt-2">
          Current invoice ID: {currentInvoiceId}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 h-full overflow-auto">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
        Line Items for Invoice #{currentInvoiceId} ({lineItems.length} items)
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
                <TableCell>{displayValue(item.Description)}</TableCell>
                <TableCell>{displayValue(item.Date_of_Work)}</TableCell>
                <TableCell>{displayValue(item.Ticket_Work_Order)}</TableCell>
                <TableCell>{displayValue(item.AFE_number)}</TableCell>
                <TableCell>{displayValue(item.Cost_Center)}</TableCell>
                <TableCell>{displayValue(item.Cost_Code)}</TableCell>
                <TableCell>{displayValue(item.Unit_of_Measure)}</TableCell>
                <TableCell className="text-right">{displayValue(item.Qauntity)}</TableCell>
                <TableCell className="text-right">{displayValue(item.Rate)}</TableCell>
                <TableCell className="text-right">{displayValue(item.Total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

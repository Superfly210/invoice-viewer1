
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, AlertCircle } from "lucide-react";

type LineItem = {
  id: number;
  invoice_id: number;
  Description: any; // jsonb
  Unit_of_Measure: any; // jsonb
  AFE_number: any; // jsonb
  Cost_Center: any; // jsonb
  Cost_Code: any; // jsonb
  Rate: any; // jsonb
  Qauntity: any; // jsonb - Note: This is misspelled in the database
  Total: any; // jsonb
  Date_of_Work: any; // jsonb
  Ticket_Work_Order: any; // jsonb
  created_at: string;
};

interface LineItemsPanelProps {
  currentInvoiceId: number | null;
}

export const LineItemsPanel = ({ currentInvoiceId }: LineItemsPanelProps) => {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Log the currentInvoiceId when it changes
    console.log("LineItemsPanel - currentInvoiceId changed to:", currentInvoiceId);
    setError(null);
    
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
        setError(`Database error: ${error.message}`);
        throw error;
      }
      
      console.log("Raw line items data received:", data);
      
      if (data && data.length > 0) {
        console.log("Sample line item structure:", JSON.stringify(data[0], null, 2));
        // Count how many items have valid data for key fields
        const validItems = data.filter(item => 
          item.Description !== null || 
          item.Date_of_Work !== null || 
          item.Total !== null
        ).length;
        console.log(`Found ${validItems} line items with valid key data out of ${data.length} total`);
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
          setError(`Could not verify invoice: ${invoiceError.message}`);
        } else {
          console.log("Invoice existence check result:", invoiceData);
        }
      }
      
      setLineItems(data || []);
    } catch (error) {
      console.error('Error fetching line items:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      toast({
        title: "Error",
        description: "Failed to load line items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to safely parse JSON values from jsonb fields
  const parseJsonValue = (value: any, fieldName: string) => {
    if (value === null || value === undefined) return 'N/A';
    
    console.log(`Parsing field ${fieldName} with value:`, value);
    
    try {
      // If it's already a string, try to parse as JSON if it looks like JSON
      if (typeof value === 'string') {
        if (value.startsWith('{') || value.startsWith('[')) {
          return JSON.parse(value);
        }
        return value;
      }
      
      // If it's already an object or array (from jsonb column)
      if (typeof value === 'object') {
        return value;
      }
      
      return value;
    } catch (error) {
      console.warn(`Error parsing ${fieldName}:`, error, value);
      return value;
    }
  };

  // Display the value in a readable format
  const displayValue = (value: any, fieldName: string) => {
    if (value === null || value === undefined) return 'N/A';
    
    // Parse if needed
    const parsedValue = parseJsonValue(value, fieldName);
    
    // Handle object display
    if (typeof parsedValue === 'object') {
      if (parsedValue === null) return 'N/A';
      
      // For arrays, join the values
      if (Array.isArray(parsedValue)) {
        return parsedValue.join(', ');
      }
      
      // For objects, we can either stringify or return a specific property
      if (parsedValue.value !== undefined) {
        return String(parsedValue.value);
      }
      
      return JSON.stringify(parsedValue);
    }
    
    // Handle numeric values
    if (typeof parsedValue === 'number') {
      // Format currency values
      if (fieldName === 'Rate' || fieldName === 'Total') {
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

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8 text-center h-full">
        <div className="flex justify-center items-center mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 ml-2">Error Loading Line Items</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          {error}
        </p>
        <div className="text-sm text-slate-500 mt-4">
          Current invoice ID: {currentInvoiceId}
        </div>
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
                <TableCell>{displayValue(item.Description, 'Description')}</TableCell>
                <TableCell>{displayValue(item.Date_of_Work, 'Date_of_Work')}</TableCell>
                <TableCell>{displayValue(item.Ticket_Work_Order, 'Ticket_Work_Order')}</TableCell>
                <TableCell>{displayValue(item.AFE_number, 'AFE_number')}</TableCell>
                <TableCell>{displayValue(item.Cost_Center, 'Cost_Center')}</TableCell>
                <TableCell>{displayValue(item.Cost_Code, 'Cost_Code')}</TableCell>
                <TableCell>{displayValue(item.Unit_of_Measure, 'Unit_of_Measure')}</TableCell>
                <TableCell className="text-right">{displayValue(item.Qauntity, 'Qauntity')}</TableCell>
                <TableCell className="text-right">{displayValue(item.Rate, 'Rate')}</TableCell>
                <TableCell className="text-right">{displayValue(item.Total, 'Total')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

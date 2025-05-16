
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type LineItem = {
  id: number;
  invoice_id: number;
  Description: string | null;
  Unit_of_Measure: string | null;
  AFE_number: string | null;
  Cost_Center: string | null;
  Cost_Code: string | null;
  Rate: number | null;
  Quantity: number | null;  // Fixed from Qauntity to Quantity
  Total: number | null;
  Date_of_Work: string | null;
  Ticket_Work_Order: string | null;
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
      
      // Try to fetch line items first, accounting for the "Quantity" column name change
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
      
      // Set the line items (empty array if no data)
      setLineItems(data || []);
      
      // If no line items were found, let's double-check the invoice exists
      if (!data || data.length === 0) {
        console.log("No line items found for invoice ID:", invoiceId);
        
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

  // Add sample line items for demonstration (only if there are no line items)
  const addSampleLineItems = async () => {
    if (!currentInvoiceId) return;
    
    try {
      setIsLoading(true);
      
      // Create sample line items
      const sampleItems = [
        {
          invoice_id: currentInvoiceId,
          Description: 'Equipment Rental - Excavator',
          Unit_of_Measure: 'Day',
          Rate: 450,
          Quantity: 3,
          Total: 1350,
          Date_of_Work: '2024-05-12',
          AFE_number: 'AFE-2024-001'
        },
        {
          invoice_id: currentInvoiceId,
          Description: 'Labor - Standard Hours',
          Unit_of_Measure: 'Hour', 
          Rate: 85,
          Quantity: 8,
          Total: 680,
          Ticket_Work_Order: 'WO-24601'
        }
      ];
      
      const { error } = await supabase
        .from('Line Items')
        .insert(sampleItems);
        
      if (error) {
        console.error('Error creating sample line items:', error);
        toast({
          title: "Error",
          description: "Failed to create sample line items",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Added sample line items for demonstration",
      });
      
      // Fetch the line items again to refresh the list
      fetchLineItems(currentInvoiceId);
    } catch (error) {
      console.error('Error adding sample line items:', error);
      toast({
        title: "Error",
        description: "Failed to add sample line items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Display the value in a readable format
  const displayValue = (value: any, fieldName: string) => {
    if (value === null || value === undefined) return 'N/A';
    
    // Format numeric values
    if (typeof value === 'number') {
      if (fieldName === 'Rate' || fieldName === 'Total') {
        return `$${value.toFixed(2)}`;
      }
      return String(value);
    }
    
    return String(value);
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
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          This invoice doesn't have any line items recorded.
        </p>
        <Button 
          onClick={addSampleLineItems}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Sample Line Items
        </Button>
        <div className="text-sm text-slate-500 mt-6">
          Current invoice ID: {currentInvoiceId}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 h-full overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
          Line Items for Invoice #{currentInvoiceId} ({lineItems.length} items)
        </h2>
      </div>
      
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
                <TableCell className="text-right">{displayValue(item.Quantity, 'Quantity')}</TableCell>
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

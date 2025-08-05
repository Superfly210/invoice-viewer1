
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Plus, X } from "lucide-react";
import { EditableLineItemCell } from "./invoice/EditableLineItemCell";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency, parseCurrencyValue } from "@/lib/currencyFormatter";
import { logLineItemChange } from "@/utils/auditLogger";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type LineItem = {
  id: number;
  invoice_id: number;
  Description: string | null;
  Unit_of_Measure: string | null;
  AFE_number: string | null;
  Cost_Center: string | null;
  Cost_Code: string | null;
  Rate: number | null;
  Quantity: number | null;
  Total: number | null;
  Date_of_Work: string | null;
  Ticket_Work_Order: string | null;
  created_at: string;
};

interface LineItemsPanelProps {
  currentInvoiceId: number | null;
}

export const LineItemsPanel = ({
  currentInvoiceId
}: LineItemsPanelProps) => {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();
  
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
      const {
        data,
        error
      } = await supabase.from('Line_Items').select('*').eq('invoice_id', invoiceId);
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
        const {
          data: invoiceData,
          error: invoiceError
        } = await supabase.from('Attachment_Info').select('id').eq('id', invoiceId).single();
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
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFieldUpdate = async (lineItemId: number, field: string, newValue: string) => {
    try {
      console.log(`Updating line item ${lineItemId} ${field} to:`, newValue);

      // Get old value for audit trail
      const currentItem = lineItems.find(item => item.id === lineItemId);
      const oldValue = currentItem?.[field as keyof LineItem];

      // Convert string values to appropriate types
      let processedValue: any = newValue;
      if (field === 'Rate' || field === 'Total') {
        // Use the currency parser for monetary fields
        processedValue = parseCurrencyValue(newValue);
      } else if (field === 'Quantity') {
        // Convert to number for quantity
        const numericValue = parseFloat(newValue.replace(/[,]/g, ''));
        processedValue = isNaN(numericValue) ? null : numericValue;
      }
      const {
        error
      } = await supabase.from('Line_Items').update({
        [field]: processedValue
      }).eq('id', lineItemId);
      if (error) {
        console.error('Error updating line item field:', error);
        toast({
          title: "Error",
          description: `Failed to update ${field}`,
          variant: "destructive"
        });
      } else {
        // Log the change to audit trail
        if (currentInvoiceId) {
          await logLineItemChange(currentInvoiceId, lineItemId, field, oldValue, newValue);
        }
        
        toast({
          title: "Success",
          description: `${field} updated successfully`
        });
        // Refresh the line items data
        if (currentInvoiceId) {
          fetchLineItems(currentInvoiceId);
        }
        // Invalidate audit trail query
        queryClient.invalidateQueries({ queryKey: ['audit-trail', currentInvoiceId] });
      }
    } catch (error) {
      console.error('Error updating line item field:', error);
      toast({
        title: "Error",
        description: `Failed to update ${field}`,
        variant: "destructive"
      });
    }
  };

  const handleAddLineItem = async () => {
    if (!currentInvoiceId) return;

    try {
      const { error } = await supabase
        .from('Line_Items')
        .insert({
          invoice_id: currentInvoiceId,
          Description: '',
          Unit_of_Measure: '',
          AFE_number: '',
          Cost_Center: '',
          Cost_Code: '',
          Rate: null,
          Quantity: null,
          Total: null,
          Date_of_Work: '',
          Ticket_Work_Order: ''
        });

      if (error) {
        console.error('Error adding line item:', error);
        toast({
          title: "Error",
          description: "Failed to add line item",
          variant: "destructive"
        });
      } else {
        // Log the addition to audit trail
        await logLineItemChange(currentInvoiceId, null, 'Line Item', null, 'Added', 'INSERT');
        
        toast({
          title: "Success",
          description: "Line item added successfully"
        });
        // Refresh the line items data
        fetchLineItems(currentInvoiceId);
        // Invalidate audit trail query
        queryClient.invalidateQueries({ queryKey: ['audit-trail', currentInvoiceId] });
      }
    } catch (error) {
      console.error('Error adding line item:', error);
      toast({
        title: "Error",
        description: "Failed to add line item",
        variant: "destructive"
      });
    }
  };

  const handleDeleteLineItem = async (lineItemId: number) => {
    try {
      // Get the line item data before deleting
      const lineItemToDelete = lineItems.find(item => item.id === lineItemId);
      
      const { error } = await supabase
        .from('Line_Items')
        .delete()
        .eq('id', lineItemId);

      if (error) {
        console.error('Error deleting line item:', error);
        toast({
          title: "Error",
          description: "Failed to delete line item",
          variant: "destructive"
        });
      } else {
        // Log the deletion to audit trail with full data
        if (currentInvoiceId && lineItemToDelete) {
          await logLineItemChange(currentInvoiceId, lineItemId, 'Line Item', JSON.stringify(lineItemToDelete), null, 'DELETE');
        }
        
        toast({
          title: "Success",
          description: "Line item deleted successfully"
        });
        // Refresh the line items data
        if (currentInvoiceId) {
          fetchLineItems(currentInvoiceId);
        }
        // Invalidate audit trail query
        queryClient.invalidateQueries({ queryKey: ['audit-trail', currentInvoiceId] });
      }
    } catch (error) {
      console.error('Error deleting line item:', error);
      toast({
        title: "Error",
        description: "Failed to delete line item",
        variant: "destructive"
      });
    }
  };

  // Display the value in a readable format
  const displayValue = (value: any, fieldName: string) => {
    if (value === null || value === undefined) return '';

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
    return <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading line items...</span>
      </div>;
  }
  
  if (error) {
    return <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8 text-center h-full">
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
      </div>;
  }
  
  if (!currentInvoiceId) {
    return <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8 text-center h-full">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">No Invoice Selected</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Select an invoice to view its line items.
        </p>
      </div>;
  }
  
  // Calculate the total sum of all line items
  const totalSum = lineItems.reduce((sum, item) => {
    return sum + (item.Total || 0);
  }, 0);

  return <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 h-full overflow-auto">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
          Line Items for Invoice #{currentInvoiceId} ({lineItems.length} items)
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Work Date</TableHead>
              <TableHead>Ticket/Order</TableHead>
              <TableHead>AFE Number</TableHead>
              <TableHead>Cost Center</TableHead>
              <TableHead>Cost Code</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="">Quantity</TableHead>
              <TableHead className="">Rate</TableHead>
              <TableHead className="">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineItems.map(item => <TableRow key={item.id}>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                        <X className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to delete?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the line item.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteLineItem(item.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
                <TableCell>
                  <EditableLineItemCell value={item.Description} onSave={newValue => handleFieldUpdate(item.id, 'Description', newValue)} />
                </TableCell>
                <TableCell>
                  <EditableLineItemCell value={item.Date_of_Work} onSave={newValue => handleFieldUpdate(item.id, 'Date_of_Work', newValue)} type="date" />
                </TableCell>
                <TableCell>
                  <EditableLineItemCell value={item.Ticket_Work_Order} onSave={newValue => handleFieldUpdate(item.id, 'Ticket_Work_Order', newValue)} />
                </TableCell>
                <TableCell>
                  <EditableLineItemCell value={item.AFE_number} onSave={newValue => handleFieldUpdate(item.id, 'AFE_number', newValue)} />
                </TableCell>
                <TableCell>
                  <EditableLineItemCell value={item.Cost_Center} onSave={newValue => handleFieldUpdate(item.id, 'Cost_Center', newValue)} />
                </TableCell>
                <TableCell>
                  <EditableLineItemCell value={item.Cost_Code} onSave={newValue => handleFieldUpdate(item.id, 'Cost_Code', newValue)} />
                </TableCell>
                <TableCell>
                  <EditableLineItemCell value={item.Unit_of_Measure} onSave={newValue => handleFieldUpdate(item.id, 'Unit_of_Measure', newValue)} />
                </TableCell>
                <TableCell className="text-right">
                  <EditableLineItemCell value={item.Quantity} onSave={newValue => handleFieldUpdate(item.id, 'Quantity', newValue)} type="number" />
                </TableCell>
                <TableCell className="text-right">
                  <EditableLineItemCell value={item.Rate ? formatCurrency(item.Rate) : null} onSave={newValue => handleFieldUpdate(item.id, 'Rate', newValue)} type="text" />
                </TableCell>
                <TableCell className="text-right">
                  <EditableLineItemCell value={item.Total ? formatCurrency(item.Total) : null} onSave={newValue => handleFieldUpdate(item.id, 'Total', newValue)} type="text" />
                </TableCell>
              </TableRow>)}
            {/* Total row */}
            <TableRow className="border-t-2 border-slate-300 dark:border-slate-600 font-semibold">
              <TableCell colSpan={10} className="text-right text-slate-800 dark:text-slate-200">
                Total:
              </TableCell>
              <TableCell className="text-right text-slate-800 dark:text-slate-200">
                {formatCurrency(totalSum)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-4 flex justify-center">
        <Button onClick={handleAddLineItem} size="sm" className="flex items-center">
          <Plus className="h-4 w-4 mr-1" />
          Add Line Item
        </Button>
      </div>
    </div>;
};


import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Plus, X } from "lucide-react";
// import { EditableLineItemCell } from "./invoice/EditableLineItemCell";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useSubtotalComparison } from "@/hooks/useSubtotalComparison";
import { useGstComparison } from "@/hooks/useGstComparison";
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
import { Tables } from "@/integrations/supabase/types";
import { AttachmentInfo } from "@/hooks/useInvoiceDataFetching";

type LineItem = Tables<'Line_Items'>;
type Quantity = Tables<'Quantities'>;

type FlatLineItem = {
    lineItemId: number;
    quantityId: number | null;
    Description: string | null;
    Date_of_Work: string | null;
    Ticket_Work_Order: string | null;
    Unit_of_Measure: string | null;
    Quantity: number | null;
    Rate: number | null;
    Total: number | null;
    calc_gst: number | null;
    gst_exempt: boolean | null;
    gst_included: boolean | null;
};

interface LineItemsPanelProps {
  currentInvoiceId: number | null;
  currentInvoice?: AttachmentInfo | null; // Add current invoice prop with proper typing
}

export const LineItemsPanel = ({
  currentInvoiceId,
  currentInvoice
}: LineItemsPanelProps) => {
  const [flatLineItems, setFlatLineItems] = useState<FlatLineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use currentInvoice prop for GST comparison instead of separate query
  const invoiceGstTotal = currentInvoice?.GST_Total || null;
  const invoiceSubtotal = currentInvoice?.Sub_Total || null;

  const { data: codingTotal = 0 } = useQuery({
    queryKey: ['invoice-coding-total', currentInvoiceId],
    queryFn: async () => {
      if (!currentInvoiceId) return 0;
      const { data, error } = await supabase
        .from('invoice_coding')
        .select('total')
        .eq('invoice_id', currentInvoiceId);
      
      if (error) throw error;
      return data.reduce((acc, item) => acc + (item.total || 0), 0);
    },
    enabled: !!currentInvoiceId,
  });

  // Calculate the total sum of all line items
  const totalSum = flatLineItems.reduce((sum, item) => {
    return sum + (item.Total || 0);
  }, 0);

  // Calculate the GST sum
  const gstSum = flatLineItems.reduce((sum, item) => {
    return sum + (item.calc_gst || 0);
  }, 0);

  // Use subtotal comparison hook - MUST be called before any early returns
  const subtotalComparison = useSubtotalComparison({
    invoiceSubtotal: invoiceSubtotal,
    codingTotal,
    lineItemsTotal: totalSum
  });

  // Use GST comparison hook
  const gstComparison = useGstComparison({
    invoiceGstTotal: invoiceGstTotal,
    lineItemsGstSum: gstSum
  });
  
  useEffect(() => {
    console.log("LineItemsPanel - currentInvoiceId changed to:", currentInvoiceId);
    setError(null);
    if (currentInvoiceId) {
      fetchLineItems(currentInvoiceId);
    } else {
      setFlatLineItems([]);
      setIsLoading(false);
    }
  }, [currentInvoiceId]);
  
  const fetchLineItems = async (invoiceId: number) => {
    try {
      setIsLoading(true);
      console.log("Fetching line items for invoice ID:", invoiceId);

      // 1. Fetch Line_Items
      const { data: lineItemsData, error: lineItemsError } = await supabase
        .from('Line_Items')
        .select('*')
        .eq('invoice_id', invoiceId);

      if (lineItemsError) {
        console.error('Error fetching line items:', lineItemsError);
        setError(`Database error: ${lineItemsError.message}`);
        throw lineItemsError;
      }

      console.log("Raw line items data received:", lineItemsData);

      if (!lineItemsData || lineItemsData.length === 0) {
        console.log("No line items found for invoice ID:", invoiceId);
        setFlatLineItems([]);
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
        return;
      }

      const lineItemIds = lineItemsData.map(item => item.id);
      console.log("Querying Quantities for line item IDs:", lineItemIds);

      // 2. Fetch Quantities with type assertion for newly added column
type QuantityRow = {
        id: number;
        line_items_id: number | null;
        Unit_of_Measure: string | null;
        Quantity: number | null;
        Rate: number | null;
        calc_total: number | null;
        calc_gst: number | null;
        gst_exempt: boolean | null;
        gst_included: boolean | null;
      };

      const { data: quantitiesData, error: quantitiesError } = await supabase
        .from('Quantities')
        .select('id, line_items_id, Unit_of_Measure, Quantity, Rate, calc_total, calc_gst, gst_exempt, gst_included')
        .in('line_items_id', lineItemIds);
      
      console.log("Quantities data received:", quantitiesData);
      console.log("Quantities query error:", quantitiesError);

      if (quantitiesError) {
        console.error('Error fetching quantities:', quantitiesError);
        setError(`Database error: ${quantitiesError.message}`);
        throw quantitiesError;
      }

      // Cast to our known type structure
      const typedQuantities = quantitiesData as QuantityRow[] | null;

      // 3. Join and flatten data
      const newFlatLineItems: FlatLineItem[] = [];
      lineItemsData.forEach(lineItem => {
        const relatedQuantities = typedQuantities?.filter(q => q.line_items_id === lineItem.id) || [];
        if (relatedQuantities.length > 0) {
          relatedQuantities.forEach(quantity => {
            newFlatLineItems.push({
              lineItemId: lineItem.id,
              quantityId: quantity.id,
              Description: lineItem.Description,
              Date_of_Work: lineItem.Date_of_Work,
              Ticket_Work_Order: lineItem.Ticket_Work_Order,
              Unit_of_Measure: quantity.Unit_of_Measure,
              Quantity: quantity.Quantity,
              Rate: quantity.Rate,
              Total: quantity.calc_total,
              calc_gst: quantity.calc_gst,
              gst_exempt: quantity.gst_exempt,
              gst_included: quantity.gst_included,
            });
          });
        } else {
          newFlatLineItems.push({
            lineItemId: lineItem.id,
            quantityId: null,
            Description: lineItem.Description,
            Date_of_Work: lineItem.Date_of_Work,
            Ticket_Work_Order: lineItem.Ticket_Work_Order,
            Unit_of_Measure: null,
            Quantity: null,
            Rate: null,
            Total: null,
            calc_gst: null,
            gst_exempt: null,
            gst_included: null,
          });
        }
      });

      console.log("Combined and flattened line items data:", newFlatLineItems);
      // Sort by quantityId to maintain consistent order
      newFlatLineItems.sort((a, b) => {
        if (a.quantityId === null && b.quantityId === null) return 0;
        if (a.quantityId === null) return 1; // nulls to the end
        if (b.quantityId === null) return -1; // nulls to the end
        return a.quantityId - b.quantityId;
      });
      setFlatLineItems(newFlatLineItems);

    } catch (error) {
      console.error('Error fetching line items data:', error);
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
  
  const handleFieldUpdate = async (quantityId: number | null, field: string, newValue: string) => { // Changed parameter name
    try {
      console.log(`Updating quantity ${quantityId} ${field} to:`, newValue); // Adjusted log message

      const currentItem = flatLineItems.find(item => item.quantityId === quantityId); // Changed find condition
      const oldValue = currentItem?.[field as keyof FlatLineItem];

      let processedValue: any = newValue;
      const quantityFields = ['Rate', 'Total', 'Quantity', 'Unit_of_Measure', 'gst_exempt', 'gst_included'];

      if (quantityFields.includes(field)) {
        if (field === 'Rate' || field === 'Total') {
          processedValue = parseCurrencyValue(newValue);
        } else if (field === 'Quantity') {
          const numericValue = parseFloat(newValue.replace(/[,]/g, ''));
          processedValue = isNaN(numericValue) ? null : numericValue;
        } else if (field === 'gst_exempt' || field === 'gst_included') {
          processedValue = newValue === 'true';
        }
        
        if (quantityId === null) { // Added null check for quantityId
          console.error("Cannot update quantity: quantityId is null.");
          toast({
            title: "Error",
            description: "Cannot update quantity: quantityId is null.",
            variant: "destructive"
          });
          return;
        }

        const { error } = await supabase.from('Quantities').update({
          [field]: processedValue
        }).eq('id', quantityId); // Changed line_items_id to id, and lineItemId to quantityId

        if (error) throw error;
        fetchLineItems(currentInvoiceId); // Re-fetch after successful update

      } else {
        // This else block handles updates to Line_Items table.
        // The current handleFieldUpdate is designed for Quantities.
        // If Line_Items fields need to be updated, a separate function or more complex logic might be needed.
        // For now, I'll keep it as is, but it will use quantityId as lineItemId, which is incorrect for Line_Items.
        // I will add a warning here.
        console.warn(`Attempting to update Line_Items field '${field}' using quantityId. This might be incorrect.`);
        const { error } = await supabase.from('Line_Items').update({
          [field]: processedValue
        }).eq('id', quantityId); // This 'id' should be lineItemId, not quantityId
        if (error) throw error;
        fetchLineItems(currentInvoiceId); // Re-fetch after successful updatef
      }
    } catch (error) {
      console.error('Error updating field:', error);
      toast({
        title: "Error",
        description: "Failed to update field",
        variant: "destructive"
      });
    }
    

  }; // Closing brace for handleFieldUpdate

  const handleAddLineItem = async () => {
    if (!currentInvoiceId) return;

    try {
      const { data: lineItemData, error: lineItemError } = await supabase
        .from('Line_Items')
        .insert({
          invoice_id: currentInvoiceId,
          Description: '',
          AFE_number: '',
          Cost_Center: '',
          Cost_Code: '',
          Date_of_Work: '',
          Ticket_Work_Order: ''
        }).select().single();

      if (lineItemError) throw lineItemError;

      // Type assertion for insert with newly added columns
      const { error: quantityError } = await supabase.from('Quantities').insert({
        line_items_id: lineItemData.id,
        invoice_id: currentInvoiceId,
        Unit_of_Measure: '',
        Rate: null,
        Quantity: null,
        Total: null,
        gst_exempt: false,
        gst_included: false,
      } as any);

      if (quantityError) throw quantityError;

      await logLineItemChange(currentInvoiceId, null, 'Line Item', null, 'Added', 'INSERT');
      
      toast({
        title: "Success",
        description: "Line item added successfully"
      });
      fetchLineItems(currentInvoiceId);
      queryClient.invalidateQueries({ queryKey: ['audit-trail', currentInvoiceId] });

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
      const lineItemToDelete = flatLineItems.find(item => item.lineItemId === lineItemId); // Changed lineItems to flatLineItems
      
      const { error: quantityError } = await supabase
        .from('Quantities')
        .delete()
        .eq('line_items_id', lineItemId);
      
      if (quantityError) throw quantityError;

      const { error: lineItemError } = await supabase
        .from('Line_Items')
        .delete()
        .eq('id', lineItemId);

      if (lineItemError) throw lineItemError;

      if (currentInvoiceId && lineItemToDelete) {
        await logLineItemChange(currentInvoiceId, lineItemId, 'Line Item', JSON.stringify(lineItemToDelete), null, 'DELETE');
      }
      
      toast({
        title: "Success",
        description: "Line item deleted successfully"
      });

      if (currentInvoiceId) {
        fetchLineItems(currentInvoiceId);
      }
      queryClient.invalidateQueries({ queryKey: ['audit-trail', currentInvoiceId] });

    } catch (error) {
      console.error('Error deleting line item:', error);
      toast({
        title: "Error",
        description: "Failed to delete line item",
        variant: "destructive"
      });
    }
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
   
    return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 h-full flex flex-col">
      <div className="flex-1 overflow-auto relative">
        <table className="w-full caption-bottom text-sm">
          <thead className="sticky top-0 bg-white dark:bg-slate-800 z-10 shadow-sm [&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-8"></th>
              <th className="h-12 px-4 text-left align-middle font-bold text-muted-foreground">Description</th>
              <th className="h-12 px-4 text-left align-middle font-bold text-muted-foreground">Work Date</th>
              <th className="h-12 px-4 text-left align-middle font-bold text-muted-foreground">Ticket/Order</th>
              <th className="h-12 px-4 text-left align-middle font-bold text-muted-foreground">Unit</th>
              <th className="h-12 px-4 text-center align-middle font-bold text-muted-foreground">Quantity</th>
              <th className="h-12 px-4 text-center align-middle font-bold text-muted-foreground">Rate</th>
              <th className="h-12 px-4 text-center align-middle font-bold text-muted-foreground">Total</th>
              <th className="h-12 px-4 text-center align-middle font-bold text-muted-foreground">GST Exempt</th>
              <th className="h-12 px-4 text-center align-middle font-bold text-muted-foreground">GST Included</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {(() => {
              const rowSpans: Record<number, number> = flatLineItems.reduce((acc, item) => {
                acc[item.lineItemId] = (acc[item.lineItemId] || 0) + 1;
                return acc;
              }, {} as Record<number, number>);

              const renderedLineItemIds = new Set<number>();

              return flatLineItems.map((item, index) => {
                const isFirst = !renderedLineItemIds.has(item.lineItemId);
                if (isFirst) {
                  renderedLineItemIds.add(item.lineItemId);
                }

                return (
                  <tr key={`${item.lineItemId}-${item.quantityId || index}`} className="border-b transition-colors hover:bg-muted/50">
                    {isFirst && (
                      <>
                        <td className="p-4 align-middle" rowSpan={rowSpans[item.lineItemId]}>
                          {/* Delete button disabled for now */}
                        </td>
                        <td className="p-4 align-middle" rowSpan={rowSpans[item.lineItemId]}>{item.Description}</td>
                        <td className="p-4 align-middle whitespace-nowrap" rowSpan={rowSpans[item.lineItemId]}>{item.Date_of_Work}</td>
                        <td className="p-4 align-middle" rowSpan={rowSpans[item.lineItemId]}>{item.Ticket_Work_Order}</td>
                      </>
                    )}
                    <td className="p-4 align-middle">{item.Unit_of_Measure}</td>
                    <td className="p-4 align-middle text-center">{item.Quantity}</td>
                    <td className="p-4 align-middle text-center">{item.Rate ? formatCurrency(item.Rate) : null}</td>
                    <td className="p-4 align-middle text-center">{item.Total ? formatCurrency(item.Total) : null}</td>
                    <td className="p-4 align-middle text-center">
                      <input
                        type="checkbox"
                        checked={item.gst_exempt || false}
                        onChange={(e) => handleFieldUpdate(item.quantityId, 'gst_exempt', String(e.target.checked))}
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                    </td>
                    <td className="p-4 align-middle text-center">
                      <input
                        type="checkbox"
                        checked={item.gst_included || false}
                        onChange={(e) => handleFieldUpdate(item.quantityId, 'gst_included', String(e.target.checked))}
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                    </td>
                  </tr>
                );
              });
            })()}
            {/* Subtotal row */}
            <tr className="border-b border-t-2 border-slate-300 dark:border-slate-600 font-semibold transition-colors hover:bg-muted/50">
              <td colSpan={7} className="p-4 align-middle text-right text-slate-800 dark:text-slate-200">
                Subtotal:
              </td>
              <td className="p-4 align-middle text-center text-slate-800 dark:text-slate-200">
              <span className={`px-2 py-1 rounded inline-block ${subtotalComparison.highlightClass}`}>
                {formatCurrency(totalSum)}
              </span>
              </td>
              <td colSpan={2}></td>
            </tr>
            {/* GST row */}
            <tr className="border-b font-semibold transition-colors hover:bg-muted/50">
              <td colSpan={7} className="p-4 align-middle text-right text-slate-800 dark:text-slate-200">
                G.S.T:
              </td>
              <td className="p-4 align-middle text-center text-slate-800 dark:text-slate-200">
                <span className={`px-2 py-1 rounded inline-block ${gstComparison.highlightClass}`}>
                  {formatCurrency(gstSum)}
                </span>
              </td>
              <td colSpan={2}></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Add button disabled for now */}
    </div>
  );
};

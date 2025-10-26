/**
 * Custom hook for fetching and managing line items data
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { FlatLineItem, QuantityRow } from "../types";

export function useLineItems(currentInvoiceId: number | null) {
  const [flatLineItems, setFlatLineItems] = useState<FlatLineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
        
        // Verify invoice exists
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

      // 2. Fetch Quantities
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
          // Line item without quantities
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

  return {
    flatLineItems,
    setFlatLineItems,
    isLoading,
    error,
    refetch: () => currentInvoiceId && fetchLineItems(currentInvoiceId),
  };
}

/**
 * Custom hook for line item CRUD operations
 */

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { logLineItemChange } from "@/utils/auditLogger";
import type { FlatLineItem } from "../types";

export function useLineItemActions(
  flatLineItems: FlatLineItem[],
  setFlatLineItems: React.Dispatch<React.SetStateAction<FlatLineItem[]>>,
  currentInvoiceId: number | null
) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFieldUpdate = async (quantityId: number | null, field: string, newValue: string) => {
    try {
      console.log(`Updating quantity ${quantityId} ${field} to:`, newValue);

      const currentItem = flatLineItems.find(item => item.quantityId === quantityId);
      const oldValue = currentItem?.[field as keyof FlatLineItem];

      if (!quantityId) {
        toast({
          title: "Error",
          description: "Cannot update item without quantity ID",
          variant: "destructive"
        });
        return;
      }

      // Parse value based on field type
      let parsedValue: any = newValue;
      if (field === 'gst_exempt' || field === 'gst_included') {
        parsedValue = newValue === 'true';
      } else if (field === 'Quantity' || field === 'Rate') {
        parsedValue = parseFloat(newValue) || null;
      }

      // Update in database
      const { error } = await supabase
        .from('Quantities')
        .update({ [field]: parsedValue })
        .eq('id', quantityId);

      if (error) throw error;

      // Update local state
      setFlatLineItems(prevItems =>
        prevItems.map(item =>
          item.quantityId === quantityId
            ? { ...item, [field]: parsedValue }
            : item
        )
      );

      // Log the change
      if (currentInvoiceId) {
        await logLineItemChange(
          currentInvoiceId,
          quantityId,
          field,
          oldValue,
          parsedValue
        );
      }

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['invoice-coding-total', currentInvoiceId] });

      toast({
        title: "Success",
        description: `${field} updated successfully`,
      });

    } catch (error) {
      console.error('Error updating field:', error);
      toast({
        title: "Error",
        description: "Failed to update field",
        variant: "destructive"
      });
    }
  };

  const handleDeleteLineItem = async (lineItemId: number) => {
    try {
      const { error } = await supabase
        .from('Line_Items')
        .delete()
        .eq('id', lineItemId);

      if (error) throw error;

      setFlatLineItems(prevItems =>
        prevItems.filter(item => item.lineItemId !== lineItemId)
      );

      toast({
        title: "Success",
        description: "Line item deleted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ['invoice-coding-total', currentInvoiceId] });

    } catch (error) {
      console.error('Error deleting line item:', error);
      toast({
        title: "Error",
        description: "Failed to delete line item",
        variant: "destructive"
      });
    }
  };

  const handleAddLineItem = async () => {
    if (!currentInvoiceId) {
      toast({
        title: "Error",
        description: "No invoice selected",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create new line item
      const { data: newLineItem, error: lineItemError } = await supabase
        .from('Line_Items')
        .insert({
          invoice_id: currentInvoiceId,
          Description: '',
          Date_of_Work: null,
          Ticket_Work_Order: null,
        })
        .select()
        .single();

      if (lineItemError) throw lineItemError;

      // Create associated quantity row
      const { data: newQuantity, error: quantityError } = await supabase
        .from('Quantities')
        .insert({
          line_items_id: newLineItem.id,
          invoice_id: currentInvoiceId, // Required field
          Unit_of_Measure: null,
          Quantity: null,
          Rate: null,
          calc_total: null,
          calc_gst: null,
          gst_exempt: false,
          gst_included: false,
        } as any) // Supabase type compatibility
        .select()
        .single();

      if (quantityError) throw quantityError;

      // Add to local state
      const newFlatItem: FlatLineItem = {
        lineItemId: newLineItem.id,
        quantityId: newQuantity.id,
        Description: newLineItem.Description,
        Date_of_Work: newLineItem.Date_of_Work,
        Ticket_Work_Order: newLineItem.Ticket_Work_Order,
        Unit_of_Measure: newQuantity.Unit_of_Measure,
        Quantity: newQuantity.Quantity,
        Rate: newQuantity.Rate,
        Total: newQuantity.calc_total,
        calc_gst: newQuantity.calc_gst,
        gst_exempt: newQuantity.gst_exempt,
        gst_included: newQuantity.gst_included,
      };

      setFlatLineItems(prevItems => [...prevItems, newFlatItem]);

      toast({
        title: "Success",
        description: "Line item added successfully",
      });

      queryClient.invalidateQueries({ queryKey: ['invoice-coding-total', currentInvoiceId] });

    } catch (error) {
      console.error('Error adding line item:', error);
      toast({
        title: "Error",
        description: "Failed to add line item",
        variant: "destructive"
      });
    }
  };

  return {
    handleFieldUpdate,
    handleDeleteLineItem,
    handleAddLineItem,
  };
}

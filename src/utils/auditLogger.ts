
import { supabase } from "@/integrations/supabase/client";

export const logInvoiceChange = async (
  invoiceId: number,
  fieldName: string,
  oldValue: any,
  newValue: any,
  changeType: 'UPDATE' | 'INSERT' | 'DELETE' = 'UPDATE'
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('invoice_audit_log')
      .insert({
        invoice_id: invoiceId,
        field_name: fieldName,
        old_value: oldValue?.toString() || null,
        new_value: newValue?.toString() || null,
        change_type: changeType,
        changed_by: user?.id || null
      });

    if (error) {
      console.error('Error logging invoice change:', error);
    }
  } catch (error) {
    console.error('Error logging invoice change:', error);
  }
};

export const logLineItemChange = async (
  invoiceId: number,
  lineItemId: number | null,
  fieldName: string,
  oldValue: any,
  newValue: any,
  changeType: 'UPDATE' | 'INSERT' | 'DELETE' = 'UPDATE'
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('line_items_audit_log')
      .insert({
        invoice_id: invoiceId,
        line_item_id: lineItemId,
        field_name: fieldName,
        old_value: oldValue?.toString() || null,
        new_value: newValue?.toString() || null,
        change_type: changeType,
        changed_by: user?.id || null
      });

    if (error) {
      console.error('Error logging line item change:', error);
    }
  } catch (error) {
    console.error('Error logging line item change:', error);
  }
};

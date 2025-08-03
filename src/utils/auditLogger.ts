
import { supabase } from "@/integrations/supabase/client";

export const logAuditChange = async (
  invoiceId: number,
  logType: 'INVOICE' | 'LINE_ITEM',
  fieldName: string,
  oldValue: any,
  newValue: any,
  itemId?: number | null,
  changeType: 'UPDATE' | 'INSERT' | 'DELETE' = 'UPDATE'
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('audit_log')
      .insert({
        invoice_id: invoiceId,
        item_id: itemId,
        log_type: logType,
        field_name: fieldName,
        old_value: oldValue?.toString() || null,
        new_value: newValue?.toString() || null,
        change_type: changeType,
        changed_by: user?.id || null
      });

    if (error) {
      console.error('Error logging change:', error);
    }
  } catch (error) {
    console.error('Error logging change:', error);
  }
};

// Helper functions for backward compatibility
export const logInvoiceChange = async (
  invoiceId: number,
  fieldName: string,
  oldValue: any,
  newValue: any,
  changeType: 'UPDATE' | 'INSERT' | 'DELETE' = 'UPDATE'
) => {
  return logAuditChange(invoiceId, 'INVOICE', fieldName, oldValue, newValue, null, changeType);
};

export const logLineItemChange = async (
  invoiceId: number,
  itemId: number,
  fieldName: string,
  oldValue: any,
  newValue: any,
  changeType: 'UPDATE' | 'INSERT' | 'DELETE' = 'UPDATE'
) => {
  return logAuditChange(invoiceId, 'LINE_ITEM', fieldName, oldValue, newValue, itemId, changeType);
};


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
    
    // Use direct REST API call to avoid TypeScript issues
    const response = await fetch(`${supabase.supabaseUrl}/rest/v1/invoice_audit_log`, {
      method: 'POST',
      headers: {
        'apikey': supabase.supabaseKey,
        'Authorization': `Bearer ${supabase.supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        invoice_id: invoiceId,
        field_name: fieldName,
        old_value: oldValue?.toString() || null,
        new_value: newValue?.toString() || null,
        change_type: changeType,
        changed_by: user?.id || null
      })
    });

    if (!response.ok) {
      console.error('Error logging invoice change:', await response.text());
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
    
    // Use direct REST API call to avoid TypeScript issues
    const response = await fetch(`${supabase.supabaseUrl}/rest/v1/line_items_audit_log`, {
      method: 'POST',
      headers: {
        'apikey': supabase.supabaseKey,
        'Authorization': `Bearer ${supabase.supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        invoice_id: invoiceId,
        line_item_id: lineItemId,
        field_name: fieldName,
        old_value: oldValue?.toString() || null,
        new_value: newValue?.toString() || null,
        change_type: changeType,
        changed_by: user?.id || null
      })
    });

    if (!response.ok) {
      console.error('Error logging line item change:', await response.text());
    }
  } catch (error) {
    console.error('Error logging line item change:', error);
  }
};

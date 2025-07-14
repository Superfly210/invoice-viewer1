
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
    const SUPABASE_URL = "https://bumyvuiywdnffhmayxcz.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1bXl2dWl5d2RuZmZobWF5eGN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5Njc3MDgsImV4cCI6MjA1NzU0MzcwOH0.20yKpjbuWYIPNwc4SwqMoZNXZv4wUksa1xuGdXaGe78";

    const response = await fetch(`${SUPABASE_URL}/rest/v1/invoice_audit_log`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
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
    const SUPABASE_URL = "https://bumyvuiywdnffhmayxcz.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1bXl2dWl5d2RuZmZobWF5eGN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5Njc3MDgsImV4cCI6MjA1NzU0MzcwOH0.20yKpjbuWYIPNwc4SwqMoZNXZv4wUksa1xuGdXaGe78";

    const response = await fetch(`${SUPABASE_URL}/rest/v1/line_items_audit_log`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
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

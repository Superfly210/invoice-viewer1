
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
    
    const SUPABASE_URL = "https://bumyvuiywdnffhmayxcz.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1bXl2dWl5d2RuZmZobWF5eGN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5Njc3MDgsImV4cCI6MjA1NzU0MzcwOH0.20yKpjbuWYIPNwc4SwqMoZNXZv4wUksa1xuGdXaGe78";

    const response = await fetch(`${SUPABASE_URL}/rest/v1/audit_log`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        invoice_id: invoiceId,
        item_id: itemId,
        log_type: logType,
        field_name: fieldName,
        old_value: oldValue?.toString() || null,
        new_value: newValue?.toString() || null,
        change_type: changeType,
        changed_by: user?.id || null
      })
    });

    if (!response.ok) {
      console.error('Error logging change:', await response.text());
    }
  } catch (error) {
    console.error('Error logging change:', error);
  }
};


import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AuditLogEntry = {
  id: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  change_type: 'UPDATE' | 'INSERT' | 'DELETE';
  changed_by: string | null;
  changed_at: string;
  source_type: 'invoice' | 'line_item';
  line_item_id?: number | null;
};

export const useAuditTrail = (invoiceId: number) => {
  return useQuery({
    queryKey: ['audit-trail', invoiceId],
    queryFn: async () => {
      console.log('Fetching audit trail for invoice:', invoiceId);
      
      let combinedLogs: AuditLogEntry[] = [];

      try {
        // Fetch from the audit tables directly using REST API
        const SUPABASE_URL = "https://bumyvuiywdnffhmayxcz.supabase.co";
        const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1bXl2dWl5d2RuZmZobWF5eGN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5Njc3MDgsImV4cCI6MjA1NzU0MzcwOH0.20yKpjbuWYIPNwc4SwqMoZNXZv4wUksa1xuGdXaGe78";

        const invoiceResponse = await fetch(`${SUPABASE_URL}/rest/v1/invoice_audit_log?invoice_id=eq.${invoiceId}&order=changed_at.desc`, {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        const lineItemsResponse = await fetch(`${SUPABASE_URL}/rest/v1/line_items_audit_log?invoice_id=eq.${invoiceId}&order=changed_at.desc`, {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (invoiceResponse.ok) {
          const invoiceAuditData = await invoiceResponse.json();
          combinedLogs.push(...invoiceAuditData.map((log: any) => ({
            ...log,
            source_type: 'invoice' as const
          })));
        }

        if (lineItemsResponse.ok) {
          const lineItemsAuditData = await lineItemsResponse.json();
          combinedLogs.push(...lineItemsAuditData.map((log: any) => ({
            ...log,
            source_type: 'line_item' as const
          })));
        }
      } catch (error) {
        console.error('Error fetching audit logs:', error);
        // Return empty array if audit tables don't exist yet
        return [];
      }

      // Sort by changed_at descending
      combinedLogs.sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());

      console.log('Combined audit logs:', combinedLogs);
      return combinedLogs;
    },
    enabled: !!invoiceId,
  });
};


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
      
      // Fetch invoice audit logs using raw SQL to avoid type issues
      const { data: invoiceAuditData, error: invoiceError } = await supabase
        .rpc('sql', {
          query: `
            SELECT id, field_name, old_value, new_value, change_type, changed_by, changed_at
            FROM invoice_audit_log 
            WHERE invoice_id = $1 
            ORDER BY changed_at DESC
          `,
          params: [invoiceId]
        });

      // For now, let's use a direct approach since the tables exist but types aren't updated
      let combinedLogs: AuditLogEntry[] = [];

      try {
        // Try to fetch from the audit tables directly
        const invoiceResponse = await fetch(`${supabase.supabaseUrl}/rest/v1/invoice_audit_log?invoice_id=eq.${invoiceId}&order=changed_at.desc`, {
          headers: {
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${supabase.supabaseKey}`,
            'Content-Type': 'application/json'
          }
        });

        const lineItemsResponse = await fetch(`${supabase.supabaseUrl}/rest/v1/line_items_audit_log?invoice_id=eq.${invoiceId}&order=changed_at.desc`, {
          headers: {
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${supabase.supabaseKey}`,
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

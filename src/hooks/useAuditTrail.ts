
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
      
      // Fetch invoice audit logs
      const { data: invoiceAuditData, error: invoiceError } = await supabase
        .from('invoice_audit_log')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('changed_at', { ascending: false });

      if (invoiceError) {
        console.error('Error fetching invoice audit logs:', invoiceError);
        throw invoiceError;
      }

      // Fetch line items audit logs
      const { data: lineItemsAuditData, error: lineItemsError } = await supabase
        .from('line_items_audit_log')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('changed_at', { ascending: false });

      if (lineItemsError) {
        console.error('Error fetching line items audit logs:', lineItemsError);
        throw lineItemsError;
      }

      // Combine and format the audit logs
      const combinedLogs: AuditLogEntry[] = [
        ...(invoiceAuditData || []).map(log => ({
          ...log,
          source_type: 'invoice' as const
        })),
        ...(lineItemsAuditData || []).map(log => ({
          ...log,
          source_type: 'line_item' as const
        }))
      ];

      // Sort by changed_at descending
      combinedLogs.sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());

      console.log('Combined audit logs:', combinedLogs);
      return combinedLogs;
    },
    enabled: !!invoiceId,
  });
};


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
  user_name?: string;
};

export const useAuditTrail = (invoiceId: number) => {
  return useQuery({
    queryKey: ['audit-trail', invoiceId],
    queryFn: async () => {
      console.log('Fetching audit trail for invoice:', invoiceId);
      
      let combinedLogs: AuditLogEntry[] = [];

      try {
        // Use Supabase client to fetch audit data with user information
        const { data: invoiceAuditData, error: invoiceError } = await supabase
          .from('invoice_audit_log')
          .select(`
            *,
            profiles!invoice_audit_log_changed_by_fkey(full_name, username)
          `)
          .eq('invoice_id', invoiceId)
          .order('changed_at', { ascending: false });

        const { data: lineItemsAuditData, error: lineItemsError } = await supabase
          .from('line_items_audit_log')
          .select(`
            *,
            profiles!line_items_audit_log_changed_by_fkey(full_name, username)
          `)
          .eq('invoice_id', invoiceId)
          .order('changed_at', { ascending: false });

        if (!invoiceError && invoiceAuditData) {
          combinedLogs.push(...invoiceAuditData.map((log: any) => ({
            ...log,
            source_type: 'invoice' as const,
            user_name: log.profiles?.full_name || log.profiles?.username || 'Unknown User'
          })));
        }

        if (!lineItemsError && lineItemsAuditData) {
          combinedLogs.push(...lineItemsAuditData.map((log: any) => ({
            ...log,
            source_type: 'line_item' as const,
            user_name: log.profiles?.full_name || log.profiles?.username || 'Unknown User'
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


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
        // Fetch audit data with a simple approach due to RLS complexity
        const { data: invoiceAuditData, error: invoiceError } = await supabase
          .from('invoice_audit_log')
          .select('*')
          .eq('invoice_id', invoiceId)
          .order('changed_at', { ascending: false });

        const { data: lineItemsAuditData, error: lineItemsError } = await supabase
          .from('line_items_audit_log')
          .select('*')
          .eq('invoice_id', invoiceId)
          .order('changed_at', { ascending: false });

        // Fetch user profiles separately to avoid RLS issues
        const userIds = new Set<string>();
        if (invoiceAuditData) {
          invoiceAuditData.forEach((log: any) => {
            if (log.changed_by) userIds.add(log.changed_by);
          });
        }
        if (lineItemsAuditData) {
          lineItemsAuditData.forEach((log: any) => {
            if (log.changed_by) userIds.add(log.changed_by);
          });
        }

        // Fetch profiles for all user IDs
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, username')
          .in('id', Array.from(userIds));

        // Create a map for quick lookup
        const profilesMap = new Map();
        profiles?.forEach((profile: any) => {
          profilesMap.set(profile.id, profile);
        });

        if (!invoiceError && invoiceAuditData) {
          combinedLogs.push(...invoiceAuditData.map((log: any) => ({
            ...log,
            source_type: 'invoice' as const,
            user_name: profilesMap.get(log.changed_by)?.full_name || 
                      profilesMap.get(log.changed_by)?.username || 
                      'Unknown User'
          })));
        }

        if (!lineItemsError && lineItemsAuditData) {
          combinedLogs.push(...lineItemsAuditData.map((log: any) => ({
            ...log,
            source_type: 'line_item' as const,
            user_name: profilesMap.get(log.changed_by)?.full_name || 
                      profilesMap.get(log.changed_by)?.username || 
                      'Unknown User'
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

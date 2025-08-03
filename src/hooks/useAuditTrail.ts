
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
  log_type: 'INVOICE' | 'LINE_ITEM';
  item_id?: number | null;
  user_name?: string;
};

export const useAuditTrail = (invoiceId: number) => {
  return useQuery({
    queryKey: ['audit-trail', invoiceId],
    queryFn: async () => {
      console.log('Fetching audit trail for invoice:', invoiceId);
      
      let auditLogs: AuditLogEntry[] = [];

      try {
        const { data: auditData, error } = await supabase
          .from('audit_log')
          .select('*')
          .eq('invoice_id', invoiceId)
          .order('changed_at', { ascending: false });

        if (error) throw error;

        const userIds = new Set<string>();
        if (auditData) {
          auditData.forEach((log: any) => {
            if (log.changed_by) userIds.add(log.changed_by);
          });
        }

        let profilesMap = new Map();
        if (userIds.size > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, username')
            .in('id', Array.from(userIds));

          profiles?.forEach((profile: any) => {
            profilesMap.set(profile.id, profile);
          });
        }

        if (auditData) {
          auditLogs = auditData.map((log: any) => ({
            id: log.id,
            field_name: log.field_name,
            old_value: log.old_value,
            new_value: log.new_value,
            change_type: log.change_type,
            changed_by: log.changed_by,
            changed_at: log.changed_at,
            log_type: log.log_type,
            item_id: log.item_id,
            user_name: profilesMap.get(log.changed_by)?.full_name || 
                      profilesMap.get(log.changed_by)?.username || 
                      'Unknown User'
          }));
        }
      } catch (error) {
        console.error('Error fetching audit logs:', error);
        return [];
      }

      console.log('Audit logs:', auditLogs);
      return auditLogs;
    },
    enabled: !!invoiceId,
  });
};

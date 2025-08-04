
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuditLogEntry } from "./useAuditTrail";

export const useUndo = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUndoing, setIsUndoing] = useState(false);

  const getTableName = (logType: 'INVOICE' | 'LINE_ITEM' | 'INVOICE_CODING') => {
    const tableMap = {
      'INVOICE': 'Attachment_Info',
      'LINE_ITEM': 'Line_Items',
      'INVOICE_CODING': 'invoice_coding'
    } as const;
    return tableMap[logType];
  };

  const undoChange = async (logEntry: AuditLogEntry) => {
    setIsUndoing(true);
    const tableName = getTableName(logEntry.log_type as any);
    let error = null;

    try {
      // For INVOICE type, use invoice_id instead of item_id
      const targetId = logEntry.log_type === 'INVOICE' ? logEntry.invoice_id : logEntry.item_id;
      
      if (!targetId) {
        throw new Error(`No ${logEntry.log_type === 'INVOICE' ? 'invoice_id' : 'item_id'} found in the log entry.`);
      }

      // Handle field name mapping for columns with spaces
      const fieldName = logEntry.field_name === 'Responsible User' ? '"Responsible User"' : logEntry.field_name;

      switch (logEntry.change_type) {
        case 'UPDATE':
          if (logEntry.log_type === 'INVOICE_CODING' || logEntry.field_name.startsWith('coding_')) {
            // Handle invoice coding fields
            const cleanFieldName = logEntry.field_name.replace('coding_', '');
            ({ error } = await supabase
              .from('invoice_coding')
              .update({ [cleanFieldName]: logEntry.old_value })
              .eq('id', targetId));
          } else {
            ({ error } = await supabase
              .from(tableName)
              .update({ [fieldName]: logEntry.old_value })
              .eq('id', targetId));
          }
          break;
        case 'INSERT':
          ({ error } = await supabase
            .from(tableName)
            .delete()
            .eq('id', targetId));
          break;
        case 'DELETE':
          toast({
            title: "Undo Not Supported",
            description: "Undo for DELETE operations is not yet implemented.",
            variant: "destructive",
          });
          return;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully reverted the change to ${logEntry.field_name}.`,
      });

      await queryClient.invalidateQueries({ queryKey: ['audit-trail', logEntry.invoice_id] });
      await queryClient.invalidateQueries({ queryKey: ['invoices'] });


    } catch (err) {
      console.error("Undo failed:", err);
      toast({
        title: "Error",
        description: "Failed to undo the action.",
        variant: "destructive",
      });
    } finally {
      setIsUndoing(false);
    }
  };

  return { undoChange, isUndoing };
};


import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuditLogEntry } from "./useAuditTrail";

export const useUndo = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUndoing, setIsUndoing] = useState(false);

  const getTableName = (logType: 'INVOICE' | 'LINE_ITEM') => {
    const tableMap = {
      'INVOICE': 'Attachment_Info',
      'LINE_ITEM': 'Line_Items'
    } as const;
    return tableMap[logType];
  };

  const undoChange = async (logEntry: AuditLogEntry) => {
    setIsUndoing(true);
    const tableName = getTableName(logEntry.log_type);
    let error = null;

    try {
      if (!logEntry.item_id) {
        throw new Error("No item_id found in the log entry.");
      }

      switch (logEntry.change_type) {
        case 'UPDATE':
          ({ error } = await supabase
            .from(tableName)
            .update({ [logEntry.field_name]: logEntry.old_value })
            .eq('id', logEntry.item_id));
          break;
        case 'INSERT':
          ({ error } = await supabase
            .from(tableName)
            .delete()
            .eq('id', logEntry.item_id));
          break;
        case 'DELETE':
          toast({
            title: "Undo Not Supported",
            description: "Undo for DELETE operations is not yet implemented.",
            variant: "destructive",
          });
          break;
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

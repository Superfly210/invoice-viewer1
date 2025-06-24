
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const useToastNotifications = (currentInvoiceId?: number | null) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateInvoiceStatus = async (status: string, responsibleUser?: string) => {
    if (!currentInvoiceId) {
      toast({
        title: "Error",
        description: "No invoice selected",
        variant: "destructive",
      });
      return;
    }

    try {
      const updateData: any = { Status: status };
      if (responsibleUser) {
        updateData["Responsible User"] = responsibleUser;
      }

      const { error } = await supabase
        .from('Attachment_Info')
        .update(updateData)
        .eq('id', currentInvoiceId);

      if (error) throw error;

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['attachment-info'] });
      
      toast({
        title: "Success",
        description: `Invoice ${status.toLowerCase()}${responsibleUser ? ` and forwarded to ${responsibleUser}` : ''}`,
      });
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast({
        title: "Error",
        description: `Failed to update invoice`,
        variant: "destructive",
      });
    }
  };

  const handleApprove = () => {
    updateInvoiceStatus("Approved");
  };

  const handleDeny = () => {
    updateInvoiceStatus("Denied");
  };

  const handleQuarantine = () => {
    updateInvoiceStatus("Hold");
  };

  const handleForward = (userId: string, userName: string) => {
    updateInvoiceStatus("Forwarded", userName);
  };

  return {
    handleApprove,
    handleDeny,
    handleQuarantine,
    handleForward,
  };
};

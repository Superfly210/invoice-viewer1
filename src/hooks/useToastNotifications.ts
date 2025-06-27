
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const useToastNotifications = (currentInvoiceId?: number | null) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateInvoiceStatus = async (status: string) => {
    if (!currentInvoiceId) {
      toast({
        title: "Error",
        description: "No invoice selected",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('Attachment_Info')
        .update({ Status: status })
        .eq('id', currentInvoiceId);

      if (error) throw error;

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['attachment-info'] });
      
      toast({
        title: "Success",
        description: `Invoice ${status.toLowerCase()}`,
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

  const updateResponsibleUser = async (responsibleUser: string) => {
    if (!currentInvoiceId) {
      toast({
        title: "Error",
        description: "No invoice selected",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('Attachment_Info')
        .update({ "Responsible User": responsibleUser })
        .eq('id', currentInvoiceId);

      if (error) throw error;

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['attachment-info'] });
      
      toast({
        title: "Success",
        description: `Invoice forwarded to ${responsibleUser}`,
      });
    } catch (error) {
      console.error('Error forwarding invoice:', error);
      toast({
        title: "Error",
        description: `Failed to forward invoice`,
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
    updateInvoiceStatus("On Hold");
  };

  const handleNotAnInvoice = () => {
    updateInvoiceStatus("Not an Invoice");
  };

  const handleApproveAndForward = (userId: string, userName: string) => {
    // First approve the invoice
    updateInvoiceStatus("Approved");
    // Then forward it
    updateResponsibleUser(userName);
  };

  const handleForward = (userId: string, userName: string) => {
    updateResponsibleUser(userName);
  };

  return {
    handleApprove,
    handleDeny,
    handleQuarantine,
    handleNotAnInvoice,
    handleApproveAndForward,
    handleForward,
  };
};

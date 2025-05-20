
import { useToast } from "@/hooks/use-toast";

export const useToastNotifications = () => {
  const { toast } = useToast();

  const handleApprove = () => {
    toast({
      title: "Invoice Approved",
      description: "The invoice has been successfully approved.",
      variant: "default",
    });
  };

  const handleDeny = () => {
    toast({
      title: "Invoice Denied",
      description: "The invoice has been denied.",
      variant: "destructive",
    });
  };

  const handleQuarantine = () => {
    toast({
      title: "Invoice Quarantined",
      description: "The invoice has been placed in quarantine for further review.",
      variant: "default",
    });
  };

  const handleForward = () => {
    toast({
      title: "Invoice Forwarded",
      description: "The invoice has been forwarded for review.",
    });
  };

  return {
    handleApprove,
    handleDeny,
    handleQuarantine,
    handleForward,
  };
};

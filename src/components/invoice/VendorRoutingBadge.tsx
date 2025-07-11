
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { AttachmentInfo } from "@/hooks/useInvoiceDataFetching";

interface VendorRoutingBadgeProps {
  currentInvoice: AttachmentInfo;
}

export const VendorRoutingBadge = ({ currentInvoice }: VendorRoutingBadgeProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAddToVendorTable = async () => {
    try {
      const { error } = await supabase
        .from('vendor_info')
        .insert({
          invoicing_company_name: currentInvoice.Invoicing_Comp_Name,
          invoicing_company_street: currentInvoice.Invoicing_Comp_Street,
          invoicing_company_city: currentInvoice.Invoicing_Comp_City,
          invoicing_company_province_state: currentInvoice.Invoicing_Comp_State_Prov,
          invoicing_company_post_zip_code: currentInvoice.Invoicing_Comp_Postal_Code,
          gst_number: currentInvoice.GST_Number,
          wcb_number: currentInvoice.WCB_Number,
        });

      if (error) throw error;

      // Update the Company_Routed field to true
      const { error: updateError } = await supabase
        .from('Attachment_Info')
        .update({ Company_Routed: true })
        .eq('id', currentInvoice.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Vendor information added to vendor table successfully",
      });

      // Refresh the invoice data
      queryClient.invalidateQueries({ queryKey: ['attachment-info'] });
    } catch (error) {
      console.error('Error adding vendor info:', error);
      toast({
        title: "Error",
        description: "Failed to add vendor information",
        variant: "destructive",
      });
    }
  };

  if (currentInvoice.Company_Routed) {
    return (
      <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 rounded-full">
        Vendor Info Retrieved from Vendor Table
      </Badge>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleAddToVendorTable}
      className="ml-2 bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200 rounded-full text-xs px-3 py-1"
    >
      Vendor Info Extracted from Invoice. Add info to Vendor Table
    </Button>
  );
};

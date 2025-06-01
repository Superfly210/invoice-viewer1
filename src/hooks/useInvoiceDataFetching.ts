
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type AttachmentInfo = {
  id: number;
  Invoice_Number: string | null;
  Invoicing_Comp_Name: string | null;
  Invoicing_Comp_Street: any | null;
  Invoicing_Comp_City: string | null;
  Invoicing_Comp_State_Prov: string | null;
  Invoicing_Comp_Postal_Code: string | null;
  GST_Number: any | null;
  WCB_Number: any | null;
  Sub_Total: number | null;
  GST_Total: number | null;
  Total: number | null;
  created_at: string;
  Google_Drive_URL: string | null;
  Email_Info_ID: number | null;
}

export const useInvoiceDataFetching = (currentInvoiceIndex: number) => {
  const [invoices, setInvoices] = useState<AttachmentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoiceData();
  }, []);

  const fetchInvoiceData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('Attachment_Info')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      // Convert Google_Drive_URL from Json to string if needed and map database fields to our type
      const processedData = data?.map(item => ({
        id: item.id,
        Invoice_Number: item.Invoice_Number,
        Invoicing_Comp_Name: item.Invoicing_Comp_Name,
        Invoicing_Comp_Street: item.Invoicing_Comp_Street,
        Invoicing_Comp_City: item.Invoicing_Comp_City,
        Invoicing_Comp_State_Prov: item.Invoicing_Comp_State_Province || null,
        Invoicing_Comp_Postal_Code: item.Invoicing_Comp_Postal_Code,
        GST_Number: item.GST_Number,
        WCB_Number: item.WCB_Number,
        Sub_Total: item.Sub_Total,
        GST_Total: item.GST_Total,
        Total: item.Total,
        created_at: item.created_at,
        Google_Drive_URL: item.Google_Drive_URL ? String(item.Google_Drive_URL) : null,
        Email_Info_ID: item.Email_Info_ID
      })) || [];

      setInvoices(processedData as AttachmentInfo[]);
      console.log("Fetched invoices:", processedData.length);
    } catch (error) {
      console.error('Error fetching invoice data:', error);
      toast({
        title: "Error",
        description: "Failed to load invoice data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentGoogleDriveUrl = (): string | null => {
    if (!invoices.length || currentInvoiceIndex >= invoices.length) return null;
    
    const currentInvoice = invoices[currentInvoiceIndex];
    return currentInvoice.Google_Drive_URL;
  };

  const currentInvoice = invoices[currentInvoiceIndex] || null;
  console.log("Current invoice index:", currentInvoiceIndex, "Current invoice:", currentInvoice);

  return {
    invoices,
    isLoading,
    getCurrentGoogleDriveUrl,
    currentInvoice,
  };
};

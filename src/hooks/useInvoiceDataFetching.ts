
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

      // Convert Google_Drive_URL from Json to string if needed
      const processedData = data?.map(item => ({
        ...item,
        Google_Drive_URL: item.Google_Drive_URL ? String(item.Google_Drive_URL) : null
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

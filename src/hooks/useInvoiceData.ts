
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useInvoiceData = (currentInvoiceIndex: number) => {
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(null);
  const [currentInvoiceId, setCurrentInvoiceId] = useState<number | null>(null);
  const [currentEmailInfoId, setCurrentEmailInfoId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get total count of invoices
        const { count, error: countError } = await supabase
          .from('Attachment_Info')
          .select('*', { count: 'exact', head: true });
        
        if (countError) throw countError;
        setTotalInvoices(count || 0);
        
        // Fetch current invoice data
        const { data, error } = await supabase
          .from('Attachment_Info')
          .select('*')
          .order('id', { ascending: true })
          .range(currentInvoiceIndex, currentInvoiceIndex);

        if (error) throw error;
        
        if (data && data.length > 0) {
          // Extract PDF URL correctly
          let url = null;
          if (data[0].Google_Drive_URL) {
            // Handle both object and string types for Google_Drive_URL
            if (typeof data[0].Google_Drive_URL === 'object') {
              url = String(JSON.stringify(data[0].Google_Drive_URL));
            } else {
              url = String(data[0].Google_Drive_URL);
            }
            console.log("Extracted PDF URL:", url);
          }
          
          setCurrentPdfUrl(url);
          setCurrentInvoiceId(data[0].id);
          setCurrentEmailInfoId(data[0].Email_Info_ID);
          console.log("Set current invoice ID to:", data[0].id);
          console.log("Set current email info ID to:", data[0].Email_Info_ID);
        } else {
          console.log("No invoice data found for index:", currentInvoiceIndex);
        }
      } catch (error) {
        console.error('Error fetching invoice data:', error);
        toast({
          title: "Error",
          description: "Failed to load invoice data",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [currentInvoiceIndex, toast]);

  return {
    totalInvoices,
    currentPdfUrl,
    currentInvoiceId,
    currentEmailInfoId,
  };
};


import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AttachmentInfo } from "./useInvoiceDataFetching";

export const useInvoiceFiltering = () => {
  const [userFilter, setUserFilter] = useState<"all" | "mine">("mine");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "hold">("pending");

  // Get current user
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, username')
        .eq('id', user.id)
        .single();
      
      return profile;
    },
  });

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['attachment-info'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Attachment_Info')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      const processedData = data?.map(item => ({
        id: item.id,
        Invoice_Number: item.Invoice_Number,
        Invoice_Date: item.Invoice_Date,
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
        Email_Info_ID: item.Email_Info_ID,
        Email_ID: item.Email_ID,
        "Responsible User": item["Responsible User"],
        Status: item.Status
      })) || [];

      return processedData as AttachmentInfo[];
    },
    staleTime: 1000 * 60 * 5,
  });

  const filteredInvoices = useMemo(() => {
    let filtered = [...invoices];

    // Filter by user
    if (userFilter === "mine" && user) {
      const currentUserName = user.full_name || user.username;
      filtered = filtered.filter(invoice => 
        invoice["Responsible User"] === currentUserName
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      if (statusFilter === "pending") {
        filtered = filtered.filter(invoice => 
          invoice.Status === "Pending Approval" || !invoice.Status
        );
      } else if (statusFilter === "approved") {
        filtered = filtered.filter(invoice => 
          invoice.Status === "Approved"
        );
      } else if (statusFilter === "hold") {
        filtered = filtered.filter(invoice => 
          invoice.Status === "On Hold"
        );
      }
    }

    return filtered;
  }, [invoices, userFilter, statusFilter, user]);

  return {
    filteredInvoices,
    isLoading,
    userFilter,
    setUserFilter,
    statusFilter,
    setStatusFilter,
    totalFilteredCount: filteredInvoices.length,
  };
};

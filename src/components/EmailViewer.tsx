
import { useState, useEffect } from "react";
import { FileText, Paperclip, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type EmailInfo = {
  id_: number;
  created_at: string;
  Date: string | null;
  From: string | null;
  Subject: string | null;
  Email_Mark_Down: string | null;
  cc: string | null;
  Email_Type: string | null;
}

type EmailViewerProps = {
  currentInvoiceId?: number | null;
  emailInfoId?: number | null;
}

export const EmailViewer = ({ currentInvoiceId, emailInfoId }: EmailViewerProps = {}) => {
  const [emailData, setEmailData] = useState<EmailInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmailData();
  }, [currentInvoiceId, emailInfoId]);

  const fetchEmailData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let query = supabase.from('Email_Info').select('*');
      
      // If we have a specific Email_Info ID, query by that
      if (emailInfoId) {
        query = query.eq('id_', emailInfoId);
      } 
      // Otherwise if we have an invoice ID, try to find related email
      else if (currentInvoiceId) {
        // First try to get the Email_Info_ID from Attachment_Info
        const { data: attachmentData, error: attachmentError } = await supabase
          .from('Attachment_Info')
          .select('Email_Info_ID')
          .eq('id', currentInvoiceId)
          .single();
          
        if (attachmentError) {
          console.error("Error fetching related email info:", attachmentError);
          throw new Error("Could not find related email information");
        }
        
        if (attachmentData && attachmentData.Email_Info_ID) {
          query = query.eq('id_', attachmentData.Email_Info_ID);
        } else {
          throw new Error("No email associated with this invoice");
        }
      } else {
        // No specific ID provided, get the most recent email
        query = query.order('created_at', { ascending: false }).limit(1);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // Map the database fields to our EmailInfo type
        const emailInfo: EmailInfo = {
          id_: data[0].id_,
          created_at: data[0].created_at,
          Date: data[0].Date,
          From: data[0].From,
          Subject: data[0].Subject,
          Email_Mark_Down: data[0].Email_Mark_Down,
          cc: data[0].cc,
          Email_Type: data[0].Email_Type
        };
        setEmailData(emailInfo);
      } else {
        setEmailData(null);
        setError("No email data found");
      }
    } catch (error: any) {
      console.error('Error fetching email data:', error);
      setError(error.message || "Failed to load email data");
      toast({
        title: "Error",
        description: "Failed to load email data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading email data...</span>
      </div>
    );
  }
  
  if (error || !emailData) {
    return (
      <div className="flex flex-col justify-center items-center h-full bg-white p-6">
        <p className="text-lg font-semibold text-red-500">
          {error || "No email data available"}
        </p>
        <p className="text-sm text-slate-500 mt-2">
          Try selecting a different invoice or check the database connection.
        </p>
      </div>
    );
  }

  const formattedDate = emailData.Date 
    ? new Date(emailData.Date).toLocaleString() 
    : new Date(emailData.created_at).toLocaleString();

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex justify-between items-center p-3 border-b border-slate-200 bg-slate-50">
        <div className="font-medium">{emailData.From || "No sender information"}</div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <div className="text-lg font-semibold mb-2">{emailData.Subject || "No subject"}</div>
          <div className="text-sm text-slate-500 mb-4">
            Sent: {formattedDate}
            {emailData.cc && <div>CC: {emailData.cc}</div>}
            {emailData.Email_Type && <div>Type: {emailData.Email_Type}</div>}
          </div>
        </div>

        <div className="prose max-w-none text-slate-700 mb-6">
          {emailData.Email_Mark_Down ? (
            <div dangerouslySetInnerHTML={{ __html: emailData.Email_Mark_Down.replace(/\n/g, '<br>') }} />
          ) : (
            <p>No email content available</p>
          )}
        </div>
      </div>
    </div>
  );
};

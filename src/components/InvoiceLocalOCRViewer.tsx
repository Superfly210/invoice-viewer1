import { useState, useEffect } from "react";
import { FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type InvoiceLocalOCRViewerProps = {
  currentInvoiceId?: number | null;
}

export const InvoiceLocalOCRViewer = ({ currentInvoiceId }: InvoiceLocalOCRViewerProps = {}) => {
  const [ocrContent, setOcrContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchOCRData();
  }, [currentInvoiceId]);

  const fetchOCRData = async () => {
    if (!currentInvoiceId) {
      setError("No invoice ID provided");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('Attachment_Info')
        .select('Attach_Local_OCR, File_Name, created_at')
        .eq('id', currentInvoiceId)
        .single();
      
      if (error) {
        throw error;
      }
      
      // Type assertion for column not yet in generated types
      const typedData = data as { Attach_Local_OCR?: string } | null;
      
      if (typedData && typedData.Attach_Local_OCR) {
        setOcrContent(typedData.Attach_Local_OCR);
      } else {
        setOcrContent(null);
        setError("No local OCR content available for this invoice");
      }
    } catch (error: any) {
      console.error('Error fetching local OCR data:', error);
      setError(error.message || "Failed to load local OCR data");
      toast({
        title: "Error",
        description: "Failed to load local OCR data",
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
        <span className="ml-2">Loading local OCR content...</span>
      </div>
    );
  }
  
  if (error || !ocrContent) {
    return (
      <div className="flex flex-col justify-center items-center h-full bg-white p-6">
        <FileText className="h-12 w-12 text-slate-400 mb-4" />
        <p className="text-lg font-semibold text-red-500">
          {error || "No local OCR content available"}
        </p>
        <p className="text-sm text-slate-500 mt-2 text-center">
          This invoice doesn't have any local OCR content associated with it.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex justify-between items-center p-3 border-b border-slate-200 bg-slate-50">
        <div className="font-medium flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          Invoice Local OCR
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="prose max-w-none text-slate-700">
          <pre className="whitespace-pre-wrap font-mono text-sm bg-slate-50 p-4 rounded-md border">
            {ocrContent}
          </pre>
        </div>
      </div>
    </div>
  );
}; 
/**
 * Custom hook for managing invoice submissions data
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Submission } from "../types";

export function useSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSubmissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('invoice_submissions')
        .select('*')
        .eq('submitted_by', user.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setSubmissions((data as unknown as Submission[]) || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load submissions",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteSubmission = async (id: string) => {
    try {
      const { error } = await supabase
        .from('invoice_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSubmissions(prev => prev.filter(sub => sub.id !== id));
      
      toast({
        title: "Success",
        description: "Submission deleted successfully",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete submission",
      });
      throw error;
    }
  };

  const downloadFile = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('submission-files')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() || 'invoice.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Could not download the file",
      });
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  return {
    submissions,
    loading,
    fetchSubmissions,
    deleteSubmission,
    downloadFile,
  };
}

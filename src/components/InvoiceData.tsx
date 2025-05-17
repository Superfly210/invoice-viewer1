
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Loader2, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type AttachmentInfo = {
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

export const InvoiceData = () => {
  const [invoices, setInvoices] = useState<AttachmentInfo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [companyDetailsOpen, setCompanyDetailsOpen] = useState(false);
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

  // Get the current invoice's Google Drive URL (if any)
  const getCurrentGoogleDriveUrl = (): string | null => {
    if (!invoices.length || currentIndex >= invoices.length) return null;
    
    const currentInvoice = invoices[currentIndex];
    return currentInvoice.Google_Drive_URL;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading invoice data...</span>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">No Invoice Data Available</h2>
        <p className="text-slate-600 dark:text-slate-400">
          There are no invoices in the database. Try adding some data to the 'Attachment_Info' table.
        </p>
      </div>
    );
  }

  const currentInvoice = invoices[currentIndex];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4">
      <div className="overflow-x-auto">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium w-1/3">ID</TableCell>
              <TableCell className="text-left">{currentInvoice.id}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium w-1/3">Invoice Number</TableCell>
              <TableCell className="text-left">{currentInvoice.Invoice_Number || 'N/A'}</TableCell>
            </TableRow>
            
            <TableRow>
              <TableCell className="font-medium w-1/3">Company Name</TableCell>
              <TableCell className="text-left">{currentInvoice.Invoicing_Comp_Name || 'N/A'}</TableCell>
            </TableRow>
            
            <TableRow>
              <TableCell colSpan={2} className="p-0 border-0">
                <Collapsible open={companyDetailsOpen} onOpenChange={setCompanyDetailsOpen} className="w-full">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-full flex justify-center items-center rounded-none bg-slate-50 dark:bg-slate-900/50">
                      {companyDetailsOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                        {companyDetailsOpen ? "Hide details" : "Show company details"}
                      </span>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium w-1/3">Company Street</TableCell>
                          <TableCell className="text-left">{JSON.stringify(currentInvoice.Invoicing_Comp_Street) || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium w-1/3">Company City</TableCell>
                          <TableCell className="text-left">{currentInvoice.Invoicing_Comp_City || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium w-1/3">Company State/Province</TableCell>
                          <TableCell className="text-left">{currentInvoice.Invoicing_Comp_State_Prov || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium w-1/3">Postal Code</TableCell>
                          <TableCell className="text-left">{currentInvoice.Invoicing_Comp_Postal_Code || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium w-1/3">GST Number</TableCell>
                          <TableCell className="text-left">{currentInvoice.GST_Number ? JSON.stringify(currentInvoice.GST_Number) : 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium w-1/3">WCB Number</TableCell>
                          <TableCell className="text-left">{currentInvoice.WCB_Number ? JSON.stringify(currentInvoice.WCB_Number) : 'N/A'}</TableCell>
                        </TableRow>
                        {currentInvoice.Google_Drive_URL && (
                          <TableRow>
                            <TableCell className="font-medium w-1/3">Google Drive URL</TableCell>
                            <TableCell className="text-left">
                              <a 
                                href={currentInvoice.Google_Drive_URL} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-600 hover:underline truncate block"
                              >
                                {currentInvoice.Google_Drive_URL}
                              </a>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CollapsibleContent>
                </Collapsible>
              </TableCell>
            </TableRow>
            
            <TableRow>
              <TableCell className="font-medium w-1/3">Subtotal</TableCell>
              <TableCell className="text-left">{currentInvoice.Sub_Total?.toFixed(2) || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium w-1/3">GST Total</TableCell>
              <TableCell className="text-left">{currentInvoice.GST_Total?.toFixed(2) || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium w-1/3">Total</TableCell>
              <TableCell className="text-left">{currentInvoice.Total?.toFixed(2) || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium w-1/3">Created At</TableCell>
              <TableCell className="text-left">{new Date(currentInvoice.created_at).toLocaleString()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

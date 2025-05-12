
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Loader2, ChevronLeft, ChevronRight, Plus, ChevronDown } from "lucide-react";
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
        .from('Attachment Info')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      setInvoices(data || []);
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

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
    // Reset collapsible state when navigating to new invoice
    setCompanyDetailsOpen(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < invoices.length - 1 ? prev + 1 : prev));
    // Reset collapsible state when navigating to new invoice
    setCompanyDetailsOpen(false);
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
          There are no invoices in the database. Try adding some data to the 'Attachment Info' table.
        </p>
      </div>
    );
  }

  const currentInvoice = invoices[currentIndex];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
          Invoice {currentIndex + 1} of {invoices.length}
        </h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentIndex === invoices.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium w-1/3">ID</TableCell>
              <TableCell>{currentInvoice.id}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Invoice Number</TableCell>
              <TableCell>{currentInvoice.Invoice_Number || 'N/A'}</TableCell>
            </TableRow>
            <Collapsible open={companyDetailsOpen} onOpenChange={setCompanyDetailsOpen}>
              <TableRow>
                <TableCell className="font-medium">Company Name</TableCell>
                <TableCell>{currentInvoice.Invoicing_Comp_Name || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={2} className="p-2 bg-slate-50 dark:bg-slate-900/50">
                  <div className="flex justify-center w-full">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-full flex justify-center items-center">
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
                  </div>
                </TableCell>
              </TableRow>
              <CollapsibleContent>
                <TableRow>
                  <TableCell className="font-medium">Company Street</TableCell>
                  <TableCell>{JSON.stringify(currentInvoice.Invoicing_Comp_Street) || 'N/A'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Company City</TableCell>
                  <TableCell>{currentInvoice.Invoicing_Comp_City || 'N/A'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Company State/Province</TableCell>
                  <TableCell>{currentInvoice.Invoicing_Comp_State_Prov || 'N/A'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Postal Code</TableCell>
                  <TableCell>{currentInvoice.Invoicing_Comp_Postal_Code || 'N/A'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">GST Number</TableCell>
                  <TableCell>{currentInvoice.GST_Number ? JSON.stringify(currentInvoice.GST_Number) : 'N/A'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">WCB Number</TableCell>
                  <TableCell>{currentInvoice.WCB_Number ? JSON.stringify(currentInvoice.WCB_Number) : 'N/A'}</TableCell>
                </TableRow>
              </CollapsibleContent>
            </Collapsible>
            <TableRow>
              <TableCell className="font-medium">Subtotal</TableCell>
              <TableCell>{currentInvoice.Sub_Total?.toFixed(2) || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">GST Total</TableCell>
              <TableCell>{currentInvoice.GST_Total?.toFixed(2) || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Total</TableCell>
              <TableCell>{currentInvoice.Total?.toFixed(2) || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Created At</TableCell>
              <TableCell>{new Date(currentInvoice.created_at).toLocaleString()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

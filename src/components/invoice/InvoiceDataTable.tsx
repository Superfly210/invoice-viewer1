
import { useState } from "react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { CompanyDetails } from "./CompanyDetails";
import { EditableTableCell } from "./EditableTableCell";
import { InvoiceCodingTable } from "./InvoiceCodingTable";
import { VendorCombobox } from "./VendorCombobox";
import { AttachmentInfo } from "@/hooks/useInvoiceDataFetching";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { formatCurrency, parseCurrencyValue } from "@/lib/currencyFormatter";
import { useSubtotalComparison } from "@/hooks/useSubtotalComparison";
import { useFinancialValidation } from "@/hooks/useFinancialValidation";
import { useGstComparison } from "@/hooks/useGstComparison";
import { logAuditChange } from "@/utils/auditLogger";
import { useAuth } from "@/components/AuthProvider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface InvoiceDataTableProps {
  currentInvoice: AttachmentInfo;
}

type VendorInfo = {
  id: number;
  invoicing_company_name: string | null;
  invoicing_company_street: string | null;
  invoicing_company_city: string | null;
  invoicing_company_province_state: string | null;
  invoicing_company_post_zip_code: string | null;
  gst_number: string | null;
  wcb_number: string | null;
  Prompt_Line_Items: string | null;
  match_criteria_1: string | null;
  match_criteria_2: string | null;
};

export const InvoiceDataTable = ({ currentInvoice }: InvoiceDataTableProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [pendingVendor, setPendingVendor] = useState<VendorInfo | null>(null);
  const [showVendorConfirmDialog, setShowVendorConfirmDialog] = useState(false);

  // Fetch coding total and line items total for comparison
  const { data: codingTotal = 0 } = useQuery({
    queryKey: ['invoice-coding-total', currentInvoice.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoice_coding')
        .select('total')
        .eq('invoice_id', currentInvoice.id);
      
      if (error) throw error;
      return data.reduce((acc, item) => acc + (item.total || 0), 0);
    },
  });

  // Fetch line items totals for GST comparison
  const { data: lineItemsData } = useQuery({
    queryKey: ['line-items-data', currentInvoice.id],
    queryFn: async () => {
      const { data: lineItemsRaw, error: lineItemsError } = await supabase
        .from('Line_Items')
        .select('id, Total')
        .eq('invoice_id', currentInvoice.id);
      
      if (lineItemsError) throw lineItemsError;

      const lineItemIds = lineItemsRaw?.map(item => item.id) || [];
      
      if (lineItemIds.length === 0) {
        return { lineItemsTotal: 0, gstSum: 0 };
      }

      const { data: quantitiesData, error: quantitiesError } = await supabase
        .from('Quantities')
        .select('calc_total, calc_gst')
        .in('line_items_id', lineItemIds);
      
      if (quantitiesError) throw quantitiesError;

      const lineItemsTotal = quantitiesData?.reduce((acc, item) => acc + (item.calc_total || 0), 0) || 0;
      const gstSum = quantitiesData?.reduce((acc, item) => acc + (item.calc_gst || 0), 0) || 0;

      return { lineItemsTotal, gstSum };
    },
  });

  const lineItemsTotal = lineItemsData?.lineItemsTotal || 0;
  const lineItemsGstSum = lineItemsData?.gstSum || 0;

  // Use subtotal comparison hook
  const subtotalComparison = useSubtotalComparison({
    invoiceSubtotal: currentInvoice.Sub_Total,
    codingTotal,
    lineItemsTotal
  });

  // Use financial validation hook (only for total validation)
  const financialValidation = useFinancialValidation({
    subTotal: currentInvoice.Sub_Total,
    gstTotal: currentInvoice.GST_Total,
    total: currentInvoice.Total
  });

  // Use GST comparison hook
  const gstComparison = useGstComparison({
    invoiceGstTotal: currentInvoice.GST_Total,
    lineItemsGstSum: lineItemsGstSum
  });

  const { data: currentUserProfile } = useQuery({
    queryKey: ['current-user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, username')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      return data;
    },
    enabled: !!user?.id,
  });

  const handleFieldUpdate = async (field: string, newValue: string) => {
    try {
      const oldValue = currentInvoice[field as keyof AttachmentInfo];
      
      queryClient.setQueryData(['attachment-info'], (oldData: AttachmentInfo[] | undefined) => {
        if (!oldData) return oldData;
        
        return oldData.map(invoice => 
          invoice.id === currentInvoice.id 
            ? { ...invoice, [field]: newValue }
            : invoice
        );
      });
      
      let processedValue: any = newValue;
      
      if (field === 'Sub_Total' || field === 'GST_Total' || field === 'Total') {
        processedValue = parseCurrencyValue(newValue);
      }

      const { error } = await supabase
        .from('Attachment_Info')
        .update({ [field]: processedValue })
        .eq('id', currentInvoice.id);

      if (error) {
        console.error('Error updating field:', error);
        queryClient.invalidateQueries({ queryKey: ['attachment-info'] });
        toast({
          title: "Error",
          description: `Failed to update ${field}`,
          variant: "destructive",
        });
      } else {
        await logAuditChange(currentInvoice.id, 'INVOICE', field, oldValue, newValue);
        
        toast({
          title: "Success",
          description: `${field} updated successfully`,
        });
        queryClient.invalidateQueries({ queryKey: ['attachment-info'] });
        queryClient.invalidateQueries({ queryKey: ['attachment-info-summary'] });
        queryClient.invalidateQueries({ queryKey: ['audit-trail', currentInvoice.id] });
      }
    } catch (error) {
      console.error('Error updating field:', error);
      queryClient.invalidateQueries({ queryKey: ['attachment-info'] });
      toast({
        title: "Error",
        description: `Failed to update ${field}`,
        variant: "destructive",
      });
    }
  };

  const handleVendorSelect = (vendor: VendorInfo) => {
    setPendingVendor(vendor);
    setShowVendorConfirmDialog(true);
  };

  const handleConfirmVendorSelection = async () => {
    if (!pendingVendor) return;

    try {
      const { error } = await supabase
        .from('Attachment_Info')
        .update({
          Invoicing_Comp_Name: pendingVendor.invoicing_company_name,
          Invoicing_Comp_Street: pendingVendor.invoicing_company_street,
          Invoicing_Comp_City: pendingVendor.invoicing_company_city,
          Invoicing_Comp_State_Prov: pendingVendor.invoicing_company_province_state,
          Invoicing_Comp_Postal_Code: pendingVendor.invoicing_company_post_zip_code,
          GST_Number: pendingVendor.gst_number,
          WCB_Number: pendingVendor.wcb_number,
          Company_Routed: true,
        })
        .eq('id', currentInvoice.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vendor information applied successfully",
      });

      queryClient.invalidateQueries({ queryKey: ['attachment-info'] });
      setShowVendorConfirmDialog(false);
      setPendingVendor(null);
    } catch (error) {
      console.error('Error applying vendor info:', error);
      toast({
        title: "Error",
        description: "Failed to apply vendor information",
        variant: "destructive",
      });
    }
  };

  const getStatusHighlighting = (status: string | null) => {
    if (!status) return "";
    
    switch (status) {
      case "Pending Approval":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "Approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "On Hold":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "Denied":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default:
        return "";
    }
  };

  const getResponsibleUserHighlighting = (responsibleUser: string | null) => {
    if (!responsibleUser || !user || !currentUserProfile) return "";
    
    const currentUserName = currentUserProfile.full_name || currentUserProfile.username;
    const isCurrentUser = responsibleUser === currentUserName;
    
    if (isCurrentUser) {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
    } else {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
    }
  };

  const getCompanyNameHighlighting = () => {
    return currentInvoice.Company_Routed
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100";
  };

  const getCompanyNameTooltip = () => {
    return currentInvoice.Company_Routed
      ? "Vendor Info Retrieved from Vendor Table"
      : "Vendor Info Extracted from Invoice";
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableBody>
          <TableRow className="h-12">
            <TableCell className="font-medium w-40 text-left py-2">Invoice ID</TableCell>
            <TableCell className="text-left py-2">{currentInvoice.id}</TableCell>
          </TableRow>
          <TableRow className="h-12">
            <TableCell className="font-medium w-40 text-left py-2">Responsible User</TableCell>
            <TableCell className="text-left py-2">
              <span className={`px-2 py-1 rounded ${getResponsibleUserHighlighting(currentInvoice["Responsible User"])}`}>
                {currentInvoice["Responsible User"] || 'N/A'}
              </span>
            </TableCell>
          </TableRow>
          <TableRow className="h-12">
            <TableCell className="font-medium w-40 text-left py-2">Status</TableCell>
            <TableCell className="text-left py-2">
              <span className={`px-2 py-1 rounded ${getStatusHighlighting(currentInvoice.Status)}`}>
                {currentInvoice.Status || 'N/A'}
              </span>
            </TableCell>
          </TableRow>
          <TableRow className="h-12">
            <TableCell className="font-medium w-40 text-left py-2">Invoice Number</TableCell>
            <TableCell className="text-left py-2 group">
              <EditableTableCell
                value={currentInvoice.Invoice_Number}
                onSave={(newValue) => handleFieldUpdate('Invoice_Number', newValue)}
              />
            </TableCell>
          </TableRow>
          <TableRow className="h-12">
            <TableCell className="font-medium w-40 text-left py-2">Invoice Date</TableCell>
            <TableCell className="text-left py-2 group">
              <EditableTableCell
                value={currentInvoice.Invoice_Date}
                onSave={(newValue) => handleFieldUpdate('Invoice_Date', newValue)}
                type="date"
              />
            </TableCell>
          </TableRow>
          
          <TableRow>
            <TableCell className="font-medium w-40 text-left align-middle">Company Name</TableCell>
            <TableCell className="text-left py-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center group w-full gap-1">
                      <EditableTableCell
                        value={currentInvoice.Invoicing_Comp_Name}
                        onSave={(newValue) => handleFieldUpdate('Invoicing_Comp_Name', newValue)}
                        highlightClass={getCompanyNameHighlighting()}
                      />
                      <VendorCombobox
                        value={currentInvoice.Invoicing_Comp_Name}
                        onVendorSelect={handleVendorSelect}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getCompanyNameTooltip()}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableCell>
          </TableRow>
          
          <AlertDialog open={showVendorConfirmDialog} onOpenChange={setShowVendorConfirmDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Vendor Selection</AlertDialogTitle>
                <AlertDialogDescription>
                  This will overwrite the current company information with:
                  <br /><br />
                  <strong>Company:</strong> {pendingVendor?.invoicing_company_name}<br />
                  <strong>Street:</strong> {pendingVendor?.invoicing_company_street}<br />
                  <strong>City:</strong> {pendingVendor?.invoicing_company_city}<br />
                  <strong>Province:</strong> {pendingVendor?.invoicing_company_province_state}<br />
                  <strong>Postal:</strong> {pendingVendor?.invoicing_company_post_zip_code}<br />
                  <strong>GST:</strong> {pendingVendor?.gst_number}<br />
                  <strong>WCB:</strong> {pendingVendor?.wcb_number}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setPendingVendor(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmVendorSelection}>Confirm</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <CompanyDetails currentInvoice={currentInvoice} />
          
          <TableRow className="h-12">
            <TableCell className="font-medium w-40 text-left py-2">Subtotal</TableCell>
            <TableCell className="text-left py-2 group">
                <EditableTableCell
                  value={currentInvoice.Sub_Total !== null && currentInvoice.Sub_Total !== undefined ? formatCurrency(currentInvoice.Sub_Total) : 'N/A'}
                  onSave={(newValue) => handleFieldUpdate('Sub_Total', newValue)}
                  type="text"
                  highlightClass={subtotalComparison.highlightClass}
                />
            </TableCell>
          </TableRow>
          <TableRow className="h-12">
            <TableCell className="font-medium w-40 text-left py-2">GST Total</TableCell>
            <TableCell className="text-left py-2 group">
                <EditableTableCell
                  value={currentInvoice.GST_Total !== null && currentInvoice.GST_Total !== undefined ? formatCurrency(currentInvoice.GST_Total) : 'N/A'}
                  onSave={(newValue) => handleFieldUpdate('GST_Total', newValue)}
                  type="text"
                  highlightClass={gstComparison.highlightClass}
                />
            </TableCell>
          </TableRow>
          <TableRow className="h-12">
            <TableCell className="font-medium w-40 text-left py-2">Total</TableCell>
            <TableCell className="text-left py-2 group">
                <EditableTableCell
                  value={currentInvoice.Total !== null && currentInvoice.Total !== undefined ? formatCurrency(currentInvoice.Total) : 'N/A'}
                  onSave={(newValue) => handleFieldUpdate('Total', newValue)}
                  type="text"
                  highlightClass={financialValidation.totalValidationClass}
                />
            </TableCell>
          </TableRow>
          
          <TableRow>
            <TableCell colSpan={2} className="p-0">
              <InvoiceCodingTable invoiceId={currentInvoice.id} currentInvoice={currentInvoice} lineItemsTotal={lineItemsTotal} />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

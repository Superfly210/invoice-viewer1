
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { CompanyDetails } from "./CompanyDetails";
import { EditableTableCell } from "./EditableTableCell";
import { InvoiceCodingTable } from "./InvoiceCodingTable";
import { AttachmentInfo } from "@/hooks/useInvoiceDataFetching";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { formatCurrency, parseCurrencyValue } from "@/lib/currencyFormatter";
import { useSubtotalComparison } from "@/hooks/useSubtotalComparison";
import { logAuditChange } from "@/utils/auditLogger";
import { useAuth } from "@/components/AuthProvider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface InvoiceDataTableProps {
  currentInvoice: AttachmentInfo;
}

export const InvoiceDataTable = ({ currentInvoice }: InvoiceDataTableProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

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

  const { data: lineItemsTotal = 0 } = useQuery({
    queryKey: ['line-items-total', currentInvoice.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Line_Items')
        .select('Total')
        .eq('invoice_id', currentInvoice.id);
      
      if (error) throw error;
      return data.reduce((acc, item) => acc + (item.Total || 0), 0);
    },
  });

  // Use subtotal comparison hook
  const subtotalComparison = useSubtotalComparison({
    invoiceSubtotal: currentInvoice.Sub_Total,
    codingTotal,
    lineItemsTotal
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

  const handleAddToVendorTable = async () => {
    try {
      const { error } = await supabase
        .from('vendor_info')
        .insert({
          invoicing_company_name: currentInvoice.Invoicing_Comp_Name,
          invoicing_company_street: currentInvoice.Invoicing_Comp_Street,
          invoicing_company_city: currentInvoice.Invoicing_Comp_City,
          invoicing_company_province_state: currentInvoice.Invoicing_Comp_State_Prov,
          invoicing_company_post_zip_code: currentInvoice.Invoicing_Comp_Postal_Code,
          gst_number: currentInvoice.GST_Number,
          wcb_number: currentInvoice.WCB_Number,
        });

      if (error) throw error;

      const { error: updateError } = await supabase
        .from('Attachment_Info')
        .update({ Company_Routed: true })
        .eq('id', currentInvoice.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Vendor information added to vendor table successfully",
      });

      queryClient.invalidateQueries({ queryKey: ['attachment-info'] });
    } catch (error) {
      console.error('Error adding vendor info:', error);
      toast({
        title: "Error",
        description: "Failed to add vendor information",
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
          <TableRow className="h-16">
            <TableCell className="font-medium w-48 text-left py-3">ID</TableCell>
            <TableCell className="text-left py-3">{currentInvoice.id}</TableCell>
          </TableRow>
          <TableRow className="h-16">
            <TableCell className="font-medium w-48 text-left py-3">Created At</TableCell>
            <TableCell className="text-left py-3">{new Date(currentInvoice.created_at).toLocaleString()}</TableCell>
          </TableRow>
          <TableRow className="h-16">
            <TableCell className="font-medium w-48 text-left py-3">Email ID</TableCell>
            <TableCell className="text-left py-3">{currentInvoice.Email_ID || 'N/A'}</TableCell>
          </TableRow>
          <TableRow className="h-16">
            <TableCell className="font-medium w-48 text-left py-3">Google Drive URL</TableCell>
            <TableCell className="text-left py-3">
              {currentInvoice.Google_Drive_URL ? (
                <a 
                  href={currentInvoice.Google_Drive_URL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  View Document
                </a>
              ) : (
                'N/A'
              )}
            </TableCell>
          </TableRow>
          <TableRow className="h-16">
            <TableCell className="font-medium w-48 text-left py-3">Responsible User</TableCell>
            <TableCell className="text-left py-3">
              <span className={`px-2 py-1 rounded ${getResponsibleUserHighlighting(currentInvoice["Responsible User"])}`}>
                {currentInvoice["Responsible User"] || 'N/A'}
              </span>
            </TableCell>
          </TableRow>
          <TableRow className="h-16">
            <TableCell className="font-medium w-48 text-left py-3">Status</TableCell>
            <TableCell className="text-left py-3">
              <span className={`px-2 py-1 rounded ${getStatusHighlighting(currentInvoice.Status)}`}>
                {currentInvoice.Status || 'N/A'}
              </span>
            </TableCell>
          </TableRow>
          <TableRow className="h-16">
            <TableCell className="font-medium w-48 text-left py-3">Invoice Number</TableCell>
            <TableCell className="text-left py-3">
              <EditableTableCell
                value={currentInvoice.Invoice_Number}
                onSave={(newValue) => handleFieldUpdate('Invoice_Number', newValue)}
              />
            </TableCell>
          </TableRow>
          <TableRow className="h-16">
            <TableCell className="font-medium w-48 text-left py-3">Invoice Date</TableCell>
            <TableCell className="text-left py-3">
              <EditableTableCell
                value={currentInvoice.Invoice_Date}
                onSave={(newValue) => handleFieldUpdate('Invoice_Date', newValue)}
                type="date"
              />
            </TableCell>
          </TableRow>
          
          <TableRow>
            <TableCell className="font-medium w-48 text-left align-middle">Company Name</TableCell>
            <TableCell className="text-left py-3 flex items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex-grow">
                      <EditableTableCell
                        value={currentInvoice.Invoicing_Comp_Name}
                        onSave={(newValue) => handleFieldUpdate('Invoicing_Comp_Name', newValue)}
                        className={`px-2 py-1 rounded ${getCompanyNameHighlighting()}`}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getCompanyNameTooltip()}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {!currentInvoice.Company_Routed && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddToVendorTable}
                  className="ml-2 bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200 rounded-full text-xs px-3 py-1"
                >
                  Add to Vendor Table
                </Button>
              )}
            </TableCell>
          </TableRow>
          
          <CompanyDetails currentInvoice={currentInvoice} />
          
          <TableRow className="h-16">
            <TableCell className="font-medium w-48 text-left py-3">Subtotal</TableCell>
            <TableCell className="text-left py-3">
              <div className={`inline-block px-2 py-1 rounded ${subtotalComparison.highlightClass}`}>
                <EditableTableCell
                  value={currentInvoice.Sub_Total ? formatCurrency(currentInvoice.Sub_Total) : null}
                  onSave={(newValue) => handleFieldUpdate('Sub_Total', newValue)}
                  type="text"
                />
              </div>
            </TableCell>
          </TableRow>
          <TableRow className="h-16">
            <TableCell className="font-medium w-48 text-left py-3">GST Total</TableCell>
            <TableCell className="text-left py-3">
              <EditableTableCell
                value={currentInvoice.GST_Total ? formatCurrency(currentInvoice.GST_Total) : null}
                onSave={(newValue) => handleFieldUpdate('GST_Total', newValue)}
                type="text"
              />
            </TableCell>
          </TableRow>
          <TableRow className="h-16">
            <TableCell className="font-medium w-48 text-left py-3">Total</TableCell>
            <TableCell className="text-left py-3">
              <EditableTableCell
                value={currentInvoice.Total ? formatCurrency(currentInvoice.Total) : null}
                onSave={(newValue) => handleFieldUpdate('Total', newValue)}
                type="text"
              />
            </TableCell>
          </TableRow>
          
          <TableRow>
            <TableCell colSpan={2} className="p-0">
              <InvoiceCodingTable invoiceId={currentInvoice.id} />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};


import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { CompanyDetails } from "./CompanyDetails";
import { EditableTableCell } from "./EditableTableCell";
import { InvoiceCodingTable } from "./InvoiceCodingTable";
import { VendorRoutingBadge } from "./VendorRoutingBadge";
import { AttachmentInfo } from "@/hooks/useInvoiceDataFetching";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency, parseCurrencyValue } from "@/lib/currencyFormatter";
import { logInvoiceChange } from "@/utils/auditLogger";
import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "@tanstack/react-query";

interface InvoiceDataTableProps {
  currentInvoice: AttachmentInfo;
}

export const InvoiceDataTable = ({ currentInvoice }: InvoiceDataTableProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch current user's profile to compare with responsible user
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
      console.log(`Updating ${field} to:`, newValue);
      
      // Get old value for audit trail
      const oldValue = currentInvoice[field as keyof AttachmentInfo];
      
      // Optimistic update - immediately update the cache
      queryClient.setQueryData(['attachment-info'], (oldData: AttachmentInfo[] | undefined) => {
        if (!oldData) return oldData;
        
        return oldData.map(invoice => 
          invoice.id === currentInvoice.id 
            ? { ...invoice, [field]: newValue }
            : invoice
        );
      });
      
      // Convert string values to appropriate types for database
      let processedValue: any = newValue;
      
      if (field === 'Sub_Total' || field === 'GST_Total' || field === 'Total') {
        // Use the currency parser for monetary fields
        processedValue = parseCurrencyValue(newValue);
      }

      const { error } = await supabase
        .from('Attachment_Info')
        .update({ [field]: processedValue })
        .eq('id', currentInvoice.id);

      if (error) {
        console.error('Error updating field:', error);
        // Revert optimistic update on error
        queryClient.invalidateQueries({ queryKey: ['attachment-info'] });
        toast({
          title: "Error",
          description: `Failed to update ${field}`,
          variant: "destructive",
        });
      } else {
        // Log the change to audit trail
        await logInvoiceChange(currentInvoice.id, field, oldValue, newValue);
        
        toast({
          title: "Success",
          description: `${field} updated successfully`,
        });
        // Refresh to ensure data consistency
        queryClient.invalidateQueries({ queryKey: ['attachment-info'] });
        queryClient.invalidateQueries({ queryKey: ['attachment-info-summary'] });
        queryClient.invalidateQueries({ queryKey: ['audit-trail', currentInvoice.id] });
      }
    } catch (error) {
      console.error('Error updating field:', error);
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['attachment-info'] });
      toast({
        title: "Error",
        description: `Failed to update ${field}`,
        variant: "destructive",
      });
    }
  };

  // Helper function to get status highlighting
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

  // Helper function to get responsible user highlighting
  const getResponsibleUserHighlighting = (responsibleUser: string | null) => {
    if (!responsibleUser || !user || !currentUserProfile) return "";
    
    // Compare with current user's full name or username
    const currentUserName = currentUserProfile.full_name || currentUserProfile.username;
    const isCurrentUser = responsibleUser === currentUserName;
    
    if (isCurrentUser) {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
    } else {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
    }
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
          
          <TableRow className="h-16">
            <TableCell className="font-medium w-48 text-left py-3">Company Name</TableCell>
            <TableCell className="text-left py-3 flex items-center">
              <EditableTableCell
                value={currentInvoice.Invoicing_Comp_Name}
                onSave={(newValue) => handleFieldUpdate('Invoicing_Comp_Name', newValue)}
              />
              <VendorRoutingBadge currentInvoice={currentInvoice} />
            </TableCell>
          </TableRow>
          
          <CompanyDetails currentInvoice={currentInvoice} />
          
          <TableRow className="h-16">
            <TableCell className="font-medium w-48 text-left py-3">Subtotal</TableCell>
            <TableCell className="text-left py-3">
              <EditableTableCell
                value={currentInvoice.Sub_Total ? formatCurrency(currentInvoice.Sub_Total) : null}
                onSave={(newValue) => handleFieldUpdate('Sub_Total', newValue)}
                type="text"
              />
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

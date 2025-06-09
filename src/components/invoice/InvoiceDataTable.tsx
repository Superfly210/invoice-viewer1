
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { CompanyDetails } from "./CompanyDetails";
import { EditableTableCell } from "./EditableTableCell";
import { AttachmentInfo } from "@/hooks/useInvoiceDataFetching";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency, parseCurrencyValue } from "@/lib/currencyFormatter";

interface InvoiceDataTableProps {
  currentInvoice: AttachmentInfo;
}

export const InvoiceDataTable = ({ currentInvoice }: InvoiceDataTableProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFieldUpdate = async (field: string, newValue: string) => {
    try {
      console.log(`Updating ${field} to:`, newValue);
      
      // Convert string values to appropriate types
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
        toast({
          title: "Error",
          description: `Failed to update ${field}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `${field} updated successfully`,
        });
        // Refresh the data with more specific query invalidation
        queryClient.invalidateQueries({ queryKey: ['attachment-info'] });
        queryClient.invalidateQueries({ queryKey: ['invoice-data'] });
      }
    } catch (error) {
      console.error('Error updating field:', error);
      toast({
        title: "Error",
        description: `Failed to update ${field}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium w-1/3 text-left">ID</TableCell>
            <TableCell className="text-left">{currentInvoice.id}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium w-1/3 text-left">Created At</TableCell>
            <TableCell className="text-left">{new Date(currentInvoice.created_at).toLocaleString()}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium w-1/3 text-left">Email ID</TableCell>
            <TableCell className="text-left">
              <EditableTableCell
                value={currentInvoice.Email_ID}
                onSave={(newValue) => handleFieldUpdate('Email_ID', newValue)}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium w-1/3 text-left">Responsible User</TableCell>
            <TableCell className="text-left">
              <EditableTableCell
                value={currentInvoice["Responsible User"]}
                onSave={(newValue) => handleFieldUpdate('Responsible User', newValue)}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium w-1/3 text-left">Status</TableCell>
            <TableCell className="text-left">
              <EditableTableCell
                value={currentInvoice.Status}
                onSave={(newValue) => handleFieldUpdate('Status', newValue)}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium w-1/3 text-left">Invoice Number</TableCell>
            <TableCell className="text-left">
              <EditableTableCell
                value={currentInvoice.Invoice_Number}
                onSave={(newValue) => handleFieldUpdate('Invoice_Number', newValue)}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium w-1/3 text-left">Invoice Date</TableCell>
            <TableCell className="text-left">
              <EditableTableCell
                value={currentInvoice.Invoice_Date}
                onSave={(newValue) => handleFieldUpdate('Invoice_Date', newValue)}
                type="date"
              />
            </TableCell>
          </TableRow>
          
          <TableRow>
            <TableCell className="font-medium w-1/3 text-left">Company Name</TableCell>
            <TableCell className="text-left">
              <EditableTableCell
                value={currentInvoice.Invoicing_Comp_Name}
                onSave={(newValue) => handleFieldUpdate('Invoicing_Comp_Name', newValue)}
              />
            </TableCell>
          </TableRow>
          
          <CompanyDetails currentInvoice={currentInvoice} />
          
          <TableRow>
            <TableCell className="font-medium w-1/3 text-left">Subtotal</TableCell>
            <TableCell className="text-left">
              <EditableTableCell
                value={currentInvoice.Sub_Total ? formatCurrency(currentInvoice.Sub_Total) : null}
                onSave={(newValue) => handleFieldUpdate('Sub_Total', newValue)}
                type="text"
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium w-1/3 text-left">GST Total</TableCell>
            <TableCell className="text-left">
              <EditableTableCell
                value={currentInvoice.GST_Total ? formatCurrency(currentInvoice.GST_Total) : null}
                onSave={(newValue) => handleFieldUpdate('GST_Total', newValue)}
                type="text"
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium w-1/3 text-left">Total</TableCell>
            <TableCell className="text-left">
              <EditableTableCell
                value={currentInvoice.Total ? formatCurrency(currentInvoice.Total) : null}
                onSave={(newValue) => handleFieldUpdate('Total', newValue)}
                type="text"
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

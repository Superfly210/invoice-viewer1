
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { CompanyDetails } from "./CompanyDetails";
import { AttachmentInfo } from "@/hooks/useInvoiceDataFetching";

interface InvoiceDataTableProps {
  currentInvoice: AttachmentInfo;
}

export const InvoiceDataTable = ({ currentInvoice }: InvoiceDataTableProps) => {
  // Helper function to clean up JSON stringified values
  const cleanValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'string') return value;
    // Remove quotes from JSON stringified values
    return String(value).replace(/^"(.*)"$/, '$1');
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
            <TableCell className="font-medium w-1/3 text-left">Invoice Number</TableCell>
            <TableCell className="text-left">{currentInvoice.Invoice_Number || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium w-1/3 text-left">Invoice Date</TableCell>
            <TableCell className="text-left">{currentInvoice.Invoice_Date || 'N/A'}</TableCell>
          </TableRow>
          
          <TableRow>
            <TableCell className="font-medium w-1/3 text-left">Company Name</TableCell>
            <TableCell className="text-left">{currentInvoice.Invoicing_Comp_Name || 'N/A'}</TableCell>
          </TableRow>
          
          <CompanyDetails currentInvoice={currentInvoice} />
          
          <TableRow>
            <TableCell className="font-medium w-1/3 text-left">Subtotal</TableCell>
            <TableCell className="text-left">{currentInvoice.Sub_Total ? `$${currentInvoice.Sub_Total.toFixed(2)}` : 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium w-1/3 text-left">GST Total</TableCell>
            <TableCell className="text-left">{currentInvoice.GST_Total ? `$${currentInvoice.GST_Total.toFixed(2)}` : 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium w-1/3 text-left">Total</TableCell>
            <TableCell className="text-left">{currentInvoice.Total ? `$${currentInvoice.Total.toFixed(2)}` : 'N/A'}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

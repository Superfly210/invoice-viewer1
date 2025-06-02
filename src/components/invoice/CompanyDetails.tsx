
import { useState } from "react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Plus } from "lucide-react";
import { AttachmentInfo } from "@/hooks/useInvoiceDataFetching";

interface CompanyDetailsProps {
  currentInvoice: AttachmentInfo;
}

export const CompanyDetails = ({ currentInvoice }: CompanyDetailsProps) => {
  const [companyDetailsOpen, setCompanyDetailsOpen] = useState(false);

  // Helper function to clean up JSON stringified values
  const cleanValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'string') return value;
    // Remove quotes from JSON stringified values and handle JSON objects
    const stringValue = String(value);
    if (stringValue.startsWith('"') && stringValue.endsWith('"')) {
      return stringValue.slice(1, -1);
    }
    return stringValue;
  };

  return (
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
                  <TableCell className="font-medium w-1/3 text-left">Company Street</TableCell>
                  <TableCell className="text-left">{cleanValue(currentInvoice.Invoicing_Comp_Street)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium w-1/3 text-left">Company City</TableCell>
                  <TableCell className="text-left">{currentInvoice.Invoicing_Comp_City || 'N/A'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium w-1/3 text-left">Company State/Province</TableCell>
                  <TableCell className="text-left">{currentInvoice.Invoicing_Comp_State_Prov || 'N/A'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium w-1/3 text-left">Postal Code</TableCell>
                  <TableCell className="text-left">{currentInvoice.Invoicing_Comp_Postal_Code || 'N/A'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium w-1/3 text-left">GST Number</TableCell>
                  <TableCell className="text-left">{cleanValue(currentInvoice.GST_Number)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium w-1/3 text-left">WCB Number</TableCell>
                  <TableCell className="text-left">{cleanValue(currentInvoice.WCB_Number)}</TableCell>
                </TableRow>
                {currentInvoice.Google_Drive_URL && (
                  <TableRow>
                    <TableCell className="font-medium w-1/3 text-left">Google Drive URL</TableCell>
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
  );
};

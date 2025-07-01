
import { useState } from "react";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Plus } from "lucide-react";
import { AttachmentInfo } from "@/hooks/useInvoiceDataFetching";
import { EditableTableCell } from "./EditableTableCell";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface CompanyDetailsProps {
  currentInvoice: AttachmentInfo;
}

export const CompanyDetails = ({
  currentInvoice
}: CompanyDetailsProps) => {
  const [companyDetailsOpen, setCompanyDetailsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFieldUpdate = async (field: string, newValue: string) => {
    try {
      console.log(`Updating company ${field} to:`, newValue);
      const { error } = await supabase.from('Attachment_Info').update({
        [field]: newValue
      }).eq('id', currentInvoice.id);
      
      if (error) {
        console.error('Error updating field:', error);
        toast({
          title: "Error",
          description: `Failed to update ${field}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: `${field} updated successfully`
        });
        queryClient.invalidateQueries({
          queryKey: ['attachment-info']
        });
      }
    } catch (error) {
      console.error('Error updating field:', error);
      toast({
        title: "Error",
        description: `Failed to update ${field}`,
        variant: "destructive"
      });
    }
  };

  // Helper function to clean up JSON stringified values
  const cleanValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    // Remove quotes from JSON stringified values and handle JSON objects
    const stringValue = String(value);
    if (stringValue.startsWith('"') && stringValue.endsWith('"')) {
      return stringValue.slice(1, -1);
    }
    return stringValue;
  };

  return (
    <>
      <TableRow>
        <TableCell colSpan={2} className="p-0 border-0">
          <Collapsible open={companyDetailsOpen} onOpenChange={setCompanyDetailsOpen} className="w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-full flex justify-center items-center rounded-none bg-slate-50 dark:bg-slate-900/50">
                {companyDetailsOpen ? <ChevronDown className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                  {companyDetailsOpen ? "Hide details" : "Show company details"}
                </span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-0">
              <TableBody>
                <TableRow className="h-12">
                  <TableCell className="font-medium w-48 text-left py-3">Company Street</TableCell>
                  <TableCell className="text-left py-3">
                    <EditableTableCell 
                      value={cleanValue(currentInvoice.Invoicing_Comp_Street)} 
                      onSave={newValue => handleFieldUpdate('Invoicing_Comp_Street', newValue)} 
                    />
                  </TableCell>
                </TableRow>
                <TableRow className="h-12">
                  <TableCell className="font-medium w-48 text-left py-3">Company City</TableCell>
                  <TableCell className="text-left py-3">
                    <EditableTableCell 
                      value={currentInvoice.Invoicing_Comp_City} 
                      onSave={newValue => handleFieldUpdate('Invoicing_Comp_City', newValue)} 
                    />
                  </TableCell>
                </TableRow>
                <TableRow className="h-12">
                  <TableCell className="font-medium w-48 text-left py-3">Company State/Province</TableCell>
                  <TableCell className="text-left py-3">
                    <EditableTableCell 
                      value={currentInvoice.Invoicing_Comp_State_Prov} 
                      onSave={newValue => handleFieldUpdate('Invoicing_Comp_State_Province', newValue)} 
                    />
                  </TableCell>
                </TableRow>
                <TableRow className="h-12">
                  <TableCell className="font-medium w-48 text-left py-3">Postal Code</TableCell>
                  <TableCell className="text-left py-3">
                    <EditableTableCell 
                      value={currentInvoice.Invoicing_Comp_Postal_Code} 
                      onSave={newValue => handleFieldUpdate('Invoicing_Comp_Postal_Code', newValue)} 
                    />
                  </TableCell>
                </TableRow>
                <TableRow className="h-12">
                  <TableCell className="font-medium w-48 text-left py-3">GST Number</TableCell>
                  <TableCell className="text-left py-3">
                    <EditableTableCell 
                      value={cleanValue(currentInvoice.GST_Number)} 
                      onSave={newValue => handleFieldUpdate('GST_Number', newValue)} 
                    />
                  </TableCell>
                </TableRow>
                <TableRow className="h-12">
                  <TableCell className="font-medium w-48 text-left py-3">WCB Number</TableCell>
                  <TableCell className="text-left py-3">
                    <EditableTableCell 
                      value={cleanValue(currentInvoice.WCB_Number)} 
                      onSave={newValue => handleFieldUpdate('WCB_Number', newValue)} 
                    />
                  </TableCell>
                </TableRow>
                {currentInvoice.Google_Drive_URL && (
                  <TableRow className="h-12">
                    <TableCell className="font-medium w-48 text-left py-3">Google Drive URL</TableCell>
                    <TableCell className="text-left py-3">
                      <EditableTableCell 
                        value={currentInvoice.Google_Drive_URL} 
                        onSave={newValue => handleFieldUpdate('Google_Drive_URL', newValue)} 
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </CollapsibleContent>
          </Collapsible>
        </TableCell>
      </TableRow>
    </>
  );
};

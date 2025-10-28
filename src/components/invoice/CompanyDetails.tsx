
import { useState } from "react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Plus } from "lucide-react";
import { AttachmentInfo } from "@/hooks/useInvoiceDataFetching";
import { EditableTableCell } from "./EditableTableCell";
import { AddVendorDialog } from "./AddVendorDialog";
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
  const [isAddVendorDialogOpen, setIsAddVendorDialogOpen] = useState(false);
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
      <AddVendorDialog
        isOpen={isAddVendorDialogOpen}
        onClose={() => setIsAddVendorDialogOpen(false)}
        initialData={{
          companyName: currentInvoice.Invoicing_Comp_Name,
          street: cleanValue(currentInvoice.Invoicing_Comp_Street),
          city: currentInvoice.Invoicing_Comp_City,
          province: currentInvoice.Invoicing_Comp_State_Prov,
          postalCode: currentInvoice.Invoicing_Comp_Postal_Code,
          gstNumber: cleanValue(currentInvoice.GST_Number),
          wcbNumber: cleanValue(currentInvoice.WCB_Number),
        }}
        invoiceId={currentInvoice.id}
      />
      <TableRow>
        <TableCell colSpan={2} className="p-0 border-0">
          <Collapsible open={companyDetailsOpen} onOpenChange={setCompanyDetailsOpen} className="w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-full flex justify-center items-center rounded-none bg-slate-50 dark:bg-slate-900/50">
                {companyDetailsOpen ? <ChevronDown className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                  {companyDetailsOpen ? "Hide Company Details" : "Show Company Details/Add New Vendor"}
                </span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-0">
              <Table className="w-full">
                <TableBody>
                  <TableRow className="h-10">
                    <TableCell className="font-medium w-40 text-left py-2">Street</TableCell>
                  <TableCell className="text-left py-2">
                    <EditableTableCell 
                      value={cleanValue(currentInvoice.Invoicing_Comp_Street)} 
                      onSave={newValue => handleFieldUpdate('Invoicing_Comp_Street', newValue)} 
                    />
                  </TableCell>
                </TableRow>
                <TableRow className="h-10">
                  <TableCell className="font-medium w-40 text-left py-2">City</TableCell>
                  <TableCell className="text-left py-2">
                    <EditableTableCell 
                      value={currentInvoice.Invoicing_Comp_City} 
                      onSave={newValue => handleFieldUpdate('Invoicing_Comp_City', newValue)} 
                    />
                  </TableCell>
                </TableRow>
                <TableRow className="h-10">
                  <TableCell className="font-medium w-40 text-left py-2">State/Prov.</TableCell>
                  <TableCell className="text-left py-2">
                    <EditableTableCell 
                      value={currentInvoice.Invoicing_Comp_State_Prov} 
                      onSave={newValue => handleFieldUpdate('Invoicing_Comp_State_Province', newValue)} 
                    />
                  </TableCell>
                </TableRow>
                <TableRow className="h-10">
                  <TableCell className="font-medium w-40 text-left py-2">Postal/ZIP</TableCell>
                  <TableCell className="text-left py-2">
                    <EditableTableCell 
                      value={currentInvoice.Invoicing_Comp_Postal_Code} 
                      onSave={newValue => handleFieldUpdate('Invoicing_Comp_Postal_Code', newValue)} 
                    />
                  </TableCell>
                </TableRow>
                <TableRow className="h-10">
                  <TableCell className="font-medium w-40 text-left py-2">GST Number</TableCell>
                  <TableCell className="text-left py-2">
                    <EditableTableCell 
                      value={cleanValue(currentInvoice.GST_Number)} 
                      onSave={newValue => handleFieldUpdate('GST_Number', newValue)} 
                    />
                  </TableCell>
                </TableRow>
                <TableRow className="h-10">
                  <TableCell className="font-medium w-40 text-left py-2">WCB Number</TableCell>
                  <TableCell className="text-left py-2">
                    <EditableTableCell 
                      value={cleanValue(currentInvoice.WCB_Number)} 
                      onSave={newValue => handleFieldUpdate('WCB_Number', newValue)} 
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2} className="py-3">
                    <Button 
                      size="sm"
                      onClick={() => setIsAddVendorDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Vendor
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
              </Table>
            </CollapsibleContent>
          </Collapsible>
        </TableCell>
      </TableRow>
    </>
  );
};

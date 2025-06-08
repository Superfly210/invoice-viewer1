
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditableTableCell } from "@/components/invoice/EditableTableCell";
import { useToast } from "@/hooks/use-toast";

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
  created_at: string;
};

export const VendorTable = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vendors, isLoading, error } = useQuery({
    queryKey: ['vendor-info'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_info')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as VendorInfo[];
    },
  });

  const updateVendorMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: number; field: string; value: string }) => {
      const { error } = await supabase
        .from('vendor_info')
        .update({ [field]: value })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-info'] });
      toast({
        title: "Success",
        description: "Vendor information updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update vendor information",
        variant: "destructive",
      });
      console.error('Error updating vendor:', error);
    },
  });

  const handleSave = (vendorId: number, field: string, newValue: string) => {
    updateVendorMutation.mutate({ id: vendorId, field, value: newValue });
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <p>Loading vendor information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600">Error loading vendor information</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company Name</TableHead>
            <TableHead>Street</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Province/State</TableHead>
            <TableHead>Postal/Zip Code</TableHead>
            <TableHead>GST Number</TableHead>
            <TableHead>WCB Number</TableHead>
            <TableHead>Prompt Line Items</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendors && vendors.length > 0 ? (
            vendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell>
                  <EditableTableCell
                    value={vendor.invoicing_company_name}
                    onSave={(newValue) => handleSave(vendor.id, 'invoicing_company_name', newValue)}
                    type="text"
                  />
                </TableCell>
                <TableCell>
                  <EditableTableCell
                    value={vendor.invoicing_company_street}
                    onSave={(newValue) => handleSave(vendor.id, 'invoicing_company_street', newValue)}
                    type="text"
                  />
                </TableCell>
                <TableCell>
                  <EditableTableCell
                    value={vendor.invoicing_company_city}
                    onSave={(newValue) => handleSave(vendor.id, 'invoicing_company_city', newValue)}
                    type="text"
                  />
                </TableCell>
                <TableCell>
                  <EditableTableCell
                    value={vendor.invoicing_company_province_state}
                    onSave={(newValue) => handleSave(vendor.id, 'invoicing_company_province_state', newValue)}
                    type="text"
                  />
                </TableCell>
                <TableCell>
                  <EditableTableCell
                    value={vendor.invoicing_company_post_zip_code}
                    onSave={(newValue) => handleSave(vendor.id, 'invoicing_company_post_zip_code', newValue)}
                    type="text"
                  />
                </TableCell>
                <TableCell>
                  <EditableTableCell
                    value={vendor.gst_number}
                    onSave={(newValue) => handleSave(vendor.id, 'gst_number', newValue)}
                    type="text"
                  />
                </TableCell>
                <TableCell>
                  <EditableTableCell
                    value={vendor.wcb_number}
                    onSave={(newValue) => handleSave(vendor.id, 'wcb_number', newValue)}
                    type="text"
                  />
                </TableCell>
                <TableCell>
                  <EditableTableCell
                    value={vendor.Prompt_Line_Items}
                    onSave={(newValue) => handleSave(vendor.id, 'Prompt_Line_Items', newValue)}
                    type="text"
                  />
                </TableCell>
                <TableCell>{new Date(vendor.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-gray-500">
                No vendor data found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

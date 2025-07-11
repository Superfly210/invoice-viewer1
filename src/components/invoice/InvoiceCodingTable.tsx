
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency, parseCurrencyValue } from "@/lib/currencyFormatter";
import { EditableLineItemCell } from "./EditableLineItemCell";
import { X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface InvoiceCodingTableProps {
  invoiceId: number;
}

type InvoiceCoding = {
  id: number;
  afe_number: string | null;
  cost_center: string | null;
  cost_code: string | null;
  total: number | null;
};

export const InvoiceCodingTable = ({ invoiceId }: InvoiceCodingTableProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingRow, setIsAddingRow] = useState(false);

  const { data: codingData = [], isLoading } = useQuery({
    queryKey: ['invoice-coding', invoiceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoice_coding')
        .select('id, afe_number, cost_center, cost_code, total')
        .eq('invoice_id', invoiceId)
        .order('id', { ascending: true });

      if (error) throw error;
      return data as InvoiceCoding[];
    },
    enabled: !!invoiceId,
  });

  const handleFieldUpdate = async (codingId: number, field: string, newValue: string) => {
    try {
      console.log(`Updating coding ${codingId} ${field} to:`, newValue);
      
      // Convert string values to appropriate types for database
      let processedValue: any = newValue;
      
      if (field === 'total') {
        processedValue = parseCurrencyValue(newValue);
      }

      const { error } = await supabase
        .from('invoice_coding')
        .update({ [field]: processedValue })
        .eq('id', codingId);

      if (error) {
        console.error('Error updating coding field:', error);
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
        queryClient.invalidateQueries({ queryKey: ['invoice-coding', invoiceId] });
      }
    } catch (error) {
      console.error('Error updating coding field:', error);
      toast({
        title: "Error",
        description: `Failed to update ${field}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteRow = async (codingId: number) => {
    try {
      const { error } = await supabase
        .from('invoice_coding')
        .delete()
        .eq('id', codingId);

      if (error) {
        console.error('Error deleting coding row:', error);
        toast({
          title: "Error",
          description: "Failed to delete row",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Row deleted successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['invoice-coding', invoiceId] });
      }
    } catch (error) {
      console.error('Error deleting coding row:', error);
      toast({
        title: "Error",
        description: "Failed to delete row",
        variant: "destructive",
      });
    }
  };

  const handleAddRow = async () => {
    try {
      setIsAddingRow(true);
      const { error } = await supabase
        .from('invoice_coding')
        .insert({
          invoice_id: invoiceId,
          afe_number: '',
          cost_center: '',
          cost_code: '',
          total: 0
        });

      if (error) {
        console.error('Error adding coding row:', error);
        toast({
          title: "Error",
          description: "Failed to add new row",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "New row added successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['invoice-coding', invoiceId] });
      }
    } catch (error) {
      console.error('Error adding coding row:', error);
      toast({
        title: "Error",
        description: "Failed to add new row",
        variant: "destructive",
      });
    } finally {
      setIsAddingRow(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">Loading coding data...</div>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="text-sm font-medium text-gray-900 mb-3">Invoice Coding Details</h4>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs w-8"></TableHead>
              <TableHead className="text-xs">AFE Number</TableHead>
              <TableHead className="text-xs">Cost Center</TableHead>
              <TableHead className="text-xs">Cost Code</TableHead>
              <TableHead className="text-xs text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {codingData.map((coding) => (
              <TableRow key={coding.id} className="text-sm">
                <TableCell className="py-2 w-8">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteRow(coding.id)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </TableCell>
                <TableCell className="py-2">
                  <EditableLineItemCell
                    value={coding.afe_number}
                    onSave={(newValue) => handleFieldUpdate(coding.id, 'afe_number', newValue)}
                  />
                </TableCell>
                <TableCell className="py-2">
                  <EditableLineItemCell
                    value={coding.cost_center}
                    onSave={(newValue) => handleFieldUpdate(coding.id, 'cost_center', newValue)}
                  />
                </TableCell>
                <TableCell className="py-2">
                  <EditableLineItemCell
                    value={coding.cost_code}
                    onSave={(newValue) => handleFieldUpdate(coding.id, 'cost_code', newValue)}
                  />
                </TableCell>
                <TableCell className="py-2 text-right">
                  <EditableLineItemCell
                    value={coding.total ? formatCurrency(coding.total) : null}
                    onSave={(newValue) => handleFieldUpdate(coding.id, 'total', newValue)}
                    type="text"
                  />
                </TableCell>
              </TableRow>
            ))}
            {codingData.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-gray-500 text-sm">
                  No coding data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="mt-2 flex justify-start">
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddRow}
            disabled={isAddingRow}
            className="text-green-600 border-green-300 hover:bg-green-50"
          >
            <Plus className="h-3 w-3 mr-1" />
            {isAddingRow ? 'Adding...' : 'Add Row'}
          </Button>
        </div>
      </div>
    </div>
  );
};

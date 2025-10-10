import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency, parseCurrencyValue } from "@/lib/currencyFormatter";
import { EditableLineItemCell } from "./EditableLineItemCell";
import { X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useSubtotalComparison } from "@/hooks/useSubtotalComparison";
import { useAfeValidation } from "@/hooks/useAfeValidation";
import { logAuditChange } from "@/utils/auditLogger";
import { AttachmentInfo } from "@/hooks/useInvoiceDataFetching";

interface InvoiceCodingTableProps {
  invoiceId: number;
  currentInvoice?: AttachmentInfo | null;
  lineItemsTotal?: number;
}

type InvoiceCoding = {
  id: number;
  afe_cost_center: string | null;
  cost_code: string | null;
  total: number | null;
};

export const InvoiceCodingTable = ({ invoiceId, currentInvoice, lineItemsTotal }: InvoiceCodingTableProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingRow, setIsAddingRow] = useState(false);
  const { user } = useAuth();
  const { getAfeCostCenterValidationClass } = useAfeValidation();

  // Use props for subtotal comparison instead of separate queries
  const invoiceSubtotal = currentInvoice?.Sub_Total || null;
  const lineItemsTotalValue = lineItemsTotal || 0;

  const { data: costCodes = [], isLoading: isCostCodesLoading } = useQuery<string[]>({
    queryKey: ['cost-codes'],
    queryFn: async () => {
      // Corrected from .select('cost_code') to .select('code')
      const { data, error } = await supabase.from('cost_codes').select('code');
      if (error) {
        console.error("Error fetching cost codes:", error);
        toast({
          title: "Error Loading Cost Codes",
          description: "Could not validate cost codes. Please try again later.",
          variant: "destructive",
        });
        throw error;
      }
      // Corrected from item.cost_code to item.code
      return data.map((item) => item.code);
    },
  });

  const normalizedMasterCodes = useMemo(() => {
    if (isCostCodesLoading) return null;
    return new Set(costCodes.map(code => code.toLowerCase().trim().replace(/[.\s-]/g, '')));
  }, [costCodes, isCostCodesLoading]);

  const isCostCodeInvalid = (costCode: string | null) => {
    if (!normalizedMasterCodes) return false; // Don't validate if master list isn't ready
    if (!costCode) return true; // Null or empty is invalid
    const normalizedCostCode = costCode.toLowerCase().trim().replace(/[.\s-]/g, '');
    return !normalizedMasterCodes.has(normalizedCostCode);
  };

  const { data: codingData = [], isLoading } = useQuery({
    queryKey: ['invoice-coding', invoiceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoice_coding')
        .select('id, afe_cost_center, cost_code, total')
        .eq('invoice_id', invoiceId)
        .order('id', { ascending: true });

      if (error) throw error;
      return data as InvoiceCoding[];
    },
    enabled: !!invoiceId,
  });

  const totalAmount = useMemo(() => {
    return codingData.reduce((acc, item) => acc + (item.total || 0), 0);
  }, [codingData]);

  // Use subtotal comparison hook
  const subtotalComparison = useSubtotalComparison({
    invoiceSubtotal: invoiceSubtotal,
    codingTotal: totalAmount,
    lineItemsTotal: lineItemsTotalValue
  });

  const handleFieldUpdate = async (codingId: number, field: string, newValue: string) => {
    try {
      const oldValue = codingData.find(item => item.id === codingId)?.[field as keyof InvoiceCoding] || null;

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
        await logAuditChange(invoiceId, 'LINE_ITEM', `coding_${field}`, oldValue, processedValue, codingId);

        toast({
          title: "Success",
          description: `${field} updated successfully`,
        });
        queryClient.invalidateQueries({ queryKey: ['invoice-coding', invoiceId] });
        queryClient.invalidateQueries({ queryKey: ['audit-trail', invoiceId] });
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
      const deletedData = codingData.find(item => item.id === codingId);

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
        if (deletedData) {
          await logAuditChange(invoiceId, 'INVOICE_CODING', 'coding_row', JSON.stringify(deletedData), null, codingId, 'DELETE');
        }

        toast({
          title: "Success",
          description: "Row deleted successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['invoice-coding', invoiceId] });
        queryClient.invalidateQueries({ queryKey: ['audit-trail', invoiceId] });
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
      const { data, error } = await supabase
        .from('invoice_coding')
        .insert({
          invoice_id: invoiceId,
          afe_cost_center: '',
          cost_code: '',
          total: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding coding row:', error);
        toast({
          title: "Error",
          description: "Failed to add new row",
          variant: "destructive",
        });
      } else {
        await logAuditChange(invoiceId, 'LINE_ITEM', 'coding_row', null, JSON.stringify(data), data.id, 'INSERT');

        toast({
          title: "Success",
          description: "New row added successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['invoice-coding', invoiceId] });
        queryClient.invalidateQueries({ queryKey: ['audit-trail', invoiceId] });
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
    <div className="mt-4 p-4 rounded-lg">
      <h4 className="text-sm font-medium text-gray-900 mb-3">Invoice Coding Details</h4>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs w-8"></TableHead>
              <TableHead className="text-xs">AFE/CC</TableHead>
              <TableHead className="text-xs">Cost Code</TableHead>
              <TableHead className="text-xs text-left">Subtotal</TableHead>
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
                    value={coding.afe_cost_center}
                    onSave={(newValue) => handleFieldUpdate(coding.id, 'afe_cost_center', newValue)}
                    highlightClass={getAfeCostCenterValidationClass(coding.afe_cost_center)}
                    placeholder="For AFE Numbers XX#####, For Cost Centers, ##"
                  />
                </TableCell>
                <TableCell className="py-2 whitespace-nowrap">
                  <EditableLineItemCell
                    value={coding.cost_code}
                    onSave={(newValue) => handleFieldUpdate(coding.id, 'cost_code', newValue)}
                    isInvalid={isCostCodeInvalid(coding.cost_code)}
                    placeholder="####-####"
                  />
                </TableCell>
                <TableCell className="py-2 text-left">
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
                <TableCell colSpan={4} className="text-center py-4 text-gray-500 text-sm">
                  No coding data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>
                <Button
                  size="sm"
                  onClick={handleAddRow}
                  disabled={isAddingRow}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {isAddingRow ? 'Adding...' : 'Add Row'}
                </Button>
              </TableCell>
              <TableCell className="text-right font-medium">Subtotal</TableCell>
              <TableCell className="text-left font-medium">
                <EditableLineItemCell
                  value={formatCurrency(totalAmount)}
                  onSave={() => {}} // Read-only total
                  highlightClass={subtotalComparison.highlightClass}
                />
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
};
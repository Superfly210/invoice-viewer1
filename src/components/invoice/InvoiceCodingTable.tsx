
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/currencyFormatter";

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

  if (isLoading) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">Loading coding data...</div>
      </div>
    );
  }

  if (codingData.length === 0) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">No coding data available</div>
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
              <TableHead className="text-xs">AFE Number</TableHead>
              <TableHead className="text-xs">Cost Center</TableHead>
              <TableHead className="text-xs">Cost Code</TableHead>
              <TableHead className="text-xs text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {codingData.map((coding) => (
              <TableRow key={coding.id} className="text-sm">
                <TableCell className="py-2">{coding.afe_number || 'N/A'}</TableCell>
                <TableCell className="py-2">{coding.cost_center || 'N/A'}</TableCell>
                <TableCell className="py-2">{coding.cost_code || 'N/A'}</TableCell>
                <TableCell className="py-2 text-right">
                  {coding.total ? formatCurrency(coding.total) : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

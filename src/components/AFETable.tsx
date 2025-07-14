
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const AFETable = () => {
  const { data: afeData = [], isLoading } = useQuery({
    queryKey: ['afe-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('afe')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading AFE data...</div>;
  }

  return (
    <div className="h-[calc(100vh-200px)] w-full rounded-md border">
      <div className="h-full overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead>AFE Number</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Estimate</TableHead>
              <TableHead>Approved Amount</TableHead>
              <TableHead>Awaiting Approval</TableHead>
              <TableHead>Responsible User</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {afeData.map((afe) => (
              <TableRow key={afe.id}>
                <TableCell className="font-medium">{afe.afe_number}</TableCell>
                <TableCell>{afe.AFE_Description || 'N/A'}</TableCell>
                <TableCell>${afe.afe_estimate?.toLocaleString()}</TableCell>
                <TableCell>${afe.approved_amount?.toLocaleString()}</TableCell>
                <TableCell>${afe.awaiting_approval_amount?.toLocaleString()}</TableCell>
                <TableCell>{afe.responsible_user_id || 'N/A'}</TableCell>
                <TableCell>{new Date(afe.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

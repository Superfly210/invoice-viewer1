
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CostCode = {
  id: number;
  code: string;
  description: string | null;
};

export default function CostCodes() {
  const { data: costCodes, isLoading, error } = useQuery({
    queryKey: ['cost_codes'],
    queryFn: async () => {
      console.log("Fetching cost codes...");
      const { data, error } = await supabase
        .from('cost_codes')
        .select('*');
      
      if (error) {
        console.error('Error fetching cost codes:', error);
        throw error;
      }
      
      console.log("Cost codes fetched:", data);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Cost Codes</h1>
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Cost Codes</h1>
        <div className="text-red-600">Error loading cost codes: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Cost Codes</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {costCodes && costCodes.length > 0 ? (
              costCodes.map((costCode) => (
                <TableRow key={costCode.id}>
                  <TableCell>{costCode.code}</TableCell>
                  <TableCell>{costCode.description || 'No description'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-gray-500">
                  No cost codes found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


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

type CostCenter = {
  id: string;
  code: string;
  description: string;
};

export default function CostCenters() {
  const { data: costCenters, isLoading, error } = useQuery({
    queryKey: ['cost_centers'],
    queryFn: async () => {
      console.log("Fetching cost centers...");
      const { data, error } = await supabase
        .from('cost_centers')
        .select('*');
      
      if (error) {
        console.error('Error fetching cost centers:', error);
        throw error;
      }
      
      console.log("Cost centers fetched:", data);
      return data as CostCenter[];
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Cost Centers</h1>
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Cost Centers</h1>
        <div className="text-red-600">Error loading cost centers: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Cost Centers</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {costCenters && costCenters.length > 0 ? (
              costCenters.map((costCenter) => (
                <TableRow key={costCenter.id}>
                  <TableCell>{costCenter.code}</TableCell>
                  <TableCell>{costCenter.description}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-gray-500">
                  No cost centers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

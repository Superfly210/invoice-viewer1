
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Profile = {
  id: string;
  full_name: string;
};

type AFE = {
  id: string;
  afe_number: string;
  responsible_user_id: string | null;
  afe_estimate: number;
  approved_amount: number;
  awaiting_approval_amount: number;
  invoices_awaiting_approval: number;
};

export function AFETable() {
  // Fetch users for the responsible user dropdown
  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name');
      if (error) throw error;
      return data as Profile[];
    },
  });

  // Fetch AFE data
  const { data: afes } = useQuery({
    queryKey: ['afes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('afe')
        .select('*');
      if (error) throw error;
      
      // Transform the data to include invoices_awaiting_approval with a default value of 0
      return (data || []).map(afe => ({
        ...afe,
        invoices_awaiting_approval: 0 // Default value since it's not in the database
      })) as AFE[];
    },
  });

  const handleUserChange = async (afeId: string, userId: string) => {
    const { error } = await supabase
      .from('afe')
      .update({ responsible_user_id: userId })
      .eq('id', afeId);

    if (error) {
      console.error('Error updating responsible user:', error);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>AFE Number</TableHead>
            <TableHead>Responsible User</TableHead>
            <TableHead className="text-right">Invoices Awaiting Approval</TableHead>
            <TableHead className="text-right">AFE Estimate</TableHead>
            <TableHead className="text-right">Approved Amount</TableHead>
            <TableHead className="text-right">Awaiting Approval Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {afes?.map((afe) => (
            <TableRow key={afe.id}>
              <TableCell>{afe.afe_number}</TableCell>
              <TableCell>
                <Select
                  value={afe.responsible_user_id || ""}
                  onValueChange={(value) => handleUserChange(afe.id, value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles?.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-right">{afe.invoices_awaiting_approval || 0}</TableCell>
              <TableCell className="text-right">${afe.afe_estimate.toLocaleString()}</TableCell>
              <TableCell className="text-right">${afe.approved_amount.toLocaleString()}</TableCell>
              <TableCell className="text-right">${afe.awaiting_approval_amount.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

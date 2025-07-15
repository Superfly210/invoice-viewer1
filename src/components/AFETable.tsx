
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronUp, ChevronDown } from "lucide-react";

type SortField = 'afe_number' | 'AFE_Description' | 'afe_estimate' | 'approved_amount' | 'awaiting_approval_amount' | 'created_at';
type SortOrder = 'asc' | 'desc';

export const AFETable = () => {
  const queryClient = useQueryClient();
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  const { data: afeData = [], isLoading } = useQuery({
    queryKey: ['afe-data', sortField, sortOrder],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('afe')
        .select('*')
        .order(sortField, { ascending: sortOrder === 'asc' });

      if (error) throw error;
      return data;
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username')
        .order('full_name');

      if (error) throw error;
      return data;
    },
  });

  const updateResponsibleUser = useMutation({
    mutationFn: async ({ afeId, userId }: { afeId: string; userId: string }) => {
      const { error } = await supabase
        .from('afe')
        .update({ responsible_user_id: userId })
        .eq('id', afeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['afe-data', sortField, sortOrder] });
    },
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center justify-between">
        <span>{children}</span>
        <div className="flex flex-col ml-1">
          <ChevronUp 
            className={`h-3 w-3 ${sortField === field && sortOrder === 'asc' ? 'text-primary' : 'text-gray-400'}`}
          />
          <ChevronDown 
            className={`h-3 w-3 -mt-1 ${sortField === field && sortOrder === 'desc' ? 'text-primary' : 'text-gray-400'}`}
          />
        </div>
      </div>
    </TableHead>
  );

  if (isLoading) {
    return <div className="text-center py-4">Loading AFE data...</div>;
  }

  return (
    <div className="h-[calc(100vh-200px)] w-full rounded-md border">
      <div className="h-full overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <SortableHeader field="afe_number">AFE Number</SortableHeader>
              <SortableHeader field="AFE_Description">Description</SortableHeader>
              <TableHead>Responsible User</TableHead>
              <SortableHeader field="afe_estimate">Estimate</SortableHeader>
              <SortableHeader field="approved_amount">Approved Amount</SortableHeader>
              <SortableHeader field="awaiting_approval_amount">Awaiting Approval</SortableHeader>
              <SortableHeader field="created_at">Created At</SortableHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {afeData.map((afe) => (
              <TableRow key={afe.id}>
                <TableCell className="font-medium">{afe.afe_number}</TableCell>
                <TableCell>{afe.AFE_Description || 'N/A'}</TableCell>
                <TableCell>
                  <Select
                    value={afe.responsible_user_id || ""}
                    onValueChange={(value) => updateResponsibleUser.mutate({ afeId: afe.id, userId: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select user">
                        {profiles.find(p => p.id === afe.responsible_user_id)?.full_name || 
                         profiles.find(p => p.id === afe.responsible_user_id)?.username || 
                         'Select user'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.full_name || profile.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>${afe.afe_estimate?.toLocaleString()}</TableCell>
                <TableCell>${afe.approved_amount?.toLocaleString()}</TableCell>
                <TableCell>${afe.awaiting_approval_amount?.toLocaleString()}</TableCell>
                <TableCell>{new Date(afe.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

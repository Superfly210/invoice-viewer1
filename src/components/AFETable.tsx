
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const AFETable = () => {
  const queryClient = useQueryClient();
  
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
      queryClient.invalidateQueries({ queryKey: ['afe-data'] });
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
              <TableHead>Responsible User</TableHead>
              <TableHead>Estimate</TableHead>
              <TableHead>Approved Amount</TableHead>
              <TableHead>Awaiting Approval</TableHead>
              <TableHead>Created At</TableHead>
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

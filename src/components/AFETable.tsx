
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
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users for the responsible user dropdown
  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      console.log("Fetching profiles...");
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name');
      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }
      console.log("Profiles fetched:", data);
      return data as Profile[];
    },
  });

  // Fetch AFE data
  const { data: afes, isLoading, error } = useQuery({
    queryKey: ['afes'],
    queryFn: async () => {
      console.log("Fetching AFE data...");
      const { data, error } = await supabase
        .from('afe')
        .select('*')
        .order('afe_number', { ascending: true });
      
      if (error) {
        console.error('Error fetching AFE data:', error);
        throw error;
      }
      
      console.log('Raw AFE data fetched:', data);
      
      if (!data || data.length === 0) {
        console.log("No AFE data found");
        return [];
      }
      
      // Transform the data to include invoices_awaiting_approval with a default value of 0
      const transformedData = data.map(afe => ({
        ...afe,
        invoices_awaiting_approval: 0 // Default value since it's not in the database
      })) as AFE[];
      
      console.log('Transformed AFE data:', transformedData);
      return transformedData;
    },
  });

  const handleUserChange = async (afeId: string, userId: string) => {
    try {
      console.log("Updating responsible user:", afeId, userId);
      const { error } = await supabase
        .from('afe')
        .update({ responsible_user_id: userId })
        .eq('id', afeId);

      if (error) {
        console.error('Error updating responsible user:', error);
        toast({
          title: "Error",
          description: "Failed to update responsible user",
          variant: "destructive",
        });
      } else {
        // Refresh the data
        queryClient.invalidateQueries({ queryKey: ['afes'] });
        toast({
          title: "Success",
          description: "Responsible user updated successfully",
        });
      }
    } catch (error) {
      console.error('Error updating responsible user:', error);
      toast({
        title: "Error",
        description: "Failed to update responsible user",
        variant: "destructive",
      });
    }
  };

  const handleImportAFE = () => {
    // TODO: Implement AFE data import functionality
    console.log("Import AFE Data");
    toast({
      title: "Feature Coming Soon",
      description: "AFE data import functionality will be available soon",
    });
  };

  const handleAddAFE = () => {
    // TODO: Implement Add AFE functionality
    console.log("Add AFE");
    toast({
      title: "Feature Coming Soon",
      description: "Add AFE functionality will be available soon",
    });
  };

  console.log("AFE Table render - Loading:", isLoading, "Error:", error, "Data:", afes);

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <p>Loading AFE data...</p>
      </div>
    );
  }

  if (error) {
    console.error("AFE Table error:", error);
    return (
      <div className="p-4 text-center">
        <p className="text-red-600">Error loading AFE data: {error.message}</p>
        <p className="text-sm text-gray-500 mt-2">Check console for more details</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <div className="flex justify-end p-4 space-x-2">
        <Button variant="outline" onClick={handleImportAFE}>
          <Upload className="mr-2 h-4 w-4" /> Import AFE Data
        </Button>
        <Button onClick={handleAddAFE}>
          <Plus className="mr-2 h-4 w-4" /> Add AFE
        </Button>
      </div>
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
          {afes && afes.length > 0 ? (
            afes.map((afe) => (
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
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-500">
                No AFE data found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

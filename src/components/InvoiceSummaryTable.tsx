import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/currencyFormatter";
import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useInvoiceFilters } from "@/hooks/useInvoiceFilters";
import { InvoiceSummaryTableHeader } from "./InvoiceSummaryTableHeader";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ExternalLink, Pencil, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logInvoiceChange } from "@/utils/auditLogger";

type AttachmentInfo = {
  id: number;
  Invoice_Number: string | null;
  Invoice_Date: string | null;
  Invoicing_Comp_Name: string | null;
  "Responsible User": string | null;
  Status: string | null;
  Sub_Total: number | null;
  GST_Total: number | null;
  Total: number | null;
  created_at: string;
};

type UserProfile = {
  id: string;
  full_name: string | null;
  username: string | null;
};

export const InvoiceSummaryTable = React.memo(({ 
  onNavigateToReviewer 
}: { 
  onNavigateToReviewer?: (invoiceId: number) => void 
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { filterValues, debouncedFilterValues, filterSetters } = useInvoiceFilters();
  const { invoiceNumberFilter, invoiceDateFilter, companyNameFilter } = filterValues;
  const { debouncedInvoiceNumberFilter, debouncedInvoiceDateFilter, debouncedCompanyNameFilter } = debouncedFilterValues;
  const { setInvoiceNumberFilter, setInvoiceDateFilter, setCompanyNameFilter, clearFilters } = filterSetters;

  // State for tracking which invoice is being edited
  const [editingResponsibleUser, setEditingResponsibleUser] = useState<number | null>(null);
  const [editingStatus, setEditingStatus] = useState<number | null>(null);

  // Refs for focus management
  const invoiceNumberRef = useRef<HTMLInputElement>(null);
  const invoiceDateRef = useRef<HTMLInputElement>(null);
  const companyNameRef = useRef<HTMLInputElement>(null);
  const lastFocusedRef = useRef<React.RefObject<HTMLInputElement> | null>(null);

  // Fetch all users for the dropdown
  const { data: users } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username')
        .order('full_name');
      
      if (error) throw error;
      return data as UserProfile[];
    },
  });

  // Fetch invoices
  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ['attachment-info-summary', debouncedInvoiceNumberFilter, debouncedInvoiceDateFilter, debouncedCompanyNameFilter],
    queryFn: async () => {
      let query = supabase
        .from('Attachment_Info')
        .select('id, Invoice_Number, Invoice_Date, Invoicing_Comp_Name, "Responsible User", Status, Sub_Total, GST_Total, Total, created_at');

      if (debouncedInvoiceNumberFilter) {
        query = query.ilike('Invoice_Number', `%${debouncedInvoiceNumberFilter}%`);
      }
      if (debouncedInvoiceDateFilter) {
        query = query.ilike('Invoice_Date', `%${debouncedInvoiceDateFilter}%`);
      }
      if (debouncedCompanyNameFilter) {
        query = query.ilike('Invoicing_Comp_Name', `%${debouncedCompanyNameFilter}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AttachmentInfo[];
    },
  });

  // Mutation for updating responsible user
  const updateResponsibleUserMutation = useMutation({
    mutationFn: async ({ 
      invoiceId, 
      oldValue, 
      newValue 
    }: { 
      invoiceId: number; 
      oldValue: string | null; 
      newValue: string 
    }) => {
      // Get the user's full name
      const user = users?.find(u => u.id === newValue);
      const userName = user?.full_name || user?.username || newValue;

      const { error } = await supabase
        .from('Attachment_Info')
        .update({ 'Responsible User': userName })
        .eq('id', invoiceId);

      if (error) throw error;

      // Log the change
      await logInvoiceChange(
        invoiceId,
        'Responsible User',
        oldValue,
        userName,
        'UPDATE'
      );

      return userName;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachment-info-summary'] });
      toast({
        title: "Success",
        description: "Responsible user updated successfully",
      });
      setEditingResponsibleUser(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update responsible user",
      });
    },
  });

  // Mutation for updating status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ 
      invoiceId, 
      oldValue, 
      newValue 
    }: { 
      invoiceId: number; 
      oldValue: string | null; 
      newValue: string 
    }) => {
      const { error } = await supabase
        .from('Attachment_Info')
        .update({ Status: newValue })
        .eq('id', invoiceId);

      if (error) throw error;

      // Log the change
      await logInvoiceChange(
        invoiceId,
        'Status',
        oldValue,
        newValue,
        'UPDATE'
      );

      return newValue;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachment-info-summary'] });
      toast({
        title: "Success",
        description: "Status updated successfully",
      });
      setEditingStatus(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update status",
      });
    },
  });

  // Status options
  const statusOptions = [
    "Pending",
    "Approved",
    "Denied",
    "Hold",
    "Quarantine",
    "Not An Invoice"
  ];

  // Restore focus after table data updates
  useEffect(() => {
    if (lastFocusedRef.current && lastFocusedRef.current.current) {
      lastFocusedRef.current.current.focus();
      const currentValue = lastFocusedRef.current.current.value;
      lastFocusedRef.current.current.setSelectionRange(currentValue.length, currentValue.length);
    }
  }, [invoices]);

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <p>Loading invoice summary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600">Error loading invoice summary</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-250px)] overflow-auto rounded-md border">
      <div className="p-4 flex justify-end">
        <Button onClick={clearFilters}>
          Clear Filters
        </Button>
      </div>
      <Table>
        <InvoiceSummaryTableHeader
          invoiceNumberFilter={invoiceNumberFilter}
          setInvoiceNumberFilter={setInvoiceNumberFilter}
          invoiceDateFilter={invoiceDateFilter}
          setInvoiceDateFilter={setInvoiceDateFilter}
          companyNameFilter={companyNameFilter}
          setCompanyNameFilter={setCompanyNameFilter}
          invoiceNumberRef={invoiceNumberRef}
          invoiceDateRef={invoiceDateRef}
          companyNameRef={companyNameRef}
          setLastFocusedRef={(ref) => (lastFocusedRef.current = ref)}
        />
        <TableBody>
          {invoices && invoices.length > 0 ? (
            invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {invoice.id}
                    {onNavigateToReviewer && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => onNavigateToReviewer(invoice.id)}
                        title="Open in Invoice Reviewer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell>{invoice.Invoice_Number || 'N/A'}</TableCell>
                <TableCell>{invoice.Invoice_Date || 'N/A'}</TableCell>
                <TableCell>{invoice.Invoicing_Comp_Name || 'N/A'}</TableCell>
                
                {/* Responsible User with edit functionality */}
                <TableCell>
                  {editingResponsibleUser === invoice.id ? (
                    <div className="flex items-center gap-2">
                      <Select
                        onValueChange={(value) => {
                          updateResponsibleUserMutation.mutate({
                            invoiceId: invoice.id,
                            oldValue: invoice["Responsible User"],
                            newValue: value,
                          });
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                        <SelectContent>
                          {users?.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.full_name || user.username || user.id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setEditingResponsibleUser(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{invoice["Responsible User"] || 'N/A'}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setEditingResponsibleUser(invoice.id)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </TableCell>
                
                {/* Status with edit functionality */}
                <TableCell>
                  {editingStatus === invoice.id ? (
                    <div className="flex items-center gap-2">
                      <Select
                        onValueChange={(value) => {
                          updateStatusMutation.mutate({
                            invoiceId: invoice.id,
                            oldValue: invoice.Status,
                            newValue: value,
                          });
                        }}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setEditingStatus(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{invoice.Status || 'N/A'}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setEditingStatus(invoice.id)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </TableCell>
                
                <TableCell className="text-right">
                  {invoice.Sub_Total ? formatCurrency(invoice.Sub_Total) : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  {invoice.GST_Total ? formatCurrency(invoice.GST_Total) : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  {invoice.Total ? formatCurrency(invoice.Total) : 'N/A'}
                </TableCell>
                <TableCell>{new Date(invoice.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="text-center text-gray-500">
                No invoice data found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
});

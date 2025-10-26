/**
 * Helper functions for the Submission Portal
 */

import type { Submission, SubmissionFilters, StatusConfig } from "../types";

export function getStatusBadge(status: string): { variant: "default" | "secondary" | "destructive" | "outline"; color: string } {
  const statusConfig: Record<string, StatusConfig> = {
    pending: { variant: "secondary", color: "bg-yellow-100 text-yellow-800" },
    processed: { variant: "default", color: "bg-blue-100 text-blue-800" },
    approved: { variant: "default", color: "bg-green-100 text-green-800" },
    rejected: { variant: "destructive", color: "bg-red-100 text-red-800" },
  };
  
  return statusConfig[status] || { variant: "outline", color: "" };
}

export function filterAndSortSubmissions(
  submissions: Submission[],
  filters: SubmissionFilters
): Submission[] {
  const { searchTerm, statusFilter, sortBy, sortOrder } = filters;
  
  return submissions
    .filter(sub => {
      if (searchTerm && !sub.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (statusFilter !== "all" && sub.status !== statusFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      let compareValue = 0;
      if (sortBy === "date") {
        compareValue = new Date(a.invoice_date).getTime() - new Date(b.invoice_date).getTime();
      } else if (sortBy === "company") {
        compareValue = a.invoicing_company.localeCompare(b.invoicing_company);
      } else if (sortBy === "total") {
        compareValue = a.invoice_total - b.invoice_total;
      }
      return sortOrder === "asc" ? compareValue : -compareValue;
    });
}

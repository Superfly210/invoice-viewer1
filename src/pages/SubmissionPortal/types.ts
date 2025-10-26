/**
 * Types and interfaces for the Submission Portal
 */

export interface CodingRow {
  id: string;
  afeNumberCostCenter: string;
  costCode: string;
  total: string;
}

export interface Submission {
  id: string;
  invoice_number: string | null;
  invoicing_company: string;
  invoice_date: string;
  sub_total: number;
  gst_total: number;
  invoice_total: number;
  invoice_file_path: string;
  supporting_docs_paths: string[] | null;
  coding_details: CodingRow[];
  contact_emails: string[];
  additional_comments: string | null;
  submitted_at: string;
  submitted_by: string | null;
  status: string;
}

export interface SubmissionFormData {
  invoicingCompany: string;
  invoiceNumber: string;
  invoiceDate: Date | undefined;
  subTotal: string;
  gstTotal: string;
  invoiceTotal: string;
  codingRows: CodingRow[];
  emailFields: string[];
  additionalComments: string;
  confirmationChecked: boolean;
}

export interface SubmissionFilters {
  searchTerm: string;
  statusFilter: string;
  sortBy: "date" | "company" | "total";
  sortOrder: "asc" | "desc";
}

export type SubmissionStatus = "pending" | "processed" | "approved" | "rejected";

export interface StatusConfig {
  variant: "default" | "secondary" | "destructive" | "outline";
  color: string;
}

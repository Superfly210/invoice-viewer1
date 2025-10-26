/**
 * Custom hook for managing submission form state and logic
 */

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { mergePDFs } from "@/lib/pdfMerger";
import { parseCurrencyValue } from "@/lib/currencyFormatter";
import type { CodingRow, Submission, SubmissionFormData } from "../types";

export function useSubmissionForm(onSuccess: () => void) {
  const { toast } = useToast();
  
  // File upload states
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [supportingDocs, setSupportingDocs] = useState<File[]>([]);
  
  // Form fields
  const [invoicingCompany, setInvoicingCompany] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState<Date>();
  const [subTotal, setSubTotal] = useState("");
  const [gstTotal, setGstTotal] = useState("");
  const [invoiceTotal, setInvoiceTotal] = useState("");
  const [codingRows, setCodingRows] = useState<CodingRow[]>([
    { id: "1", afeNumberCostCenter: "", costCode: "", total: "" }
  ]);
  const [emailFields, setEmailFields] = useState<string[]>([""]);
  const [additionalComments, setAdditionalComments] = useState("");
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  
  // Loading states
  const [submitting, setSubmitting] = useState(false);
  const [mergingPDFs, setMergingPDFs] = useState(false);
  
  // Editing state
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);

  const resetForm = () => {
    setInvoiceFile(null);
    setSupportingDocs([]);
    setInvoicingCompany("");
    setInvoiceNumber("");
    setInvoiceDate(undefined);
    setSubTotal("");
    setGstTotal("");
    setInvoiceTotal("");
    setCodingRows([{ id: "1", afeNumberCostCenter: "", costCode: "", total: "" }]);
    setEmailFields([""]);
    setAdditionalComments("");
    setConfirmationChecked(false);
    setEditingSubmission(null);
  };

  const loadSubmissionForEdit = (submission: Submission) => {
    setEditingSubmission(submission);
    setInvoicingCompany(submission.invoicing_company);
    setInvoiceNumber(submission.invoice_number || "");
    setInvoiceDate(new Date(submission.invoice_date));
    setSubTotal(String(submission.sub_total));
    setGstTotal(String(submission.gst_total));
    setInvoiceTotal(String(submission.invoice_total));
    setCodingRows(submission.coding_details || [{ id: "1", afeNumberCostCenter: "", costCode: "", total: "" }]);
    setEmailFields(submission.contact_emails.length > 0 ? submission.contact_emails : [""]);
    setAdditionalComments(submission.additional_comments || "");
  };

  // Coding rows management
  const addCodingRow = () => {
    const newId = String(Date.now());
    setCodingRows([...codingRows, { id: newId, afeNumberCostCenter: "", costCode: "", total: "" }]);
  };

  const removeCodingRow = (id: string) => {
    setCodingRows(codingRows.filter(row => row.id !== id));
  };

  const updateCodingRow = (id: string, field: keyof CodingRow, value: string) => {
    setCodingRows(codingRows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  // Email fields management
  const addEmailField = () => {
    setEmailFields([...emailFields, ""]);
  };

  const removeEmailField = (index: number) => {
    setEmailFields(emailFields.filter((_, i) => i !== index));
  };

  const updateEmailField = (index: number, value: string) => {
    const newFields = [...emailFields];
    newFields[index] = value;
    setEmailFields(newFields);
  };

  const handleSubmit = async () => {
    // Validation
    if (!invoicingCompany || !invoiceDate || !confirmationChecked) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields and confirm the submission",
      });
      return;
    }

    if (!editingSubmission && !invoiceFile) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please upload an invoice file",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let finalInvoicePath = editingSubmission?.invoice_file_path || "";
      let supportingDocsPaths: string[] = editingSubmission?.supporting_docs_paths || [];

      // Handle file uploads for new submissions
      if (!editingSubmission) {
        if (supportingDocs.length > 0) {
          setMergingPDFs(true);
          const mergedPDF = await mergePDFs(invoiceFile!, supportingDocs);
          setMergingPDFs(false);

          const fileName = `${user.id}/${Date.now()}_merged.pdf`;
          const { error: uploadError } = await supabase.storage
            .from('submission-files')
            .upload(fileName, mergedPDF);

          if (uploadError) throw uploadError;
          finalInvoicePath = fileName;
        } else if (invoiceFile) {
          const fileName = `${user.id}/${Date.now()}_${invoiceFile.name}`;
          const { error: uploadError } = await supabase.storage
            .from('submission-files')
            .upload(fileName, invoiceFile);

          if (uploadError) throw uploadError;
          finalInvoicePath = fileName;
        }
      }

      const submissionData = {
        invoicing_company: invoicingCompany,
        invoice_number: invoiceNumber || null,
        invoice_date: invoiceDate.toISOString().split('T')[0],
        sub_total: parseCurrencyValue(subTotal),
        gst_total: parseCurrencyValue(gstTotal),
        invoice_total: parseCurrencyValue(invoiceTotal),
        invoice_file_path: finalInvoicePath,
        supporting_docs_paths: supportingDocsPaths,
        coding_details: codingRows as any, // Supabase Json type
        contact_emails: emailFields.filter(email => email.trim() !== ""),
        additional_comments: additionalComments || null,
        submitted_by: user.id,
        status: 'pending',
      };

      if (editingSubmission) {
        const { error } = await supabase
          .from('invoice_submissions')
          .update(submissionData as any) // Supabase type compatibility
          .eq('id', editingSubmission.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Submission updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('invoice_submissions')
          .insert([submissionData] as any); // Supabase type compatibility

        if (error) throw error;

        toast({
          title: "Success",
          description: "Invoice submitted successfully",
        });
      }

      resetForm();
      onSuccess();
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit invoice",
      });
    } finally {
      setSubmitting(false);
      setMergingPDFs(false);
    }
  };

  return {
    // File states
    invoiceFile,
    setInvoiceFile,
    supportingDocs,
    setSupportingDocs,
    
    // Form fields
    invoicingCompany,
    setInvoicingCompany,
    invoiceNumber,
    setInvoiceNumber,
    invoiceDate,
    setInvoiceDate,
    subTotal,
    setSubTotal,
    gstTotal,
    setGstTotal,
    invoiceTotal,
    setInvoiceTotal,
    codingRows,
    emailFields,
    additionalComments,
    setAdditionalComments,
    confirmationChecked,
    setConfirmationChecked,
    
    // Loading states
    submitting,
    mergingPDFs,
    
    // Editing
    editingSubmission,
    loadSubmissionForEdit,
    
    // Actions
    resetForm,
    handleSubmit,
    addCodingRow,
    removeCodingRow,
    updateCodingRow,
    addEmailField,
    removeEmailField,
    updateEmailField,
  };
}

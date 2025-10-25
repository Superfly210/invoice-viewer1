import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { mergePDFs } from "@/lib/pdfMerger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Upload, Plus, X, LogOut, FileText, Search, Download, Eye, Edit, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, parseCurrencyValue, handleCurrencyInput } from "@/lib/currencyFormatter";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CodingRow {
  id: string;
  afeNumberCostCenter: string;
  costCode: string;
  total: string;
}

interface Submission {
  id: string;
  invoice_number: string | null;
  invoicing_company: string;
  invoice_date: string;
  sub_total: number;
  gst_total: number;
  invoice_total: number;
  invoice_file_path: string;
  supporting_docs_paths: string[] | null;
  coding_details: any;
  contact_emails: string[];
  additional_comments: string | null;
  submitted_at: string;
  submitted_by: string | null;
  status: string;
}

export default function SubmissionPortal() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Submissions list state
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "company" | "total">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);
  
  // View details dialog
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [viewingSubmission, setViewingSubmission] = useState<Submission | null>(null);
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(null);
  
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
  const [submitting, setSubmitting] = useState(false);
  const [mergingPDFs, setMergingPDFs] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('invoice_submissions')
        .select('*')
        .eq('submitted_by', user.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load submissions",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
      pending: { variant: "secondary", color: "bg-yellow-100 text-yellow-800" },
      processed: { variant: "default", color: "bg-blue-100 text-blue-800" },
      approved: { variant: "default", color: "bg-green-100 text-green-800" },
      rejected: { variant: "destructive", color: "bg-red-100 text-red-800" },
    };
    
    const config = statusConfig[status] || { variant: "outline", color: "" };
    
    return (
      <Badge variant={config.variant} className="capitalize">
        {status}
      </Badge>
    );
  };

  const filteredSubmissions = submissions
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

  const handleSort = (column: "date" | "company" | "total") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const openNewSubmissionSheet = () => {
    resetForm();
    setEditingSubmission(null);
    setSheetOpen(true);
  };

  const openEditSheet = (submission: Submission) => {
    setEditingSubmission(submission);
    setInvoicingCompany(submission.invoicing_company);
    setInvoiceNumber(submission.invoice_number || "");
    setInvoiceDate(new Date(submission.invoice_date));
    setSubTotal(formatCurrency(submission.sub_total));
    setGstTotal(formatCurrency(submission.gst_total));
    setInvoiceTotal(formatCurrency(submission.invoice_total));
    setCodingRows(submission.coding_details || [{ id: "1", afeNumberCostCenter: "", costCode: "", total: "" }]);
    setEmailFields(submission.contact_emails.length > 0 ? submission.contact_emails : [""]);
    setAdditionalComments(submission.additional_comments || "");
    setSheetOpen(true);
  };

  const openViewDetails = (submission: Submission) => {
    setViewingSubmission(submission);
    setViewDetailsOpen(true);
  };

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
  };

  const handleDownload = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('submission-files')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() || 'invoice.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Could not download the file",
      });
    }
  };

  const handleDelete = async () => {
    if (!submissionToDelete) return;

    try {
      const { error } = await supabase
        .from('invoice_submissions')
        .delete()
        .eq('id', submissionToDelete);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Submission deleted successfully",
      });
      
      fetchSubmissions();
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Could not delete submission",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSubmissionToDelete(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'invoice' | 'supporting') => {
    const files = e.target.files;
    if (!files) return;
    
    if (type === 'invoice') {
      setInvoiceFile(files[0]);
    } else {
      setSupportingDocs(prev => [...prev, ...Array.from(files)]);
    }
  };

  const removeInvoiceFile = () => setInvoiceFile(null);
  const removeSupportingDoc = (index: number) => {
    setSupportingDocs(prev => prev.filter((_, i) => i !== index));
  };

  const handleCurrencyChange = (value: string, setter: (val: string) => void) => {
    setter(handleCurrencyInput(value));
  };

  const formatCurrencyOnBlur = (value: string, setter: (val: string) => void) => {
    const numericValue = parseCurrencyValue(value);
    if (numericValue !== null) {
      setter(formatCurrency(numericValue));
    }
  };

  const addCodingRow = () => {
    setCodingRows(prev => [...prev, {
      id: Date.now().toString(),
      afeNumberCostCenter: "",
      costCode: "",
      total: ""
    }]);
  };

  const removeCodingRow = (id: string) => {
    setCodingRows(prev => prev.filter(row => row.id !== id));
  };

  const updateCodingRow = (id: string, field: keyof CodingRow, value: string) => {
    setCodingRows(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const addEmailField = () => setEmailFields(prev => [...prev, ""]);
  const removeEmailField = (index: number) => {
    setEmailFields(prev => prev.filter((_, i) => i !== index));
  };
  const updateEmailField = (index: number, value: string) => {
    setEmailFields(prev => prev.map((email, i) => i === index ? value : email));
  };

  const validateForm = () => {
    if (!editingSubmission && !invoiceFile) return "Invoice document is required";
    if (!invoicingCompany.trim()) return "Invoicing company is required";
    if (!invoiceDate) return "Invoice date is required";
    if (!subTotal.trim()) return "Invoice sub total is required";
    if (!gstTotal.trim()) return "Invoice GST is required";
    if (!invoiceTotal.trim()) return "Invoice total is required";
    if (codingRows.length === 0) return "At least one coding row is required";
    
    const hasValidCoding = codingRows.some(row => 
      row.afeNumberCostCenter.trim() || (row.costCode.trim() && row.total.trim())
    );
    if (!hasValidCoding) return "Each coding row must have either an AFE Number/Cost Center or Cost Code and Total";
    
    if (!confirmationChecked) return "Please confirm field coding and signature are included";
    
    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: error,
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      let mergedFileName = editingSubmission?.invoice_file_path;

      // Only merge PDFs if it's a new submission or files were changed
      if (!editingSubmission || invoiceFile) {
        setMergingPDFs(true);
        toast({
          title: "Merging PDFs",
          description: "Combining invoice and supporting documents...",
        });

        const mergedPdfBlob = await mergePDFs(invoiceFile!, supportingDocs);
        setMergingPDFs(false);

        const mergedPdfFile = new File(
          [mergedPdfBlob], 
          `merged-invoice-${Date.now()}.pdf`,
          { type: 'application/pdf' }
        );

        mergedFileName = `${user.id}/${Date.now()}-merged-invoice.pdf`;
        const { error: uploadError } = await supabase.storage
          .from('submission-files')
          .upload(mergedFileName, mergedPdfFile);

        if (uploadError) throw uploadError;
      }

      const submissionData = {
        invoicing_company: invoicingCompany,
        invoice_number: invoiceNumber.trim() || null,
        invoice_date: invoiceDate!.toISOString().split('T')[0],
        sub_total: parseCurrencyValue(subTotal),
        gst_total: parseCurrencyValue(gstTotal),
        invoice_total: parseCurrencyValue(invoiceTotal),
        invoice_file_path: mergedFileName!,
        supporting_docs_paths: supportingDocs.map(doc => doc.name),
        coding_details: JSON.parse(JSON.stringify(codingRows)),
        contact_emails: emailFields.filter(email => email.trim()),
        additional_comments: additionalComments.trim() || null,
        submitted_by: user.id,
        status: 'pending'
      };

      if (editingSubmission) {
        const { error: updateError } = await supabase
          .from('invoice_submissions')
          .update(submissionData)
          .eq('id', editingSubmission.id);

        if (updateError) throw updateError;

        toast({
          title: "Updated successfully",
          description: "Your invoice submission has been updated.",
        });
      } else {
        const { error: insertError } = await supabase
          .from('invoice_submissions')
          .insert(submissionData);

        if (insertError) throw insertError;

        toast({
          title: "Invoice submitted successfully",
          description: "Your invoice is queued for processing.",
        });
      }
      
      setSheetOpen(false);
      resetForm();
      fetchSubmissions();
      
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: error instanceof Error ? error.message : "Failed to submit invoice.",
      });
    } finally {
      setSubmitting(false);
      setMergingPDFs(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Invoice Submission Portal</h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by invoice number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processed">Processed</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={openNewSubmissionSheet}>
            <Plus className="w-4 h-4 mr-2" />
            Submit New Invoice
          </Button>
        </div>

        {/* Submissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No submissions found. Click "Submit New Invoice" to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("date")}
                    >
                      Invoice Date {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead>
                      Invoice Number
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("total")}
                    >
                      Total {sortBy === "total" && (sortOrder === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openViewDetails(submission)}>
                      <TableCell>{format(new Date(submission.invoice_date), "MMM d, yyyy")}</TableCell>
                      <TableCell className="font-medium">{submission.invoice_number || "—"}</TableCell>
                      <TableCell>{formatCurrency(submission.invoice_total)}</TableCell>
                      <TableCell>{getStatusBadge(submission.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(submission.submitted_at), "MMM d, yyyy h:mm a")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openViewDetails(submission)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownload(submission.invoice_file_path)}
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {submission.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditSheet(submission)}
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSubmissionToDelete(submission.id);
                                  setDeleteDialogOpen(true);
                                }}
                                title="Delete"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>
              Submitted on {viewingSubmission && format(new Date(viewingSubmission.submitted_at), "MMMM d, yyyy 'at' h:mm a")}
            </DialogDescription>
          </DialogHeader>
          
          {viewingSubmission && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Company</label>
                  <p className="text-base">{viewingSubmission.invoicing_company}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Invoice Number</label>
                  <p className="text-base">{viewingSubmission.invoice_number || "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Invoice Date</label>
                  <p className="text-base">{format(new Date(viewingSubmission.invoice_date), "MMMM d, yyyy")}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sub Total</label>
                  <p className="text-base">{formatCurrency(viewingSubmission.sub_total)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">GST</label>
                  <p className="text-base">{formatCurrency(viewingSubmission.gst_total)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total</label>
                  <p className="text-base font-semibold">{formatCurrency(viewingSubmission.invoice_total)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(viewingSubmission.status)}</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Coding Details</label>
                <div className="mt-2 space-y-2">
                  {viewingSubmission.coding_details?.map((row: any, idx: number) => (
                    <div key={idx} className="p-3 bg-muted rounded-lg grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="font-medium">AFE/Cost Center: </span>
                        {row.afeNumberCostCenter || "-"}
                      </div>
                      <div>
                        <span className="font-medium">Cost Code: </span>
                        {row.costCode || "-"}
                      </div>
                      <div>
                        <span className="font-medium">Total: </span>
                        {row.total || "-"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {viewingSubmission.contact_emails?.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contact Emails</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {viewingSubmission.contact_emails.map((email, idx) => (
                      <Badge key={idx} variant="outline">{email}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {viewingSubmission.additional_comments && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Additional Comments</label>
                  <p className="mt-1 text-sm bg-muted p-3 rounded-lg">{viewingSubmission.additional_comments}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleDownload(viewingSubmission.invoice_file_path)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                {viewingSubmission.status === "pending" && (
                  <Button 
                    onClick={() => {
                      setViewDetailsOpen(false);
                      openEditSheet(viewingSubmission);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Submission
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this submission. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submission Form Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingSubmission ? "Edit Submission" : "Submit New Invoice"}</SheetTitle>
            <SheetDescription>
              {editingSubmission ? "Update your invoice submission details" : "Fill in the details to submit a new invoice"}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* File Upload - Only show for new submissions */}
            {!editingSubmission && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Upload Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Invoice Document *</label>
                    {!invoiceFile ? (
                      <div className="border-2 border-dashed rounded-lg p-4 text-center">
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleFileUpload(e, 'invoice')}
                          className="hidden"
                          id="invoice-upload"
                        />
                        <Button size="sm" onClick={() => document.getElementById('invoice-upload')?.click()}>
                          Choose File
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 p-2 bg-muted rounded">
                        <FileText className="h-6 w-6 text-blue-500" />
                        <span className="flex-1 text-sm">{invoiceFile.name}</span>
                        <Button size="sm" variant="ghost" onClick={removeInvoiceFile}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Supporting Documents</label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <input
                        type="file"
                        multiple
                        onChange={(e) => handleFileUpload(e, 'supporting')}
                        className="hidden"
                        id="supporting-upload"
                      />
                      <Button size="sm" onClick={() => document.getElementById('supporting-upload')?.click()}>
                        Choose Files
                      </Button>
                    </div>
                    {supportingDocs.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {supportingDocs.map((file, index) => (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-muted rounded">
                            <FileText className="h-6 w-6 text-blue-500" />
                            <span className="flex-1 text-sm">{file.name}</span>
                            <Button size="sm" variant="ghost" onClick={() => removeSupportingDoc(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Invoice Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Invoicing Company *</label>
                  <Input
                    value={invoicingCompany}
                    onChange={(e) => setInvoicingCompany(e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Invoice Number</label>
                  <Input
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="Enter invoice number (optional)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Invoice Date *</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !invoiceDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {invoiceDate ? format(invoiceDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={invoiceDate}
                        onSelect={setInvoiceDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-2">Sub Total *</label>
                    <Input
                      value={subTotal}
                      onChange={(e) => handleCurrencyChange(e.target.value, setSubTotal)}
                      onBlur={(e) => formatCurrencyOnBlur(e.target.value, setSubTotal)}
                      placeholder="$0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium mb-2">GST *</label>
                    <Input
                      value={gstTotal}
                      onChange={(e) => handleCurrencyChange(e.target.value, setGstTotal)}
                      onBlur={(e) => formatCurrencyOnBlur(e.target.value, setGstTotal)}
                      placeholder="$0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium mb-2">Total *</label>
                    <Input
                      value={invoiceTotal}
                      onChange={(e) => handleCurrencyChange(e.target.value, setInvoiceTotal)}
                      onBlur={(e) => formatCurrencyOnBlur(e.target.value, setInvoiceTotal)}
                      placeholder="$0.00"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Coding Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Coding Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {codingRows.map((row) => (
                  <div key={row.id} className="grid grid-cols-4 gap-2 p-3 border rounded">
                    <div>
                      <label className="block text-xs font-medium mb-1">AFE/Cost Center</label>
                      <Input
                        value={row.afeNumberCostCenter}
                        onChange={(e) => updateCodingRow(row.id, 'afeNumberCostCenter', e.target.value)}
                        placeholder="AB12345"
                        className="text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium mb-1">Cost Code</label>
                      <Input
                        value={row.costCode}
                        onChange={(e) => updateCodingRow(row.id, 'costCode', e.target.value)}
                        placeholder="1234-1234"
                        className="text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium mb-1">Total</label>
                      <Input
                        value={row.total}
                        onChange={(e) => handleCurrencyChange(e.target.value, (val) => updateCodingRow(row.id, 'total', val))}
                        onBlur={(e) => formatCurrencyOnBlur(e.target.value, (val) => updateCodingRow(row.id, 'total', val))}
                        placeholder="$0.00"
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="flex items-end">
                      {codingRows.length > 1 && (
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => removeCodingRow(row.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                <Button onClick={addCodingRow} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Row
                </Button>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Addresses</label>
                  {emailFields.map((email, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => updateEmailField(index, e.target.value)}
                        placeholder="email@example.com"
                      />
                      {emailFields.length > 1 && (
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => removeEmailField(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button size="sm" onClick={addEmailField} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Email
                  </Button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Additional Comments</label>
                  <Textarea
                    value={additionalComments}
                    onChange={(e) => setAdditionalComments(e.target.value)}
                    placeholder="Any additional notes"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Confirmation */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="confirmation"
                  checked={confirmationChecked}
                  onCheckedChange={(checked) => setConfirmationChecked(checked as boolean)}
                />
                <label htmlFor="confirmation" className="text-sm font-medium">
                  I confirm field coding and signature are included *
                </label>
              </div>
              
              <Button
                onClick={handleSubmit}
                disabled={submitting || mergingPDFs}
                className="w-full"
              >
                {mergingPDFs ? "Merging PDFs..." : submitting ? "Submitting..." : editingSubmission ? "Update Submission" : "Submit Invoice"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

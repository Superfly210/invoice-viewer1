
import { useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { mergePDFs } from "@/lib/pdfMerger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Upload, Plus, X, LogOut, FileText } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, parseCurrencyValue, handleCurrencyInput } from "@/lib/currencyFormatter";

interface CodingRow {
  id: string;
  afeNumberCostCenter: string;
  costCode: string;
  total: string;
}

export default function SubmissionPortal() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // File upload states
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [supportingDocs, setSupportingDocs] = useState<File[]>([]);
  
  // Form 1 - Invoice Details
  const [invoicingCompany, setInvoicingCompany] = useState("");
  const [invoiceDate, setInvoiceDate] = useState<Date>();
  const [subTotal, setSubTotal] = useState("");
  const [gstTotal, setGstTotal] = useState("");
  const [invoiceTotal, setInvoiceTotal] = useState("");
  
  // Form 2 - Coding Details
  const [codingRows, setCodingRows] = useState<CodingRow[]>([
    { id: "1", afeNumberCostCenter: "", costCode: "", total: "" }
  ]);
  
  // Form 3 - Contact Info
  const [emailFields, setEmailFields] = useState<string[]>([""]);
  const [additionalComments, setAdditionalComments] = useState("");
  
  // Final submission
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mergingPDFs, setMergingPDFs] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
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

  const removeInvoiceFile = () => {
    setInvoiceFile(null);
  };

  const removeSupportingDoc = (index: number) => {
    setSupportingDocs(prev => prev.filter((_, i) => i !== index));
  };

  const handleCurrencyChange = (value: string, setter: (val: string) => void) => {
    // Allow free typing and only clean up invalid characters
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

  const addEmailField = () => {
    setEmailFields(prev => [...prev, ""]);
  };

  const removeEmailField = (index: number) => {
    setEmailFields(prev => prev.filter((_, i) => i !== index));
  };

  const updateEmailField = (index: number, value: string) => {
    setEmailFields(prev => prev.map((email, i) => i === index ? value : email));
  };

  const validateForm = () => {
    if (!invoiceFile) return "Invoice document is required";
    if (!invoicingCompany.trim()) return "Invoicing company is required";
    if (!invoiceDate) return "Invoice date is required";
    if (!subTotal.trim()) return "Invoice sub total is required";
    if (!gstTotal.trim()) return "Invoice GST is required";
    if (!invoiceTotal.trim()) return "Invoice total is required";
    if (codingRows.length === 0) return "At least one coding row is required";
    
    // Check if at least one coding row has either AFE number/cost center or cost code and total
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

      const userId = user.id;
      
      // IMPORTANT: PDFs are merged with invoice FIRST, followed by supporting documents in the order they were uploaded
      // This maintains a consistent document structure for processing
      setMergingPDFs(true);
      toast({
        title: "Merging PDFs",
        description: "Combining invoice and supporting documents...",
      });

      let mergedPdfBlob: Blob;
      try {
        mergedPdfBlob = await mergePDFs(invoiceFile!, supportingDocs);
      } catch (mergeError) {
        setMergingPDFs(false);
        throw new Error(`PDF merge failed: ${mergeError instanceof Error ? mergeError.message : 'Unknown error'}`);
      }
      setMergingPDFs(false);

      // Convert Blob to File for upload
      const mergedPdfFile = new File(
        [mergedPdfBlob], 
        `merged-invoice-${Date.now()}.pdf`,
        { type: 'application/pdf' }
      );

      // Upload merged PDF (contains invoice first, then supporting docs)
      const mergedFileName = `${userId}/${Date.now()}-merged-invoice.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('submission-files')
        .upload(mergedFileName, mergedPdfFile);

      if (uploadError) throw uploadError;

      // Save submission data to database
      const { error: insertError } = await supabase
        .from('invoice_submissions')
        .insert({
          invoicing_company: invoicingCompany,
          invoice_date: invoiceDate!.toISOString().split('T')[0],
          sub_total: parseCurrencyValue(subTotal),
          gst_total: parseCurrencyValue(gstTotal),
          invoice_total: parseCurrencyValue(invoiceTotal),
          invoice_file_path: mergedFileName,
          supporting_docs_paths: supportingDocs.map(doc => doc.name),
          coding_details: JSON.parse(JSON.stringify(codingRows)),
          contact_emails: emailFields.filter(email => email.trim()),
          additional_comments: additionalComments.trim() || null,
          submitted_by: userId,
          status: 'pending'
        });

      if (insertError) throw insertError;

      toast({
        title: "Invoice submitted successfully",
        description: "Your invoice is queued for processing. You'll be notified once complete.",
      });
      
      // Clear all fields
      setInvoiceFile(null);
      setSupportingDocs([]);
      setInvoicingCompany("");
      setInvoiceDate(undefined);
      setSubTotal("");
      setGstTotal("");
      setInvoiceTotal("");
      setCodingRows([{ id: "1", afeNumberCostCenter: "", costCode: "", total: "" }]);
      setEmailFields([""]);
      setAdditionalComments("");
      setConfirmationChecked(false);
      
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: error instanceof Error ? error.message : "Failed to submit invoice. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Invoice Submission Portal</h1>
          <Button onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* File Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Invoice Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Invoice Document *</label>
              {!invoiceFile ? (
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop your invoice PDF here, or click to browse
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileUpload(e, 'invoice')}
                    className="hidden"
                    id="invoice-upload"
                  />
                  <Button onClick={() => document.getElementById('invoice-upload')?.click()}>
                    Choose File
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <span className="flex-1 text-sm">{invoiceFile.name}</span>
                  <Button
                    size="sm"
                    onClick={removeInvoiceFile}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Supporting Documents Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Additional Supporting Documents</label>
              <p className="text-xs text-muted-foreground mb-2">Field ticket backup and/or proof of field approval</p>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop supporting documents here, or click to browse
                </p>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e, 'supporting')}
                  className="hidden"
                  id="supporting-upload"
                />
                <Button onClick={() => document.getElementById('supporting-upload')?.click()}>
                  Choose Files
                </Button>
              </div>
              
              {/* Display uploaded supporting documents */}
              {supportingDocs.length > 0 && (
                <div className="mt-4 space-y-2">
                  {supportingDocs.map((file, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <span className="flex-1 text-sm">{file.name}</span>
                      <Button
                        size="sm"
                        onClick={() => removeSupportingDoc(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Form 1 - Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
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
                    {invoiceDate ? format(invoiceDate, "PPP") : "Select invoice date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={invoiceDate}
                    onSelect={setInvoiceDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Invoice Sub Total *</label>
                <Input
                  value={subTotal}
                  onChange={(e) => handleCurrencyChange(e.target.value, setSubTotal)}
                  onBlur={(e) => formatCurrencyOnBlur(e.target.value, setSubTotal)}
                  placeholder="$0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Invoice GST *</label>
                <Input
                  value={gstTotal}
                  onChange={(e) => handleCurrencyChange(e.target.value, setGstTotal)}
                  onBlur={(e) => formatCurrencyOnBlur(e.target.value, setGstTotal)}
                  placeholder="$0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Invoice Total *</label>
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

        {/* Form 2 - Invoice Coding Details */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Coding Details</CardTitle>
            <p className="text-sm text-muted-foreground">
              Each row must have either an AFE Number OR Cost Center, Cost Code and Total
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {codingRows.map((row, index) => (
              <div key={row.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                <div>
                  <label className="block text-xs font-medium mb-1">AFE Number/Cost Center</label>
                  <Input
                    value={row.afeNumberCostCenter}
                    onChange={(e) => updateCodingRow(row.id, 'afeNumberCostCenter', e.target.value)}
                    placeholder="For AFEs: 'AB12345', For Cost Centers: '1'"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium mb-1">Cost Code</label>
                  <Input
                    value={row.costCode}
                    onChange={(e) => updateCodingRow(row.id, 'costCode', e.target.value)}
                    placeholder="1234-1234"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium mb-1">Total</label>
                  <Input
                    value={row.total}
                    onChange={(e) => handleCurrencyChange(e.target.value, (val) => updateCodingRow(row.id, 'total', val))}
                    onBlur={(e) => formatCurrencyOnBlur(e.target.value, (val) => updateCodingRow(row.id, 'total', val))}
                    placeholder="$0.00"
                  />
                </div>
                
                <div className="flex items-end">
                  {codingRows.length > 1 && (
                    <Button
                      size="icon"
                      onClick={() => removeCodingRow(row.id)}
                      className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            <Button onClick={addCodingRow}>
              <Plus className="w-4 h-4 mr-2" />
              Add Coding Row
            </Button>
          </CardContent>
        </Card>

        {/* Form 3 - Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email Addresses for Additional Correspondence</label>
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
                      onClick={() => removeEmailField(index)}
                      className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button size="sm" onClick={addEmailField}>
                <Plus className="w-4 h-4 mr-2" />
                Add Email
              </Button>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Additional Comments</label>
              <Textarea
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
                placeholder="Enter any additional comments or notes"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Final Submission */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="confirmation"
                  checked={confirmationChecked}
                  onCheckedChange={(checked) => setConfirmationChecked(checked as boolean)}
                />
                <label htmlFor="confirmation" className="text-sm font-medium">
                  I confirm field coding and signature are included in the invoice or supporting documents *
                </label>
              </div>
              
              <Button
                onClick={handleSubmit}
                disabled={submitting || mergingPDFs}
                className="w-full"
                size="lg"
              >
                {mergingPDFs ? "Merging PDFs..." : submitting ? "Submitting..." : "Submit Invoice"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

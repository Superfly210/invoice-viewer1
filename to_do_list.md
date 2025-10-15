# Invoice Submission Portal Refactoring - TODO List

## Overview
This refactoring implements two major changes:
1. Client-side PDF merging using pdf-lib to combine invoice + supporting documents (invoice first, then supporting docs in order)
2. Pull-based architecture (Option 3) where n8n polls Supabase instead of receiving webhook pushes

---

## Part 1: Database Schema Updates

### Task 1.1: Add Status Tracking Columns
- Create a new Supabase migration file
- Add the following columns to invoice_submissions table:
  ALTER TABLE invoice_submissions 
  ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  ADD COLUMN processed_at TIMESTAMP,
  ADD COLUMN error_message TEXT;
  
- Create an index for performance:
  CREATE INDEX idx_invoice_submissions_status ON invoice_submissions(status, created_at);
  
- Run the migration against your Supabase database
- Verify columns were added successfully in Supabase dashboard

### Task 1.2: Update Storage Schema (Optional)
- Consider renaming invoice_file_path to merged_pdf_path for clarity
- If renaming, create migration to rename column
- Update all references in code if renamed

---

## Part 2: Install Dependencies

### Task 2.1: Verify pdf-lib Package
- Confirm pdf-lib is already in package.json
- If not present, run: npm install pdf-lib
- Verify @types/pdf-lib if using TypeScript

### Task 2.2: Remove Unused Dependencies (Optional)
- Since we're removing the axios webhook call, consider if axios is still needed elsewhere
- If not used elsewhere, run: npm uninstall axios

---

## Part 3: Create PDF Utility Functions

### Task 3.1: Create PDF Merge Utility File
- Create new file: src/lib/pdfMerger.ts
- Import pdf-lib: import { PDFDocument } from 'pdf-lib'
- Create async function mergePDFs(invoiceFile: File, supportingDocs: File[]): Promise<Blob>
  - CRITICAL: Invoice file must be first, followed by supporting docs in the exact order provided
  - Create new PDFDocument
  - First, process the invoice file:
    - Read invoice file as ArrayBuffer
    - Load PDF from ArrayBuffer using PDFDocument.load()
    - Copy all pages from invoice PDF using copyPages()
    - Add invoice pages to merged document
  - Then, loop through each supporting doc in order:
    - Read file as ArrayBuffer
    - Load PDF from ArrayBuffer using PDFDocument.load()
    - Copy all pages from source PDF to merged document using copyPages()
    - Add copied pages to merged document
  - Save merged document as Uint8Array
  - Convert to Blob with type 'application/pdf'
  - Return Blob
- Add error handling with try-catch
- Add validation to ensure files are valid PDFs
- Add detailed error messages for debugging

### Task 3.2: Example Implementation Structure
Create src/lib/pdfMerger.ts with this structure:

import { PDFDocument } from 'pdf-lib';

export async function mergePDFs(invoiceFile: File, supportingDocs: File[]): Promise<Blob> {
  try {
    // Validate invoice file exists
    if (!invoiceFile) {
      throw new Error('Invoice file is required');
    }

    // Create new merged PDF
    const mergedPdf = await PDFDocument.create();

    // STEP 1: Process invoice file FIRST
    const invoiceArrayBuffer = await invoiceFile.arrayBuffer();
    const invoicePdf = await PDFDocument.load(invoiceArrayBuffer);
    const invoicePages = await mergedPdf.copyPages(invoicePdf, invoicePdf.getPageIndices());
    invoicePages.forEach(page => mergedPdf.addPage(page));

    // STEP 2: Process supporting docs IN ORDER
    for (let i = 0; i < supportingDocs.length; i++) {
      const doc = supportingDocs[i];
      const docArrayBuffer = await doc.arrayBuffer();
      const docPdf = await PDFDocument.load(docArrayBuffer);
      const docPages = await mergedPdf.copyPages(docPdf, docPdf.getPageIndices());
      docPages.forEach(page => mergedPdf.addPage(page));
    }

    // Save and return
    const mergedPdfBytes = await mergedPdf.save();
    return new Blob([mergedPdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('PDF merge error:', error);
    throw new Error(`Failed to merge PDFs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

---

## Part 4: Update SubmissionPortal.tsx

### Task 4.1: Import PDF Merger
- Add import at top of file: import { mergePDFs } from '@/lib/pdfMerger'

### Task 4.2: Add Loading State for PDF Merging
- Add new state: const [mergingPDFs, setMergingPDFs] = useState(false)
- This will show user feedback during merge operation

### Task 4.3: Modify handleSubmit Function - PDF Merging Section
- Locate the file upload section in handleSubmit (after validation, before Supabase upload)
- Add PDF merging logic BEFORE any file uploads:

  // Merge PDFs before upload (invoice first, then supporting docs in order)
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

### Task 4.4: Update File Upload Logic
- Replace the two separate upload sections (invoice + supporting docs) with single merged PDF upload:

  // Upload merged PDF (contains invoice first, then supporting docs)
  const mergedFileName = `${userId}/${Date.now()}-merged-invoice.pdf`;
  const { error: uploadError } = await supabase.storage
    .from('submission-files')
    .upload(mergedFileName, mergedPdfFile);

  if (uploadError) throw uploadError;

- Remove the old invoiceFileName upload code block
- Remove the old supportingDocPaths loop upload code block
- Remove the supportingDocPaths array declaration

### Task 4.5: Update Database Insert
- Modify the Supabase insert to use new schema:

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

- Note: supporting_docs_paths now stores just the original filenames for reference
- Note: status is set to 'pending' for n8n to process

### Task 4.6: Remove n8n Webhook Call
- Delete the entire try-catch block that contains axios.post to n8n webhook
- Remove all FormData creation code for webhook
- Remove formData.append() calls
- Remove the webhook success toast
- Remove the webhook error handling toast and console.error
- Keep only the final success toast with updated message:

  toast({
    title: "Invoice submitted successfully",
    description: "Your invoice has been received and is queued for processing.",
  });

### Task 4.7: Update Submit Button Text
- Update button disabled state to include mergingPDFs:

  <Button
    onClick={handleSubmit}
    disabled={submitting || mergingPDFs}
    className="w-full"
    size="lg"
  >
    {mergingPDFs ? "Merging PDFs..." : submitting ? "Submitting..." : "Submit Invoice"}
  </Button>

### Task 4.8: Update Success Message
- The success toast should indicate queued processing:

  toast({
    title: "Invoice submitted successfully",
    description: "Your invoice is queued for processing. You'll be notified once complete.",
  });

### Task 4.9: Add Comment Documentation
- Add comment above PDF merging section explaining the order:
  // IMPORTANT: PDFs are merged with invoice FIRST, followed by supporting documents in the order they were uploaded
  // This maintains a consistent document structure for processing

---

## Notes for Cursor

CRITICAL REQUIREMENTS:
- pdf-lib is already installed - do NOT reinstall it
- PDF merge order is CRITICAL: Invoice file MUST be first, then supporting docs in exact order provided
- The mergePDFs function signature must accept invoiceFile as first parameter and supportingDocs array as second parameter
- Database changes must be completed and verified before making code changes
- All file upload logic must be replaced with single merged PDF upload
- Remove ALL axios webhook code completely - no webhook calls should remain
- The status field must be set to 'pending' on every new submission
- Keep all existing form validation logic intact
- Maintain all existing form fields and their validation rules
- Error messages should be user-friendly and specific
- Test PDF merging with various file sizes and page counts
- Ensure merged PDF maintains quality and all pages are included
- Consider Supabase storage limits (50MB on free tier, adjust if needed)
- The supporting_docs_paths field now stores original filenames only (for reference/audit trail)
- Make sure to handle edge cases: single invoice with no supporting docs, large PDFs, corrupted PDFs
- Add appropriate loading states so users know PDF merging is happening
- Clean up all unused imports after removing webhook code (especially axios if unused elsewhere)

IMPLEMENTATION ORDER:
1. Database schema changes FIRST
2. Create pdfMerger.ts utility
3. Update SubmissionPortal.tsx imports and state
4. Modify handleSubmit function
5. Remove all webhook-related code
6. Test thoroughly with various PDF combinations
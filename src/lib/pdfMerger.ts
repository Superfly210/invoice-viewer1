import { PDFDocument } from 'pdf-lib';

/**
 * Merges an invoice PDF with supporting documents in the specified order.
 * The invoice file is always placed first, followed by supporting documents
 * in the exact order they are provided.
 * 
 * @param invoiceFile - The main invoice PDF file (required)
 * @param supportingDocs - Array of supporting document PDF files (optional)
 * @returns Promise<Blob> - The merged PDF as a Blob
 * @throws Error if merge fails or files are invalid
 */
export async function mergePDFs(invoiceFile: File, supportingDocs: File[]): Promise<Blob> {
  try {
    // Validate invoice file exists
    if (!invoiceFile) {
      throw new Error('Invoice file is required');
    }

    // Validate file types
    if (invoiceFile.type !== 'application/pdf') {
      throw new Error('Invoice file must be a PDF');
    }

    for (const doc of supportingDocs) {
      if (doc.type !== 'application/pdf') {
        throw new Error('All supporting documents must be PDFs');
      }
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

    // Save and return merged PDF
    const mergedPdfBytes = await mergedPdf.save();
    return new Blob([mergedPdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('PDF merge error:', error);
    throw new Error(`Failed to merge PDFs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

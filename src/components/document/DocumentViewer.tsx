
import React, { useState } from "react";
import { PDFViewer } from "@/components/PDFViewer";
import { EmailViewer } from "@/components/EmailViewer";
import { MarkdownViewer } from "@/components/MarkdownViewer";
import { InvoiceExtractViewer } from "@/components/InvoiceExtractViewer";
import { InvoiceLocalOCRViewer } from "@/components/InvoiceLocalOCRViewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileIcon, MailIcon, FileText } from "lucide-react";

interface DocumentViewerProps {
  currentPdfUrl: string | null;
  currentInvoiceId: number | null;
  emailInfoId: number | null;
  onPdfPageChange: (currentPage: number, totalPages: number) => void;
}

export const DocumentViewer = ({
  currentPdfUrl,
  currentInvoiceId,
  emailInfoId,
  onPdfPageChange,
}: DocumentViewerProps) => {
  const [activeDocTab, setActiveDocTab] = useState("pdf");

  return (
    <div className="h-full overflow-hidden">
      <Tabs value={activeDocTab} onValueChange={setActiveDocTab} className="w-full h-full">
        <TabsList className="grid w-full grid-cols-5 mx-4 mt-4">
          <TabsTrigger value="pdf" className="flex items-center">
            <FileIcon className="h-4 w-4 mr-2" />
            Invoice PDF
          </TabsTrigger>
          <TabsTrigger value="markdown" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Invoice Markdown
          </TabsTrigger>
          <TabsTrigger value="extract" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Invoice Extract
          </TabsTrigger>
          <TabsTrigger value="ocr" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Invoice Local OCR
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center">
            <MailIcon className="h-4 w-4 mr-2" />
            Email Message
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pdf" className="mt-0 h-full">
          <PDFViewer 
            pdfUrl={currentPdfUrl} 
            onPageChange={onPdfPageChange}
          />
        </TabsContent>
        <TabsContent value="email" className="mt-0 h-[calc(100%-60px)]">
          <EmailViewer 
            currentInvoiceId={currentInvoiceId}
            emailInfoId={emailInfoId}
          />
        </TabsContent>
        <TabsContent value="markdown" className="mt-0 h-[calc(100%-60px)]">
          <MarkdownViewer 
            currentInvoiceId={currentInvoiceId}
          />
        </TabsContent>
        <TabsContent value="extract" className="mt-0 h-[calc(100%-60px)]">
          <InvoiceExtractViewer 
            currentInvoiceId={currentInvoiceId}
          />
        </TabsContent>
        <TabsContent value="ocr" className="mt-0 h-[calc(100%-60px)]">
          <InvoiceLocalOCRViewer 
            currentInvoiceId={currentInvoiceId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};


import React, { useState } from "react";
import { PDFViewer } from "@/components/PDFViewer";
import { EmailViewer } from "@/components/EmailViewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileIcon, MailIcon } from "lucide-react";

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
    <div className="h-full overflow-auto">
      <Tabs value={activeDocTab} onValueChange={setActiveDocTab} className="w-full h-full">
        <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
          <TabsTrigger value="pdf" className="flex items-center">
            <FileIcon className="h-4 w-4 mr-2" />
            Invoice PDF
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center">
            <MailIcon className="h-4 w-4 mr-2" />
            Email Message
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pdf" className="mt-0 h-[calc(100%-60px)]">
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
      </Tabs>
    </div>
  );
};

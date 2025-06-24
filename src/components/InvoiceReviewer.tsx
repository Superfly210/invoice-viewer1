
import { useState } from "react";
import { ActionBarWithThemeToggle } from "@/components/ActionBarWithThemeToggle";
import { LineItemsPanel } from "@/components/LineItemsPanel";
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizableHandle 
} from "@/components/ui/resizable";
import { PanelBottomIcon } from "lucide-react";
import { InvoiceDataPanel } from "@/components/invoice/InvoiceDataPanel";
import { DocumentViewer } from "@/components/document/DocumentViewer";
import { useInvoiceData } from "@/hooks/useInvoiceData";
import { useToastNotifications } from "@/hooks/useToastNotifications";
import { useInvoiceDataFetching } from "@/hooks/useInvoiceDataFetching";

interface InvoiceReviewerProps {
  onSectionChange?: (section: string) => void;
}

export const InvoiceReviewer = ({ onSectionChange }: InvoiceReviewerProps) => {
  const [currentInvoiceIndex, setCurrentInvoiceIndex] = useState(0);
  const [pdfCurrentPage, setPdfCurrentPage] = useState(1);
  const [pdfTotalPages, setPdfTotalPages] = useState(3);
  
  const { 
    totalInvoices, 
    currentPdfUrl, 
    currentInvoiceId, 
    currentEmailInfoId 
  } = useInvoiceData(currentInvoiceIndex);

  const { currentInvoice } = useInvoiceDataFetching(currentInvoiceIndex);
  
  const {
    handleApprove,
    handleDeny,
    handleQuarantine,
    handleForward
  } = useToastNotifications(currentInvoiceId);

  const handlePrevious = () => {
    console.log("Previous clicked, current index:", currentInvoiceIndex);
    const newIndex = Math.max(0, currentInvoiceIndex - 1);
    setCurrentInvoiceIndex(newIndex);
    setPdfCurrentPage(1); // Reset to first page when changing invoices
    console.log("New index:", newIndex);
  };

  const handleNext = () => {
    console.log("Next clicked, current index:", currentInvoiceIndex, "total:", totalInvoices);
    if (currentInvoiceIndex < totalInvoices - 1) {
      const newIndex = currentInvoiceIndex + 1;
      setCurrentInvoiceIndex(newIndex);
      setPdfCurrentPage(1); // Reset to first page when changing invoices
      console.log("New index:", newIndex);
    }
  };

  const handlePdfPageChange = (currentPage: number, totalPages: number) => {
    console.log("PDF page changed:", currentPage, "of", totalPages);
    setPdfCurrentPage(currentPage);
    setPdfTotalPages(totalPages);
  };

  console.log("InvoiceReviewer rendering with index:", currentInvoiceIndex);

  return (
    <>
      <ActionBarWithThemeToggle 
        onApprove={handleApprove}
        onDeny={handleDeny}
        onQuarantine={handleQuarantine}
        onForward={handleForward}
        currentInvoice={currentInvoiceIndex + 1}
        totalInvoices={totalInvoices}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
      <ResizablePanelGroup direction="vertical" className="flex-1">
        <ResizablePanel defaultSize={70} minSize={30}>
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={50} minSize={30}>
              <InvoiceDataPanel 
                currentInvoiceIndex={currentInvoiceIndex}
                onSectionChange={onSectionChange} 
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
              <DocumentViewer
                currentPdfUrl={currentPdfUrl}
                currentInvoiceId={currentInvoiceId}
                emailInfoId={currentEmailInfoId}
                onPdfPageChange={handlePdfPageChange}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle withHandle>
          <div className="flex justify-center items-center w-full h-full">
            <PanelBottomIcon className="h-4 w-4 text-slate-400" />
          </div>
        </ResizableHandle>
        <ResizablePanel defaultSize={30} minSize={15}>
          <LineItemsPanel currentInvoiceId={currentInvoiceId} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
};

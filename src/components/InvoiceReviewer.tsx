
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
import { useToastNotifications } from "@/hooks/useToastNotifications";
import { useInvoiceFiltering } from "@/hooks/useInvoiceFiltering";

interface InvoiceReviewerProps {
  onSectionChange?: (section: string) => void;
}

export const InvoiceReviewer = ({ onSectionChange }: InvoiceReviewerProps) => {
  const [currentFilteredIndex, setCurrentFilteredIndex] = useState(0);
  const [pdfCurrentPage, setPdfCurrentPage] = useState(1);
  const [pdfTotalPages, setPdfTotalPages] = useState(3);
  
  const {
    filteredInvoices,
    isLoading,
    userFilter,
    setUserFilter,
    statusFilter,
    setStatusFilter,
    totalFilteredCount,
  } = useInvoiceFiltering();

  const currentInvoice = filteredInvoices[currentFilteredIndex] || null;
  const currentInvoiceId = currentInvoice?.id || null;
  const currentEmailInfoId = currentInvoice?.Email_Info_ID || null;
  const currentPdfUrl = currentInvoice?.Google_Drive_URL || null;
  
  const {
    handleApprove,
    handleDeny,
    handleQuarantine,
    handleForward
  } = useToastNotifications(currentInvoiceId);

  const handlePrevious = () => {
    console.log("Previous clicked, current index:", currentFilteredIndex);
    const newIndex = Math.max(0, currentFilteredIndex - 1);
    setCurrentFilteredIndex(newIndex);
    setPdfCurrentPage(1);
    console.log("New index:", newIndex);
  };

  const handleNext = () => {
    console.log("Next clicked, current index:", currentFilteredIndex, "total:", totalFilteredCount);
    if (currentFilteredIndex < totalFilteredCount - 1) {
      const newIndex = currentFilteredIndex + 1;
      setCurrentFilteredIndex(newIndex);
      setPdfCurrentPage(1);
      console.log("New index:", newIndex);
    }
  };

  const handlePdfPageChange = (currentPage: number, totalPages: number) => {
    console.log("PDF page changed:", currentPage, "of", totalPages);
    setPdfCurrentPage(currentPage);
    setPdfTotalPages(totalPages);
  };

  const handleUserFilterChange = (filter: "all" | "mine") => {
    setUserFilter(filter);
    setCurrentFilteredIndex(0); // Reset to first invoice when filter changes
  };

  const handleStatusFilterChange = (filter: "all" | "pending" | "approved" | "hold") => {
    setStatusFilter(filter);
    setCurrentFilteredIndex(0); // Reset to first invoice when filter changes
  };

  console.log("InvoiceReviewer rendering with index:", currentFilteredIndex);

  return (
    <>
      <ActionBarWithThemeToggle 
        onApprove={handleApprove}
        onDeny={handleDeny}
        onQuarantine={handleQuarantine}
        onForward={handleForward}
        currentInvoice={currentFilteredIndex + 1}
        totalInvoices={totalFilteredCount}
        onPrevious={handlePrevious}
        onNext={handleNext}
        userFilter={userFilter}
        onUserFilterChange={handleUserFilterChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
      />
      <ResizablePanelGroup direction="vertical" className="flex-1">
        <ResizablePanel defaultSize={70} minSize={30}>
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={50} minSize={30}>
              <InvoiceDataPanel 
                currentInvoiceIndex={currentFilteredIndex}
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

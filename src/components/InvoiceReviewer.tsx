
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
import { useToast } from "@/hooks/use-toast";

export const InvoiceReviewer = () => {
  const [currentFilteredIndex, setCurrentFilteredIndex] = useState(0);
  const [pdfCurrentPage, setPdfCurrentPage] = useState(1);
  const [pdfTotalPages, setPdfTotalPages] = useState(3);
  const { toast } = useToast();
  
  const {
    filteredInvoices,
    isLoading,
    userFilter,
    setUserFilter,
    statusFilter,
    setStatusFilter,
    sortOrder,
    setSortOrder,
    totalFilteredCount,
    refreshData,
  } = useInvoiceFiltering();

  const currentInvoice = filteredInvoices[currentFilteredIndex] || null;
  const currentInvoiceId = currentInvoice?.id || null;
  const currentEmailInfoId = currentInvoice?.Email_Info_ID || null;
  const currentPdfUrl = currentInvoice?.Google_Drive_URL || null;
  
  const {
    handleApprove,
    handleDeny,
    handleQuarantine,
    handleNotAnInvoice,
    handleApproveAndForward,
    handleForward
  } = useToastNotifications(currentInvoiceId);

  const handlePrevious = () => {
    const newIndex = Math.max(0, currentFilteredIndex - 1);
    setCurrentFilteredIndex(newIndex);
    setPdfCurrentPage(1);
  };

  const handleNext = () => {
    if (currentFilteredIndex < totalFilteredCount - 1) {
      const newIndex = currentFilteredIndex + 1;
      setCurrentFilteredIndex(newIndex);
      setPdfCurrentPage(1);
    }
  };

  const handlePdfPageChange = (currentPage: number, totalPages: number) => {
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

  const handleSortOrderChange = (order: "newest" | "oldest") => {
    setSortOrder(order);
    setCurrentFilteredIndex(0); // Reset to first invoice when sort order changes
    refreshData();
  };

  const handleRefresh = () => {
    refreshData();
    toast({
      title: "Data Refreshed",
      description: "Invoice data has been refreshed from the database",
    });
  };

  return (
    <>
      <ActionBarWithThemeToggle 
        onApprove={handleApprove}
        onDeny={handleDeny}
        onQuarantine={handleQuarantine}
        onNotAnInvoice={handleNotAnInvoice}
        onApproveAndForward={handleApproveAndForward}
        onForward={handleForward}
        currentInvoice={currentFilteredIndex + 1}
        totalInvoices={totalFilteredCount}
        onPrevious={handlePrevious}
        onNext={handleNext}
        userFilter={userFilter}
        onUserFilterChange={handleUserFilterChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        sortOrder={sortOrder}
        onSortOrderChange={handleSortOrderChange}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />
      <ResizablePanelGroup direction="vertical" className="flex-1">
        <ResizablePanel defaultSize={70} minSize={30}>
          <div className="flex h-full">
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={50} minSize={30}>
                <InvoiceDataPanel 
                  currentInvoice={currentInvoice}
                  isLoading={isLoading}
                />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50} minSize={30}>
                <div className="flex-1 overflow-auto">
                  <DocumentViewer
                    currentPdfUrl={currentPdfUrl}
                    currentInvoiceId={currentInvoiceId}
                    emailInfoId={currentEmailInfoId}
                    onPdfPageChange={handlePdfPageChange}
                  />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
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

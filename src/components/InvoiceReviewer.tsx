
import { useState, useMemo, useEffect, useRef } from "react";
import { ActionBarWithThemeToggle } from "@/components/ActionBarWithThemeToggle";
import { LineItemsPanel } from "@/components/LineItemsPanel";
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizableHandle 
} from "@/components/ui/resizable";
import { PanelBottomIcon, ChevronRight, ChevronLeft } from "lucide-react";
import { InvoiceDataPanel } from "@/components/invoice/InvoiceDataPanel";
import { DocumentViewer } from "@/components/document/DocumentViewer";
import { MetadataPanel } from "@/components/MetadataPanel";
import { useToastNotifications } from "@/hooks/useToastNotifications";
import { useInvoiceFiltering } from "@/hooks/useInvoiceFiltering";
import { useToast } from "@/hooks/use-toast";
import { usePdfPreloader } from "@/hooks/usePdfPreloader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const InvoiceReviewer = ({ 
  initialInvoiceId 
}: { 
  initialInvoiceId?: number 
} = {}) => {
  const [currentFilteredIndex, setCurrentFilteredIndex] = useState(0);
  const [pdfCurrentPage, setPdfCurrentPage] = useState(1);
  const [pdfTotalPages, setPdfTotalPages] = useState(3);
  const [isMetadataPanelOpen, setIsMetadataPanelOpen] = useState(true);
  const metadataPanelRef = useRef<any>(null);
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
  
  // 🎯 Extract PDF URLs from filtered invoices for preloading
  const filteredPdfUrls = useMemo(() => {
    return filteredInvoices.map(inv => inv.Google_Drive_URL);
  }, [filteredInvoices]);

  // 🎯 Preload adjacent PDFs based on current filter
  usePdfPreloader({
    currentIndex: currentFilteredIndex,
    pdfUrls: filteredPdfUrls,
    preloadCount: 2, // Preload 2 ahead and 2 behind
    enabled: filteredInvoices.length > 0,
  });

  // Set initial invoice index when initialInvoiceId is provided
  // Clear filters first to ensure the invoice is visible
  useEffect(() => {
    if (initialInvoiceId) {
      // Clear filters to show all invoices
      setUserFilter("all");
      setStatusFilter("all");
    }
  }, [initialInvoiceId, setUserFilter, setStatusFilter]);

  // Find and navigate to the specific invoice after filters are cleared
  useEffect(() => {
    if (initialInvoiceId && filteredInvoices.length > 0) {
      const index = filteredInvoices.findIndex(inv => inv.id === initialInvoiceId);
      if (index !== -1) {
        setCurrentFilteredIndex(index);
        setPdfCurrentPage(1);
      } else {
        // If invoice not found, show a toast notification
        toast({
          variant: "destructive",
          title: "Invoice Not Found",
          description: `Invoice ID ${initialInvoiceId} could not be found in the current view.`,
        });
      }
    }
  }, [initialInvoiceId, filteredInvoices, toast]);
  
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

  const toggleMetadataPanel = () => {
    if (metadataPanelRef.current) {
      if (isMetadataPanelOpen) {
        metadataPanelRef.current.collapse();
      } else {
        metadataPanelRef.current.expand();
      }
    }
    setIsMetadataPanelOpen(prev => !prev);
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
              <ResizablePanel defaultSize={25} minSize={20}>
                <InvoiceDataPanel 
                  currentInvoice={currentInvoice}
                  isLoading={isLoading}
                />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={75} minSize={30}>
                <ResizablePanelGroup direction="horizontal">
                  <ResizablePanel
                    ref={metadataPanelRef}
                    defaultSize={33}
                    minSize={isMetadataPanelOpen ? 20 : 0}
                    collapsible={true}
                    collapsedSize={0}
                  >
                    <div className="h-full flex flex-col">
                      <div className="flex-1 overflow-auto">
                        <MetadataPanel currentInvoiceId={currentInvoice?.id || null} />
                      </div>
                    </div>
                  </ResizablePanel>
                  <ResizableHandle withHandle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMetadataPanel}
                      className={cn(
                        "h-8 w-8 p-0 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700",
                        "absolute top-1/2 -translate-y-1/2 z-10",
                        "flex items-center justify-center"
                      )}
                    >
                      {isMetadataPanelOpen ? (
                        <ChevronLeft className="h-4 w-4 text-slate-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-500" />
                      )}
                    </Button>
                  </ResizableHandle>
                  <ResizablePanel defaultSize={67} minSize={30}>
                    <div className="flex-1 overflow-hidden h-full">
                      <DocumentViewer
                        currentPdfUrl={currentPdfUrl}
                        currentInvoiceId={currentInvoiceId}
                        emailInfoId={currentEmailInfoId}
                        onPdfPageChange={handlePdfPageChange}
                      />
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
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
          <LineItemsPanel currentInvoiceId={currentInvoiceId} currentInvoice={currentInvoice} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
};

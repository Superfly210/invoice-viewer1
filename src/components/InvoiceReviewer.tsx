
import { useState, useEffect } from "react";
import { ActionBarWithThemeToggle } from "@/components/ActionBarWithThemeToggle";
import { InvoiceData } from "@/components/InvoiceData";
import { PDFViewer } from "@/components/PDFViewer";
import { EmailViewer } from "@/components/EmailViewer";
import { MetadataPanel } from "@/components/MetadataPanel";
import { LineItemsPanel } from "@/components/LineItemsPanel";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizableHandle 
} from "@/components/ui/resizable";
import { FileTextIcon, TableIcon, MailIcon, FileIcon, PanelBottomIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface InvoiceReviewerProps {
  onSectionChange?: (section: string) => void;
}

export const InvoiceReviewer = ({ onSectionChange }: InvoiceReviewerProps) => {
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [activeTab, setActiveTab] = useState("data");
  const [activeDocTab, setActiveDocTab] = useState("pdf");
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(null);
  const [currentInvoiceIndex, setCurrentInvoiceIndex] = useState(0);
  const [currentInvoiceId, setCurrentInvoiceId] = useState<number | null>(null);
  const [currentEmailInfoId, setCurrentEmailInfoId] = useState<number | null>(null);
  const [pdfCurrentPage, setPdfCurrentPage] = useState(1);
  const [pdfTotalPages, setPdfTotalPages] = useState(3);
  const { toast } = useToast();

  // Fetch the current invoice's PDF URL and get total count
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get total count of invoices
        const { count, error: countError } = await supabase
          .from('Attachment_Info')
          .select('*', { count: 'exact', head: true });
        
        if (countError) throw countError;
        setTotalInvoices(count || 0);
        
        // Fetch current invoice data
        const { data, error } = await supabase
          .from('Attachment_Info')
          .select('*')
          .order('id', { ascending: true })
          .range(currentInvoiceIndex, currentInvoiceIndex);

        if (error) throw error;
        
        if (data && data.length > 0) {
          // Log more details about the data we received
          console.log("Invoice data retrieved:", data[0]);
          
          // Extract PDF URL correctly
          let url = null;
          if (data[0].Google_Drive_URL) {
            // Handle both object and string types for Google_Drive_URL
            if (typeof data[0].Google_Drive_URL === 'object') {
              url = String(JSON.stringify(data[0].Google_Drive_URL));
            } else {
              url = String(data[0].Google_Drive_URL);
            }
            console.log("Extracted PDF URL:", url);
          }
          
          setCurrentPdfUrl(url);
          setCurrentInvoiceId(data[0].id);
          setCurrentEmailInfoId(data[0].Email_Info_ID);
          console.log("InvoiceReviewer - Set current invoice ID to:", data[0].id);
          console.log("InvoiceReviewer - Set current email info ID to:", data[0].Email_Info_ID);
        } else {
          console.log("No invoice data found for index:", currentInvoiceIndex);
        }
      } catch (error) {
        console.error('Error fetching invoice data:', error);
        toast({
          title: "Error",
          description: "Failed to load invoice data",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [currentInvoiceIndex, toast]);

  const handleApprove = () => {
    toast({
      title: "Invoice Approved",
      description: "The invoice has been successfully approved.",
      variant: "default",
    });
  };

  const handleDeny = () => {
    toast({
      title: "Invoice Denied",
      description: "The invoice has been denied.",
      variant: "destructive",
    });
  };

  const handleQuarantine = () => {
    toast({
      title: "Invoice Quarantined",
      description: "The invoice has been placed in quarantine for further review.",
      variant: "default",
    });
  };

  const handleForward = () => {
    toast({
      title: "Invoice Forwarded",
      description: "The invoice has been forwarded for review.",
    });
  };

  const handlePrevious = () => {
    setCurrentInvoiceIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    if (currentInvoiceIndex < totalInvoices - 1) {
      setCurrentInvoiceIndex(prev => prev + 1);
    }
  };

  const handlePdfPageChange = (currentPage: number, totalPages: number) => {
    setPdfCurrentPage(currentPage);
    setPdfTotalPages(totalPages);
  };

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
              <div className="h-full overflow-auto p-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="data" className="flex items-center">
                      <TableIcon className="h-4 w-4 mr-2" />
                      Invoice Data
                    </TabsTrigger>
                    <TabsTrigger value="metadata" className="flex items-center">
                      <FileTextIcon className="h-4 w-4 mr-2" />
                      Metadata
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="data" className="mt-0">
                    <InvoiceData />
                  </TabsContent>
                  <TabsContent value="metadata" className="mt-0">
                    <MetadataPanel />
                  </TabsContent>
                </Tabs>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
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
                      onPageChange={handlePdfPageChange}
                    />
                  </TabsContent>
                  <TabsContent value="email" className="mt-0 h-[calc(100%-60px)]">
                    <EmailViewer 
                      currentInvoiceId={currentInvoiceId}
                      emailInfoId={currentEmailInfoId}
                    />
                  </TabsContent>
                </Tabs>
              </div>
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

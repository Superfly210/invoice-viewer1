
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ActionBarWithThemeToggle } from "@/components/ActionBarWithThemeToggle";
import { InvoiceData } from "@/components/InvoiceData";
import { PDFViewer } from "@/components/PDFViewer";
import { EmailViewer } from "@/components/EmailViewer";
import { MetadataPanel } from "@/components/MetadataPanel";
import { InvoiceSigner } from "@/components/InvoiceSigner";
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
import AFE from "@/pages/AFE";
import CostCenters from "@/pages/CostCenters";
import Permissions from "@/pages/Permissions";

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [activeTab, setActiveTab] = useState("data");
  const [activeDocTab, setActiveDocTab] = useState("pdf");
  const [activeSection, setActiveSection] = useState("reviewer"); // "signer", "reviewer", "summary"
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(null);
  const [currentInvoiceIndex, setCurrentInvoiceIndex] = useState(0);
  const [currentInvoiceId, setCurrentInvoiceId] = useState<number | null>(null);
  const [pdfCurrentPage, setPdfCurrentPage] = useState(1);
  const [pdfTotalPages, setPdfTotalPages] = useState(3);
  const { toast } = useToast();

  // Fetch the current invoice's PDF URL and get total count
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get total count of invoices
        const { count, error: countError } = await supabase
          .from('Attachment Info')
          .select('*', { count: 'exact', head: true });
        
        if (countError) throw countError;
        setTotalInvoices(count || 0);
        
        // Fetch current invoice data
        const { data, error } = await supabase
          .from('Attachment Info')
          .select('*')
          .order('id', { ascending: true })
          .range(currentInvoiceIndex, currentInvoiceIndex);

        if (error) throw error;
        
        if (data && data.length > 0) {
          // Convert Google_Drive_URL from Json to string if needed
          let url = data[0].Google_Drive_URL ? String(data[0].Google_Drive_URL) : null;
          setCurrentPdfUrl(url);
          setCurrentInvoiceId(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching invoice data:', error);
      }
    };

    fetchData();
  }, [currentInvoiceIndex]);

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

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const handlePdfPageChange = (currentPage: number, totalPages: number) => {
    setPdfCurrentPage(currentPage);
    setPdfTotalPages(totalPages);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed}
        onSectionChange={handleSectionChange}
        activeSection={activeSection}
      />
      <main className="flex flex-col flex-1 overflow-hidden">
        {activeSection === "reviewer" && (
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
                          <EmailViewer />
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
        )}

        {activeSection === "signer" && <InvoiceSigner />}
        
        {activeSection === "summary" && (
          <div className="p-8">
            <h2 className="text-2xl font-semibold mb-6 dark:text-white">Invoice Summary</h2>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
              <p className="text-slate-600 dark:text-slate-300">
                The Invoice Summary section is under development.
              </p>
            </div>
          </div>
        )}

        {activeSection === "afe" && <AFE />}
        
        {activeSection === "cost-centers" && <CostCenters />}
        
        {activeSection === "permissions" && <Permissions />}
      </main>
    </div>
  );
};

export default Index;


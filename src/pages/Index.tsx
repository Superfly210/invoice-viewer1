import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ActionBarWithThemeToggle } from "@/components/ActionBarWithThemeToggle";
import { InvoiceData } from "@/components/InvoiceData";
import { PDFViewer } from "@/components/PDFViewer";
import { EmailViewer } from "@/components/EmailViewer";
import { MetadataPanel } from "@/components/MetadataPanel";
import { InvoiceSigner } from "@/components/InvoiceSigner";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { FileTextIcon, TableIcon, MailIcon, FileIcon } from "lucide-react";
import AFE from "@/pages/AFE";
import CostCenters from "@/pages/CostCenters";
import Permissions from "@/pages/Permissions";

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(3);
  const [totalInvoices, setTotalInvoices] = useState(12);
  const [activeTab, setActiveTab] = useState("data");
  const [activeDocTab, setActiveDocTab] = useState("pdf");
  const [activeSection, setActiveSection] = useState("reviewer"); // "signer", "reviewer", "summary"
  const { toast } = useToast();

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
    if (currentInvoice > 1) {
      setCurrentInvoice(currentInvoice - 1);
    }
  };

  const handleNext = () => {
    if (currentInvoice < totalInvoices) {
      setCurrentInvoice(currentInvoice + 1);
    }
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
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
              currentInvoice={currentInvoice}
              totalInvoices={totalInvoices}
              onPrevious={handlePrevious}
              onNext={handleNext}
            />
            <ResizablePanelGroup direction="horizontal" className="flex-1">
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
                <div className="h-full overflow-auto p-4">
                  <Tabs value={activeDocTab} onValueChange={setActiveDocTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="pdf" className="flex items-center">
                        <FileIcon className="h-4 w-4 mr-2" />
                        Invoice PDF
                      </TabsTrigger>
                      <TabsTrigger value="email" className="flex items-center">
                        <MailIcon className="h-4 w-4 mr-2" />
                        Email Message
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="pdf" className="mt-0">
                      <PDFViewer />
                    </TabsContent>
                    <TabsContent value="email" className="mt-0">
                      <EmailViewer />
                    </TabsContent>
                  </Tabs>
                </div>
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

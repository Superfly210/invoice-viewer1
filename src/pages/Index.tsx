
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ActionBar } from "@/components/ActionBar";
import { InvoiceData } from "@/components/InvoiceData";
import { PDFViewer } from "@/components/PDFViewer";
import { MetadataPanel } from "@/components/MetadataPanel";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { FileTextIcon, TableIcon } from "lucide-react";

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(3);
  const [totalInvoices, setTotalInvoices] = useState(12);
  const [activeTab, setActiveTab] = useState("data");
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

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <main className="flex flex-col flex-1 overflow-hidden">
        <ActionBar 
          onApprove={handleApprove}
          onDeny={handleDeny}
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
              <PDFViewer />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  );
};

export default Index;

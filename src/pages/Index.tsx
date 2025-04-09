
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ActionBar } from "@/components/ActionBar";
import { InvoiceData } from "@/components/InvoiceData";
import { PDFViewer } from "@/components/PDFViewer";
import { MetadataPanel } from "@/components/MetadataPanel";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(3);
  const [totalInvoices, setTotalInvoices] = useState(12);
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
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          <div className="w-full lg:w-1/2 p-4 overflow-auto border-r border-slate-200">
            <InvoiceData />
          </div>
          <div className="w-full lg:w-1/2 p-4 overflow-auto border-l border-slate-200">
            <PDFViewer />
          </div>
        </div>
        <div className="p-4 border-t border-slate-200 h-64 overflow-auto">
          <MetadataPanel />
        </div>
      </main>
    </div>
  );
};

export default Index;

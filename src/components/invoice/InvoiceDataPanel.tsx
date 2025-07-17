
import React, { useState } from "react";
import { InvoiceData } from "@/components/InvoiceData";
import { MetadataPanel } from "@/components/MetadataPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TableIcon, FileTextIcon } from "lucide-react";
import { AttachmentInfo } from "@/hooks/useInvoiceDataFetching";

interface InvoiceDataPanelProps {
  currentInvoice: AttachmentInfo | null;
  isLoading: boolean;
  onSectionChange?: (section: string) => void;
}

export const InvoiceDataPanel = ({ currentInvoice, isLoading, onSectionChange }: InvoiceDataPanelProps) => {
  const [activeTab, setActiveTab] = useState("data");
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (onSectionChange) {
      onSectionChange(value);
    }
  };

  console.log("InvoiceDataPanel - currentInvoice:", currentInvoice);

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full h-full flex flex-col">
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-700">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="data" className="flex items-center">
              <TableIcon className="h-4 w-4 mr-2" />
              Invoice Data
            </TabsTrigger>
            <TabsTrigger value="metadata" className="flex items-center">
              <FileTextIcon className="h-4 w-4 mr-2" />
              Metadata
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <TabsContent value="data" className="mt-0">
            <InvoiceData currentInvoice={currentInvoice} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="metadata" className="mt-0">
            <MetadataPanel currentInvoiceId={currentInvoice?.id || null} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

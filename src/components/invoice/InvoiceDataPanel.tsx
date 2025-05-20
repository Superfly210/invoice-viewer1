
import React, { useState } from "react";
import { InvoiceData } from "@/components/InvoiceData";
import { MetadataPanel } from "@/components/MetadataPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TableIcon, FileTextIcon } from "lucide-react";

interface InvoiceDataPanelProps {
  onSectionChange?: (section: string) => void;
}

export const InvoiceDataPanel = ({ onSectionChange }: InvoiceDataPanelProps) => {
  const [activeTab, setActiveTab] = useState("data");
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (onSectionChange) {
      onSectionChange(value);
    }
  };

  return (
    <div className="h-full overflow-auto p-4">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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
  );
};

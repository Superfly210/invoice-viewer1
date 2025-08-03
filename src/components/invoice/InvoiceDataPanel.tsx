
import React from "react";
import { InvoiceData } from "@/components/InvoiceData";
import { MetadataPanel } from "@/components/MetadataPanel";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { AttachmentInfo } from "@/hooks/useInvoiceDataFetching";
import { TableIcon, Clock } from "lucide-react";

interface InvoiceDataPanelProps {
  currentInvoice: AttachmentInfo | null;
  isLoading: boolean;
}

export const InvoiceDataPanel = ({ currentInvoice, isLoading }: InvoiceDataPanelProps) => {
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="h-full flex flex-col">
          <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold flex items-center">
              <TableIcon className="h-4 w-4 mr-2" />
              Invoice Data
            </h2>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <InvoiceData currentInvoice={currentInvoice} isLoading={isLoading} />
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="h-full flex flex-col">
          <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Event History
            </h2>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <MetadataPanel currentInvoiceId={currentInvoice?.id || null} />
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

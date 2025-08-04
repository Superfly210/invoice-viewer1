
import React, { useState, useRef } from "react";
import { InvoiceData } from "@/components/InvoiceData";
import { MetadataPanel } from "@/components/MetadataPanel";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { AttachmentInfo } from "@/hooks/useInvoiceDataFetching";
import { TableIcon, Clock, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InvoiceDataPanelProps {
  currentInvoice: AttachmentInfo | null;
  isLoading: boolean;
}

export const InvoiceDataPanel = ({ currentInvoice, isLoading }: InvoiceDataPanelProps) => {
  const [isMetadataPanelOpen, setIsMetadataPanelOpen] = useState(true);
  const metadataPanelRef = useRef<any>(null); // Ref for the metadata panel

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
            <ChevronRight className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-slate-500" />
          )}
        </Button>
      </ResizableHandle>
      <ResizablePanel
        ref={metadataPanelRef}
        defaultSize={50}
        minSize={isMetadataPanelOpen ? 30 : 0}
        collapsible={true}
        collapsedSize={0}
      >
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

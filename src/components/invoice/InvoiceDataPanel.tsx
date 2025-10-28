
import { InvoiceData } from "@/components/InvoiceData";
import { AttachmentInfo } from "@/hooks/useInvoiceDataFetching";

interface InvoiceDataPanelProps {
  currentInvoice: AttachmentInfo | null;
  isLoading: boolean;
}

export const InvoiceDataPanel = ({ currentInvoice, isLoading }: InvoiceDataPanelProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto p-4">
        <InvoiceData currentInvoice={currentInvoice} isLoading={isLoading} />
      </div>
    </div>
  );
};

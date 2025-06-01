
import { InvoiceLoading } from "@/components/invoice/InvoiceLoading";
import { EmptyInvoiceState } from "@/components/invoice/EmptyInvoiceState";
import { InvoiceDataTable } from "@/components/invoice/InvoiceDataTable";
import { AttachmentInfo } from "@/hooks/useInvoiceDataFetching";

interface InvoiceDataProps {
  currentInvoice: AttachmentInfo | null;
  isLoading: boolean;
}

export const InvoiceData = ({ currentInvoice, isLoading }: InvoiceDataProps) => {
  console.log("InvoiceData rendering with:", { currentInvoice, isLoading });

  if (isLoading) {
    return <InvoiceLoading />;
  }

  if (!currentInvoice) {
    return <EmptyInvoiceState />;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4">
      <InvoiceDataTable currentInvoice={currentInvoice} />
    </div>
  );
};

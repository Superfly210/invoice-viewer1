
import { useInvoiceDataFetching } from "@/hooks/useInvoiceDataFetching";
import { InvoiceLoading } from "@/components/invoice/InvoiceLoading";
import { EmptyInvoiceState } from "@/components/invoice/EmptyInvoiceState";
import { InvoiceDataTable } from "@/components/invoice/InvoiceDataTable";

export const InvoiceData = () => {
  const { invoices, currentIndex, isLoading, currentInvoice } = useInvoiceDataFetching();

  if (isLoading) {
    return <InvoiceLoading />;
  }

  if (invoices.length === 0) {
    return <EmptyInvoiceState />;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4">
      <InvoiceDataTable currentInvoice={currentInvoice!} />
    </div>
  );
};

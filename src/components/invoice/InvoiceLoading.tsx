
import { Loader2 } from "lucide-react";

export const InvoiceLoading = () => {
  return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <span className="ml-2">Loading invoice data...</span>
    </div>
  );
};

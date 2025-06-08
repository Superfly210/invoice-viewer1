
import { VendorTable } from "@/components/VendorTable";

const Vendor = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Vendor Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage vendor information and details
        </p>
      </div>
      
      <div className="flex-1 p-6 overflow-auto">
        <VendorTable />
      </div>
    </div>
  );
};

export default Vendor;

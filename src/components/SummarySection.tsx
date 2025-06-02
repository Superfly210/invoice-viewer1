
import React from "react";
import { InvoiceSummaryTable } from "./InvoiceSummaryTable";

export const SummarySection = () => {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-6 dark:text-white">Invoice Summary</h2>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
        <InvoiceSummaryTable />
      </div>
    </div>
  );
};

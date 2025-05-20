
import React from "react";

export const EmptyInvoiceState = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8 text-center">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">No Invoice Data Available</h2>
      <p className="text-slate-600 dark:text-slate-400">
        There are no invoices in the database. Try adding some data to the 'Attachment_Info' table.
      </p>
    </div>
  );
};

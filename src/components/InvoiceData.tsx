
import { useState } from "react";
import { InvoiceField, type InvoiceFieldData } from "./invoice/InvoiceField";
import { IssuesSummary } from "./invoice/IssuesSummary";
import { defaultInvoiceFields } from "./invoice/mockInvoiceData";

export const InvoiceData = () => {
  const [fields, setFields] = useState<InvoiceFieldData[]>(defaultInvoiceFields);

  const handleEdit = (id: string, value: string) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, value } : field
    ));
  };

  const handleToggleLock = (id: string) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, locked: !field.locked } : field
    ));
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Invoice Data</h2>
        <IssuesSummary fields={fields} />
      </div>

      <div className="space-y-4">
        {fields.map(field => (
          <InvoiceField 
            key={field.id}
            field={field}
            onEdit={handleEdit}
            onToggleLock={handleToggleLock}
          />
        ))}
      </div>
    </div>
  );
};


import { useState, useEffect } from "react";
import { InvoiceField, type InvoiceFieldData } from "./invoice/InvoiceField";
import { IssuesSummary } from "./invoice/IssuesSummary";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const InvoiceData = () => {
  const [fields, setFields] = useState<InvoiceFieldData[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoiceData();
  }, []);

  const fetchInvoiceData = async () => {
    try {
      const { data, error } = await supabase
        .from('Attachment Info')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;

      if (data) {
        const mappedFields: InvoiceFieldData[] = [
          {
            id: "invoice_number",
            label: "Invoice Number",
            value: data.Invoice_Number || "",
            confidence: 0.95,
            locked: false,
            issues: []
          },
          {
            id: "company_name",
            label: "Company Name",
            value: data.Invoicing_Comp_Name || "",
            confidence: 0.9,
            locked: false,
            issues: []
          },
          {
            id: "company_address",
            label: "Company Address",
            value: `${data.Invoicing_Comp_Street || ''} ${data.Invoicing_Comp_City || ''} ${data.Invoicing_Comp_State_Prov || ''} ${data.Invoicing_Comp_Postal_Code || ''}`.trim(),
            confidence: 0.85,
            locked: false,
            issues: []
          },
          {
            id: "gst_number",
            label: "GST Number",
            value: data.GST_Number ? JSON.stringify(data.GST_Number) : "",
            confidence: 0.95,
            locked: false,
            issues: []
          },
          {
            id: "wcb_number",
            label: "WCB Number",
            value: data.WCB_Number ? JSON.stringify(data.WCB_Number) : "",
            confidence: 0.92,
            locked: false,
            issues: []
          },
          {
            id: "subtotal",
            label: "Subtotal",
            value: data.Sub_Total?.toString() || "",
            confidence: 0.98,
            locked: false,
            issues: []
          },
          {
            id: "gst_total",
            label: "GST Total",
            value: data.GST_Total?.toString() || "",
            confidence: 0.98,
            locked: false,
            issues: []
          },
          {
            id: "total",
            label: "Total",
            value: data.Total?.toString() || "",
            confidence: 0.98,
            locked: false,
            issues: []
          }
        ];

        setFields(mappedFields);
      }
    } catch (error) {
      console.error('Error fetching invoice data:', error);
      toast({
        title: "Error",
        description: "Failed to load invoice data",
        variant: "destructive",
      });
    }
  };

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

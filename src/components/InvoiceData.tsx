
import { useState } from "react";
import { Check, AlertTriangle, X, Lock, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type InvoiceField = {
  id: string;
  label: string;
  value: string;
  validation: "success" | "warning" | "error" | "none";
  validationMessage: string;
  editable: boolean;
  locked: boolean;
  confidence: number;
};

export const InvoiceData = () => {
  const [fields, setFields] = useState<InvoiceField[]>([
    {
      id: "invoice-number",
      label: "Invoice Number",
      value: "INV-009876",
      validation: "success",
      validationMessage: "Validated successfully",
      editable: true,
      locked: true,
      confidence: 95,
    },
    {
      id: "invoice-date",
      label: "Invoice Date",
      value: "2024-11-18",
      validation: "success",
      validationMessage: "Validated successfully",
      editable: true,
      locked: false,
      confidence: 90,
    },
    {
      id: "vendor-name",
      label: "Vendor Name",
      value: "Norbridge Supply Inc.",
      validation: "success",
      validationMessage: "Validated successfully",
      editable: true,
      locked: false,
      confidence: 98,
    },
    {
      id: "location",
      label: "Location",
      value: "Alberta – Field Ops",
      validation: "warning",
      validationMessage: "Location format inconsistent with database",
      editable: true,
      locked: false,
      confidence: 80,
    },
    {
      id: "total-amount",
      label: "Total Amount",
      value: "$12,850.00",
      validation: "error",
      validationMessage: "Total doesn't match line items sum ($12,950.00)",
      editable: true,
      locked: false,
      confidence: 75,
    },
    {
      id: "gst-amount",
      label: "GST Amount",
      value: "$642.50",
      validation: "success",
      validationMessage: "Validated successfully",
      editable: true,
      locked: false,
      confidence: 85,
    },
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const issuesCount = fields.filter(field => field.validation === "warning" || field.validation === "error").length;

  const startEditing = (field: InvoiceField) => {
    if (field.locked) return;
    setEditingId(field.id);
    setEditValue(field.value);
  };

  const saveEdit = (id: string) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, value: editValue } : field
    ));
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const toggleLock = (id: string) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, locked: !field.locked } : field
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-800">Invoice Data</h2>
        {issuesCount > 0 && (
          <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm flex items-center">
            <AlertTriangle className="h-4 w-4 mr-1" />
            {issuesCount} {issuesCount === 1 ? "Issue" : "Issues"} Found
          </div>
        )}
      </div>

      <div className="space-y-4">
        {fields.map(field => (
          <div 
            key={field.id} 
            className={cn(
              "p-3 rounded-md border",
              field.validation === "error" && "bg-red-50 border-red-200",
              field.validation === "warning" && "bg-amber-50 border-amber-200",
              field.validation === "success" && "bg-white border-slate-200",
              field.validation === "none" && "bg-white border-slate-200"
            )}
          >
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-slate-700">{field.label}</label>
              <div className="flex items-center space-x-2">
                {field.validation !== "none" && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          {field.validation === "success" && <Check className="h-4 w-4 text-green-500" />}
                          {field.validation === "warning" && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                          {field.validation === "error" && <X className="h-4 w-4 text-red-500" />}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{field.validationMessage}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {field.editable && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={() => toggleLock(field.id)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          {field.locked ? 
                            <Lock className="h-4 w-4" /> : 
                            <Pencil className="h-4 w-4" />
                          }
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {field.locked ? "Unlock field" : "Lock field"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>

            {editingId === field.id ? (
              <div className="flex space-x-2 mt-1">
                <input
                  type="text"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={() => saveEdit(field.id)}
                  className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={cancelEdit}
                  className="bg-slate-200 text-slate-700 p-2 rounded-md hover:bg-slate-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div 
                  className="text-base text-slate-900 mt-1"
                  onClick={() => !field.locked && startEditing(field)}
                >
                  {field.value}
                </div>

                <div className="mt-2 flex items-center">
                  <div className="text-xs text-slate-500 mr-2">Confidence:</div>
                  <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full",
                        field.confidence >= 90 ? "bg-green-500" :
                        field.confidence >= 75 ? "bg-blue-500" :
                        "bg-amber-500"
                      )}
                      style={{ width: `${field.confidence}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-slate-500 ml-2">{field.confidence}%</div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

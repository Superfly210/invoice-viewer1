import { useState } from "react";
import { Check, AlertTriangle, X, Lock, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ConfidenceDisplay } from "./ConfidenceDisplay";

export type InvoiceFieldData = {
  id: string;
  label: string;
  value: string;
  validation: "success" | "warning" | "error" | "none";
  validationMessage: string;
  editable: boolean;
  locked: boolean;
  confidence: number;
};

type InvoiceFieldProps = {
  field: InvoiceFieldData;
  onEdit: (id: string, value: string) => void;
  onToggleLock: (id: string) => void;
};

export const InvoiceField = ({ field, onEdit, onToggleLock }: InvoiceFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(field.value);

  const startEditing = () => {
    if (field.locked) return;
    setIsEditing(true);
    setEditValue(field.value);
  };

  const saveEdit = () => {
    onEdit(field.id, editValue);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditValue(field.value);
  };

  return (
    <div 
      className={cn(
        "p-3 rounded-md border",
        field.validation === "error" && "bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-800",
        field.validation === "warning" && "bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800",
        field.validation === "success" && "bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700",
        field.validation === "none" && "bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700"
      )}
    >
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{field.label}</label>
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
                    onClick={() => onToggleLock(field.id)}
                    className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
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
          <ConfidenceDisplay confidence={field.confidence} />
        </div>
      </div>

      {isEditing ? (
        <div className="flex space-x-2 mt-1">
          <input
            type="text"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            autoFocus
          />
          <button
            onClick={saveEdit}
            className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={cancelEdit}
            className="bg-slate-200 text-slate-700 p-2 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="text-base text-slate-900 dark:text-slate-200 mt-1">
          {field.value}
        </div>
      )}
    </div>
  );
};

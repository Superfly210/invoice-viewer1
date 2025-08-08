
import { useState } from "react";
import { Edit, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EditableTableCellProps {
  value: string | number | null;
  onSave: (newValue: string) => void;
  type?: "text" | "number" | "date";
  className?: string;
  highlightClass?: string;
}

export const EditableTableCell = ({ value, onSave, type = "text", className, highlightClass }: EditableTableCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value?.toString() || '');

  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(value?.toString() || '');
  };

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(value?.toString() || '');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const displayValue = value || 'N/A';

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <Input
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1"
          autoFocus
        />
        <Button size="sm" onClick={handleSave}>
          <Check className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between group w-full">
      <span className={`text-left ${className || ''} ${highlightClass || ''}`}>{displayValue}</span>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleEdit}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit className="h-4 w-4" />
      </Button>
    </div>
  );
};


import { useState } from "react";
import { Edit, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EditableLineItemCellProps {
  value: string | number | null;
  onSave: (newValue: string) => void;
  type?: "text" | "number" | "date";
  isInvalid?: boolean;
  highlightClass?: string;
}

export const EditableLineItemCell = ({ value, onSave, type = "text", isInvalid = false, highlightClass }: EditableLineItemCellProps) => {
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
      <div className="flex items-center space-x-1">
        <Input
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 h-8 text-sm"
          autoFocus
        />
        <Button size="sm" onClick={handleSave} className="h-8 w-8 p-0">
          <Check className="h-3 w-3" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleCancel} className="h-8 w-8 p-0">
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between group min-h-[32px]">
      <span className={`text-left flex-1 ${isInvalid ? 'bg-orange-200' : ''} ${highlightClass || ''}`}>{displayValue}</span>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleEdit}
        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 ml-2"
      >
        <Edit className="h-3 w-3" />
      </Button>
    </div>
  );
};

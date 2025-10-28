import { useState } from "react";
import Draggable from "react-draggable";
import { X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface AddVendorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    companyName: string | null;
    street: string | null;
    city: string | null;
    province: string | null;
    postalCode: string | null;
    gstNumber: string | null;
    wcbNumber: string | null;
  };
  invoiceId: number;
}

export const AddVendorDialog = ({ isOpen, onClose, initialData, invoiceId }: AddVendorDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    companyName: initialData.companyName || "",
    street: initialData.street || "",
    city: initialData.city || "",
    province: initialData.province || "",
    postalCode: initialData.postalCode || "",
    gstNumber: initialData.gstNumber || "",
    wcbNumber: initialData.wcbNumber || "",
    promptLineItems: "",
    matchCriteria1: "",
    matchCriteria2: "",
  });

  const [size, setSize] = useState({ width: 600, height: 850 });
  const [isResizing, setIsResizing] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      // Insert into vendor_info table
      const { error: vendorError } = await supabase
        .from('vendor_info')
        .insert({
          invoicing_company_name: formData.companyName,
          invoicing_company_street: formData.street,
          invoicing_company_city: formData.city,
          invoicing_company_province_state: formData.province,
          invoicing_company_post_zip_code: formData.postalCode,
          gst_number: formData.gstNumber,
          wcb_number: formData.wcbNumber,
          Prompt_Line_Items: formData.promptLineItems,
          match_criteria_1: formData.matchCriteria1,
          match_criteria_2: formData.matchCriteria2,
        });

      if (vendorError) throw vendorError;

      // Update invoice Company_Routed flag
      const { error: updateError } = await supabase
        .from('Attachment_Info')
        .update({ Company_Routed: true })
        .eq('id', invoiceId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Vendor added successfully",
      });

      queryClient.invalidateQueries({ queryKey: ['vendor-info'] });
      queryClient.invalidateQueries({ queryKey: ['attachment-info'] });
      
      onClose();
    } catch (error) {
      console.error('Error adding vendor:', error);
      toast({
        title: "Error",
        description: "Failed to add vendor",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('resize-handle')) {
      setIsResizing(true);
      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = size.width;
      const startHeight = size.height;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;
        setSize({
          width: Math.max(400, startWidth + deltaX),
          height: Math.max(500, startHeight + deltaY),
        });
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <Draggable handle=".drag-handle" bounds="parent" disabled={isResizing}>
        <div
          className="absolute top-1/4 left-1/4 bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 pointer-events-auto"
          style={{ width: `${size.width}px`, height: `${size.height}px` }}
          onMouseDown={handleMouseDown}
        >
          {/* Header with drag handle */}
          <div className="drag-handle flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 cursor-move bg-slate-50 dark:bg-slate-800 rounded-t-lg">
            <div className="flex items-center gap-2">
              <GripVertical className="h-5 w-5 text-slate-400" />
              <h2 className="text-lg font-semibold">Add New Vendor</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto p-6 space-y-4" style={{ height: `${size.height - 130}px` }}>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">Street</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => handleChange('street', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Province/State</Label>
                <Input
                  id="province"
                  value={formData.province}
                  onChange={(e) => handleChange('province', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal/ZIP Code</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => handleChange('postalCode', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input
                  id="gstNumber"
                  value={formData.gstNumber}
                  onChange={(e) => handleChange('gstNumber', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wcbNumber">WCB Number</Label>
                <Input
                  id="wcbNumber"
                  value={formData.wcbNumber}
                  onChange={(e) => handleChange('wcbNumber', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="promptLineItems">Prompt Line Items (AI Prompt)</Label>
              <Textarea
                id="promptLineItems"
                value={formData.promptLineItems}
                onChange={(e) => handleChange('promptLineItems', e.target.value)}
                rows={3}
                placeholder="Enter AI prompt for line item extraction..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="matchCriteria1">Match Criteria 1</Label>
              <Input
                id="matchCriteria1"
                value={formData.matchCriteria1}
                onChange={(e) => handleChange('matchCriteria1', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="matchCriteria2">Match Criteria 2</Label>
              <Input
                id="matchCriteria2"
                value={formData.matchCriteria2}
                onChange={(e) => handleChange('matchCriteria2', e.target.value)}
              />
            </div>
          </div>

          {/* Footer with buttons */}
          <div className="flex justify-end gap-2 p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-b-lg">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Add Vendor
            </Button>
          </div>

          {/* Resize handle */}
          <div className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize">
            <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-slate-400" />
          </div>
        </div>
      </Draggable>
    </div>
  );
};

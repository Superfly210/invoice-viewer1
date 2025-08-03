
-- Create the new unified audit_log table
CREATE TABLE public.audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id BIGINT NOT NULL REFERENCES public."attachment_info"(id) ON DELETE CASCADE,
  item_id BIGINT, -- For line_item_id or other item-specific IDs
  log_type TEXT NOT NULL CHECK (log_type IN ('INVOICE', 'LINE_ITEM')), -- Distinguishes between invoice and line item logs
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  change_type TEXT NOT NULL CHECK (change_type IN ('UPDATE', 'INSERT', 'DELETE')),
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Policies for audit_log
CREATE POLICY "Users can view audit logs" 
  ON public.audit_log 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert audit logs" 
  ON public.audit_log 
  FOR INSERT 
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_audit_log_invoice_id ON public.audit_log(invoice_id);
CREATE INDEX idx_audit_log_item_id ON public.audit_log(item_id);
CREATE INDEX idx_audit_log_changed_at ON public.audit_log(changed_at DESC);

-- Migrate data from invoice_audit_log to the new audit_log table
INSERT INTO public.audit_log (invoice_id, log_type, field_name, old_value, new_value, change_type, changed_by, changed_at)
SELECT 
  invoice_id, 
  'INVOICE' as log_type, 
  field_name, 
  old_value, 
  new_value, 
  change_type, 
  changed_by, 
  changed_at
FROM public."invoice_audit_log";

-- Migrate data from line_items_audit_log to the new audit_log table
INSERT INTO public.audit_log (invoice_id, item_id, log_type, field_name, old_value, new_value, change_type, changed_by, changed_at)
SELECT 
  invoice_id, 
  line_item_id as item_id, 
  'LINE_ITEM' as log_type, 
  field_name, 
  old_value, 
  new_value, 
  change_type, 
  changed_by, 
  changed_at
FROM public."line_items_audit_log";

-- Drop the old audit log tables
DROP TABLE public."invoice_audit_log";
DROP TABLE public."line_items_audit_log";

-- Drop the incomplete audit_log table
DROP TABLE IF EXISTS public.audit_log;

-- Create a comprehensive audit_log table that consolidates both invoice and line item changes
CREATE TABLE public.audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id bigint NOT NULL,
  item_id bigint NULL, -- For line item changes, NULL for invoice changes
  log_type text NOT NULL CHECK (log_type IN ('INVOICE', 'LINE_ITEM')),
  field_name text NOT NULL,
  old_value text NULL,
  new_value text NULL,
  change_type text NOT NULL DEFAULT 'UPDATE' CHECK (change_type IN ('INSERT', 'UPDATE', 'DELETE')),
  changed_by uuid NULL,
  changed_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Audit logs are viewable by authenticated users" 
ON public.audit_log 
FOR SELECT 
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Audit logs can be inserted by authenticated users" 
ON public.audit_log 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated'::text);

-- Add indexes for better performance
CREATE INDEX idx_audit_log_invoice_id ON public.audit_log(invoice_id);
CREATE INDEX idx_audit_log_changed_at ON public.audit_log(changed_at);
CREATE INDEX idx_audit_log_log_type ON public.audit_log(log_type);

-- Migrate existing data from invoice_audit_log
INSERT INTO public.audit_log (
  invoice_id, 
  item_id, 
  log_type, 
  field_name, 
  old_value, 
  new_value, 
  change_type, 
  changed_by, 
  changed_at
)
SELECT 
  invoice_id,
  NULL as item_id,
  'INVOICE' as log_type,
  field_name,
  old_value,
  new_value,
  change_type,
  changed_by,
  changed_at
FROM public.invoice_audit_log;

-- Migrate existing data from line_items_audit_log  
INSERT INTO public.audit_log (
  invoice_id,
  item_id,
  log_type,
  field_name,
  old_value,
  new_value,
  change_type,
  changed_by,
  changed_at
)
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
FROM public.line_items_audit_log;
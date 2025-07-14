
-- Create audit trail table for invoice data changes
CREATE TABLE public.invoice_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id BIGINT NOT NULL REFERENCES public.Attachment_Info(id),
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  change_type TEXT NOT NULL CHECK (change_type IN ('UPDATE', 'INSERT', 'DELETE')),
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit trail table for line items changes
CREATE TABLE public.line_items_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  line_item_id BIGINT,
  invoice_id BIGINT NOT NULL REFERENCES public.Attachment_Info(id),
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  change_type TEXT NOT NULL CHECK (change_type IN ('UPDATE', 'INSERT', 'DELETE')),
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) policies
ALTER TABLE public.invoice_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.line_items_audit_log ENABLE ROW LEVEL SECURITY;

-- Policies for invoice_audit_log
CREATE POLICY "Users can view invoice audit logs" 
  ON public.invoice_audit_log 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert invoice audit logs" 
  ON public.invoice_audit_log 
  FOR INSERT 
  WITH CHECK (true);

-- Policies for line_items_audit_log  
CREATE POLICY "Users can view line items audit logs" 
  ON public.line_items_audit_log 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert line items audit logs" 
  ON public.line_items_audit_log 
  FOR INSERT 
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_invoice_audit_log_invoice_id ON public.invoice_audit_log(invoice_id);
CREATE INDEX idx_invoice_audit_log_changed_at ON public.invoice_audit_log(changed_at DESC);
CREATE INDEX idx_line_items_audit_log_invoice_id ON public.line_items_audit_log(invoice_id);
CREATE INDEX idx_line_items_audit_log_changed_at ON public.line_items_audit_log(changed_at DESC);

-- Create audit tables for invoice and line items change tracking

-- Create invoice_audit_log table
CREATE TABLE public.invoice_audit_log (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    change_type TEXT NOT NULL DEFAULT 'UPDATE',
    changed_by UUID,
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create line_items_audit_log table  
CREATE TABLE public.line_items_audit_log (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    line_item_id BIGINT,
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    change_type TEXT NOT NULL DEFAULT 'UPDATE',
    changed_by UUID,
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.invoice_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.line_items_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies for audit tables
CREATE POLICY "Audit logs are viewable by authenticated users" 
ON public.invoice_audit_log 
FOR SELECT 
USING (true);

CREATE POLICY "Audit logs can be inserted by authenticated users" 
ON public.invoice_audit_log 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Line items audit logs are viewable by authenticated users" 
ON public.line_items_audit_log 
FOR SELECT 
USING (true);

CREATE POLICY "Line items audit logs can be inserted by authenticated users" 
ON public.line_items_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX idx_invoice_audit_log_invoice_id ON public.invoice_audit_log(invoice_id);
CREATE INDEX idx_invoice_audit_log_changed_at ON public.invoice_audit_log(changed_at);
CREATE INDEX idx_line_items_audit_log_invoice_id ON public.line_items_audit_log(invoice_id);
CREATE INDEX idx_line_items_audit_log_line_item_id ON public.line_items_audit_log(line_item_id);
CREATE INDEX idx_line_items_audit_log_changed_at ON public.line_items_audit_log(changed_at);
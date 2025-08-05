-- Update audit_log table constraints to allow COMMENT and INVOICE_CODING
ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_change_type_check;
ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_log_type_check;

-- Add updated constraints
ALTER TABLE audit_log ADD CONSTRAINT audit_log_change_type_check 
CHECK (change_type IN ('UPDATE', 'INSERT', 'DELETE', 'COMMENT'));

ALTER TABLE audit_log ADD CONSTRAINT audit_log_log_type_check 
CHECK (log_type IN ('INVOICE', 'LINE_ITEM', 'INVOICE_CODING', 'COMMENT'));
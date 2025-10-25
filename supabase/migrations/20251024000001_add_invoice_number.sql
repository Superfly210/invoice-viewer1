-- Add invoice_number column to invoice_submissions table
ALTER TABLE public.invoice_submissions 
ADD COLUMN IF NOT EXISTS invoice_number TEXT;

-- Add index for searching by invoice number
CREATE INDEX IF NOT EXISTS idx_invoice_submissions_invoice_number 
ON public.invoice_submissions(invoice_number);

-- Add comment
COMMENT ON COLUMN public.invoice_submissions.invoice_number IS 'Invoice number for easier identification and searching';

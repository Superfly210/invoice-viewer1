-- Add UPDATE and DELETE policies for invoice_submissions
-- The status column already exists, we just need the policies

-- Allow users to update their own pending submissions
CREATE POLICY "Users can update their own pending submissions" 
ON public.invoice_submissions 
FOR UPDATE 
USING (auth.uid() = submitted_by AND status = 'pending')
WITH CHECK (auth.uid() = submitted_by AND status = 'pending');

-- Allow users to delete their own pending submissions
CREATE POLICY "Users can delete their own pending submissions" 
ON public.invoice_submissions 
FOR DELETE 
USING (auth.uid() = submitted_by AND status = 'pending');

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_invoice_submissions_status 
ON public.invoice_submissions(status);

CREATE INDEX IF NOT EXISTS idx_invoice_submissions_submitted_by 
ON public.invoice_submissions(submitted_by);

CREATE INDEX IF NOT EXISTS idx_invoice_submissions_submitted_at 
ON public.invoice_submissions(submitted_at DESC);

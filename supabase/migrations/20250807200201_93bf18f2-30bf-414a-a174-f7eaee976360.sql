-- Create table for invoice submissions
CREATE TABLE public.invoice_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoicing_company TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  sub_total DECIMAL(12,2) NOT NULL,
  gst_total DECIMAL(12,2) NOT NULL,
  invoice_total DECIMAL(12,2) NOT NULL,
  invoice_file_path TEXT NOT NULL,
  supporting_docs_paths TEXT[], -- Array of file paths
  coding_details JSONB NOT NULL,
  contact_emails TEXT[] NOT NULL,
  additional_comments TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submitted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoice_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view their own submissions" 
ON public.invoice_submissions 
FOR SELECT 
USING (auth.uid() = submitted_by);

CREATE POLICY "Users can create submissions" 
ON public.invoice_submissions 
FOR INSERT 
WITH CHECK (auth.uid() = submitted_by);

-- Create storage bucket for submission files if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('submission-files', 'submission-files', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for submission files
CREATE POLICY "Users can upload their own submission files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'submission-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own submission files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'submission-files' AND auth.uid()::text = (storage.foldername(name))[1]);
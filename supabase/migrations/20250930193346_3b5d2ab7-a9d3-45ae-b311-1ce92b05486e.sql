-- Ensure gst_included column exists in Quantities table
-- This migration is idempotent and will only add the column if it doesn't exist

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'Quantities' 
    AND column_name = 'gst_included'
  ) THEN
    ALTER TABLE public."Quantities" 
    ADD COLUMN gst_included boolean DEFAULT false;
    
    COMMENT ON COLUMN public."Quantities".gst_included IS 'Indicates if GST is included in the rate';
  END IF;
END $$;
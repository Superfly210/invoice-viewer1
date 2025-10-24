-- Create a function to detect potential duplicate invoices
-- Returns a JSONB object with issues for each invoice

CREATE OR REPLACE FUNCTION get_invoice_issues(invoice_id_param INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  result JSONB := '[]'::JSONB;
  duplicate_ids INTEGER[];
  invoice_num TEXT;
  company_name TEXT;
BEGIN
  -- Get the invoice number and company name for the given invoice
  SELECT 
    LOWER(TRIM("Invoice_Number")),
    LOWER(TRIM("Invoicing_Comp_Name"))
  INTO invoice_num, company_name
  FROM "Attachment_Info"
  WHERE id = invoice_id_param;

  -- Check for potential duplicates if invoice number and company name are not null/empty
  IF invoice_num IS NOT NULL AND invoice_num != '' 
     AND company_name IS NOT NULL AND company_name != '' THEN
    
    -- Find all invoices with the same invoice number and company name (case-insensitive)
    SELECT ARRAY_AGG(id ORDER BY id)
    INTO duplicate_ids
    FROM "Attachment_Info"
    WHERE LOWER(TRIM("Invoice_Number")) = invoice_num
      AND LOWER(TRIM("Invoicing_Comp_Name")) = company_name
      AND id != invoice_id_param
      AND "Invoice_Number" IS NOT NULL
      AND "Invoice_Number" != ''
      AND "Invoicing_Comp_Name" IS NOT NULL
      AND "Invoicing_Comp_Name" != '';

    -- If duplicates found, add to result
    IF duplicate_ids IS NOT NULL AND array_length(duplicate_ids, 1) > 0 THEN
      result := result || jsonb_build_object(
        'type', 'duplicate',
        'message', 'Potential Duplicate',
        'severity', 'warning',
        'duplicate_ids', to_jsonb(duplicate_ids)
      );
    END IF;
  END IF;

  RETURN result;
END;
$$;

-- Create an index to improve performance of duplicate detection
-- Note: Using expression index with proper quoting for case-sensitive column names
CREATE INDEX IF NOT EXISTS idx_attachment_info_invoice_lookup 
ON "Attachment_Info" (LOWER(TRIM("Invoice_Number")), LOWER(TRIM("Invoicing_Comp_Name")));

-- Add comment
COMMENT ON FUNCTION get_invoice_issues(INTEGER) IS 
'Returns a JSONB array of issues for a given invoice, including duplicate detection';

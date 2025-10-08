-- Security Fix Migration
-- 1. Audit Log Security: Restrict to users/admins only, no modifications allowed

-- Drop existing policies on audit_log
DROP POLICY IF EXISTS "Audit logs are viewable by authenticated users" ON public.audit_log;
DROP POLICY IF EXISTS "Insert" ON public.audit_log;
DROP POLICY IF EXISTS "Update" ON public.audit_log;
DROP POLICY IF EXISTS "Delete" ON public.audit_log;

-- Create new restrictive policies for audit_log
CREATE POLICY "Users and admins can view audit logs"
ON public.audit_log
FOR SELECT
USING (has_role(auth.uid(), 'user'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users and admins can insert audit logs"
ON public.audit_log
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'user'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- 2. Email_Info & Attachment_Info Access: Users and admins only

-- Update Email_Info policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public."Email_Info";
DROP POLICY IF EXISTS "Viewer access for Email_Info" ON public."Email_Info";

CREATE POLICY "Users and admins can view Email_Info"
ON public."Email_Info"
FOR SELECT
USING (has_role(auth.uid(), 'user'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users and admins can insert Email_Info"
ON public."Email_Info"
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'user'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users and admins can update Email_Info"
ON public."Email_Info"
FOR UPDATE
USING (has_role(auth.uid(), 'user'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Update Attachment_Info policies
DROP POLICY IF EXISTS "Enable insert" ON public."Attachment_Info";
DROP POLICY IF EXISTS "Update All" ON public."Attachment_Info";
DROP POLICY IF EXISTS "Viewer access for Attachment_Info" ON public."Attachment_Info";

CREATE POLICY "Users and admins can view Attachment_Info"
ON public."Attachment_Info"
FOR SELECT
USING (has_role(auth.uid(), 'user'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users and admins can insert Attachment_Info"
ON public."Attachment_Info"
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'user'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users and admins can update Attachment_Info"
ON public."Attachment_Info"
FOR UPDATE
USING (has_role(auth.uid(), 'user'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- 3. Financial Record Deletion: Admin-only

-- Update AFE delete policy
DROP POLICY IF EXISTS "Delete" ON public.afe;

CREATE POLICY "Only admins can delete AFEs"
ON public.afe
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update vendor_info delete policy
DROP POLICY IF EXISTS "Delete" ON public.vendor_info;

CREATE POLICY "Only admins can delete vendor_info"
ON public.vendor_info
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Pricing Data Protection: Users and admins only

-- Update Line_Items policies
DROP POLICY IF EXISTS "Viewer access for Line_Items" ON public."Line_Items";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public."Line_Items";

CREATE POLICY "Users and admins can view Line_Items"
ON public."Line_Items"
FOR SELECT
USING (has_role(auth.uid(), 'user'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users and admins can insert Line_Items"
ON public."Line_Items"
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'user'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Update Quantities policies
DROP POLICY IF EXISTS "Select" ON public."Quantities";

CREATE POLICY "Users and admins can view Quantities"
ON public."Quantities"
FOR SELECT
USING (has_role(auth.uid(), 'user'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Update invoice_coding policy
DROP POLICY IF EXISTS "Viewer access for invoice_coding" ON public.invoice_coding;

CREATE POLICY "Users and admins can view invoice_coding"
ON public.invoice_coding
FOR SELECT
USING (has_role(auth.uid(), 'user'::app_role) OR has_role(auth.uid(), 'admin'::app_role));
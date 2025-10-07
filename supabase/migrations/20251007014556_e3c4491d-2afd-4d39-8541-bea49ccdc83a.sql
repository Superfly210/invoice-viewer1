-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    LOWER(SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      CONCAT(
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        ' ',
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
      )
    ),
    NULL
  );
  
  -- Automatically assign submitter role to new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'submitter');
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users for new signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to check if admin role can be revoked (prevent removing last admin)
CREATE OR REPLACE FUNCTION public.can_revoke_admin_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    SELECT COUNT(*) 
    FROM public.user_roles 
    WHERE role = 'admin'
  ) > 1 OR NOT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = _user_id AND role = 'admin'
  );
$$;

-- Update user_roles DELETE policy to prevent removing last admin
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Admins can delete roles" 
ON public.user_roles
FOR DELETE
USING (
  has_role(auth.uid(), 'admin') 
  AND can_revoke_admin_role(user_id)
);

-- Update RLS policies on viewer-only tables to require user or admin role
-- Attachment_Info
DROP POLICY IF EXISTS "Enable read" ON public."Attachment_Info";
CREATE POLICY "Viewer access for Attachment_Info"
ON public."Attachment_Info"
FOR SELECT
USING (
  has_role(auth.uid(), 'user') OR has_role(auth.uid(), 'admin')
);

-- Email_Info
DROP POLICY IF EXISTS "Enable read access for all users" ON public."Email_Info";
CREATE POLICY "Viewer access for Email_Info"
ON public."Email_Info"
FOR SELECT
USING (
  has_role(auth.uid(), 'user') OR has_role(auth.uid(), 'admin')
);

-- Line_Items
DROP POLICY IF EXISTS "Enable read access for all users" ON public."Line_Items";
CREATE POLICY "Viewer access for Line_Items"
ON public."Line_Items"
FOR SELECT
USING (
  has_role(auth.uid(), 'user') OR has_role(auth.uid(), 'admin')
);

-- invoice_coding
DROP POLICY IF EXISTS "Enable read access for all users" ON public.invoice_coding;
CREATE POLICY "Viewer access for invoice_coding"
ON public.invoice_coding
FOR SELECT
USING (
  has_role(auth.uid(), 'user') OR has_role(auth.uid(), 'admin')
);

-- Assign submitter role to all existing users who don't have it yet
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'submitter'::app_role
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_roles.user_id = auth.users.id 
  AND user_roles.role = 'submitter'
);
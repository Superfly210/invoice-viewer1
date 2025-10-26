# Security Documentation

## Environment Variables

This application uses environment variables to configure the Supabase connection. All environment variables in this project are **client-side variables** (prefixed with `VITE_`), meaning they are embedded in the browser JavaScript bundle during build.

### Understanding Client-Side Environment Variables

**Important:** In Vite applications, environment variables prefixed with `VITE_` are:
- Embedded directly into the client-side JavaScript bundle
- Visible in browser developer tools and network requests
- Accessible to anyone who views the page source
- **NOT SECRET** - they should never contain sensitive credentials

### Current Environment Variables

#### `VITE_SUPABASE_URL`
- **Purpose:** The URL endpoint for your Supabase project
- **Example:** `https://your-project-id.supabase.co`
- **Security Level:** Public - safe to expose
- **Usage:** Required for all Supabase client operations

#### `VITE_SUPABASE_PROJECT_ID`
- **Purpose:** Your Supabase project identifier
- **Example:** `your-project-id`
- **Security Level:** Public - safe to expose
- **Usage:** Used for administrative and identification purposes

#### `VITE_SUPABASE_PUBLISHABLE_KEY` (formerly `VITE_SUPABASE_ANON_KEY`)
- **Purpose:** The Supabase anonymous/public API key
- **Security Level:** ✅ **SAFE FOR CLIENT-SIDE USE**
- **Why it's safe:**
  - This is the "anon" key, designed specifically for public exposure
  - Access is controlled by Row Level Security (RLS) policies in your database
  - It cannot bypass RLS policies or access restricted data
  - All database operations are governed by the RLS rules you define
- **What it can do:**
  - Authenticate users (sign up, sign in)
  - Query data allowed by RLS policies
  - Execute operations permitted by RLS policies
- **What it CANNOT do:**
  - Bypass Row Level Security policies
  - Access data not permitted by RLS rules
  - Perform admin operations
  - Access service-level features

### What NOT to Put in Client-Side Environment Variables

❌ **NEVER expose these in VITE_ variables:**
- `service_role` key (full database access, bypasses RLS)
- Database passwords
- API secrets for third-party services
- Encryption keys
- OAuth client secrets
- Private API tokens

### Security Through Row Level Security (RLS)

The `VITE_SUPABASE_PUBLISHABLE_KEY` is protected by Supabase's Row Level Security:

```sql
-- Example: Only users can read their own invoices
CREATE POLICY "Users can read own invoices" 
ON invoices FOR SELECT 
USING (auth.uid() = user_id);

-- Example: Only authenticated users can insert invoices
CREATE POLICY "Authenticated users can insert invoices" 
ON invoices FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

**Your database is secure as long as:**
1. ✅ RLS is enabled on all tables
2. ✅ RLS policies are correctly configured
3. ✅ You never use the `service_role` key in client code

### Setup Instructions

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your Supabase credentials:**
   - Go to your [Supabase Dashboard](https://app.supabase.com)
   - Navigate to Settings > API
   - Copy the Project URL to `VITE_SUPABASE_URL`
   - Copy the Project ID to `VITE_SUPABASE_PROJECT_ID`
   - Copy the `anon` `public` key to `VITE_SUPABASE_PUBLISHABLE_KEY`
   - ⚠️ **DO NOT** copy the `service_role` key

3. **Verify your .gitignore:**
   - Ensure `.env` is listed in `.gitignore` (already configured)
   - Never commit the `.env` file to version control

### Production Deployment

For production environments, set environment variables through your hosting platform:

#### Vercel
```
Project Settings > Environment Variables
```
Add each `VITE_*` variable individually.

#### Netlify
```
Site Settings > Build & Deploy > Environment
```
Add each `VITE_*` variable individually.

#### Docker
```dockerfile
# Use environment variables in docker-compose.yml
version: '3.8'
services:
  app:
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_PROJECT_ID=${VITE_SUPABASE_PROJECT_ID}
      - VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_PUBLISHABLE_KEY}
```

### Runtime Validation

The application validates environment variables at startup:

```typescript
// From src/integrations/supabase/client.ts
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    'Missing required Supabase environment variables. ' +
    'Please copy .env.example to .env and fill in your credentials.'
  );
}
```

If you see this error:
1. Verify your `.env` file exists
2. Check that all required variables are set
3. Restart the development server (`npm run dev`)

### Security Checklist

- [x] `.env` file is in `.gitignore`
- [x] Only using `anon` key in client code (not `service_role`)
- [x] Row Level Security (RLS) enabled on all tables
- [x] RLS policies tested and validated
- [x] Environment variables documented
- [x] Runtime validation for missing variables
- [ ] Regular security audits of RLS policies
- [ ] Monitor Supabase dashboard for unauthorized access attempts

### Additional Security Measures

1. **Enable RLS on all tables:**
   ```sql
   ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
   ```

2. **Review RLS policies regularly:**
   - Check for overly permissive policies
   - Ensure policies match your business logic
   - Test policies with different user roles

3. **Use Supabase Edge Functions for sensitive operations:**
   - Store `service_role` key in Edge Function environment
   - Perform admin operations server-side
   - Never expose service_role key to client

4. **Monitor and audit:**
   - Enable Supabase logging
   - Set up alerts for unusual activity
   - Regular security reviews

### Questions?

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Row Level Security Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Client Libraries](https://supabase.com/docs/reference/javascript/introduction)

### Related Files

- `.env.example` - Template for environment variables
- `src/integrations/supabase/client.ts` - Supabase client initialization
- `src/components/PDFViewer.tsx` - Uses environment variables for Edge Functions
- `src/hooks/usePdfPreloader.ts` - Uses environment variables for Edge Functions

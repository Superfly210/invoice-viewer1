# Edge Function Deployment Guide

## Issue Fixed
The PDF viewer error "The message port closed before a response was received" was caused by strict CORS validation in the pdf-proxy Edge Function.

## What Changed
Updated `supabase/functions/pdf-proxy/index.ts` to:
- Allow localhost on any port for development
- Maintain security for production with explicit allowlist
- Better error handling and logging

## Deployment Steps

### Option 1: Using Supabase CLI (Recommended)

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project** (first time only):
   ```bash
   supabase link --project-ref YOUR_PROJECT_ID
   ```
   Replace `YOUR_PROJECT_ID` with your actual Supabase project ID from the dashboard.

4. **Deploy the Edge Function**:
   ```bash
   supabase functions deploy pdf-proxy
   ```

5. **Verify deployment**:
   ```bash
   supabase functions list
   ```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Navigate to **Edge Functions** in the left sidebar
3. Find the `pdf-proxy` function
4. Click **Edit** or **Deploy**
5. Copy the contents of `supabase/functions/pdf-proxy/index.ts`
6. Paste into the editor
7. Click **Deploy**

### Option 3: Manual File Upload

1. Go to Supabase Dashboard
2. Navigate to **Edge Functions**
3. Click **Create a new function** or edit existing `pdf-proxy`
4. Upload the `index.ts` file from `supabase/functions/pdf-proxy/`
5. Click **Deploy**

## Testing After Deployment

1. **Clear your browser cache** (important!)
   - Chrome: Ctrl+Shift+Delete → Clear cached images and files
   - Or use Incognito/Private mode

2. **Restart your dev server**:
   ```bash
   npm run dev
   ```

3. **Test PDF loading** in the Invoice Viewer

4. **Check browser console** for any CORS errors

## Environment Variables (Production)

When deploying to production, set the `ALLOWED_ORIGINS` environment variable:

1. Go to Supabase Dashboard → Edge Functions → pdf-proxy
2. Click **Settings** or **Environment Variables**
3. Add:
   ```
   ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
   ```

## Troubleshooting

### Still getting CORS errors?

1. **Check the browser console** for the actual origin being sent:
   ```javascript
   console.log(window.location.origin);
   ```

2. **Verify Edge Function logs** in Supabase Dashboard:
   - Go to Edge Functions → pdf-proxy → Logs
   - Look for the request origin being logged

3. **Test with curl**:
   ```bash
   curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/pdf-proxy \
     -H "Origin: http://localhost:8080" \
     -H "apikey: YOUR_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"url":"YOUR_GOOGLE_DRIVE_URL"}'
   ```

### Function not deploying?

- Make sure you're logged in: `supabase login`
- Check your project is linked: `supabase projects list`
- Verify the function name matches: `pdf-proxy`

### Still not working?

The issue might be:
1. **Browser cache** - Clear it completely
2. **Old service worker** - Unregister in DevTools → Application → Service Workers
3. **Network issues** - Check Supabase status page
4. **Authentication** - Verify your session is valid

## Quick Fix (If Deployment Fails)

If you can't deploy immediately, you can temporarily revert to the old CORS configuration:

```typescript
// In supabase/functions/pdf-proxy/index.ts
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',  // Temporary - not secure!
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

**⚠️ WARNING:** This is insecure and should only be used temporarily for testing!

## Next Steps

After successful deployment:
1. ✅ Test PDF loading in development
2. ✅ Test PDF loading in production
3. ✅ Set production ALLOWED_ORIGINS
4. ✅ Monitor Edge Function logs for errors
5. ✅ Update SECURITY_ADVISORY.md with deployment date

## Support

- Supabase Docs: https://supabase.com/docs/guides/functions
- Supabase Discord: https://discord.supabase.com
- Edge Functions Reference: https://supabase.com/docs/reference/cli/supabase-functions-deploy

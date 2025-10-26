# 🚀 Quick Fix Guide - PDF Viewer Error

## The Problem
❌ Error: "The message port closed before a response was received"
❌ PDFs not loading in Invoice Viewer

## The Solution
✅ Deploy updated Edge Function with fixed CORS configuration

---

## 3-Step Fix (5 minutes)

### Step 1: Install Supabase CLI
```bash
npm install -g supabase
```

### Step 2: Login and Deploy
```bash
# Login to Supabase
supabase login

# Link your project (first time only)
supabase link --project-ref YOUR_PROJECT_ID

# Deploy the fixed function
supabase functions deploy pdf-proxy
```

### Step 3: Test
```bash
# Clear browser cache (Ctrl+Shift+Delete)
# Restart dev server
npm run dev

# Test PDF loading in Invoice Viewer
```

---

## Don't Have Supabase CLI?

### Alternative: Use Supabase Dashboard

1. Go to https://app.supabase.com
2. Open your project
3. Navigate to **Edge Functions** → **pdf-proxy**
4. Click **Edit**
5. Copy contents from: `supabase/functions/pdf-proxy/index.ts`
6. Paste and click **Deploy**
7. Clear browser cache and test

---

## What Changed?

**Before:**
```typescript
'Access-Control-Allow-Origin': '*'  // ❌ Too permissive
```

**After:**
```typescript
// ✅ Validates origin, allows localhost for dev
if (requestOrigin.startsWith('http://localhost:')) {
  return requestOrigin;
}
```

---

## Troubleshooting

### Still not working?

1. **Clear browser cache completely**
   - Chrome: Ctrl+Shift+Delete
   - Select "Cached images and files"
   - Time range: "All time"

2. **Check Edge Function logs**
   - Supabase Dashboard → Edge Functions → pdf-proxy → Logs
   - Look for CORS errors

3. **Verify deployment**
   ```bash
   supabase functions list
   ```

4. **Check your dev server port**
   - Default is 8080
   - If different, it should still work (localhost on any port)

### Need more help?

See detailed guides:
- **EDGE_FUNCTION_DEPLOYMENT.md** - Full deployment instructions
- **IMMEDIATE_FIXES_SUMMARY.md** - Complete changes overview
- **SECURITY_ADVISORY.md** - Security context

---

## Why This Happened

The security fixes included stricter CORS validation in the PDF proxy. The old deployed version was rejecting requests from your development server. The updated code allows localhost connections while maintaining security for production.

---

## After Fixing

✅ PDFs will load normally
✅ All zoom/fit features work
✅ Security is maintained
✅ Development is unblocked

---

**Need Help?** Check the troubleshooting section in EDGE_FUNCTION_DEPLOYMENT.md

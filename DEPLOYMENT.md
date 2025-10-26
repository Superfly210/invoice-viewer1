# Deployment Guide

This guide covers deploying your Invoice Viewer application to various platforms with proper environment variable configuration.

## Prerequisites

Before deploying, ensure you have:
- [ ] Completed local setup with `.env` file
- [ ] Tested the application locally
- [ ] Verified all Supabase Row Level Security (RLS) policies
- [ ] Reviewed [SECURITY.md](./SECURITY.md) for security best practices

## Environment Variables Required

All deployment platforms need these environment variables:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Important:** Use the `anon public` key, NOT the `service_role` key!

## Platform-Specific Deployment Instructions

### Vercel

1. **Install Vercel CLI (optional):**
   ```bash
   npm install -g vercel
   ```

2. **Deploy via CLI:**
   ```bash
   vercel
   ```

3. **Set Environment Variables:**
   - Go to your project on [Vercel Dashboard](https://vercel.com/dashboard)
   - Navigate to Settings > Environment Variables
   - Add each variable:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_PROJECT_ID`
     - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - Select environments: Production, Preview, Development
   - Click "Save"

4. **Redeploy:**
   ```bash
   vercel --prod
   ```

### Netlify

1. **Install Netlify CLI (optional):**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build and Deploy:**
   ```bash
   npm run build
   netlify deploy --prod
   ```

3. **Set Environment Variables:**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Select your site
   - Navigate to Site Settings > Build & Deploy > Environment
   - Click "Edit Variables"
   - Add each variable:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_PROJECT_ID`
     - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - Click "Save"

4. **Trigger Redeploy:**
   - Go to Deploys tab
   - Click "Trigger deploy" > "Deploy site"

### Docker

1. **Create `.env.production` (don't commit this):**
   ```bash
   cp .env.example .env.production
   # Edit with your production Supabase credentials
   ```

2. **Update `dockerfile` to use build args:**
   ```dockerfile
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   
   # Build arguments for environment variables
   ARG VITE_SUPABASE_URL
   ARG VITE_SUPABASE_PROJECT_ID
   ARG VITE_SUPABASE_PUBLISHABLE_KEY
   
   # Make them available during build
   ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
   ENV VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID
   ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
   
   RUN npm run build
   
   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

3. **Build with environment variables:**
   ```bash
   docker build \
     --build-arg VITE_SUPABASE_URL=https://your-project.supabase.co \
     --build-arg VITE_SUPABASE_PROJECT_ID=your-project-id \
     --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key \
     -t invoice-viewer .
   ```

4. **Or use docker-compose.yml:**
   ```yaml
   version: '3.8'
   services:
     app:
       build:
         context: .
         args:
           VITE_SUPABASE_URL: ${VITE_SUPABASE_URL}
           VITE_SUPABASE_PROJECT_ID: ${VITE_SUPABASE_PROJECT_ID}
           VITE_SUPABASE_PUBLISHABLE_KEY: ${VITE_SUPABASE_PUBLISHABLE_KEY}
       ports:
         - "80:80"
   ```
   
   Then deploy with:
   ```bash
   docker-compose --env-file .env.production up -d
   ```

### Manual VPS/Server Deployment

1. **Build locally:**
   ```bash
   npm run build
   ```

2. **Set environment variables before build:**
   ```bash
   export VITE_SUPABASE_URL="https://your-project.supabase.co"
   export VITE_SUPABASE_PROJECT_ID="your-project-id"
   export VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
   npm run build
   ```

3. **Deploy the `dist` folder:**
   ```bash
   rsync -avz dist/ user@your-server:/var/www/invoice-viewer/
   ```

4. **Configure Nginx:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/invoice-viewer;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Security headers
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header X-XSS-Protection "1; mode=block" always;
   }
   ```

## Post-Deployment Checklist

After deploying, verify:

- [ ] Application loads without errors
- [ ] Authentication works (sign in/sign up)
- [ ] PDF viewing functions correctly
- [ ] Environment variables are set correctly
  - Check browser console for error messages
  - Verify Supabase connection in Network tab
- [ ] No console warnings about missing environment variables
- [ ] RLS policies are working as expected
  - Test with different user roles
  - Verify users can only access their own data

## Troubleshooting

### Build fails with "Missing required environment variables"

**Cause:** Environment variables not set during build process.

**Solution:**
- For Vercel/Netlify: Set variables in dashboard and redeploy
- For Docker: Pass variables as build args
- For local: Create `.env` file with required variables

### Application loads but Supabase connection fails

**Cause:** Wrong environment variable values or using wrong key type.

**Solution:**
1. Verify you're using the `anon public` key, NOT `service_role`
2. Check for typos in variable values
3. Ensure variable names match exactly: `VITE_SUPABASE_*`
4. Clear browser cache and hard reload

### "Failed to fetch" errors in production

**Cause:** CORS or network issues with Supabase.

**Solution:**
1. Check Supabase project is not paused
2. Verify project URL is correct
3. Check Supabase dashboard for project status
4. Review browser console for detailed error messages

## Security Reminders

Before going to production:

1. ✅ Never commit `.env` or `.env.production` files
2. ✅ Use the `anon public` key (not `service_role`)
3. ✅ Enable RLS on all database tables
4. ✅ Test RLS policies thoroughly
5. ✅ Review [SECURITY.md](./SECURITY.md) for best practices
6. ✅ Set up Supabase monitoring and alerts
7. ✅ Enable HTTPS/SSL for your domain

## Monitoring

After deployment, monitor:
- Supabase Dashboard > Logs
- Supabase Dashboard > API Usage
- Application error logs
- User feedback and reports

## Rollback Strategy

If deployment fails:

1. **Vercel/Netlify:** Revert to previous deployment from dashboard
2. **Docker:** Rollback to previous image tag
3. **Manual:** Restore previous `dist` folder backup

## Support

For deployment issues:
- Review [SECURITY.md](./SECURITY.md) for environment setup
- Check Supabase [documentation](https://supabase.com/docs)
- Review platform-specific docs (Vercel, Netlify, etc.)

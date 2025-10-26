# Security Checklist

Quick reference checklist for maintaining security in your Invoice Viewer application.

## ✅ Environment Variables

### Setup
- [ ] `.env.example` file exists and is documented
- [ ] `.env` file is in `.gitignore`
- [ ] Never committed actual `.env` file to repository
- [ ] All required variables documented in `.env.example`

### Configuration
- [ ] Using `VITE_SUPABASE_PUBLISHABLE_KEY` (anon key)
- [ ] NOT using `service_role` key in client code
- [ ] Environment variables have `VITE_` prefix for client exposure
- [ ] Runtime validation in place (`src/utils/envValidation.ts`)
- [ ] Service role key check implemented (`checkForServiceRoleKey()`)

### Production
- [ ] Environment variables set in hosting platform
- [ ] Production uses same variable names as development
- [ ] No secrets in git history (check with `git log --all -- .env`)

## ✅ Supabase Security

### Row Level Security (RLS)
- [ ] RLS enabled on ALL tables
- [ ] RLS policies created for each table
- [ ] Policies tested with different user roles
- [ ] Policies follow principle of least privilege
- [ ] No `USING (true)` policies (overly permissive)

### Authentication
- [ ] Email verification enabled (if using email auth)
- [ ] Password strength requirements configured
- [ ] Session timeout configured appropriately
- [ ] Refresh token rotation enabled

### Database
- [ ] No sensitive data in public tables without RLS
- [ ] User data properly isolated by user ID
- [ ] Audit logging enabled for critical tables
- [ ] Regular backups configured

## ✅ Application Security

### Client-Side
- [ ] No sensitive keys in client code
- [ ] API calls use authentication tokens
- [ ] Proper error handling (no info leakage)
- [ ] Input validation on all forms
- [ ] XSS protection in place (React handles this)

### Edge Functions
- [ ] Service role key only in Edge Functions
- [ ] Edge Functions validate user permissions
- [ ] Rate limiting implemented
- [ ] Error messages don't leak sensitive info

### Dependencies
- [ ] Regular `npm audit` runs
- [ ] Dependencies kept up to date
- [ ] No unused dependencies
- [ ] Lock file committed (`package-lock.json`)

## ✅ Code Security

### Best Practices
- [ ] No commented-out credentials
- [ ] No TODO comments with security implications
- [ ] Sensitive operations logged for audit
- [ ] Error boundaries catch and handle errors

### Files to Review
- [ ] `src/integrations/supabase/client.ts` - Proper key usage
- [ ] `src/components/PDFViewer.tsx` - Environment variable handling
- [ ] `src/hooks/usePdfPreloader.ts` - Environment variable handling
- [ ] `src/utils/envValidation.ts` - Validation logic

## ✅ Deployment Security

### Pre-Deployment
- [ ] All tests passing
- [ ] Security documentation reviewed
- [ ] Environment variables configured
- [ ] RLS policies verified in production database

### Production
- [ ] HTTPS/SSL enabled
- [ ] Security headers configured
- [ ] CORS properly configured in Supabase
- [ ] Rate limiting active
- [ ] Monitoring and alerts set up

### Post-Deployment
- [ ] Verify authentication works
- [ ] Test with different user roles
- [ ] Check for console errors
- [ ] Monitor Supabase logs for issues

## ✅ Regular Maintenance

### Weekly
- [ ] Review Supabase logs for anomalies
- [ ] Check for failed authentication attempts
- [ ] Monitor API usage patterns

### Monthly
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Review and update dependencies
- [ ] Audit RLS policies for new use cases
- [ ] Review user permissions and access patterns

### Quarterly
- [ ] Full security audit
- [ ] Review all RLS policies
- [ ] Test incident response procedures
- [ ] Update security documentation

## ✅ Incident Response

### If Security Issue Detected
1. [ ] Assess severity and impact
2. [ ] Contain the issue (disable features if needed)
3. [ ] Rotate compromised keys immediately
4. [ ] Notify affected users if required
5. [ ] Document incident and resolution
6. [ ] Update security measures to prevent recurrence

### Key Rotation Procedure
1. [ ] Generate new keys in Supabase dashboard
2. [ ] Update environment variables in all environments
3. [ ] Redeploy applications
4. [ ] Verify everything works
5. [ ] Delete old keys
6. [ ] Document the rotation

## 🚨 Red Flags - Investigate Immediately

- [ ] `service_role` key found in client code
- [ ] `.env` file committed to git
- [ ] RLS disabled on any table
- [ ] Hardcoded credentials anywhere
- [ ] Unusual Supabase API usage patterns
- [ ] Multiple failed authentication attempts
- [ ] Unexpected Edge Function invocations
- [ ] Console warnings about security

## 📚 Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/security)
- [Row Level Security Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- Project-specific: [SECURITY.md](./SECURITY.md)

## Notes

Use this checklist:
- Before each deployment
- During code reviews
- Monthly security audits
- After any security incidents
- When onboarding new developers

---

Last reviewed: [Add date when you review this]
Next review: [Add date for next review]

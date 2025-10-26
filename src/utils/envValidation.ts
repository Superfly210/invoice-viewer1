/**
 * Environment Variables Validation Utility
 * 
 * This module provides runtime validation for required environment variables.
 * It ensures the application fails fast with helpful error messages if configuration is missing.
 */

interface EnvConfig {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_PROJECT_ID: string;
  VITE_SUPABASE_PUBLISHABLE_KEY: string;
}

/**
 * Validates that all required environment variables are present
 * Throws a descriptive error if any are missing
 */
export function validateEnvironment(): EnvConfig {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PROJECT_ID',
    'VITE_SUPABASE_PUBLISHABLE_KEY',
  ] as const;

  const missingVars: string[] = [];
  const config: Partial<EnvConfig> = {};

  for (const varName of requiredVars) {
    const value = import.meta.env[varName];
    if (!value || value.trim() === '') {
      missingVars.push(varName);
    } else {
      config[varName] = value;
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `❌ Missing required environment variables:\n` +
      missingVars.map(v => `  - ${v}`).join('\n') +
      `\n\n` +
      `📝 Setup Instructions:\n` +
      `  1. Copy .env.example to .env:\n` +
      `     cp .env.example .env\n` +
      `\n` +
      `  2. Get your Supabase credentials:\n` +
      `     - Visit https://app.supabase.com\n` +
      `     - Go to Settings > API\n` +
      `     - Copy the Project URL, Project ID, and 'anon public' key\n` +
      `\n` +
      `  3. Fill in the .env file with your credentials\n` +
      `\n` +
      `  4. Restart the development server\n` +
      `\n` +
      `🔒 Security Note:\n` +
      `  The VITE_SUPABASE_PUBLISHABLE_KEY is the 'anon' key - it's safe for client-side use.\n` +
      `  See SECURITY.md for more information about environment variable security.`
    );
  }

  return config as EnvConfig;
}

/**
 * Gets the validated environment configuration
 * Safe to call multiple times - validation happens once
 */
let cachedConfig: EnvConfig | null = null;

export function getEnvConfig(): EnvConfig {
  if (!cachedConfig) {
    cachedConfig = validateEnvironment();
  }
  return cachedConfig;
}

/**
 * Security check: Warns if service_role key is accidentally used
 * This should NEVER be in client-side code
 */
export function checkForServiceRoleKey(): void {
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  
  // Service role keys are much longer and have 'service_role' in the payload
  if (key && key.length > 200) {
    console.error(
      '🚨 SECURITY WARNING: Your VITE_SUPABASE_PUBLISHABLE_KEY appears to be a service_role key!\n' +
      'This is a critical security risk. The service_role key should NEVER be in client-side code.\n' +
      'Please use the "anon public" key instead.\n' +
      'See SECURITY.md for more information.'
    );
  }
}

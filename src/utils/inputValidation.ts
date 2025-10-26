/**
 * Input Validation Utility
 * 
 * Provides comprehensive validation for user inputs to prevent
 * injection attacks, XSS, and data integrity issues.
 * 
 * SECURITY: Always validate on both client and server side.
 * Client-side validation is for UX, server-side is for security.
 */

import { z } from "zod";

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .email("Invalid email address")
  .max(254, "Email address is too long")
  .toLowerCase()
  .trim();

/**
 * Name validation (first name, last name, company name)
 */
export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name is too long")
  .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes")
  .trim();

/**
 * Company name validation (allows more characters)
 */
export const companyNameSchema = z
  .string()
  .min(1, "Company name is required")
  .max(200, "Company name is too long")
  .regex(/^[a-zA-Z0-9\s&.,'-]+$/, "Company name contains invalid characters")
  .trim();

/**
 * Invoice number validation
 */
export const invoiceNumberSchema = z
  .string()
  .min(1, "Invoice number is required")
  .max(50, "Invoice number is too long")
  .regex(/^[a-zA-Z0-9-_]+$/, "Invoice number can only contain letters, numbers, hyphens, and underscores")
  .trim();

/**
 * Currency amount validation
 */
export const currencyAmountSchema = z
  .number()
  .min(0, "Amount cannot be negative")
  .max(999999999.99, "Amount is too large")
  .finite("Amount must be a valid number");

/**
 * URL validation (for Google Drive links, etc.)
 */
export const urlSchema = z
  .string()
  .url("Invalid URL")
  .max(2048, "URL is too long")
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    "URL must use HTTP or HTTPS protocol"
  );

/**
 * Google Drive URL validation
 */
export const googleDriveUrlSchema = z
  .string()
  .url("Invalid URL")
  .refine(
    (url) => url.includes('drive.google.com'),
    "Must be a Google Drive URL"
  );

/**
 * Date validation (ISO format)
 */
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .refine(
    (date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    },
    "Invalid date"
  );

/**
 * Comment/Note validation (with length limits)
 */
export const commentSchema = z
  .string()
  .max(5000, "Comment is too long (max 5000 characters)")
  .trim();

/**
 * AFE number validation
 */
export const afeNumberSchema = z
  .string()
  .min(1, "AFE number is required")
  .max(50, "AFE number is too long")
  .regex(/^[a-zA-Z0-9-_]+$/, "AFE number can only contain letters, numbers, hyphens, and underscores")
  .trim();

/**
 * Sanitize HTML content (removes dangerous tags and attributes)
 * Use DOMPurify for actual sanitization in components
 */
export function sanitizeHtml(html: string): string {
  // This is a basic sanitizer - use DOMPurify for production
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');
}

/**
 * Validate and sanitize a string to prevent XSS
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // Remove angle brackets
}

/**
 * Validate invoice data from Supabase
 */
export const invoiceDataSchema = z.object({
  id: z.number().int().positive(),
  invoice_number: invoiceNumberSchema.nullable(),
  company_name: companyNameSchema.nullable(),
  invoice_date: dateSchema.nullable(),
  subtotal: currencyAmountSchema.nullable(),
  gst_total: currencyAmountSchema.nullable(),
  total: currencyAmountSchema.nullable(),
  pdf_url: urlSchema.nullable(),
  status: z.enum(['pending', 'approved', 'rejected', 'sync-open']).nullable(),
  submitted_by: z.string().uuid().nullable(),
  submitted_at: z.string().datetime().nullable(),
});

/**
 * Validate line item data
 */
export const lineItemSchema = z.object({
  id: z.number().int().positive(),
  invoice_id: z.number().int().positive(),
  description: z.string().max(500).nullable(),
  quantity: z.number().min(0).max(999999).nullable(),
  unit_price: currencyAmountSchema.nullable(),
  total: currencyAmountSchema.nullable(),
  afe_number: afeNumberSchema.nullable(),
});

/**
 * Validate user profile data
 */
export const userProfileSchema = z.object({
  id: z.string().uuid(),
  email: emailSchema,
  first_name: nameSchema.nullable(),
  last_name: nameSchema.nullable(),
  role: z.enum(['viewer', 'admin', 'submitter']).nullable(),
});

/**
 * Helper function to safely parse and validate data
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return {
      success: false,
      errors: ['Validation failed'],
    };
  }
}

/**
 * Batch validate multiple items
 */
export function batchValidate<T>(
  schema: z.ZodSchema<T>,
  items: unknown[]
): { valid: T[]; invalid: { index: number; errors: string[] }[] } {
  const valid: T[] = [];
  const invalid: { index: number; errors: string[] }[] = [];

  items.forEach((item, index) => {
    const result = safeValidate(schema, item);
    if (result.success) {
      valid.push(result.data);
    } else {
      invalid.push({ index, errors: result.errors });
    }
  });

  return { valid, invalid };
}

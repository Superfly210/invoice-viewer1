import { z } from "zod";

// SECURITY: Password requirements for protection against brute-force attacks
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/, "Password must contain at least one special character");

export const passwordRequirements = [
  "At least 8 characters long",
  "Contains at least one lowercase letter (a-z)",
  "Contains at least one uppercase letter (A-Z)",
  "Contains at least one number (0-9)",
  "Contains at least one special character (!@#$%^&* etc.)"
];

// Helper function to check password strength
export const getPasswordStrength = (password: string): {
  score: number;
  label: string;
  color: string;
} => {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/.test(password)) score++;
  
  if (score <= 2) return { score, label: "Weak", color: "text-red-500" };
  if (score <= 4) return { score, label: "Fair", color: "text-orange-500" };
  if (score <= 5) return { score, label: "Good", color: "text-yellow-500" };
  return { score, label: "Strong", color: "text-green-500" };
};

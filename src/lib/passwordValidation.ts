import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const passwordRequirements = [
  "At least 8 characters long",
  "Contains at least one lowercase letter",
  "Contains at least one uppercase letter",
  "Contains at least one number"
];

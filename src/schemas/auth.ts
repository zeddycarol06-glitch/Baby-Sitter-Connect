import { z } from "zod";

const email = z.string().trim().min(1, "Email is required").email("Enter a valid email address");
const password = z.string().min(8, "Password must be at least 8 characters");

export const loginSchema = z.object({
  email,
  password,
});

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(2, "First name is required").max(50),
    lastName: z.string().trim().min(2, "Last name is required").max(50),
    email,
    phone: z.string().trim().max(30).optional(),
    role: z.enum(["parent", "sitter"], { message: "Choose how you'll use BabySitter Connect" }),
    password,
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((value) => value, {
      message: "Please accept the terms and privacy policy",
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

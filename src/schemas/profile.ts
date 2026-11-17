import { z } from "zod";

export const childSchema = z.object({
  firstName: z.string().trim().min(2, "First name is required").max(50),
  lastName: z.string().trim().min(2, "Last name is required").max(50),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  allergies: z.string().trim().max(200).optional(),
  specialNeeds: z.string().trim().max(300).optional(),
  notes: z.string().trim().max(300).optional(),
});

export const parentProfileSchema = z.object({
  firstName: z.string().trim().min(2, "First name is required"),
  lastName: z.string().trim().min(2, "Last name is required"),
  phone: z.string().trim().max(30).optional(),
  address: z.string().trim().min(5, "Street address is required"),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  zip: z.string().trim().min(5, "ZIP code is required"),
  emergencyContactName: z.string().trim().min(2, "Emergency contact is required"),
  emergencyContactPhone: z.string().trim().min(7, "Emergency phone is required"),
});

export const sitterProfileSchema = z.object({
  displayName: z.string().trim().min(2, "Display name is required").max(60),
  headline: z.string().trim().min(10, "Write a short headline (10+ characters)").max(120),
  bio: z.string().trim().min(40, "Your bio should be at least 40 characters").max(1200),
  city: z.string().trim().min(2, "City is required"),
  hourlyRate: z.number().min(10, "Minimum rate is $10/hour").max(150, "Maximum rate is $150/hour"),
  experienceYears: z.number().min(0).max(60),
  languages: z.array(z.string()).min(1, "Select at least one language"),
  skills: z.array(z.string()).min(1, "Select at least one skill"),
});

export const messageSchema = z.object({
  body: z.string().trim().min(1, "Write a message").max(1000, "Messages must be 1000 characters or fewer"),
});

export const disputeSchema = z.object({
  bookingId: z.string().min(1, "Choose a booking"),
  reason: z.string().min(1, "Choose a reason"),
  description: z.string().trim().min(20, "Describe what happened (20+ characters)").max(1000),
});

export const verificationUploadSchema = z.object({
  type: z.enum(["government_id", "certificate", "background_check"]),
  fileName: z.string().min(1, "Choose a file to upload"),
});export const availabilitySchema = z.object({
  availability: z
    .array(
      z.object({
        dayOfWeek: z.number().min(0).max(6),
        startTime: z.string().min(1),
        endTime: z.string().min(1),
        isAvailable: z.boolean(),
      }),
    )
    .refine(
      (rows) =>
        rows.every((row) => !row.isAvailable || row.startTime < row.endTime),
      { message: "End time must be after the start time" },
    ),
});

export const adminSettingsSchema = z.object({
  commissionRate: z
    .number()
    .min(0, "Commission can't be negative")
    .max(50, "Commission can't exceed 50%"),
  serviceFeeRate: z
    .number()
    .min(0, "Service fee can't be negative")
    .max(30, "Service fee can't exceed 30%"),
  currency: z.string().trim().min(3, "Use a 3-letter currency code").max(3, "Use a 3-letter currency code"),
  payoutSchedule: z.enum(["weekly", "biweekly", "monthly"]),
  supportEmail: z.string().trim().email("Enter a valid support email"),
});

export type ChildValues = z.infer<typeof childSchema>;
export type ParentProfileValues = z.infer<typeof parentProfileSchema>;
export type SitterProfileValues = z.infer<typeof sitterProfileSchema>;
export type MessageValues = z.infer<typeof messageSchema>;
export type DisputeValues = z.infer<typeof disputeSchema>;
export type VerificationUploadValues = z.infer<typeof verificationUploadSchema>;
export type AdminSettingsValues = z.infer<typeof adminSettingsSchema>;

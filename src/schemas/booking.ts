import { z } from "zod";

export const bookingRequestSchema = z
  .object({
    date: z.string().min(1, "Choose a date"),
    startTime: z.string().min(1, "Choose a start time"),
    endTime: z.string().min(1, "Choose an end time"),
    childIds: z.array(z.string()).min(1, "Select at least one child"),
    address: z.string().trim().min(6, "Enter the address where care will happen").max(200),
    notes: z.string().trim().max(600, "Notes must be 600 characters or fewer").optional(),
  })
  .refine((values) => values.startTime < values.endTime, {
    path: ["endTime"],
    message: "End time must be after the start time",
  });

export const paymentSchema = z.object({
  nameOnCard: z.string().trim().min(2, "Enter the name on the card"),
  cardNumber: z
    .string()
    .trim()
    .transform((value) => value.replace(/\s/g, ""))
    .pipe(z.string().regex(/^\d{16}$/, "Enter a 16-digit card number")),
  expiry: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY format"),
  cvc: z
    .string()
    .trim()
    .regex(/^\d{3,4}$/, "Enter a 3 or 4 digit CVC"),
});

export const cancelBookingSchema = z.object({
  reason: z.string().trim().min(5, "Tell us why you need to cancel").max(300),
});

export const reviewSchema = z.object({
  rating: z.number().min(1, "Choose a rating").max(5),
  comment: z.string().trim().min(10, "Share a little more detail (10+ characters)").max(600),
});

export const bookingStatusSchema = z.object({
  status: z.enum(["accepted", "paid", "completed", "cancelled"]),
});

export type BookingRequestValues = z.infer<typeof bookingRequestSchema>;
export type PaymentValues = z.infer<typeof paymentSchema>;
export type CancelBookingValues = z.infer<typeof cancelBookingSchema>;
export type ReviewValues = z.infer<typeof reviewSchema>;

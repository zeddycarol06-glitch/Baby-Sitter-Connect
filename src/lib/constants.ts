export const APP_NAME = "BabySitter Connect";

export const SERVICE_FEE_RATE = 0.08;
export const DEFAULT_COMMISSION_RATE = 0.15;
export const CURRENCY = "USD";
export const CANCELLATION_WINDOW_HOURS = 24;

export const CITIES = [
  "Seattle, WA",
  "Bellevue, WA",
  "Kirkland, WA",
  "Redmond, WA",
  "Sammamish, WA",
] as const;

export const LANGUAGES = [
  "English",
  "Spanish",
  "Mandarin",
  "Hindi",
  "French",
  "Korean",
  "ASL",
  "Gujarati",
] as const;

export const SITTER_SKILLS = [
  "Newborn care",
  "Toddler care",
  "Early childhood education",
  "CPR certified",
  "First aid",
  "Special needs support",
  "Arts & crafts",
  "Homework help",
  "Meal preparation",
  "Overnight care",
  "Pets welcome",
  "Swim supervision",
] as const;

export const BOOKING_STATUS_LABELS = {
  pending: "Pending",
  accepted: "Accepted",
  paid: "Paid",
  completed: "Completed",
  cancelled: "Cancelled",
} as const;

export const PAYMENT_STATUS_LABELS = {
  pending: "Pending",
  paid: "Paid",
  refunded: "Refunded",
  failed: "Failed",
} as const;

export const VERIFICATION_STATUS_LABELS = {
  unverified: "Unverified",
  pending: "In review",
  verified: "Verified",
  rejected: "Rejected",
} as const;

export const DISPUTE_STATUS_LABELS = {
  open: "Open",
  under_review: "Under review",
  resolved: "Resolved",
  rejected: "Rejected",
} as const;

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const DEMO_ACCOUNTS = [
  { role: "Parent", email: "parent@example.com", password: "password123" },
  { role: "Babysitter", email: "maya@example.com", password: "password123" },
  { role: "Admin", email: "admin@example.com", password: "password123" },
] as const;

export const ROLE_HOME: Record<"parent" | "sitter" | "admin", string> = {
  parent: "/parent",
  sitter: "/sitter",
  admin: "/admin",
};

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";
export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";

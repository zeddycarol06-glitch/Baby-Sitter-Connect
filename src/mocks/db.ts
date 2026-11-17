import type {
  Availability,
  Booking,
  Child,
  Conversation,
  Dispute,
  Message,
  Notification,
  ParentProfile,
  Payment,
  Payout,
  Review,
  SitterProfile,
  User,
  VerificationDocument,
} from "@/types";
import {
  seedAvailability,
  seedBookings,
  seedChildren,
  seedConversations,
  seedDisputes,
  seedDocuments,
  seedMessages,
  seedNotifications,
  seedParentProfiles,
  seedPayments,
  seedPayouts,
  seedReviews,
  seedSettings,
  seedSitters,
  seedUsers,
} from "./seed";

export interface MockDatabase {
  users: User[];
  parentProfiles: ParentProfile[];
  children: Child[];
  sitters: SitterProfile[];
  availability: Availability[];
  documents: VerificationDocument[];
  bookings: Booking[];
  payments: Payment[];
  payouts: Payout[];
  reviews: Review[];
  conversations: Conversation[];
  messages: Message[];
  disputes: Dispute[];
  notifications: Notification[];
  settings: typeof seedSettings;
}

function createDatabase(): MockDatabase {
  return {
    users: structuredClone(seedUsers),
    parentProfiles: structuredClone(seedParentProfiles),
    children: structuredClone(seedChildren),
    sitters: structuredClone(seedSitters),
    availability: structuredClone(seedAvailability),
    documents: structuredClone(seedDocuments),
    bookings: structuredClone(seedBookings),
    payments: structuredClone(seedPayments),
    payouts: structuredClone(seedPayouts),
    reviews: structuredClone(seedReviews),
    conversations: structuredClone(seedConversations),
    messages: structuredClone(seedMessages),
    disputes: structuredClone(seedDisputes),
    notifications: structuredClone(seedNotifications),
    settings: structuredClone(seedSettings),
  };
}

const globalForDb = globalThis as unknown as { __bsMockDb?: MockDatabase };
export const db: MockDatabase = (globalForDb.__bsMockDb ??= createDatabase());

export function resetDatabase(): void {
  const fresh = createDatabase();
  Object.assign(db, fresh);
}

export interface RequestActor {
  id: string;
  role: User["role"];
  email: string;
  name: string;
}

export function getActor(request: Request): RequestActor {
  const id = request.headers.get("x-user-id") ?? "usr_parent_1";
  const roleHeader = request.headers.get("x-user-role");
  const role: User["role"] =
    roleHeader === "sitter" || roleHeader === "admin" || roleHeader === "parent"
      ? roleHeader
      : "parent";
  const email = decodeHeader(request.headers.get("x-user-email")) ?? "parent@example.com";
  const name = decodeHeader(request.headers.get("x-user-name")) ?? "Alex Morgan";
  ensureActor({ id, role, email, name });
  return { id, role, email, name };
}

function decodeHeader(value: string | null): string | undefined {
  if (!value) return undefined;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function ensureActor(actor: RequestActor): void {
  if (db.users.some((user) => user.id === actor.id)) return;
  const [firstName, ...rest] = actor.name.split(" ");
  const now = new Date().toISOString();
  db.users.push({
    id: actor.id,
    email: actor.email,
    firstName: firstName || "New",
    lastName: rest.join(" ") || "Member",
    role: actor.role,
    status: "active",
    emailVerified: true,
    createdAt: now,
    lastActiveAt: now,
  });

  if (actor.role === "parent" && !db.parentProfiles.some((p) => p.userId === actor.id)) {
    db.parentProfiles.push({
      id: `par_${actor.id}`,
      userId: actor.id,
      address: "",
      city: "",
      state: "",
      zip: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
    });
  }

  if (actor.role === "sitter" && !db.sitters.some((s) => s.userId === actor.id)) {
    db.sitters.push({
      id: `sit_${actor.id}`,
      userId: actor.id,
      displayName: actor.name,
      headline: "New to BabySitter Connect",
      bio: "Tell families about your experience, your approach to care, and what a day with you looks like.",
      city: "",
      state: "",
      hourlyRate: 20,
      currency: "USD",
      experienceYears: 0,
      rating: 0,
      reviewCount: 0,
      completedBookings: 0,
      responseTimeHours: 24,
      verified: false,
      verificationStatus: "unverified",
      languages: [],
      skills: [],
      photoUrl: "",
      coverGradient: "from-teal-500 via-cyan-500 to-sky-500",
      joinedAt: new Date().toISOString(),
    });
  }
}

export function currentSitter(actor: RequestActor): SitterProfile | undefined {
  return db.sitters.find((sitter) => sitter.userId === actor.id);
}

export function currentParent(actor: RequestActor): ParentProfile | undefined {
  return db.parentProfiles.find((profile) => profile.userId === actor.id);
}

export function nextId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function parseNumber(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const safePage = Math.max(1, page);
  const safeSize = Math.max(1, pageSize);
  const start = (safePage - 1) * safeSize;
  return {
    data: items.slice(start, start + safeSize),
    page: safePage,
    pageSize: safeSize,
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / safeSize)),
  };
}

export function notify(input: {
  userId: string;
  title: string;
  body: string;
  type: Notification["type"];
  href?: string;
}): void {
  db.notifications.unshift({
    id: nextId("ntf"),
    userId: input.userId,
    title: input.title,
    body: input.body,
    type: input.type,
    read: false,
    createdAt: new Date().toISOString(),
    href: input.href,
  });
}

export function touchBooking(booking: Booking, status: Booking["status"]): Booking {
  booking.status = status;
  booking.updatedAt = new Date().toISOString();
  return booking;
}

export function createPaymentForBooking(
  booking: Booking,
  method: Payment["method"] = "card",
): Payment {
  const commission = Math.round(booking.subtotal * db.settings.commissionRate * 100) / 100;
  const payment: Payment = {
    id: nextId("pay"),
    bookingId: booking.id,
    parentId: booking.parentId,
    parentName: booking.parentName,
    sitterId: booking.sitterId,
    sitterName: booking.sitterName,
    amount: booking.total,
    platformFee: Math.round((booking.serviceFee + commission) * 100) / 100,
    sitterEarnings: Math.round((booking.subtotal - commission) * 100) / 100,
    commissionRate: db.settings.commissionRate,
    status: "paid",
    method,
    last4: "4242",
    createdAt: new Date().toISOString(),
  };
  db.payments.unshift(payment);
  booking.paymentId = payment.id;
  return payment;
}

export function respondError(message: string, status = 400) {
  return Response.json({ message }, { status });
}

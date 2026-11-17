import { addDays, format } from "date-fns";
import { delay, http, HttpResponse } from "msw";
import { API_URL } from "@/lib/constants";
import { calculatePrice } from "@/lib/pricing";
import { hoursBetween, timeToMinutes } from "@/lib/format";
import type {
  AdminOverview,
  AdminReportRow,
  Availability,
  Booking,
  BookingStatus,
  Child,
  Conversation,
  Dispute,
  Message,
  Notification,
  ParentProfile,
  Payment,
  Review,
  SitterProfile,
  SitterSummary,
  SitterWithAvailability,
  User,
  VerificationDocument,
} from "@/types";
import {
  createPaymentForBooking,
  currentParent,
  currentSitter,
  db,
  getActor,
  nextId,
  notify,
  paginate,
  parseNumber,
  respondError,
  touchBooking,
} from "./db";

const api = API_URL.replace(/\/+$/, "");
const today = () => format(new Date(), "yyyy-MM-dd");
const nowIso = () => new Date().toISOString();

const CHILD_COLORS = [
  "bg-rose-200 text-rose-800",
  "bg-amber-200 text-amber-900",
  "bg-sky-200 text-sky-900",
  "bg-emerald-200 text-emerald-900",
  "bg-violet-200 text-violet-900",
];

async function simulateLatency(): Promise<void> {
  await delay(180 + Math.floor(Math.random() * 220));
}

async function readBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

function findSitter(id: string): SitterProfile | undefined {
  return db.sitters.find((sitter) => sitter.id === id);
}

function nextAvailableDate(sitterId: string): string | undefined {
  for (let offset = 0; offset < 21; offset += 1) {
    const date = addDays(new Date(), offset);
    const row = db.availability.find(
      (slot) => slot.sitterId === sitterId && slot.dayOfWeek === date.getDay() && slot.isAvailable,
    );
    if (row) return format(date, "yyyy-MM-dd");
  }
  return undefined;
}

function sitterAvailableOn(sitterId: string, date: string, start?: string, end?: string): boolean {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return true;
  const row = db.availability.find(
    (slot) => slot.sitterId === sitterId && slot.dayOfWeek === parsed.getDay() && slot.isAvailable,
  );
  if (!row) return false;
  if (start && timeToMinutes(start) < timeToMinutes(row.startTime)) return false;
  if (end && row.endTime >= row.startTime && timeToMinutes(end) > timeToMinutes(row.endTime)) {
    return false;
  }
  return true;
}

function buildConversationForBooking(booking: Booking): void {
  if (db.conversations.some((conversation) => conversation.bookingId === booking.id)) return;
  const sitter = findSitter(booking.sitterId);
  if (!sitter) return;
  const parentUser = db.users.find((user) => user.id === booking.parentId);
  const sitterUser = db.users.find((user) => user.id === booking.sitterUserId);
  db.conversations.unshift({
    id: nextId("conv"),
    bookingId: booking.id,
    participantIds: [booking.parentId, booking.sitterUserId],
    participantNames: [booking.parentName, sitter.displayName],
    participantAvatars: [parentUser?.avatarUrl ?? "", sitterUser?.avatarUrl ?? ""],
    lastMessage: "Conversation started for this booking.",
    lastMessageAt: nowIso(),
    unreadCount: 0,
    otherPartyName: sitter.displayName,
    otherPartyAvatar: sitterUser?.avatarUrl,
  });
}

function unreadFor(conversationId: string, userId: string): number {
  return db.messages.filter(
    (message) =>
      message.conversationId === conversationId && message.senderId !== userId && !message.read,
  ).length;
}

function visibleConversations(actorId: string): Conversation[] {
  return db.conversations
    .filter((conversation) => conversation.participantIds.includes(actorId))
    .map((conversation) => {
      const otherIndex = conversation.participantIds.findIndex((id) => id !== actorId);
      const otherId = otherIndex >= 0 ? conversation.participantIds[otherIndex] : undefined;
      const otherUser = db.users.find((user) => user.id === otherId);
      return {
        ...conversation,
        unreadCount: unreadFor(conversation.id, actorId),
        otherPartyName: otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : "Member",
        otherPartyAvatar: otherUser?.avatarUrl,
        lastMessageAt: conversation.lastMessageAt,
      };
    })
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
}

function recomputeVerification(sitter: SitterProfile): void {
  const documents = db.documents.filter((document) => document.sitterId === sitter.id);
  if (documents.some((document) => document.status === "rejected")) {
    sitter.verificationStatus = "rejected";
    sitter.verified = false;
  } else if (documents.some((document) => document.status === "pending")) {
    sitter.verificationStatus = "pending";
    sitter.verified = false;
  } else if (documents.length > 0) {
    sitter.verificationStatus = "verified";
    sitter.verified = true;
  }
}

const MONTHLY_SERIES = [
  { month: "Mar", revenue: 4820, bookings: 96 },
  { month: "Apr", revenue: 5240, bookings: 104 },
  { month: "May", revenue: 6110, bookings: 121 },
  { month: "Jun", revenue: 5780, bookings: 112 },
  { month: "Jul", revenue: 6940, bookings: 138 },
  { month: "Aug", revenue: 7480, bookings: 149 },
  { month: "Sep", revenue: 7120, bookings: 141 },
  { month: "Oct", revenue: 8360, bookings: 166 },
];

export const handlers = [
  // ---------------------------------------------------------------- sitters
  http.get(`${api}/sitters/featured`, async () => {
    await simulateLatency();
    const featured = [...db.sitters]
      .filter((sitter) => sitter.verified)
      .sort((a, b) => b.rating * 10 + b.reviewCount / 50 - (a.rating * 10 + a.reviewCount / 50))
      .slice(0, 4);
    return HttpResponse.json(featured);
  }),

  http.get(`${api}/sitters`, async ({ request }) => {
    await simulateLatency();
    const url = new URL(request.url);
    const params = url.searchParams;
    const q = (params.get("q") ?? "").trim().toLowerCase();
    const city = params.get("city") ?? "";
    const date = params.get("date") ?? "";
    const startTime = params.get("startTime") ?? "";
    const endTime = params.get("endTime") ?? "";
    const minRate = params.get("minRate") ? parseNumber(params.get("minRate"), 0) : undefined;
    const maxRate = params.get("maxRate") ? parseNumber(params.get("maxRate"), 999) : undefined;
    const minExperience = params.get("minExperience")
      ? parseNumber(params.get("minExperience"), 0)
      : undefined;
    const minRating = params.get("minRating") ? parseNumber(params.get("minRating"), 0) : undefined;
    const language = params.get("language") ?? "";
    const sort = params.get("sort") ?? "recommended";
    const page = parseNumber(params.get("page"), 1);
    const pageSize = parseNumber(params.get("pageSize"), 6);

    let results = db.sitters.filter((sitter) => {
      if (
        q &&
        !`${sitter.displayName} ${sitter.headline} ${sitter.city} ${sitter.skills.join(" ")}`
          .toLowerCase()
          .includes(q)
      ) {
        return false;
      }
      if (city && !sitter.city.toLowerCase().includes(city.toLowerCase().split(",")[0])) return false;
      if (minRate !== undefined && sitter.hourlyRate < minRate) return false;
      if (maxRate !== undefined && sitter.hourlyRate > maxRate) return false;
      if (minExperience !== undefined && sitter.experienceYears < minExperience) return false;
      if (minRating !== undefined && sitter.rating < minRating) return false;
      if (language && !sitter.languages.includes(language)) return false;
      if (date && !sitterAvailableOn(sitter.id, date, startTime || undefined, endTime || undefined)) {
        return false;
      }
      return true;
    });

    switch (sort) {
      case "rating":
        results = results.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
        break;
      case "price_asc":
        results = results.sort((a, b) => a.hourlyRate - b.hourlyRate);
        break;
      case "price_desc":
        results = results.sort((a, b) => b.hourlyRate - a.hourlyRate);
        break;
      case "experience":
        results = results.sort((a, b) => b.experienceYears - a.experienceYears);
        break;
      default:
        results = results.sort((a, b) => {
          const scoreA = a.rating * 10 + a.reviewCount / 40 + (a.verified ? 3 : 0);
          const scoreB = b.rating * 10 + b.reviewCount / 40 + (b.verified ? 3 : 0);
          return scoreB - scoreA;
        });
    }

    const withAvailability: SitterWithAvailability[] = results.map((sitter) => ({
      ...sitter,
      nextAvailable: nextAvailableDate(sitter.id),
    }));

    return HttpResponse.json(paginate(withAvailability, page, pageSize));
  }),

  http.get(`${api}/sitters/:id/reviews`, async ({ params }) => {
    await simulateLatency();
    const reviews = db.reviews
      .filter((review) => review.sitterId === params.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return HttpResponse.json(reviews);
  }),

  http.get(`${api}/sitters/:id/availability`, async ({ params }) => {
    await simulateLatency();
    const availability = db.availability
      .filter((slot) => slot.sitterId === params.id)
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    return HttpResponse.json(availability);
  }),

  http.put(`${api}/sitters/:id/availability`, async ({ params, request }) => {
    await simulateLatency();
    const actor = getActor(request);
    const sitter = currentSitter(actor);
    if (!sitter || sitter.id !== params.id) return respondError("Sitter not found", 404);
    const body = await readBody<{ availability: Availability[] }>(request);
    if (!body?.availability) return respondError("Availability is required");
    db.availability = db.availability.filter((slot) => slot.sitterId !== sitter.id);
    const saved = body.availability.map((slot) => ({
      ...slot,
      id: `avl_${sitter.id}_${slot.dayOfWeek}`,
      sitterId: sitter.id,
    }));
    db.availability.push(...saved);
    return HttpResponse.json(saved);
  }),

  http.get(`${api}/sitters/:id`, async ({ params }) => {
    await simulateLatency();
    const sitter = findSitter(String(params.id));
    if (!sitter) return respondError("Sitter not found", 404);
    return HttpResponse.json(sitter);
  }),

  // ---------------------------------------------------------------- parent
  http.get(`${api}/parent/summary`, async ({ request }) => {
    await simulateLatency();
    const actor = getActor(request);
    const parentBookings = db.bookings.filter((booking) => booking.parentId === actor.id);
    const upcoming = parentBookings
      .filter(
        (booking) =>
          booking.date >= today() && ["pending", "accepted", "paid"].includes(booking.status),
      )
      .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
    const conversations = visibleConversations(actor.id);
    const totalSpent = db.payments
      .filter((payment) => payment.parentId === actor.id && payment.status === "paid")
      .reduce((sum, payment) => sum + payment.amount, 0);
    const bookedSitterIds = new Set(parentBookings.map((booking) => booking.sitterId));
    const recommended = [...db.sitters]
      .filter((sitter) => sitter.verified && !bookedSitterIds.has(sitter.id))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
    return HttpResponse.json({
      upcoming,
      activeChildren: db.children.filter((child) => child.parentId === actor.id).length,
      unreadMessages: conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0),
      totalSpent,
      recommendedSitters: recommended,
    });
  }),

  http.get(`${api}/parent/profile`, async ({ request }) => {
    await simulateLatency();
    const actor = getActor(request);
    const profile = currentParent(actor);
    const user = db.users.find((item) => item.id === actor.id);
    if (!profile || !user) return respondError("Profile not found", 404);
    return HttpResponse.json({ profile, user });
  }),

  http.patch(`${api}/parent/profile`, async ({ request }) => {
    await simulateLatency();
    const actor = getActor(request);
    const profile = currentParent(actor);
    const user = db.users.find((item) => item.id === actor.id);
    if (!profile || !user) return respondError("Profile not found", 404);
    const body = await readBody<Partial<ParentProfile> & { firstName?: string; lastName?: string; phone?: string }>(request);
    if (!body) return respondError("Invalid profile payload");
    const { firstName, lastName, phone, ...profileFields } = body;
    Object.assign(profile, profileFields);
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    return HttpResponse.json({ profile, user });
  }),

  http.get(`${api}/parent/children`, async ({ request }) => {
    await simulateLatency();
    const actor = getActor(request);
    return HttpResponse.json(db.children.filter((child) => child.parentId === actor.id));
  }),

  http.post(`${api}/parent/children`, async ({ request }) => {
    await simulateLatency();
    const actor = getActor(request);
    const body = await readBody<Partial<Child>>(request);
    if (!body?.firstName || !body.dateOfBirth) return respondError("Child details are required");
    const child: Child = {
      id: nextId("ch"),
      parentId: actor.id,
      firstName: body.firstName,
      lastName: body.lastName ?? "",
      dateOfBirth: body.dateOfBirth,
      allergies: body.allergies ?? [],
      specialNeeds: body.specialNeeds ?? "",
      notes: body.notes ?? "",
      avatarColor: CHILD_COLORS[db.children.length % CHILD_COLORS.length],
    };
    db.children.push(child);
    return HttpResponse.json(child, { status: 201 });
  }),

  http.patch(`${api}/parent/children/:id`, async ({ request, params }) => {
    await simulateLatency();
    const actor = getActor(request);
    const child = db.children.find((item) => item.id === params.id && item.parentId === actor.id);
    if (!child) return respondError("Child not found", 404);
    const body = await readBody<Partial<Child>>(request);
    if (!body) return respondError("Invalid payload");
    Object.assign(child, body);
    return HttpResponse.json(child);
  }),

  http.delete(`${api}/parent/children/:id`, async ({ request, params }) => {
    await simulateLatency();
    const actor = getActor(request);
    const index = db.children.findIndex(
      (item) => item.id === params.id && item.parentId === actor.id,
    );
    if (index === -1) return respondError("Child not found", 404);
    db.children.splice(index, 1);
    return HttpResponse.json({ ok: true });
  }),

  // ---------------------------------------------------------------- bookings
  http.get(`${api}/bookings`, async ({ request }) => {
    await simulateLatency();
    const actor = getActor(request);
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const page = parseNumber(url.searchParams.get("page"), 1);
    const pageSize = parseNumber(url.searchParams.get("pageSize"), 20);
    const sort = url.searchParams.get("sort") ?? "desc";
    const sitter = currentSitter(actor);

    let bookings = db.bookings.filter((booking) => {
      if (actor.role === "admin") return true;
      if (actor.role === "sitter") return sitter ? booking.sitterId === sitter.id : false;
      return booking.parentId === actor.id;
    });

    if (status) {
      const statuses = status.split(",");
      bookings = bookings.filter((booking) => statuses.includes(booking.status));
    }

    bookings = bookings.sort((a, b) => {
      const left = `${a.date}T${a.startTime}`;
      const right = `${b.date}T${b.startTime}`;
      return sort === "asc" ? left.localeCompare(right) : right.localeCompare(left);
    });

    return HttpResponse.json(paginate(bookings, page, pageSize));
  }),

  http.get(`${api}/bookings/:id`, async ({ params }) => {
    await simulateLatency();
    const booking = db.bookings.find((item) => item.id === params.id);
    if (!booking) return respondError("Booking not found", 404);
    return HttpResponse.json(booking);
  }),

  http.post(`${api}/bookings`, async ({ request }) => {
    await simulateLatency();
    const actor = getActor(request);
    const body = await readBody<{
      sitterId: string;
      date: string;
      startTime: string;
      endTime: string;
      childIds: string[];
      notes?: string;
      address?: string;
    }>(request);

    if (!body?.sitterId || !body.date || !body.startTime || !body.endTime) {
      return respondError("Please complete all booking details");
    }
    const sitter = findSitter(body.sitterId);
    if (!sitter) return respondError("Sitter not found", 404);
    if (body.startTime >= body.endTime) return respondError("End time must be after start time");
    if (hoursBetween(body.startTime, body.endTime) < 1) {
      return respondError("Bookings must be at least one hour");
    }
    if (!body.childIds?.length) return respondError("Select at least one child");

    const children = db.children.filter(
      (child) => child.parentId === actor.id && body.childIds.includes(child.id),
    );
    const user = db.users.find((item) => item.id === actor.id);
    const parentProfile = currentParent(actor);
    const price = calculatePrice(sitter.hourlyRate, body.startTime, body.endTime, db.settings.serviceFeeRate);

    const booking: Booking = {
      id: nextId("bk"),
      parentId: actor.id,
      parentName: user ? `${user.firstName} ${user.lastName}` : "Parent",
      parentAvatarUrl: user?.avatarUrl,
      sitterId: sitter.id,
      sitterUserId: sitter.userId,
      sitterName: sitter.displayName,
      childIds: children.map((child) => child.id),
      childNames: children.map((child) => `${child.firstName} ${child.lastName}`),
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      hours: price.hours,
      notes: body.notes,
      status: "pending",
      hourlyRate: sitter.hourlyRate,
      subtotal: price.subtotal,
      serviceFee: price.serviceFee,
      total: price.total,
      address:
        body.address ||
        [parentProfile?.address, parentProfile?.city, parentProfile?.state, parentProfile?.zip]
          .filter(Boolean)
          .join(", "),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      hasReview: false,
    };

    db.bookings.unshift(booking);
    buildConversationForBooking(booking);
    notify({
      userId: sitter.userId,
      title: `New booking request from ${booking.parentName.split(" ")[0]}`,
      body: `${booking.childNames.join(" & ")} · ${booking.date} · ${booking.hours} hours`,
      type: "booking",
      href: "/sitter/requests",
    });
    return HttpResponse.json(booking, { status: 201 });
  }),

  http.patch(`${api}/bookings/:id/status`, async ({ request, params }) => {
    await simulateLatency();
    const actor = getActor(request);
    const booking = db.bookings.find((item) => item.id === params.id);
    if (!booking) return respondError("Booking not found", 404);
    const body = await readBody<{ status: BookingStatus; reason?: string }>(request);
    if (!body?.status) return respondError("Status is required");

    const allowed: BookingStatus[] = ["pending", "accepted", "paid", "completed", "cancelled"];
    if (!allowed.includes(body.status)) return respondError("Unknown status");

    if (actor.role === "sitter" && booking.sitterUserId !== actor.id) {
      return respondError("This booking does not belong to you", 403);
    }
    if (actor.role === "parent" && booking.parentId !== actor.id) {
      return respondError("This booking does not belong to you", 403);
    }

    touchBooking(booking, body.status);

    if (body.status === "accepted") {
      notify({
        userId: booking.parentId,
        title: `${booking.sitterName} accepted your booking`,
        body: `${booking.date} at ${booking.startTime}. Complete payment to confirm your spot.`,
        type: "booking",
        href: `/parent/bookings/${booking.id}`,
      });
    }

    if (body.status === "cancelled") {
      booking.cancellationReason = body.reason || "Cancelled by user";
      const payment = db.payments.find((item) => item.bookingId === booking.id);
      if (payment && payment.status === "paid") {
        payment.status = "refunded";
        payment.refundedAt = nowIso();
      }
      notify({
        userId: actor.role === "parent" ? booking.sitterUserId : booking.parentId,
        title: "A booking was cancelled",
        body: `${booking.childNames.join(" & ")} on ${booking.date} — ${booking.cancellationReason}`,
        type: "booking",
        href: actor.role === "parent" ? "/sitter/requests" : `/parent/bookings/${booking.id}`,
      });
    }

    if (body.status === "completed") {
      if (!booking.paymentId) createPaymentForBooking(booking);
      notify({
        userId: booking.parentId,
        title: "How was your booking?",
        body: `Leave a review for ${booking.sitterName} to help other families.`,
        type: "system",
        href: "/parent/bookings",
      });
    }

    return HttpResponse.json(booking);
  }),

  // ---------------------------------------------------------------- payments
  http.get(`${api}/payments`, async ({ request }) => {
    await simulateLatency();
    const actor = getActor(request);
    if (actor.role === "admin") return HttpResponse.json(db.payments);
    if (actor.role === "sitter") {
      const sitter = currentSitter(actor);
      return HttpResponse.json(
        db.payments.filter((payment) => (sitter ? payment.sitterId === sitter.id : false)),
      );
    }
    return HttpResponse.json(db.payments.filter((payment) => payment.parentId === actor.id));
  }),

  http.post(`${api}/payments`, async ({ request }) => {
    await simulateLatency();
    const actor = getActor(request);
    const body = await readBody<{ bookingId: string; nameOnCard?: string; cardNumber?: string }>(
      request,
    );
    if (!body?.bookingId) return respondError("Booking is required");
    if (body.cardNumber && !/^\d{16}$/.test(body.cardNumber.replace(/\s/g, ""))) {
      return respondError("Enter a valid 16-digit card number");
    }
    const booking = db.bookings.find((item) => item.id === body.bookingId);
    if (!booking) return respondError("Booking not found", 404);
    if (actor.role === "parent" && booking.parentId !== actor.id) {
      return respondError("This booking does not belong to you", 403);
    }
    if (booking.status === "pending") {
      return respondError("The sitter needs to accept this booking before payment");
    }
    if (booking.status === "cancelled") return respondError("This booking was cancelled");

    const existing = db.payments.find((payment) => payment.bookingId === booking.id);
    if (existing && existing.status === "paid") {
      return HttpResponse.json({ payment: existing, booking });
    }

    const payment = createPaymentForBooking(booking, "card");
    touchBooking(booking, "paid");
    notify({
      userId: booking.sitterUserId,
      title: "Payment received",
      body: `${booking.parentName} paid for ${booking.date}. You'll earn $${payment.sitterEarnings.toFixed(2)} after commission.`,
      type: "payment",
      href: "/sitter/earnings",
    });
    notify({
      userId: booking.parentId,
      title: "Booking confirmed",
      body: `Your booking with ${booking.sitterName} is confirmed for ${booking.date}.`,
      type: "payment",
      href: `/parent/bookings/${booking.id}`,
    });
    return HttpResponse.json({ payment, booking }, { status: 201 });
  }),

  http.post(`${api}/payments/:id/refund`, async ({ request, params }) => {
    await simulateLatency();
    const actor = getActor(request);
    if (actor.role !== "admin") return respondError("Only admins can issue refunds", 403);
    const payment = db.payments.find((item) => item.id === params.id);
    if (!payment) return respondError("Payment not found", 404);
    payment.status = "refunded";
    payment.refundedAt = nowIso();
    const booking = db.bookings.find((item) => item.id === payment.bookingId);
    if (booking) touchBooking(booking, "cancelled");
    notify({
      userId: payment.parentId,
      title: "Refund issued",
      body: `$${payment.amount.toFixed(2)} has been refunded to your card.`,
      type: "payment",
      href: "/parent/payments",
    });
    return HttpResponse.json(payment);
  }),

  http.get(`${api}/payouts`, async ({ request }) => {
    await simulateLatency();
    const actor = getActor(request);
    if (actor.role === "admin") return HttpResponse.json(db.payouts);
    const sitter = currentSitter(actor);
    return HttpResponse.json(
      db.payouts.filter((payout) => (sitter ? payout.sitterId === sitter.id : false)),
    );
  }),

  // ---------------------------------------------------------------- reviews
  http.get(`${api}/reviews`, async ({ request }) => {
    await simulateLatency();
    const actor = getActor(request);
    const url = new URL(request.url);
    const requestedSitter = url.searchParams.get("sitterId");
    const sitter = currentSitter(actor);
    const sitterId = requestedSitter ?? (actor.role === "sitter" ? sitter?.id : undefined);
    const reviews = db.reviews
      .filter((review) => (sitterId ? review.sitterId === sitterId : true))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return HttpResponse.json(reviews);
  }),

  http.post(`${api}/reviews`, async ({ request }) => {
    await simulateLatency();
    const actor = getActor(request);
    const body = await readBody<{ bookingId: string; rating: number; comment: string }>(request);
    if (!body?.bookingId) return respondError("Booking is required");
    const booking = db.bookings.find((item) => item.id === body.bookingId);
    if (!booking) return respondError("Booking not found", 404);
    if (booking.parentId !== actor.id) return respondError("You can only review your own bookings", 403);
    if (booking.status !== "completed") return respondError("You can review completed bookings only");
    if (booking.hasReview) return respondError("You've already reviewed this booking");
    if (!body.rating || body.rating < 1 || body.rating > 5) return respondError("Choose a rating");
    if (!body.comment || body.comment.trim().length < 10) {
      return respondError("Please write at least 10 characters");
    }

    const user = db.users.find((item) => item.id === actor.id);
    const review: Review = {
      id: nextId("rev"),
      bookingId: booking.id,
      sitterId: booking.sitterId,
      parentId: actor.id,
      parentName: user ? `${user.firstName} ${user.lastName}` : booking.parentName,
      parentAvatarUrl: user?.avatarUrl,
      rating: body.rating,
      comment: body.comment.trim(),
      createdAt: nowIso(),
    };
    db.reviews.unshift(review);
    booking.hasReview = true;
    const sitter = findSitter(booking.sitterId);
    if (sitter) {
      const total = sitter.rating * sitter.reviewCount + review.rating;
      sitter.reviewCount += 1;
      sitter.rating = Math.round((total / sitter.reviewCount) * 10) / 10;
    }
    notify({
      userId: booking.sitterUserId,
      title: "New review received",
      body: `${review.parentName} left you ${review.rating} stars.`,
      type: "system",
      href: "/sitter/reviews",
    });
    return HttpResponse.json(review, { status: 201 });
  }),

  http.post(`${api}/reviews/:id/response`, async ({ request, params }) => {
    await simulateLatency();
    const actor = getActor(request);
    const review = db.reviews.find((item) => item.id === params.id);
    if (!review) return respondError("Review not found", 404);
    const sitter = currentSitter(actor);
    if (!sitter || sitter.id !== review.sitterId) {
      return respondError("You can only respond to your own reviews", 403);
    }
    const body = await readBody<{ response: string }>(request);
    if (!body?.response?.trim() || body.response.trim().length < 10) {
      return respondError("Write at least 10 characters");
    }
    if (review.response) return respondError("You've already responded to this review");
    review.response = body.response.trim();
    notify({
      userId: review.parentId,
      title: "Sitter replied to your review",
      body: review.response.slice(0, 120),
      type: "system",
      href: "/parent/bookings",
    });
    return HttpResponse.json(review);
  }),

  // ---------------------------------------------------------------- messaging
  http.get(`${api}/conversations`, async ({ request }) => {
    await simulateLatency();
    const actor = getActor(request);
    return HttpResponse.json(visibleConversations(actor.id));
  }),

  http.get(`${api}/conversations/:id/messages`, async ({ request, params }) => {
    await simulateLatency();
    const actor = getActor(request);
    const conversation = db.conversations.find((item) => item.id === params.id);
    if (!conversation) return respondError("Conversation not found", 404);
    if (!conversation.participantIds.includes(actor.id)) {
      return respondError("You do not have access to this conversation", 403);
    }
    const messages = db.messages
      .filter((message) => message.conversationId === conversation.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return HttpResponse.json(messages);
  }),

  http.post(`${api}/conversations/:id/messages`, async ({ request, params }) => {
    await simulateLatency();
    const actor = getActor(request);
    const conversation = db.conversations.find((item) => item.id === params.id);
    if (!conversation) return respondError("Conversation not found", 404);
    if (!conversation.participantIds.includes(actor.id)) {
      return respondError("You do not have access to this conversation", 403);
    }
    const body = await readBody<{ body: string }>(request);
    if (!body?.body?.trim()) return respondError("Write a message first");

    const user = db.users.find((item) => item.id === actor.id);
    const message: Message = {
      id: nextId("msg"),
      conversationId: conversation.id,
      senderId: actor.id,
      senderName: user ? `${user.firstName} ${user.lastName}` : actor.name,
      senderAvatarUrl: user?.avatarUrl,
      body: body.body.trim(),
      createdAt: nowIso(),
      read: false,
    };
    db.messages.push(message);
    conversation.lastMessage = message.body;
    conversation.lastMessageAt = message.createdAt;
    const recipientId = conversation.participantIds.find((id) => id !== actor.id);
    if (recipientId) {
      notify({
        userId: recipientId,
        title: `New message from ${message.senderName.split(" ")[0]}`,
        body: message.body.slice(0, 120),
        type: "message",
        href: actor.role === "parent" ? "/sitter/messages" : "/parent/messages",
      });
    }
    return HttpResponse.json(message, { status: 201 });
  }),

  http.post(`${api}/conversations/:id/read`, async ({ request, params }) => {
    await simulateLatency();
    const actor = getActor(request);
    const conversation = db.conversations.find((item) => item.id === params.id);
    if (!conversation) return respondError("Conversation not found", 404);
    if (!conversation.participantIds.includes(actor.id)) {
      return respondError("You do not have access to this conversation", 403);
    }
    for (const message of db.messages) {
      if (message.conversationId === conversation.id && message.senderId !== actor.id) {
        message.read = true;
      }
    }
    return HttpResponse.json({ ok: true });
  }),

  // ---------------------------------------------------------------- verification
  http.get(`${api}/verification/documents`, async ({ request }) => {
    await simulateLatency();
    const actor = getActor(request);
    if (actor.role === "admin") return HttpResponse.json(db.documents);
    const sitter = currentSitter(actor);
    if (!sitter) return HttpResponse.json([]);
    return HttpResponse.json(db.documents.filter((document) => document.sitterId === sitter.id));
  }),

  http.post(`${api}/verification/documents`, async ({ request }) => {
    await simulateLatency();
    const actor = getActor(request);
    const sitter = currentSitter(actor);
    if (!sitter) return respondError("Sitter profile not found", 404);
    const body = await readBody<{
      type: VerificationDocument["type"];
      fileName: string;
    }>(request);
    if (!body?.type || !body.fileName) return respondError("Choose a document to upload");

    const document: VerificationDocument = {
      id: nextId("vd"),
      sitterId: sitter.id,
      sitterName: sitter.displayName,
      type: body.type,
      fileName: body.fileName,
      fileUrl: "/documents/sample-document.svg",
      status: "pending",
      uploadedAt: nowIso(),
    };
    db.documents.unshift(document);
    if (sitter.verificationStatus !== "verified") {
      sitter.verificationStatus = "pending";
    }
    notify({
      userId: "usr_admin_1",
      title: "New verification document",
      body: `${sitter.displayName} uploaded ${body.fileName}.`,
      type: "verification",
      href: "/admin/verification",
    });
    return HttpResponse.json(document, { status: 201 });
  }),

  http.get(`${api}/admin/verification`, async ({ request }) => {
    await simulateLatency();
    const actor = getActor(request);
    if (actor.role !== "admin") return respondError("Admins only", 403);
    const documents = db.documents
      .filter((document) => document.status === "pending")
      .sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());
    return HttpResponse.json(documents);
  }),

  http.post(`${api}/admin/verification/:id/review`, async ({ request, params }) => {
    await simulateLatency();
    const actor = getActor(request);
    if (actor.role !== "admin") return respondError("Admins only", 403);
    const document = db.documents.find((item) => item.id === params.id);
    if (!document) return respondError("Document not found", 404);
    const body = await readBody<{ status: "approved" | "rejected"; reason?: string }>(request);
    if (!body?.status) return respondError("Choose approve or reject");
    document.status = body.status;
    document.reviewedAt = nowIso();
    document.reviewerId = actor.id;
    if (body.status === "rejected") document.rejectionReason = body.reason || "Document needs to be re-uploaded";
    const sitter = findSitter(document.sitterId);
    if (sitter) {
      recomputeVerification(sitter);
      notify({
        userId: sitter.userId,
        title: body.status === "approved" ? "Document approved" : "Document needs attention",
        body:
          body.status === "approved"
            ? `${document.fileName} has been approved.`
            : `${document.fileName}: ${document.rejectionReason}`,
        type: "verification",
        href: "/sitter/verification",
      });
    }
    return HttpResponse.json(document);
  }),

  // ---------------------------------------------------------------- disputes
  http.get(`${api}/disputes`, async ({ request }) => {
    await simulateLatency();
    const actor = getActor(request);
    const disputes = db.disputes.filter(
      (dispute) => actor.role === "admin" || dispute.raisedById === actor.id,
    );
    return HttpResponse.json(
      disputes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    );
  }),

  http.post(`${api}/disputes`, async ({ request }) => {
    await simulateLatency();
    const actor = getActor(request);
    const body = await readBody<{ bookingId: string; reason: string; description: string }>(request);
    if (!body?.bookingId || !body.reason || !body.description) {
      return respondError("Complete the dispute form");
    }
    const booking = db.bookings.find((item) => item.id === body.bookingId);
    if (!booking) return respondError("Booking not found", 404);
    if (booking.parentId !== actor.id && booking.sitterUserId !== actor.id) {
      return respondError("You can only dispute your own bookings", 403);
    }
    const dispute: Dispute = {
      id: nextId("dsp"),
      bookingId: booking.id,
      raisedById: actor.id,
      raisedByName: actor.name,
      againstName: actor.id === booking.parentId ? booking.sitterName : booking.parentName,
      reason: body.reason,
      description: body.description,
      status: "open",
      createdAt: nowIso(),
      updatedAt: nowIso(),
      amount: booking.total,
    };
    db.disputes.unshift(dispute);
    notify({
      userId: "usr_admin_1",
      title: "New dispute opened",
      body: `${actor.name} opened a dispute about ${booking.id}.`,
      type: "system",
      href: "/admin/disputes",
    });
    return HttpResponse.json(dispute, { status: 201 });
  }),

  http.post(`${api}/admin/disputes/:id/resolve`, async ({ request, params }) => {
    await simulateLatency();
    const actor = getActor(request);
    if (actor.role !== "admin") return respondError("Admins only", 403);
    const dispute = db.disputes.find((item) => item.id === params.id);
    if (!dispute) return respondError("Dispute not found", 404);
    const body = await readBody<{ status: Dispute["status"]; resolution: string }>(request);
    if (!body?.resolution) return respondError("Add a resolution note");
    dispute.status = body.status;
    dispute.resolution = body.resolution;
    dispute.updatedAt = nowIso();
    notify({
      userId: dispute.raisedById,
      title: "Dispute updated",
      body: body.resolution,
      type: "system",
      href: "/parent/payments",
    });
    return HttpResponse.json(dispute);
  }),

  // ---------------------------------------------------------------- notifications
  http.get(`${api}/notifications`, async ({ request }) => {
    await simulateLatency();
    const actor = getActor(request);
    const notifications = db.notifications
      .filter((notification) => notification.userId === actor.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return HttpResponse.json(notifications);
  }),

  http.post(`${api}/notifications/read-all`, async ({ request }) => {
    await simulateLatency();
    const actor = getActor(request);
    for (const notification of db.notifications) {
      if (notification.userId === actor.id) notification.read = true;
    }
    return HttpResponse.json({ ok: true });
  }),

  http.post(`${api}/notifications/:id/read`, async ({ request, params }) => {
    await simulateLatency();
    const actor = getActor(request);
    const notification = db.notifications.find(
      (item) => item.id === params.id && item.userId === actor.id,
    );
    if (!notification) return respondError("Notification not found", 404);
    notification.read = true;
    return HttpResponse.json(notification);
  }),

  // ---------------------------------------------------------------- sitter
  http.get(`${api}/sitter/summary`, async ({ request }) => {
    await simulateLatency();
    const actor = getActor(request);
    const sitter = currentSitter(actor);
    if (!sitter) return respondError("Sitter profile not found", 404);
    const bookings = db.bookings.filter((booking) => booking.sitterId === sitter.id);
    const pendingRequests = bookings
      .filter((booking) => booking.status === "pending")
      .sort((a, b) => a.date.localeCompare(b.date));
    const upcoming = bookings
      .filter((booking) => booking.date >= today() && ["accepted", "paid"].includes(booking.status))
      .sort((a, b) => a.date.localeCompare(b.date));
    const payments = db.payments.filter(
      (payment) => payment.sitterId === sitter.id && payment.status === "paid",
    );
    const currentMonth = new Date().getMonth();
    const earningsThisMonth = payments
      .filter((payment) => new Date(payment.createdAt).getMonth() === currentMonth)
      .reduce((sum, payment) => sum + payment.sitterEarnings, 0);
    const pendingPayout = db.payouts
      .filter((payout) => payout.sitterId === sitter.id && payout.status !== "paid")
      .reduce((sum, payout) => sum + payout.amount, 0);

    const summary: SitterSummary = {
      earningsThisMonth: Math.round(earningsThisMonth * 100) / 100,
      pendingPayout,
      completedBookings: sitter.completedBookings,
      rating: sitter.rating,
      reviewCount: sitter.reviewCount,
      pendingRequests,
      upcoming,
      weeklyEarnings: [
        { day: "Mon", amount: 120 },
        { day: "Tue", amount: 96 },
        { day: "Wed", amount: 88 },
        { day: "Thu", amount: 44 },
        { day: "Fri", amount: 176 },
        { day: "Sat", amount: 132 },
        { day: "Sun", amount: 0 },
      ],
      profileViews: 128,
    };
    return HttpResponse.json(summary);
  }),

  http.get(`${api}/sitter/profile`, async ({ request }) => {
    await simulateLatency();
    const actor = getActor(request);
    const sitter = currentSitter(actor);
    if (!sitter) return respondError("Sitter profile not found", 404);
    return HttpResponse.json(sitter);
  }),

  http.patch(`${api}/sitter/profile`, async ({ request }) => {
    await simulateLatency();
    const actor = getActor(request);
    const sitter = currentSitter(actor);
    if (!sitter) return respondError("Sitter profile not found", 404);
    const body = await readBody<Partial<SitterProfile>>(request);
    if (!body) return respondError("Invalid payload");
    const { id: _id, userId: _userId, verified: _verified, ...updates } = body;
    Object.assign(sitter, updates);
    return HttpResponse.json(sitter);
  }),

  // ---------------------------------------------------------------- admin
  http.get(`${api}/admin/overview`, async ({ request }) => {
    await simulateLatency();
    const actor = getActor(request);
    if (actor.role !== "admin") return respondError("Admins only", 403);
    const paidPayments = db.payments.filter((payment) => payment.status === "paid");
    const overview: AdminOverview = {
      totalUsers: db.users.length,
      totalParents: db.users.filter((user) => user.role === "parent").length,
      totalSitters: db.users.filter((user) => user.role === "sitter").length,
      activeBookings: db.bookings.filter((booking) =>
        ["pending", "accepted", "paid"].includes(booking.status),
      ).length,
      gmv: Math.round(paidPayments.reduce((sum, payment) => sum + payment.amount, 0) * 100) / 100,
      revenue:
        Math.round(paidPayments.reduce((sum, payment) => sum + payment.platformFee, 0) * 100) / 100,
      commissionRate: db.settings.commissionRate,
      verificationPending: db.documents.filter((document) => document.status === "pending").length,
      openDisputes: db.disputes.filter((dispute) => dispute.status !== "resolved").length,
      monthly: MONTHLY_SERIES,
      recentBookings: [...db.bookings]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    };
    return HttpResponse.json(overview);
  }),

  http.get(`${api}/admin/users`, async ({ request }) => {
    await simulateLatency();
    const actor = getActor(request);
    if (actor.role !== "admin") return respondError("Admins only", 403);
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") ?? "").toLowerCase();
    const role = url.searchParams.get("role") ?? "";
    const status = url.searchParams.get("status") ?? "";
    const page = parseNumber(url.searchParams.get("page"), 1);
    const pageSize = parseNumber(url.searchParams.get("pageSize"), 50);

    let users = db.users.filter((user) => {
      if (q && !`${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(q)) {
        return false;
      }
      if (role && user.role !== role) return false;
      if (status && user.status !== status) return false;
      return true;
    });
    users = users.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return HttpResponse.json(paginate(users, page, pageSize));
  }),

  http.patch(`${api}/admin/users/:id/status`, async ({ request, params }) => {
    await simulateLatency();
    const actor = getActor(request);
    if (actor.role !== "admin") return respondError("Admins only", 403);
    const user = db.users.find((item) => item.id === params.id);
    if (!user) return respondError("User not found", 404);
    const body = await readBody<{ status: User["status"] }>(request);
    if (!body?.status) return respondError("Status is required");
    if (user.id === actor.id && body.status === "suspended") {
      return respondError("You cannot suspend your own account");
    }
    user.status = body.status;
    return HttpResponse.json(user);
  }),

  http.get(`${api}/admin/bookings`, async ({ request }) => {
    await simulateLatency();
    const actor = getActor(request);
    if (actor.role !== "admin") return respondError("Admins only", 403);
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") ?? "").toLowerCase();
    const status = url.searchParams.get("status") ?? "";
    const page = parseNumber(url.searchParams.get("page"), 1);
    const pageSize = parseNumber(url.searchParams.get("pageSize"), 50);
    let bookings = db.bookings.filter((booking) => {
      if (q && !`${booking.id} ${booking.parentName} ${booking.sitterName}`.toLowerCase().includes(q)) {
        return false;
      }
      if (status && booking.status !== status) return false;
      return true;
    });
    bookings = bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return HttpResponse.json(paginate(bookings, page, pageSize));
  }),

  http.get(`${api}/admin/payments`, async ({ request }) => {
    await simulateLatency();
    const actor = getActor(request);
    if (actor.role !== "admin") return respondError("Admins only", 403);
    const url = new URL(request.url);
    const status = url.searchParams.get("status") ?? "";
    const q = (url.searchParams.get("q") ?? "").toLowerCase();
    const page = parseNumber(url.searchParams.get("page"), 1);
    const pageSize = parseNumber(url.searchParams.get("pageSize"), 50);
    let payments = db.payments.filter((payment) => {
      if (status && payment.status !== status) return false;
      if (q && !`${payment.id} ${payment.parentName} ${payment.sitterName}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
    payments = payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return HttpResponse.json(paginate(payments, page, pageSize));
  }),

  http.get(`${api}/admin/reports`, async ({ request }) => {
    await simulateLatency();
    const actor = getActor(request);
    if (actor.role !== "admin") return respondError("Admins only", 403);
    const cities = Array.from(new Set(db.sitters.map((sitter) => sitter.city)));
    const reports: AdminReportRow[] = cities.map((city) => {
      const sitterIds = db.sitters.filter((sitter) => sitter.city === city).map((sitter) => sitter.id);
      const bookings = db.bookings.filter((booking) => sitterIds.includes(booking.sitterId));
      const payments = db.payments.filter(
        (payment) => sitterIds.includes(payment.sitterId) && payment.status === "paid",
      );
      return {
        label: city,
        bookings: bookings.length,
        revenue: Math.round(payments.reduce((sum, payment) => sum + payment.amount, 0) * 100) / 100,
        commission: Math.round(payments.reduce((sum, payment) => sum + payment.platformFee, 0) * 100) / 100,
        cancellations: bookings.filter((booking) => booking.status === "cancelled").length,
      };
    });
    return HttpResponse.json(
      reports.sort((a, b) => b.revenue - a.revenue),
    );
  }),

  http.get(`${api}/admin/settings`, async ({ request }) => {
    await simulateLatency();
    const actor = getActor(request);
    if (actor.role !== "admin") return respondError("Admins only", 403);
    return HttpResponse.json(db.settings);
  }),

  http.put(`${api}/admin/settings`, async ({ request }) => {
    await simulateLatency();
    const actor = getActor(request);
    if (actor.role !== "admin") return respondError("Admins only", 403);
    const body = await readBody<Partial<typeof db.settings>>(request);
    if (!body) return respondError("Invalid settings payload");
    if (body.commissionRate !== undefined && (body.commissionRate < 0 || body.commissionRate > 0.5)) {
      return respondError("Commission must be between 0% and 50%");
    }
    Object.assign(db.settings, body);
    return HttpResponse.json(db.settings);
  }),

  http.get(`${api}/admin/disputes`, async ({ request }) => {
    await simulateLatency();
    const actor = getActor(request);
    if (actor.role !== "admin") return respondError("Admins only", 403);
    return HttpResponse.json(
      [...db.disputes].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    );
  }),

  http.get(`${api}/notifications/unread-count`, async ({ request }) => {
    await simulateLatency();
    const actor = getActor(request);
    const count = db.notifications.filter(
      (notification) => notification.userId === actor.id && !notification.read,
    ).length;
    return HttpResponse.json({ count });
  }),

  http.get(`${api}/health`, () => HttpResponse.json({ ok: true, mode: "mocks" })),
];

export type MockNotification = Notification;
export type MockPayment = Payment;

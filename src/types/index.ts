export type Role = "parent" | "sitter" | "admin";

export type UserStatus = "active" | "suspended" | "pending";

export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatarUrl?: string;
}

export interface User extends SessionUser {
  phone?: string;
  location?: string;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
  lastActiveAt: string;
}

export interface ParentProfile {
  id: string;
  userId: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  bio?: string;
}

export interface Child {
  id: string;
  parentId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  allergies: string[];
  specialNeeds?: string;
  notes?: string;
  avatarColor: string;
}

export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export interface SitterProfile {
  id: string;
  userId: string;
  displayName: string;
  headline: string;
  bio: string;
  city: string;
  state: string;
  hourlyRate: number;
  currency: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  completedBookings: number;
  responseTimeHours: number;
  verified: boolean;
  verificationStatus: VerificationStatus;
  languages: string[];
  skills: string[];
  certifications?: string[];
  dateOfBirth?: string;
  photoUrl: string;
  coverGradient: string;
  joinedAt: string;
}

export interface Availability {
  id: string;
  sitterId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export type VerificationDocumentType = "government_id" | "certificate" | "background_check";

export type VerificationDocumentStatus = "pending" | "approved" | "rejected";

export interface VerificationDocument {
  id: string;
  sitterId: string;
  sitterName: string;
  type: VerificationDocumentType;
  fileName: string;
  fileUrl?: string;
  status: VerificationDocumentStatus;
  uploadedAt: string;
  reviewedAt?: string;
  reviewerId?: string;
  rejectionReason?: string;
}

export type BookingStatus = "pending" | "accepted" | "paid" | "completed" | "cancelled";

export interface Booking {
  id: string;
  parentId: string;
  parentName: string;
  parentAvatarUrl?: string;
  sitterId: string;
  sitterUserId: string;
  sitterName: string;
  childIds: string[];
  childNames: string[];
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  notes?: string;
  status: BookingStatus;
  hourlyRate: number;
  subtotal: number;
  serviceFee: number;
  total: number;
  address: string;
  createdAt: string;
  updatedAt: string;
  paymentId?: string;
  cancellationReason?: string;
  hasReview?: boolean;
}

export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";

export interface Payment {
  id: string;
  bookingId: string;
  parentId: string;
  parentName: string;
  sitterId: string;
  sitterName: string;
  amount: number;
  platformFee: number;
  sitterEarnings: number;
  commissionRate: number;
  status: PaymentStatus;
  method: "card" | "bank_transfer" | "wallet";
  last4?: string;
  createdAt: string;
  refundedAt?: string;
}

export type PayoutStatus = "pending" | "processing" | "paid";

export interface Payout {
  id: string;
  sitterId: string;
  amount: number;
  status: PayoutStatus;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  method: "bank_transfer";
  last4: string;
}

export interface Review {
  id: string;
  bookingId: string;
  sitterId: string;
  parentId: string;
  parentName: string;
  parentAvatarUrl?: string;
  rating: number;
  comment: string;
  createdAt: string;
  response?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl?: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  bookingId: string;
  participantIds: string[];
  participantNames: string[];
  participantAvatars: string[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  otherPartyName: string;
  otherPartyAvatar?: string;
}

export type DisputeStatus = "open" | "under_review" | "resolved" | "rejected";

export interface Dispute {
  id: string;
  bookingId: string;
  raisedById: string;
  raisedByName: string;
  againstName: string;
  reason: string;
  description: string;
  status: DisputeStatus;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
  amount: number;
}

export type NotificationType = "booking" | "message" | "payment" | "verification" | "system";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  href?: string;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface SitterSearchParams {
  q?: string;
  city?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  minRate?: number;
  maxRate?: number;
  minExperience?: number;
  minRating?: number;
  language?: string;
  sort?: "recommended" | "rating" | "price_asc" | "price_desc" | "experience";
  page?: number;
  pageSize?: number;
}

export interface SitterWithAvailability extends SitterProfile {
  nextAvailable?: string;
}

export interface ParentSummary {
  upcoming: Booking[];
  activeChildren: number;
  unreadMessages: number;
  totalSpent: number;
  recommendedSitters: SitterProfile[];
}

export interface SitterSummary {
  earningsThisMonth: number;
  pendingPayout: number;
  completedBookings: number;
  rating: number;
  reviewCount: number;
  pendingRequests: Booking[];
  upcoming: Booking[];
  weeklyEarnings: { day: string; amount: number }[];
  profileViews: number;
}

export interface AdminOverview {
  totalUsers: number;
  totalParents: number;
  totalSitters: number;
  activeBookings: number;
  gmv: number;
  revenue: number;
  commissionRate: number;
  verificationPending: number;
  openDisputes: number;
  monthly: { month: string; revenue: number; bookings: number }[];
  recentBookings: Booking[];
}

export interface AdminSettings {
  commissionRate: number;
  serviceFeeRate: number;
  currency: string;
  payoutSchedule: "weekly" | "biweekly" | "monthly";
  supportEmail: string;
}

export interface AdminReportRow {
  label: string;
  bookings: number;
  revenue: number;
  commission: number;
  cancellations: number;
}

export interface ApiErrorBody {
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthCredentials {
  firstName: string;
  lastName: string;
  role: Exclude<Role, "admin">;
  phone?: string;
}

export interface CreateBookingPayload {
  sitterId: string;
  date: string;
  startTime: string;
  endTime: string;
  childIds: string[];
  notes?: string;
  address: string;
}

export interface CreatePaymentPayload {
  bookingId: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
  nameOnCard: string;
}

export interface UpdateAvailabilityPayload {
  availability: Array<Pick<Availability, "dayOfWeek" | "startTime" | "endTime" | "isAvailable">>;
}

import { Badge } from "@/components/ui/badge";
import {
  BOOKING_STATUS_LABELS,
  DISPUTE_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  VERIFICATION_STATUS_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type {
  BookingStatus,
  DisputeStatus,
  PaymentStatus,
  VerificationDocumentStatus,
  VerificationStatus,
} from "@/types";

const bookingStyles: Record<BookingStatus, string> = {
  pending: "border-amber-300/60 bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200",
  accepted: "border-sky-300/60 bg-sky-100 text-sky-900 dark:bg-sky-500/15 dark:text-sky-200",
  paid: "border-emerald-300/60 bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200",
  completed: "border-primary/25 bg-primary/10 text-primary",
  cancelled: "border-rose-300/60 bg-rose-100 text-rose-900 dark:bg-rose-500/15 dark:text-rose-200",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge variant="outline" className={cn("capitalize", bookingStyles[status])}>
      {BOOKING_STATUS_LABELS[status]}
    </Badge>
  );
}

const paymentStyles: Record<PaymentStatus, string> = {
  pending: "border-amber-300/60 bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200",
  paid: "border-emerald-300/60 bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200",
  refunded: "border-slate-300/60 bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-200",
  failed: "border-rose-300/60 bg-rose-100 text-rose-900 dark:bg-rose-500/15 dark:text-rose-200",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge variant="outline" className={cn(paymentStyles[status])}>
      {PAYMENT_STATUS_LABELS[status]}
    </Badge>
  );
}

const verificationStyles: Record<VerificationStatus, string> = {
  unverified: "border-border bg-muted text-muted-foreground",
  pending: "border-amber-300/60 bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200",
  verified: "border-emerald-300/60 bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200",
  rejected: "border-rose-300/60 bg-rose-100 text-rose-900 dark:bg-rose-500/15 dark:text-rose-200",
};

export function VerificationStatusBadge({ status }: { status: VerificationStatus }) {
  return (
    <Badge variant="outline" className={cn(verificationStyles[status])}>
      {VERIFICATION_STATUS_LABELS[status]}
    </Badge>
  );
}

export function DocumentStatusBadge({ status }: { status: VerificationDocumentStatus }) {
  const styles: Record<VerificationDocumentStatus, string> = {
    pending: "border-amber-300/60 bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200",
    approved: "border-emerald-300/60 bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200",
    rejected: "border-rose-300/60 bg-rose-100 text-rose-900 dark:bg-rose-500/15 dark:text-rose-200",
  };
  return (
    <Badge variant="outline" className={cn("capitalize", styles[status])}>
      {status}
    </Badge>
  );
}

const disputeStyles: Record<DisputeStatus, string> = {
  open: "border-rose-300/60 bg-rose-100 text-rose-900 dark:bg-rose-500/15 dark:text-rose-200",
  under_review: "border-amber-300/60 bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200",
  resolved: "border-emerald-300/60 bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200",
  rejected: "border-slate-300/60 bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-200",
};

export function DisputeStatusBadge({ status }: { status: DisputeStatus }) {
  return (
    <Badge variant="outline" className={cn(disputeStyles[status])}>
      {DISPUTE_STATUS_LABELS[status]}
    </Badge>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
  ReceiptText,
  Star,
  StickyNote,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { BookingTimeline } from "@/components/bookings/booking-timeline";
import { CancelBookingDialog } from "@/components/bookings/cancel-booking-dialog";
import { DisputeDialog } from "@/components/bookings/dispute-dialog";
import { PaymentDialog } from "@/components/bookings/payment-dialog";
import { ReviewDialog } from "@/components/bookings/review-dialog";
import { BookingStatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageSkeleton } from "@/components/shared/skeletons";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useBooking, useUpdateBookingStatus } from "@/hooks/use-bookings";
import { formatCurrency, formatDate, formatLongDate, formatMoney, formatTimeRange } from "@/lib/format";

export function BookingDetailView({
  bookingId,
  perspective,
}: {
  bookingId: string;
  perspective: "parent" | "sitter";
}) {
  const { data: booking, isPending, isError, refetch } = useBooking(bookingId);
  const updateStatus = useUpdateBookingStatus();
  const [payOpen, setPayOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);

  if (isPending) return <PageSkeleton />;

  if (isError || !booking) {
    return (
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href={perspective === "parent" ? "/parent/bookings" : "/sitter/requests"}>
            <ArrowLeft className="size-4" />
            Back to bookings
          </Link>
        </Button>
        <ErrorState
          title="Booking not found"
          description="This booking may have been removed, or you don't have access to it."
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  const isParent = perspective === "parent";
  const otherName = isParent ? booking.sitterName : booking.parentName;
  const otherAvatar = isParent ? undefined : booking.parentAvatarUrl;
  const otherHref = isParent ? "/parent/messages" : "/sitter/messages";

  const canAccept = !isParent && booking.status === "pending";
  const canComplete = !isParent && booking.status === "paid";
  const canPay = isParent && booking.status === "accepted";
  const canCancel =
    booking.status === "pending" || booking.status === "accepted";
  const canReview = isParent && booking.status === "completed" && !booking.hasReview;
  const canDispute = isParent && (booking.status === "completed" || booking.status === "paid");

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href={perspective === "parent" ? "/parent/bookings" : "/sitter/requests"}>
          <ArrowLeft className="size-4" />
          Back to bookings
        </Link>
      </Button>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Booking with {otherName}
            </h1>
            <BookingStatusBadge status={booking.status} />
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {formatLongDate(booking.date)} · {formatTimeRange(booking.startTime, booking.endTime)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canPay ? (
            <Button onClick={() => setPayOpen(true)} size="lg">
              Pay {formatMoney(booking.total)}
            </Button>
          ) : null}
          {canAccept ? (
            <Button
              size="lg"
              onClick={() =>
                updateStatus.mutate(
                  { id: booking.id, status: "accepted" },
                  { onSuccess: () => toast.success("Booking accepted") },
                )
              }
              disabled={updateStatus.isPending}
            >
              <CheckCircle2 className="size-4" />
              Accept request
            </Button>
          ) : null}
          {canComplete ? (
            <Button size="lg" onClick={() => setCompleteOpen(true)}>
              <CheckCircle2 className="size-4" />
              Mark as completed
            </Button>
          ) : null}
          {canReview ? (
            <Button size="lg" onClick={() => setReviewOpen(true)}>
              <Star className="size-4" />
              Leave a review
            </Button>
          ) : null}
          {canCancel ? (
            <Button size="lg" variant="outline" onClick={() => setCancelOpen(true)}>
              <XCircle className="size-4" />
              Cancel
            </Button>
          ) : null}
        </div>
      </div>

      <BookingTimeline booking={booking} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Care details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="flex gap-3">
                  <CalendarDays className="text-primary mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <div>
                    <dt className="text-xs font-medium">Date</dt>
                    <dd className="text-muted-foreground mt-0.5 text-sm">
                      {formatDate(booking.date, "EEEE, MMMM d, yyyy")}
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Clock className="text-primary mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <div>
                    <dt className="text-xs font-medium">Time</dt>
                    <dd className="text-muted-foreground mt-0.5 text-sm">
                      {formatTimeRange(booking.startTime, booking.endTime)} ({booking.hours} hours)
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Users className="text-primary mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <div>
                    <dt className="text-xs font-medium">Children</dt>
                    <dd className="text-muted-foreground mt-0.5 text-sm">
                      {booking.childNames.join(", ")}
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MapPin className="text-primary mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <div>
                    <dt className="text-xs font-medium">Address</dt>
                    <dd className="text-muted-foreground mt-0.5 text-sm">{booking.address}</dd>
                  </div>
                </div>
              </dl>

              <Separator />

              <div className="flex gap-3">
                <StickyNote className="text-primary mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-xs font-medium">Notes for the sitter</p>
                  <p className="text-muted-foreground mt-0.5 text-sm leading-relaxed">
                    {booking.notes || "No special notes for this booking."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About {otherName.split(" ")[0]}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <UserAvatar src={otherAvatar} name={otherName} className="size-11" />
                  <div>
                    <p className="text-sm font-semibold">{otherName}</p>
                    <p className="text-muted-foreground text-xs">
                      {isParent ? "Your babysitter" : "Parent"} · Member since{" "}
                      {formatDate(booking.createdAt, "MMM yyyy")}
                    </p>
                  </div>
                </div>
                <Button asChild variant="outline">
                  <Link href={otherHref}>
                    <MessageSquare className="size-4" />
                    Message {otherName.split(" ")[0]}
                  </Link>
                </Button>
              </div>
              <p className="text-muted-foreground mt-4 rounded-lg bg-muted/60 p-3 text-xs leading-relaxed">
                {isParent
                  ? "Keep communication in the app so our safety team can help if anything comes up."
                  : "Share arrival updates and care summaries in the app. Parents appreciate the reassurance."}
              </p>
            </CardContent>
          </Card>

          {isParent && canDispute ? (
            <Card>
              <CardHeader>
                <CardTitle>Something went wrong?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Report a safety concern, no-show, or payment issue. Our trust &amp; safety team
                  responds within one business day.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setDisputeOpen(true)}
                >
                  Report an issue
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ReceiptText className="size-4" aria-hidden="true" />
                Payment summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                  {formatCurrency(booking.hourlyRate)} × {booking.hours}h
                </span>
                <span>{formatMoney(booking.subtotal)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Service fee (8%)</span>
                <span>{formatMoney(booking.serviceFee)}</span>
              </div>
              <Separator />
              <div className="flex justify-between gap-3 font-semibold">
                <span>Total</span>
                <span>{formatMoney(booking.total)}</span>
              </div>
              <p className="text-muted-foreground pt-1 text-xs">
                {booking.status === "paid" || booking.status === "completed"
                  ? "Paid securely through BabySitter Connect."
                  : booking.status === "cancelled"
                    ? "No charge applies to cancelled bookings."
                    : "Payment is collected after the sitter accepts."}
              </p>
              {canPay ? (
                <Button className="mt-2 w-full" onClick={() => setPayOpen(true)}>
                  Pay now
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <Card size="sm">
            <CardContent className="space-y-2 text-xs">
              <p className="text-sm font-semibold">Booking reference</p>
              <p className="text-muted-foreground font-mono">{booking.id}</p>
              <p className="text-muted-foreground">
                Requested {formatDate(booking.createdAt, "MMM d, yyyy 'at' h:mm a")}
              </p>
              {booking.paymentId ? (
                <p className="text-muted-foreground">
                  Payment <span className="font-mono">{booking.paymentId}</span>
                </p>
              ) : null}
              {booking.hasReview ? (
                <p className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  Review submitted
                </p>
              ) : null}
            </CardContent>
          </Card>

          {!isParent && booking.status === "pending" ? (
            <EmptyState
              icon={Clock}
              title="Respond within 24 hours"
              description="Fast responses keep your search ranking healthy and help families plan."
              className="py-6"
            />
          ) : null}
        </aside>
      </div>

      <PaymentDialog booking={booking} open={payOpen} onOpenChange={setPayOpen} />
      <ReviewDialog booking={booking} open={reviewOpen} onOpenChange={setReviewOpen} />
      <DisputeDialog booking={booking} open={disputeOpen} onOpenChange={setDisputeOpen} />
      <CancelBookingDialog
        bookingId={booking.id}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        audience={perspective}
      />
      <ConfirmDialog
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        title="Mark this booking as completed?"
        description="Only do this once care is finished. The sitter's earnings will be released on the next payout run."
        confirmLabel="Yes, it's complete"
        onConfirm={() => {
          updateStatus.mutate(
            { id: booking.id, status: "completed" },
            {
              onSuccess: () => {
                toast.success("Booking completed — thanks for confirming");
                setCompleteOpen(false);
              },
            },
          );
        }}
        loading={updateStatus.isPending}
      />
    </div>
  );
}

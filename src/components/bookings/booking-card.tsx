import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { BookingStatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, formatTimeRange } from "@/lib/format";
import type { Booking } from "@/types";

interface BookingCardProps {
  booking: Booking;
  perspective: "parent" | "sitter";
  href?: string;
}

export function BookingCard({ booking, perspective, href }: BookingCardProps) {
  const otherName = perspective === "parent" ? booking.sitterName : booking.parentName;
  const otherAvatar = perspective === "parent" ? undefined : booking.parentAvatarUrl;
  const detailHref = href ?? `/parent/bookings/${booking.id}`;

  return (
    <article className="bg-card rounded-xl p-4 ring-1 ring-foreground/10">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar src={otherAvatar} name={otherName} className="size-10 shrink-0" />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{otherName}</h3>
            <p className="text-muted-foreground text-xs">
              {perspective === "parent" ? "Babysitter" : "Parent"} · {booking.childNames.length}{" "}
              {booking.childNames.length === 1 ? "child" : "children"}
            </p>
          </div>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <dl className="mt-3 grid gap-1.5 text-xs">
        <div className="flex items-center gap-2">
          <dt className="sr-only">Date</dt>
          <CalendarDays className="text-muted-foreground size-3.5 shrink-0" aria-hidden="true" />
          <dd>{formatDate(booking.date, "EEE, MMM d, yyyy")}</dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="sr-only">Time</dt>
          <Clock className="text-muted-foreground size-3.5 shrink-0" aria-hidden="true" />
          <dd>
            {formatTimeRange(booking.startTime, booking.endTime)} · {booking.hours}h
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="sr-only">Children</dt>
          <Users className="text-muted-foreground size-3.5 shrink-0" aria-hidden="true" />
          <dd className="truncate">{booking.childNames.join(", ")}</dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="sr-only">Address</dt>
          <MapPin className="text-muted-foreground size-3.5 shrink-0" aria-hidden="true" />
          <dd className="text-muted-foreground truncate">{booking.address}</dd>
        </div>
      </dl>

      <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3">
        <p className="text-sm font-semibold">{formatCurrency(booking.total)}</p>
        <Button asChild variant="ghost" size="sm">
          <Link href={detailHref}>
            View details
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

"use client";

import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { BookingsList } from "@/components/bookings/bookings-list";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

export function ParentBookingsPageContent() {
  return (
    <div>
      <PageHeader
        eyebrow="Bookings"
        title="Your care calendar"
        description="Track requests, manage payments, and review past visits — all in one place."
        actions={
          <Button asChild>
            <Link href="/parent/bookings/new">
              <CalendarPlus className="size-4" />
              New booking
            </Link>
          </Button>
        }
      />
      <BookingsList perspective="parent" />
    </div>
  );
}

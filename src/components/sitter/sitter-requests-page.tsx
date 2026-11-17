"use client";

import { BookingsList } from "@/components/bookings/bookings-list";
import { PageHeader } from "@/components/shared/page-header";

export function SitterRequestsPageContent() {
  return (
    <div>
      <PageHeader
        eyebrow="Requests & bookings"
        title="Your care calendar"
        description="Respond to new requests quickly — families often book the first sitter who replies."
      />
      <BookingsList perspective="sitter" initialStatus="pending" />
    </div>
  );
}

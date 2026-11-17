import { Suspense } from "react";
import { BookingWizard } from "@/components/bookings/booking-wizard";
import { PageSkeleton } from "@/components/shared/skeletons";

export default function NewBookingPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <BookingWizard />
    </Suspense>
  );
}

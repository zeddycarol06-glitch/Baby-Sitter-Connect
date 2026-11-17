import { BookingDetailView } from "@/components/bookings/booking-detail-view";

export default async function ParentBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BookingDetailView bookingId={id} perspective="parent" />;
}

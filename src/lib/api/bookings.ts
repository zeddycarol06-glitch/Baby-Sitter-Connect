import { request } from "@/lib/api/client";
import type {
  Booking,
  BookingStatus,
  CreateBookingPayload,
  CreatePaymentPayload,
  Paginated,
  ParentSummary,
  Payment,
} from "@/types";

export interface BookingListParams {
  status?: string;
  sort?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export async function getBookings(params?: BookingListParams): Promise<Paginated<Booking>> {
  return request<Paginated<Booking>>({ url: "/bookings", params });
}

export async function getBooking(id: string): Promise<Booking> {
  return request<Booking>({ url: `/bookings/${id}` });
}

export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  return request<Booking>({ url: "/bookings", method: "post", data: payload });
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
  reason?: string,
): Promise<Booking> {
  return request<Booking>({
    url: `/bookings/${id}/status`,
    method: "patch",
    data: { status, reason },
  });
}

export async function payForBooking(
  payload: CreatePaymentPayload,
): Promise<{ payment: Payment; booking: Booking }> {
  return request<{ payment: Payment; booking: Booking }>({
    url: "/payments",
    method: "post",
    data: payload,
  });
}

export async function getParentSummary(): Promise<ParentSummary> {
  return request<ParentSummary>({ url: "/parent/summary" });
}

export async function getParentPayments(): Promise<Payment[]> {
  return request<Payment[]>({ url: "/payments" });
}

export async function refundPayment(id: string): Promise<Payment> {
  return request<Payment>({ url: `/payments/${id}/refund`, method: "post" });
}

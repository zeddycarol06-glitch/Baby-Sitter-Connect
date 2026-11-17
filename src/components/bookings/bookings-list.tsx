"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarPlus, Inbox } from "lucide-react";
import { BookingCard } from "@/components/bookings/booking-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Pagination } from "@/components/shared/pagination";
import { SkeletonList } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBookings } from "@/hooks/use-bookings";
import { BOOKING_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "paid", label: "Paid" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

const PAGE_SIZE = 6;

export function BookingsList({
  perspective,
  initialStatus = "all",
}: {
  perspective: "parent" | "sitter";
  initialStatus?: BookingStatus | "all";
}) {
  const [status, setStatus] = useState<BookingStatus | "all">(initialStatus);
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const { data, isPending, isError, isFetching, refetch } = useBookings({
    status: status === "all" ? undefined : status,
    sort,
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Filter bookings by status">
          {STATUS_FILTERS.map((filter) => {
            const active = status === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setStatus(filter.value);
                  setPage(1);
                }}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">Sort</span>
          <Select
            value={sort}
            onValueChange={(value) => {
              setSort(value as "asc" | "desc");
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-40" aria-label="Sort bookings">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Date: newest first</SelectItem>
              <SelectItem value="asc">Date: soonest first</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div aria-busy={isFetching} aria-live="polite">
        {isPending ? <SkeletonList rows={4} /> : null}

        {isError ? (
          <ErrorState
            title="Bookings didn't load"
            description="We couldn't retrieve your bookings. Please try again."
            onRetry={() => void refetch()}
          />
        ) : null}

        {data && data.data.length === 0 ? (
          <EmptyState
            icon={perspective === "parent" ? CalendarPlus : Inbox}
            title={
              status === "all"
                ? "No bookings yet"
                : `No ${BOOKING_STATUS_LABELS[status as BookingStatus].toLowerCase()} bookings`
            }
            description={
              perspective === "parent"
                ? "When you request a sitter, your bookings will show up here with status updates and receipts."
                : "New booking requests from families will appear here. Keep your availability up to date to get noticed."
            }
            action={
              perspective === "parent" ? (
                <Button asChild>
                  <Link href="/search">Find a sitter</Link>
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <Link href="/sitter/schedule">Update availability</Link>
                </Button>
              )
            }
          />
        ) : null}

        {data && data.data.length > 0 ? (
          <>
            <div className="grid gap-3 xl:grid-cols-2">
              {data.data.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  perspective={perspective}
                  href={
                    perspective === "parent"
                      ? `/parent/bookings/${booking.id}`
                      : `/sitter/requests/${booking.id}`
                  }
                />
              ))}
            </div>
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              totalItems={data.total}
              pageSize={data.pageSize}
              onPageChange={setPage}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}

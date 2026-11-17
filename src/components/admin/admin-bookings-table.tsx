"use client";

import { useRef, useState } from "react";
import { CalendarDays, MapPin, Search, Users } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { SkeletonTable } from "@/components/shared/skeletons";
import { BookingStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminBookings } from "@/hooks/use-admin";
import { BOOKING_STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatMoney, formatTimeRange } from "@/lib/format";
import type { Booking, BookingStatus } from "@/types";

const PAGE_SIZE = 10;

export function AdminBookingsTable() {
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<BookingStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Booking | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bookingsQuery = useAdminBookings({
    q: query || undefined,
    status: status === "all" ? undefined : status,
    page,
    pageSize: PAGE_SIZE,
  });

  function onSearchChange(value: string) {
    setSearchInput(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setQuery(value);
      setPage(1);
    }, 350);
  }

  const result = bookingsQuery.data;

  return (
    <div>
      <PageHeader
        eyebrow="Marketplace"
        title="Bookings"
        description="Every care request across the platform. Search by family, sitter, or booking ID."
        actions={
          result ? (
            <p className="text-muted-foreground text-sm">
              {result.total} {result.total === 1 ? "booking" : "bookings"}
            </p>
          ) : null
        }
      />

      <Card className="mb-4">
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              value={searchInput}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search family, sitter, or booking ID…"
              aria-label="Search bookings"
              className="pl-9"
            />
          </div>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as BookingStatus | "all");
              setPage(1);
            }}
          >
            <SelectTrigger aria-label="Filter by booking status" className="w-44">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {Object.entries(BOOKING_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {bookingsQuery.isPending ? (
        <SkeletonTable rows={8} columns={6} />
      ) : bookingsQuery.isError || !result ? (
        <ErrorState
          title="Bookings didn't load"
          description="The booking ledger is temporarily unavailable."
          onRetry={() => void bookingsQuery.refetch()}
        />
      ) : result.data.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No matching bookings"
          description="Try a different search term, or clear the status filter."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSearchInput("");
                setQuery("");
                setStatus("all");
                setPage(1);
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <div className="border-border overflow-hidden rounded-xl border">
            <Table>
              <caption className="sr-only">All platform bookings</caption>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Family → sitter</TableHead>
                  <TableHead className="hidden md:table-cell">Care date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Children</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.data.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {booking.parentName} <span className="text-muted-foreground">→</span>{" "}
                          {booking.sitterName}
                        </p>
                        <p className="text-muted-foreground font-mono text-[11px]">{booking.id}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-xs whitespace-nowrap md:table-cell">
                      {formatDate(booking.date, "MMM d, yyyy")}
                      <span className="text-muted-foreground block text-[11px]">
                        {formatTimeRange(booking.startTime, booking.endTime)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <BookingStatusBadge status={booking.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden text-xs lg:table-cell">
                      {booking.childNames.join(", ") || "—"}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold whitespace-nowrap">
                      {formatMoney(booking.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelected(booking)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            totalItems={result.total}
            pageSize={result.pageSize}
            onPageChange={setPage}
          />
        </>
      )}

      {selected ? (
        <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Booking {selected.id}</DialogTitle>
              <DialogDescription>
                Created {formatDate(selected.createdAt, "MMMM d, yyyy")} · updated{" "}
                {formatDate(selected.updatedAt, "MMMM d, yyyy")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <BookingStatusBadge status={selected.status} />
                  {selected.hasReview ? (
                    <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-medium">
                      Reviewed
                    </span>
                  ) : null}
                </div>
                <p className="text-lg font-semibold">{formatMoney(selected.total)}</p>
              </div>

              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground text-xs">Family</dt>
                  <dd className="mt-0.5 font-medium">{selected.parentName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Sitter</dt>
                  <dd className="mt-0.5 font-medium">{selected.sitterName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Care date</dt>
                  <dd className="mt-0.5 flex items-center gap-1.5 font-medium">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    {formatDate(selected.date, "MMM d, yyyy")}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Time</dt>
                  <dd className="mt-0.5 font-medium">
                    {formatTimeRange(selected.startTime, selected.endTime)} · {selected.hours}h
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted-foreground text-xs">Children</dt>
                  <dd className="mt-0.5 flex items-center gap-1.5 font-medium">
                    <Users className="size-3.5" aria-hidden="true" />
                    {selected.childNames.join(", ") || "—"}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted-foreground text-xs">Address</dt>
                  <dd className="mt-0.5 flex items-start gap-1.5 font-medium">
                    <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                    {selected.address}
                  </dd>
                </div>
              </dl>

              <dl className="bg-muted/50 grid grid-cols-2 gap-3 rounded-lg p-3 text-xs">
                <div>
                  <dt className="text-muted-foreground">Hourly rate</dt>
                  <dd className="mt-0.5 font-medium">{formatMoney(selected.hourlyRate)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="mt-0.5 font-medium">{formatMoney(selected.subtotal)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Service fee</dt>
                  <dd className="mt-0.5 font-medium">{formatMoney(selected.serviceFee)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Total charged</dt>
                  <dd className="mt-0.5 font-semibold">{formatMoney(selected.total)}</dd>
                </div>
              </dl>

              {selected.notes ? (
                <div>
                  <p className="text-muted-foreground text-xs">Family notes</p>
                  <p className="mt-1 text-sm leading-relaxed">{selected.notes}</p>
                </div>
              ) : null}

              {selected.cancellationReason ? (
                <div>
                  <p className="text-muted-foreground text-xs">Cancellation reason</p>
                  <p className="mt-1 text-sm leading-relaxed">{selected.cancellationReason}</p>
                </div>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}

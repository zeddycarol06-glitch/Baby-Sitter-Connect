"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  DollarSign,
  Scale,
  TrendingUp,
  Users,
} from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/skeletons";
import { StatCard } from "@/components/shared/stat-card";
import { BookingStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminOverview } from "@/hooks/use-admin";
import { formatCurrency, formatDate, formatMoney } from "@/lib/format";
import type { Booking } from "@/types";

export function AdminOverview() {
  const overviewQuery = useAdminOverview();

  if (overviewQuery.isPending) return <PageSkeleton />;

  if (overviewQuery.isError || !overviewQuery.data) {
    return (
      <div>
        <PageHeader title="Platform overview" />
        <ErrorState
          title="Overview didn't load"
          description="Platform metrics are temporarily unavailable."
          onRetry={() => void overviewQuery.refetch()}
        />
      </div>
    );
  }

  const overview = overviewQuery.data;
  const maxRevenue = Math.max(...overview.monthly.map((month) => month.revenue), 1);
  const totalMonthlyBookings = overview.monthly.reduce((sum, month) => sum + month.bookings, 0);

  const recentColumns: DataTableColumn<Booking>[] = [
    {
      key: "booking",
      header: "Booking",
      sortValue: (booking) => booking.createdAt,
      cell: (booking) => (
        <div className="min-w-0">
          <p className="truncate font-medium">
            {booking.parentName} <span className="text-muted-foreground">→</span> {booking.sitterName}
          </p>
          <p className="text-muted-foreground font-mono text-[11px]">{booking.id}</p>
        </div>
      ),
    },
    {
      key: "date",
      header: "Care date",
      sortValue: (booking) => booking.date,
      cell: (booking) => (
        <span className="whitespace-nowrap">{formatDate(booking.date, "MMM d, yyyy")}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (booking) => <BookingStatusBadge status={booking.status} />,
    },
    {
      key: "total",
      header: "Total",
      sortValue: (booking) => booking.total,
      cell: (booking) => <span className="font-semibold">{formatMoney(booking.total)}</span>,
      cellClassName: "text-right",
      headerClassName: "text-right",
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Admin console"
        title="Platform overview"
        description="Marketplace health at a glance — supply, demand, revenue, and the queues that need a human."
        actions={
          <Button asChild>
            <Link href="/admin/verification">
              <BadgeCheck className="size-4" />
              Review queue
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total users"
          value={String(overview.totalUsers)}
          icon={Users}
          hint={`${overview.totalParents} parents · ${overview.totalSitters} sitters`}
        />
        <StatCard
          label="Active bookings"
          value={String(overview.activeBookings)}
          icon={CalendarDays}
          hint="Pending, accepted, or paid"
        />
        <StatCard
          label="Gross booking volume"
          value={formatCurrency(overview.gmv)}
          icon={DollarSign}
          hint="All paid bookings to date"
          trend="up"
        />
        <StatCard
          label="Platform revenue"
          value={formatCurrency(overview.revenue)}
          icon={TrendingUp}
          hint={`${Math.round(overview.commissionRate * 100)}% average commission`}
          trend="up"
        />
      </div>

      {(overview.verificationPending > 0 || overview.openDisputes > 0) && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link
            href="/admin/verification"
            className="group border-amber-300/60 bg-amber-50 dark:bg-amber-500/10 hover:border-amber-400 flex items-center justify-between gap-4 rounded-xl border p-4 transition-colors"
          >
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                <BadgeCheck className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">
                  {overview.verificationPending}{" "}
                  {overview.verificationPending === 1 ? "document" : "documents"} waiting
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Sitters can&apos;t earn their verified badge until these are reviewed.
                </p>
              </div>
            </div>
            <ArrowRight className="text-muted-foreground group-hover:text-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/admin/disputes"
            className="group border-rose-300/60 bg-rose-50 dark:bg-rose-500/10 hover:border-rose-400 flex items-center justify-between gap-4 rounded-xl border p-4 transition-colors"
          >
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                <Scale className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">
                  {overview.openDisputes} open {overview.openDisputes === 1 ? "dispute" : "disputes"}
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Families and sitters are waiting on a resolution.
                </p>
              </div>
            </div>
            <ArrowRight className="text-muted-foreground group-hover:text-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Revenue by month</CardTitle>
              <p className="text-muted-foreground mt-1 text-xs">
                {formatCurrency(overview.monthly.reduce((sum, month) => sum + month.revenue, 0))} over
                the last {overview.monthly.length} months
              </p>
            </div>
            <span className="text-muted-foreground text-xs">
              {totalMonthlyBookings.toLocaleString()} bookings
            </span>
          </CardHeader>
          <CardContent>
            <div
              className="flex h-48 items-end gap-1.5 sm:gap-2"
              role="img"
              aria-label="Monthly platform revenue bar chart"
            >
              {overview.monthly.map((month) => (
                <div key={month.month} className="group flex flex-1 flex-col items-center gap-1">
                  <span className="text-muted-foreground text-[9px] sm:text-[10px]">
                    {month.revenue > 0 ? `$${Math.round(month.revenue / 100) / 10}k` : ""}
                  </span>
                  <div
                    className="bg-primary/75 group-hover:bg-primary w-full rounded-t-md transition-colors"
                    style={{ height: `${Math.max((month.revenue / maxRevenue) * 150, 4)}px` }}
                    title={`${month.month}: ${formatCurrency(month.revenue)} from ${month.bookings} bookings`}
                  />
                  <span className="text-muted-foreground text-[9px] sm:text-[10px]">
                    {month.month.slice(0, 3)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commission snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-end justify-between gap-3">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Blended take rate
                </p>
                <p className="text-2xl font-semibold">
                  {Math.round(overview.commissionRate * 100)}%
                </p>
              </div>
              <div className="bg-muted mt-2 h-2 overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full rounded-full"
                  style={{ width: `${Math.min(overview.commissionRate * 100 * 2, 100)}%` }}
                />
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-4 border-t pt-4 text-sm">
              <div>
                <dt className="text-muted-foreground text-xs">GMV</dt>
                <dd className="mt-0.5 font-semibold">{formatCurrency(overview.gmv)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Revenue</dt>
                <dd className="mt-0.5 font-semibold">{formatCurrency(overview.revenue)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Parents</dt>
                <dd className="mt-0.5 font-semibold">{overview.totalParents}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Sitters</dt>
                <dd className="mt-0.5 font-semibold">{overview.totalSitters}</dd>
              </div>
            </dl>
            <p className="text-muted-foreground border-t pt-3 text-xs leading-relaxed">
              Commission is adjustable in settings. Changes apply to new bookings, not historical
              payments.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent bookings</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/bookings">
              All bookings
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            data={overview.recentBookings}
            columns={recentColumns}
            pageSize={5}
            caption="Most recent bookings on the platform"
            emptyState={
              <EmptyState
                icon={CalendarDays}
                title="No bookings yet"
                description="New marketplace bookings will appear here."
              />
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

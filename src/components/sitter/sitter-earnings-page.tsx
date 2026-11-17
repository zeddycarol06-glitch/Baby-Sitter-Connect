"use client";

import Link from "next/link";
import { Banknote, CalendarCheck, ReceiptText, TrendingUp, Wallet } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { PaymentStatusBadge } from "@/components/shared/status-badge";
import { SkeletonTable } from "@/components/shared/skeletons";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePayouts, useSitterPayments, useSitterSummary } from "@/hooks/use-sitters";
import { formatCurrency, formatDate, formatMoney } from "@/lib/format";
import type { Payment, Payout } from "@/types";

export function SitterEarningsPageContent() {
  const summaryQuery = useSitterSummary();
  const paymentsQuery = useSitterPayments();
  const payoutsQuery = usePayouts();

  const payments = paymentsQuery.data ?? [];
  const payouts = payoutsQuery.data ?? [];
  const lifetime = payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + payment.sitterEarnings, 0);

  const columns: DataTableColumn<Payment>[] = [
    {
      key: "date",
      header: "Date",
      sortValue: (payment) => payment.createdAt,
      cell: (payment) => (
        <span className="whitespace-nowrap">{formatDate(payment.createdAt, "MMM d, yyyy")}</span>
      ),
    },
    {
      key: "parent",
      header: "Family",
      sortValue: (payment) => payment.parentName,
      cell: (payment) => (
        <div>
          <p className="font-medium">{payment.parentName}</p>
          <p className="text-muted-foreground font-mono text-[11px]">{payment.bookingId.slice(-8)}</p>
        </div>
      ),
    },
    {
      key: "gross",
      header: "Booking",
      sortValue: (payment) => payment.amount,
      cell: (payment) => formatMoney(payment.amount),
      cellClassName: "text-right",
      headerClassName: "text-right",
    },
    {
      key: "commission",
      header: "Commission",
      cell: (payment) => (
        <span className="text-muted-foreground">−{formatMoney(payment.platformFee)}</span>
      ),
      cellClassName: "text-right",
      headerClassName: "text-right",
    },
    {
      key: "net",
      header: "Your earnings",
      sortValue: (payment) => payment.sitterEarnings,
      cell: (payment) => (
        <span className="font-semibold">{formatMoney(payment.sitterEarnings)}</span>
      ),
      cellClassName: "text-right",
      headerClassName: "text-right",
    },
    {
      key: "status",
      header: "Status",
      cell: (payment) => <PaymentStatusBadge status={payment.status} />,
      cellClassName: "text-right",
      headerClassName: "text-right",
    },
  ];

  if (summaryQuery.isPending || paymentsQuery.isPending || payoutsQuery.isPending) {
    return (
      <div>
        <PageHeader title="Earnings & payouts" />
        <SkeletonTable rows={6} />
      </div>
    );
  }

  if (summaryQuery.isError || paymentsQuery.isError || payoutsQuery.isError || !summaryQuery.data) {
    return (
      <div>
        <PageHeader title="Earnings & payouts" />
        <ErrorState
          title="Earnings didn't load"
          description="We couldn't retrieve your payment history."
          onRetry={() => {
            void summaryQuery.refetch();
            void paymentsQuery.refetch();
            void payoutsQuery.refetch();
          }}
        />
      </div>
    );
  }

  const summary = summaryQuery.data;

  return (
    <div>
      <PageHeader
        eyebrow="Earnings"
        title="Earnings & payouts"
        description="Clear totals, honest fees, and a predictable payout schedule."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="This month"
          value={formatCurrency(summary.earningsThisMonth)}
          icon={TrendingUp}
          hint="After 15% platform commission"
          trend="up"
        />
        <StatCard
          label="Pending payout"
          value={formatCurrency(summary.pendingPayout)}
          icon={Wallet}
          hint="Scheduled for the next run"
        />
        <StatCard
          label="Lifetime earnings"
          value={formatCurrency(lifetime)}
          icon={Banknote}
          hint="Paid bookings only"
        />
        <StatCard
          label="Completed bookings"
          value={String(summary.completedBookings)}
          icon={CalendarCheck}
          hint={`${summary.reviewCount} reviews received`}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ReceiptText className="size-4" aria-hidden="true" />
              Payment history
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={payments}
              columns={columns}
              emptyState={
                <EmptyState
                  icon={ReceiptText}
                  title="No earnings yet"
                  description="Once a paid booking is completed, your earnings will show here."
                  action={
                    <Button asChild variant="outline">
                      <Link href="/sitter/requests">View requests</Link>
                    </Button>
                  }
                />
              }
              caption="Earnings by booking"
            />
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              {payouts.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Your first payout will appear after a completed booking.
                </p>
              ) : (
                <ul className="space-y-3">
                  {payouts.map((payout) => (
                    <li key={payout.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{formatMoney(payout.amount)}</p>
                        <PayoutStatusBadge payout={payout} />
                      </div>
                      <p className="text-muted-foreground mt-1 text-[11px]">
                        {formatDate(payout.periodStart, "MMM d")} –{" "}
                        {formatDate(payout.periodEnd, "MMM d, yyyy")}
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        Bank transfer •••• {payout.last4}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card size="sm">
            <CardContent>
              <p className="text-sm font-semibold">How payout works</p>
              <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                Earnings are released weekly after care is completed. The 15% commission covers
                payment processing, support, and insurance.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function PayoutStatusBadge({ payout }: { payout: Payout }) {
  const styles: Record<Payout["status"], string> = {
    pending: "border-amber-300/60 bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200",
    processing: "border-sky-300/60 bg-sky-100 text-sky-900 dark:bg-sky-500/15 dark:text-sky-200",
    paid: "border-emerald-300/60 bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200",
  };
  return (
    <Badge variant="outline" className={`capitalize ${styles[payout.status]}`}>
      {payout.status}
    </Badge>
  );
}

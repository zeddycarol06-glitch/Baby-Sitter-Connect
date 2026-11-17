"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CreditCard, ReceiptText, RotateCcw, Wallet } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { PaymentStatusBadge } from "@/components/shared/status-badge";
import { SkeletonTable } from "@/components/shared/skeletons";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParentPayments } from "@/hooks/use-bookings";
import { formatDate, formatMoney } from "@/lib/format";
import type { Payment } from "@/types";

export function ParentPaymentsPageContent() {
  const { data, isPending, isError, refetch } = useParentPayments();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const payments = useMemo(() => data ?? [], [data]);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return payments.filter((payment) => {
      const matchesTerm =
        !term ||
        payment.sitterName.toLowerCase().includes(term) ||
        payment.bookingId.toLowerCase().includes(term) ||
        payment.id.toLowerCase().includes(term);
      const matchesStatus = status === "all" || payment.status === status;
      return matchesTerm && matchesStatus;
    });
  }, [payments, query, status]);

  const totalPaid = payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const pending = payments
    .filter((payment) => payment.status === "pending")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const refunded = payments
    .filter((payment) => payment.status === "refunded")
    .reduce((sum, payment) => sum + payment.amount, 0);

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
      key: "sitter",
      header: "Sitter",
      sortValue: (payment) => payment.sitterName,
      cell: (payment) => (
        <div>
          <p className="font-medium">{payment.sitterName}</p>
          <p className="text-muted-foreground font-mono text-[11px]">
            {payment.bookingId.slice(-8)}
          </p>
        </div>
      ),
    },
    {
      key: "method",
      header: "Method",
      cell: (payment) => (
        <span className="text-muted-foreground text-xs">
          {payment.method === "card"
            ? `Card •••• ${payment.last4 ?? "4242"}`
            : payment.method === "bank_transfer"
              ? "Bank transfer"
              : "Wallet"}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Total",
      sortValue: (payment) => payment.amount,
      cell: (payment) => <span className="font-medium">{formatMoney(payment.amount)}</span>,
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

  if (isPending) {
    return (
      <div>
        <PageHeader title="Payments & receipts" />
        <SkeletonTable rows={6} />
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <PageHeader title="Payments & receipts" />
        <ErrorState
          title="Payments didn't load"
          description="We couldn't retrieve your payment history."
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Payments"
        title="Payments & receipts"
        description="Every charge, refund, and receipt for your family's care."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total paid" value={formatMoney(totalPaid)} icon={CreditCard} hint="Across paid bookings" />
        <StatCard label="Pending" value={formatMoney(pending)} icon={Wallet} hint="Awaiting completion" />
        <StatCard label="Refunded" value={formatMoney(refunded)} icon={RotateCcw} hint="Returned to your card" />
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by sitter, booking, or payment ID"
          className="h-9 sm:max-w-sm"
          aria-label="Search payments"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-9 w-40" aria-label="Filter by payment status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4">
        <DataTable
          data={filtered}
          columns={columns}
          emptyState={
            <EmptyState
              icon={ReceiptText}
              title={payments.length === 0 ? "No payments yet" : "No matching payments"}
              description={
                payments.length === 0
                  ? "Once you pay for a booking, receipts and payment details appear here."
                  : "Try a different search term or status filter."
              }
              action={
                payments.length === 0 ? (
                  <Button asChild>
                    <Link href="/search">Find a sitter</Link>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuery("");
                      setStatus("all");
                    }}
                  >
                    Clear filters
                  </Button>
                )
              }
            />
          }
          caption="Payment history"
        />
      </div>

      <p className="text-muted-foreground mt-4 text-xs leading-relaxed">
        Refunds follow our cancellation policy and are returned to the original payment method within
        5–10 business days. Questions? Contact{" "}
        <a href="mailto:hello@babysitterconnect.com" className="text-primary underline">
          support
        </a>
        .
      </p>
    </div>
  );
}

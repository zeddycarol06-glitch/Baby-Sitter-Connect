"use client";

import { useRef, useState } from "react";
import { CreditCard, RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { SkeletonTable } from "@/components/shared/skeletons";
import { PaymentStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useAdminPayments } from "@/hooks/use-admin";
import { useRefundPayment } from "@/hooks/use-bookings";
import { getErrorMessage } from "@/lib/api/client";
import { PAYMENT_STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatMoney } from "@/lib/format";
import type { Payment, PaymentStatus } from "@/types";

const PAGE_SIZE = 10;

export function AdminPaymentsTable() {
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<PaymentStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [refunding, setRefunding] = useState<Payment | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refundPayment = useRefundPayment();

  const paymentsQuery = useAdminPayments({
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

  const result = paymentsQuery.data;

  return (
    <div>
      <PageHeader
        eyebrow="Money"
        title="Payments & refunds"
        description="Every charge on the platform. Issue a refund only after the dispute process or a verified service failure."
        actions={
          result ? (
            <p className="text-muted-foreground text-sm">
              {result.total} {result.total === 1 ? "payment" : "payments"}
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
              placeholder="Search payment, family, or sitter…"
              aria-label="Search payments"
              className="pl-9"
            />
          </div>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as PaymentStatus | "all");
              setPage(1);
            }}
          >
            <SelectTrigger aria-label="Filter by payment status" className="w-40">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {paymentsQuery.isPending ? (
        <SkeletonTable rows={8} columns={6} />
      ) : paymentsQuery.isError || !result ? (
        <ErrorState
          title="Payments didn't load"
          description="The payment ledger is temporarily unavailable."
          onRetry={() => void paymentsQuery.refetch()}
        />
      ) : result.data.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No matching payments"
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
              <caption className="sr-only">All platform payments</caption>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Payment</TableHead>
                  <TableHead className="hidden md:table-cell">Family</TableHead>
                  <TableHead className="hidden lg:table-cell">Sitter</TableHead>
                  <TableHead className="text-right">Charged</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.data.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="min-w-0">
                        <p className="font-mono text-xs">{payment.id}</p>
                        <p className="text-muted-foreground text-[11px]">
                          {formatDate(payment.createdAt, "MMM d, yyyy")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-xs md:table-cell">
                      {payment.parentName}
                    </TableCell>
                    <TableCell className="hidden text-xs lg:table-cell">
                      {payment.sitterName}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold whitespace-nowrap">
                      {formatMoney(payment.amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right text-xs whitespace-nowrap">
                      {formatMoney(payment.platformFee)}
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={payment.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.status === "paid" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRefunding(payment)}
                        >
                          <RotateCcw className="size-3.5" />
                          Refund
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
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

      <ConfirmDialog
        open={Boolean(refunding)}
        onOpenChange={(open) => {
          if (!open) setRefunding(null);
        }}
        title={`Refund ${refunding ? formatMoney(refunding.amount) : "this payment"}?`}
        description={
          refunding
            ? `The full amount returns to ${refunding.parentName}'s card, the booking is cancelled, and the sitter's earnings are reversed. This cannot be undone.`
            : ""
        }
        confirmLabel="Issue full refund"
        destructive
        loading={refundPayment.isPending}
        onConfirm={() => {
          if (!refunding) return;
          refundPayment.mutate(refunding.id, {
            onSuccess: () => {
              toast.success("Refund issued");
              setRefunding(null);
            },
            onError: (error) => toast.error(getErrorMessage(error)),
          });
        }}
      />
    </div>
  );
}

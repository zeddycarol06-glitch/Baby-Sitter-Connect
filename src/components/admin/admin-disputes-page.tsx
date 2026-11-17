"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Loader2, Scale, ShieldAlert, UserRound } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { SkeletonList } from "@/components/shared/skeletons";
import { DisputeStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDisputes, useResolveDispute } from "@/hooks/use-disputes";
import { getErrorMessage } from "@/lib/api/client";
import { DISPUTE_STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatMoney, formatRelative } from "@/lib/format";
import type { Dispute, DisputeStatus } from "@/types";
import { cn } from "@/lib/utils";

type Filter = "active" | "all" | DisputeStatus;

export function AdminDisputesPage() {
  const disputesQuery = useDisputes();
  const [filter, setFilter] = useState<Filter>("active");
  const [resolving, setResolving] = useState<Dispute | null>(null);

  const disputes = useMemo(() => disputesQuery.data ?? [], [disputesQuery.data]);

  const counts = useMemo(
    () => ({
      open: disputes.filter((dispute) => dispute.status === "open").length,
      under_review: disputes.filter((dispute) => dispute.status === "under_review").length,
      resolved: disputes.filter((dispute) => dispute.status === "resolved").length,
      rejected: disputes.filter((dispute) => dispute.status === "rejected").length,
    }),
    [disputes],
  );

  const visible = useMemo(() => {
    if (filter === "all") return disputes;
    if (filter === "active") {
      return disputes.filter(
        (dispute) => dispute.status === "open" || dispute.status === "under_review",
      );
    }
    return disputes.filter((dispute) => dispute.status === filter);
  }, [disputes, filter]);

  if (disputesQuery.isPending) {
    return (
      <div>
        <PageHeader title="Disputes" />
        <SkeletonList rows={3} />
      </div>
    );
  }

  if (disputesQuery.isError) {
    return (
      <div>
        <PageHeader title="Disputes" />
        <ErrorState
          title="Disputes didn't load"
          description="The resolution queue is temporarily unavailable."
          onRetry={() => void disputesQuery.refetch()}
        />
      </div>
    );
  }

  const filters: { value: Filter; label: string; count: number }[] = [
    { value: "active", label: "Needs attention", count: counts.open + counts.under_review },
    { value: "all", label: "All", count: disputes.length },
    { value: "open", label: "Open", count: counts.open },
    { value: "under_review", label: "Under review", count: counts.under_review },
    { value: "resolved", label: "Resolved", count: counts.resolved },
    { value: "rejected", label: "Rejected", count: counts.rejected },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Trust & safety"
        title="Disputes"
        description="Cool-headed resolutions protect both sides. Read the full story before deciding."
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {filters.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={filter === option.value}
            onClick={() => setFilter(option.value)}
            className={cn(
              "focus-visible:ring-ring/50 rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:ring-3 focus-visible:outline-none",
              filter === option.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-muted",
            )}
          >
            {option.label}
            <span className="ml-1.5 opacity-70">{option.count}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={Scale}
          title={filter === "active" ? "Nothing needs attention" : "No disputes here"}
          description={
            filter === "active"
              ? "Every dispute has a resolution. The marketplace is calm — for now."
              : "No disputes match this filter. Try another status."
          }
          action={
            filter !== "all" ? (
              <Button variant="outline" onClick={() => setFilter("all")}>
                View all disputes
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {visible.map((dispute) => {
            const resolved = dispute.status === "resolved" || dispute.status === "rejected";
            return (
              <Card key={dispute.id}>
                <CardContent>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <DisputeStatusBadge status={dispute.status} />
                        <span className="text-muted-foreground font-mono text-[11px]">
                          {dispute.bookingId}
                        </span>
                        <span className="text-muted-foreground text-[11px]">
                          opened {formatRelative(dispute.createdAt)}
                        </span>
                      </div>

                      <h2 className="mt-2 text-base font-semibold">{dispute.reason}</h2>

                      <div className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                        <span className="flex items-center gap-1">
                          <UserRound className="size-3" aria-hidden="true" />
                          {dispute.raisedByName}
                        </span>
                        <span className="flex items-center gap-1">
                          <ShieldAlert className="size-3" aria-hidden="true" />
                          against {dispute.againstName}
                        </span>
                        <span>Disputed amount {formatMoney(dispute.amount)}</span>
                      </div>

                      <p className="mt-3 text-sm leading-relaxed">{dispute.description}</p>

                      {dispute.resolution ? (
                        <div className="bg-muted/60 mt-3 rounded-lg border-l-2 border-emerald-500/60 p-3">
                          <p className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase">
                            <CheckCircle2 className="size-3" aria-hidden="true" />
                            Resolution · {formatDate(dispute.updatedAt, "MMM d, yyyy")}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed">{dispute.resolution}</p>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 gap-2 lg:flex-col">
                      <Button
                        variant={resolved ? "outline" : "default"}
                        size="sm"
                        onClick={() => setResolving(dispute)}
                      >
                        {resolved ? "Update resolution" : "Resolve dispute"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {resolving ? (
        <ResolveDialog
          key={resolving.id}
          dispute={resolving}
          open={Boolean(resolving)}
          onOpenChange={(open) => {
            if (!open) setResolving(null);
          }}
        />
      ) : null}
    </div>
  );
}

function ResolveDialog({
  dispute,
  open,
  onOpenChange,
}: {
  dispute: Dispute;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const resolveDispute = useResolveDispute();
  const [status, setStatus] = useState<DisputeStatus>(
    dispute.status === "open" ? "under_review" : dispute.status,
  );
  const [resolution, setResolution] = useState(dispute.resolution ?? "");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    if (resolution.trim().length < 10) {
      setError("Write a resolution note (at least 10 characters).");
      return;
    }
    resolveDispute.mutate(
      { id: dispute.id, status, resolution: resolution.trim() },
      {
        onSuccess: () => {
          toast.success("Dispute updated");
          onOpenChange(false);
        },
        onError: (mutationError) => setError(getErrorMessage(mutationError)),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Resolve dispute</DialogTitle>
          <DialogDescription>
            {dispute.raisedByName} vs. {dispute.againstName} · {formatMoney(dispute.amount)} ·{" "}
            {dispute.bookingId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="dispute-status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as DisputeStatus)}>
              <SelectTrigger id="dispute-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  ["under_review", "resolved", "rejected"] as const
                ).map((value) => (
                  <SelectItem key={value} value={value}>
                    {DISPUTE_STATUS_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dispute-resolution">Resolution note</Label>
            <Textarea
              id="dispute-resolution"
              rows={5}
              value={resolution}
              aria-invalid={Boolean(error)}
              onChange={(event) => {
                setResolution(event.target.value);
                setError(null);
              }}
              placeholder="Explain what you found, what action was taken, and what each party can expect."
            />
            <p className="text-muted-foreground text-xs">
              Shared with the person who opened the dispute.
            </p>
          </div>

          {error ? (
            <p role="alert" className="text-destructive text-sm font-medium">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={resolveDispute.isPending}>
            {resolveDispute.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Save update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { Ban, Check, CircleDollarSign, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/types";

const STEPS = [
  { status: "pending", label: "Request sent", description: "Waiting for the sitter to accept" },
  { status: "accepted", label: "Accepted", description: "Sitter confirmed — payment due" },
  { status: "paid", label: "Paid & confirmed", description: "Care is booked and secure" },
  { status: "completed", label: "Completed", description: "Share a review when you're ready" },
] as const satisfies ReadonlyArray<{ status: BookingStatus; label: string; description: string }>;

function stepIndex(status: BookingStatus): number {
  return STEPS.findIndex((step) => step.status === status);
}

const STEP_ICONS = {
  pending: Clock,
  accepted: Check,
  paid: CircleDollarSign,
  completed: Sparkles,
} as const;

export function BookingTimeline({ booking }: { booking: Booking }) {
  if (booking.status === "cancelled") {
    return (
      <div className="border-destructive/20 bg-destructive/5 flex items-start gap-3 rounded-xl border p-4">
        <Ban className="text-destructive mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold">This booking was cancelled</p>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
            {booking.cancellationReason ?? "No reason provided."}
          </p>
        </div>
      </div>
    );
  }

  const current = stepIndex(booking.status);

  return (
    <ol className="grid gap-3 sm:grid-cols-4">
      {STEPS.map((step, index) => {
        const Icon = STEP_ICONS[step.status];
        const done = index < current;
        const active = index === current;
        return (
          <li key={step.status} className="relative">
            <div
              className={cn(
                "h-full rounded-xl border p-3",
                active && "border-primary/40 bg-primary/5",
                done && "border-emerald-300/50 bg-emerald-50/50 dark:bg-emerald-500/5",
                !active && !done && "border-dashed",
              )}
            >
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full",
                  done && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
                  active && "bg-primary text-primary-foreground",
                  !done && !active && "bg-muted text-muted-foreground",
                )}
              >
                {done ? (
                  <Check className="size-3.5" aria-hidden="true" />
                ) : (
                  <Icon className="size-3.5" aria-hidden="true" />
                )}
              </span>
              <p className="mt-2 text-xs font-semibold">{step.label}</p>
              <p className="text-muted-foreground mt-0.5 text-[11px] leading-snug">
                {step.description}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

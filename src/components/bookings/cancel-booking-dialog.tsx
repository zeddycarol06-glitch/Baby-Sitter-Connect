"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateBookingStatus } from "@/hooks/use-bookings";
import { getErrorMessage } from "@/lib/api/client";

export function CancelBookingDialog({
  bookingId,
  open,
  onOpenChange,
  audience = "parent",
}: {
  bookingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  audience?: "parent" | "sitter";
}) {
  const updateStatus = useUpdateBookingStatus();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    if (reason.trim().length < 5) {
      setError("Tell us a little more (at least 5 characters).");
      return;
    }
    setError(null);
    updateStatus.mutate(
      { id: bookingId, status: "cancelled", reason: reason.trim() },
      {
        onSuccess: () => {
          toast.success("Booking cancelled");
          onOpenChange(false);
          setReason("");
        },
        onError: (mutationError) => setError(getErrorMessage(mutationError)),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel this booking?</DialogTitle>
          <DialogDescription>
            {audience === "parent"
              ? "Cancellations more than 24 hours before care are refunded in full. This can't be undone."
              : "The parent will be notified and any payment will be refunded according to policy."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="cancel-reason">Reason for cancelling</Label>
          <Textarea
            id="cancel-reason"
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Let the other person know what happened…"
            aria-invalid={Boolean(error)}
          />
          {error ? (
            <p role="alert" className="text-destructive text-xs font-medium">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep booking
          </Button>
          <Button
            variant="destructive"
            onClick={submit}
            disabled={updateStatus.isPending}
          >
            {updateStatus.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Cancel booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

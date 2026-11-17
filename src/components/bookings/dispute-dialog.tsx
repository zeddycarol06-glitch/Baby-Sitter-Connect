"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FormField } from "@/components/forms/form-field";
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
import { useCreateDispute } from "@/hooks/use-disputes";
import { getErrorMessage } from "@/lib/api/client";
import { disputeSchema, type DisputeValues } from "@/schemas/profile";
import type { Booking } from "@/types";

const REASONS = [
  "Sitter did not arrive",
  "Care did not match the booking",
  "Safety or wellbeing concern",
  "Payment or refund issue",
  "Other",
];

export function DisputeDialog({
  booking,
  open,
  onOpenChange,
}: {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createDispute = useCreateDispute();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<DisputeValues>({
    resolver: zodResolver(disputeSchema),
    defaultValues: { bookingId: booking.id, reason: REASONS[0], description: "" },
  });

  useEffect(() => {
    form.setValue("bookingId", booking.id);
  }, [booking.id, form]);

  function onSubmit(values: DisputeValues) {
    setFormError(null);
    createDispute.mutate(values, {
      onSuccess: () => {
        toast.success("Your report was sent to our safety team");
        onOpenChange(false);
        form.reset({ bookingId: booking.id, reason: REASONS[0], description: "" });
      },
      onError: (error) => setFormError(getErrorMessage(error)),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report an issue</DialogTitle>
          <DialogDescription>
            Our trust &amp; safety team reviews every report. We may contact both parties for
            details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {formError ? (
            <p role="alert" className="text-destructive text-sm">
              {formError}
            </p>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="dispute-reason">What happened?</Label>
            <select
              id="dispute-reason"
              className="border-input bg-background focus-visible:ring-ring/50 h-9 w-full rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3"
              {...form.register("reason")}
            >
              {REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
            {form.formState.errors.reason ? (
              <p role="alert" className="text-destructive text-xs">
                {form.formState.errors.reason.message}
              </p>
            ) : null}
          </div>

          <FormField
            label="Details"
            htmlFor="dispute-description"
            error={form.formState.errors.description?.message}
            required
          >
            <Textarea
              id="dispute-description"
              rows={4}
              placeholder="Share dates, times, and anything that would help us understand."
              aria-invalid={Boolean(form.formState.errors.description)}
              {...form.register("description")}
            />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={createDispute.isPending}>
              {createDispute.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Submit report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

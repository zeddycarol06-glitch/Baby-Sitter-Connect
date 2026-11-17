"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FormField } from "@/components/forms/form-field";
import { StarRatingInput } from "@/components/shared/star-rating";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useCreateReview } from "@/hooks/use-reviews";
import { getErrorMessage } from "@/lib/api/client";
import { reviewSchema, type ReviewValues } from "@/schemas/booking";
import type { Booking } from "@/types";

export function ReviewDialog({
  booking,
  open,
  onOpenChange,
}: {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createReview = useCreateReview();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, comment: "" },
  });

  function onSubmit(values: ReviewValues) {
    setFormError(null);
    createReview.mutate(
      { bookingId: booking.id, rating: values.rating, comment: values.comment },
      {
        onSuccess: () => {
          toast.success("Thanks — your review is live");
          onOpenChange(false);
          form.reset();
        },
        onError: (error) => setFormError(getErrorMessage(error)),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>How did it go with {booking.sitterName.split(" ")[0]}?</DialogTitle>
          <DialogDescription>
            Your honest review helps other families choose with confidence.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {formError ? (
            <p role="alert" className="text-destructive text-sm">
              {formError}
            </p>
          ) : null}

          <div className="space-y-1.5">
            <p className="text-sm font-medium">Your rating</p>
            <StarRatingInput
              value={form.watch("rating")}
              onChange={(value) => form.setValue("rating", value, { shouldValidate: true })}
              error={Boolean(form.formState.errors.rating)}
            />
            {form.formState.errors.rating ? (
              <p role="alert" className="text-destructive text-xs font-medium">
                {form.formState.errors.rating.message}
              </p>
            ) : null}
          </div>

          <FormField
            label="Your review"
            htmlFor="review-comment"
            error={form.formState.errors.comment?.message}
            required
          >
            <Textarea
              id="review-comment"
              rows={4}
              placeholder="What stood out? How did your child feel?"
              aria-invalid={Boolean(form.formState.errors.comment)}
              {...form.register("comment")}
            />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Not now
            </Button>
            <Button type="submit" disabled={createReview.isPending}>
              {createReview.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Publish review
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

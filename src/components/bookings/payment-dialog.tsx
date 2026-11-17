"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Loader2, Lock } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { usePayBooking } from "@/hooks/use-bookings";
import { getErrorMessage } from "@/lib/api/client";
import { formatMoney } from "@/lib/format";
import { paymentSchema, type PaymentValues } from "@/schemas/booking";
import type { Booking } from "@/types";

export function PaymentDialog({
  booking,
  open,
  onOpenChange,
}: {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const payBooking = usePayBooking();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { nameOnCard: "", cardNumber: "", expiry: "", cvc: "" },
  });

  function fillTestCard() {
    form.setValue("nameOnCard", "Hannah Brooks", { shouldValidate: true });
    form.setValue("cardNumber", "4242 4242 4242 4242", { shouldValidate: true });
    form.setValue("expiry", "12/30", { shouldValidate: true });
    form.setValue("cvc", "123", { shouldValidate: true });
    toast.info("Test card details filled in");
  }

  function onSubmit(values: PaymentValues) {
    setFormError(null);
    payBooking.mutate(
      {
        bookingId: booking.id,
        cardNumber: values.cardNumber,
        expiry: values.expiry,
        cvc: values.cvc,
        nameOnCard: values.nameOnCard,
      },
      {
        onSuccess: () => {
          toast.success("Payment complete — your booking is confirmed");
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
          <DialogTitle>Pay for this booking</DialogTitle>
          <DialogDescription>
            {formatMoney(booking.total)} for {booking.hours} hours with {booking.sitterName}. Your
            payment is held securely until care is complete.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {formError ? (
            <p role="alert" className="text-destructive text-sm">
              {formError}
            </p>
          ) : null}

          <FormField
            label="Name on card"
            htmlFor="nameOnCard"
            error={form.formState.errors.nameOnCard?.message}
            required
          >
            <Input
              id="nameOnCard"
              autoComplete="cc-name"
              aria-invalid={Boolean(form.formState.errors.nameOnCard)}
              {...form.register("nameOnCard")}
            />
          </FormField>

          <FormField
            label="Card number"
            htmlFor="cardNumber"
            error={form.formState.errors.cardNumber?.message}
            required
          >
            <div className="relative">
              <CreditCard
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                id="cardNumber"
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="4242 4242 4242 4242"
                className="pl-8"
                aria-invalid={Boolean(form.formState.errors.cardNumber)}
                {...form.register("cardNumber")}
              />
            </div>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Expiry"
              htmlFor="expiry"
              error={form.formState.errors.expiry?.message}
              required
            >
              <Input
                id="expiry"
                placeholder="MM/YY"
                autoComplete="cc-exp"
                aria-invalid={Boolean(form.formState.errors.expiry)}
                {...form.register("expiry")}
              />
            </FormField>
            <FormField label="CVC" htmlFor="cvc" error={form.formState.errors.cvc?.message} required>
              <Input
                id="cvc"
                inputMode="numeric"
                placeholder="123"
                autoComplete="cc-csc"
                aria-invalid={Boolean(form.formState.errors.cvc)}
                {...form.register("cvc")}
              />
            </FormField>
          </div>

          <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Lock className="size-3.5" aria-hidden="true" />
            Demo checkout — no real card is charged.
          </p>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={fillTestCard}>
              Use test card
            </Button>
            <Button type="submit" disabled={payBooking.isPending}>
              {payBooking.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Pay {formatMoney(booking.total)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

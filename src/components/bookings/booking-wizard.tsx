"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CreditCard,
  Loader2,
  MapPin,
  PlusCircle,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { FormField } from "@/components/forms/form-field";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/skeletons";
import { StarRating } from "@/components/shared/star-rating";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCreateBookingRequest } from "@/hooks/use-bookings";
import { useChildren, useParentProfile } from "@/hooks/use-parent";
import { useFeaturedSitters, useSitter } from "@/hooks/use-sitters";
import { getErrorMessage } from "@/lib/api/client";
import { calculatePrice } from "@/lib/pricing";
import { formatCurrency, formatDate, formatLongDate, formatMoney, formatTimeRange } from "@/lib/format";
import { bookingRequestSchema, type BookingRequestValues } from "@/schemas/booking";
import { cn } from "@/lib/utils";

const STEPS = ["Choose a sitter", "Care details", "Review & request"];

export function BookingWizard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSitterId = searchParams.get("sitter") ?? "";
  const [sitterId, setSitterId] = useState(initialSitterId);
  const [step, setStep] = useState(initialSitterId ? 1 : 0);
  const [formError, setFormError] = useState<string | null>(null);
  const addressPrefilled = useRef(false);

  const sitterQuery = useSitter(sitterId);
  const featuredQuery = useFeaturedSitters();
  const childrenQuery = useChildren();
  const profileQuery = useParentProfile();
  const createBooking = useCreateBookingRequest();

  const form = useForm<BookingRequestValues>({
    resolver: zodResolver(bookingRequestSchema),
    defaultValues: {
      date: "",
      startTime: "18:00",
      endTime: "22:00",
      childIds: [],
      address: "",
      notes: "",
    },
  });

  const profile = profileQuery.data;

  useEffect(() => {
    if (!addressPrefilled.current && profile?.profile) {
      addressPrefilled.current = true;
      const { address, city, state, zip } = profile.profile;
      form.setValue("address", `${address}, ${city}, ${state} ${zip}`);
    }
  }, [form, profile]);

  const date = form.watch("date");
  const startTime = form.watch("startTime");
  const endTime = form.watch("endTime");
  const selectedChildIds = form.watch("childIds");

  const sitter = sitterQuery.data;
  const price = sitter ? calculatePrice(sitter.hourlyRate, startTime, endTime) : null;
  const selectedChildren = (childrenQuery.data ?? []).filter((child) =>
    selectedChildIds.includes(child.id),
  );

  if (childrenQuery.isPending || profileQuery.isPending) return <PageSkeleton />;

  if (childrenQuery.isError || profileQuery.isError) {
    return (
      <div>
        <PageHeader title="Request a booking" />
        <ErrorState
          title="We couldn't load your family details"
          onRetry={() => {
            void childrenQuery.refetch();
            void profileQuery.refetch();
          }}
        />
      </div>
    );
  }

  const children = childrenQuery.data ?? [];

  function goNext() {
    if (step === 0) {
      if (!sitterId) {
        toast.error("Choose a sitter to continue");
        return;
      }
      setStep(1);
      return;
    }
    if (step === 1) {
      void form.trigger(["date", "startTime", "endTime", "childIds", "address", "notes"]).then((valid) => {
        if (valid) setStep(2);
      });
      return;
    }
    form.handleSubmit(onSubmit)();
  }

  function onSubmit(values: BookingRequestValues) {
    if (!sitterId) {
      toast.error("Choose a sitter first");
      setStep(0);
      return;
    }
    setFormError(null);
    createBooking.mutate(
      {
        sitterId,
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
        childIds: values.childIds,
        address: values.address,
        notes: values.notes || undefined,
      },
      {
        onSuccess: (booking) => {
          toast.success("Request sent — we'll let you know when the sitter replies");
          router.push(`/parent/bookings/${booking.id}?created=1`);
        },
        onError: (error) => setFormError(getErrorMessage(error)),
      },
    );
  }

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href="/parent/bookings">
          <ArrowLeft className="size-4" />
          Back to bookings
        </Link>
      </Button>

      <PageHeader
        eyebrow="New booking"
        title="Request trusted care"
        description="Choose a sitter, share the details, then send your request. You'll only pay once the sitter accepts."
      />

      <ol className="mb-6 grid grid-cols-3 gap-2" aria-label="Booking steps">
        {STEPS.map((label, index) => {
          const active = index === step;
          const done = index < step;
          return (
            <li key={label}>
              <div
                className={cn(
                  "flex items-center gap-2 rounded-xl border p-3 text-xs",
                  active && "border-primary/40 bg-primary/5",
                  done && "border-emerald-300/50 bg-emerald-50/50 dark:bg-emerald-500/5",
                )}
                aria-current={active ? "step" : undefined}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                    active && "bg-primary text-primary-foreground",
                    done && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
                    !active && !done && "bg-muted text-muted-foreground",
                  )}
                >
                  {done ? <Check className="size-3" aria-hidden="true" /> : index + 1}
                </span>
                <span className="hidden font-medium sm:block">{label}</span>
                <span className="font-medium sm:hidden">Step {index + 1}</span>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="grid gap-6 lg:grid-cols-[1fr_19rem] lg:items-start">
        <div className="space-y-4">
          {step === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Who would you like to book?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Choose a sitter</p>
                  {featuredQuery.isPending ? (
                    <div className="bg-muted h-9 animate-pulse rounded-lg" />
                  ) : featuredQuery.isError ? (
                    <ErrorState compact onRetry={() => void featuredQuery.refetch()} />
                  ) : (
                    <Select
                      value={sitterId}
                      onValueChange={(value) => {
                        setSitterId(value);
                        form.clearErrors();
                      }}
                    >
                      <SelectTrigger className="w-full" aria-label="Choose a sitter">
                        <SelectValue placeholder="Select a sitter" />
                      </SelectTrigger>
                      <SelectContent>
                        {(featuredQuery.data ?? []).map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.displayName} · {formatCurrency(option.hourlyRate)}/hr ·{" "}
                            {option.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <p className="text-muted-foreground text-xs">
                    Not sure yet?{" "}
                    <Link href="/search" className="text-primary underline">
                      Browse all sitters
                    </Link>{" "}
                    and start the request from their profile.
                  </p>
                </div>

                {sitterId && sitterQuery.isPending ? (
                  <div className="bg-muted h-28 animate-pulse rounded-xl" />
                ) : null}

                {sitterQuery.isError ? (
                  <ErrorState
                    compact
                    title="That sitter isn't available"
                    description="Pick another sitter from the list above."
                    onRetry={() => void sitterQuery.refetch()}
                  />
                ) : null}

                {sitter ? (
                  <div className="bg-muted/40 flex flex-col gap-4 rounded-xl p-4 sm:flex-row sm:items-center">
                    <span className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-xl">
                      <Image
                        src={sitter.photoUrl}
                        alt={sitter.displayName}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 text-sm font-semibold">
                        {sitter.displayName}
                        {sitter.verified ? (
                          <BadgeCheck className="text-primary size-4" aria-label="Verified" />
                        ) : null}
                      </p>
                      <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
                        {sitter.headline}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs">
                        <StarRating rating={sitter.rating} reviewCount={sitter.reviewCount} />
                        <span className="text-muted-foreground inline-flex items-center gap-1">
                          <MapPin className="size-3" aria-hidden="true" />
                          {sitter.city}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-semibold">
                      {formatCurrency(sitter.hourlyRate)}
                      <span className="text-muted-foreground text-xs font-normal">/hr</span>
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          {step === 1 ? (
            <Card>
              <CardHeader>
                <CardTitle>When and where is care needed?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <FormField
                    label="Date"
                    htmlFor="booking-date"
                    error={form.formState.errors.date?.message}
                    required
                  >
                    <Input
                      id="booking-date"
                      type="date"
                      min={new Date().toISOString().slice(0, 10)}
                      aria-invalid={Boolean(form.formState.errors.date)}
                      {...form.register("date")}
                    />
                  </FormField>
                  <FormField
                    label="Start time"
                    htmlFor="booking-start"
                    error={form.formState.errors.startTime?.message}
                    required
                  >
                    <Input
                      id="booking-start"
                      type="time"
                      aria-invalid={Boolean(form.formState.errors.startTime)}
                      {...form.register("startTime")}
                    />
                  </FormField>
                  <FormField
                    label="End time"
                    htmlFor="booking-end"
                    error={form.formState.errors.endTime?.message}
                    required
                  >
                    <Input
                      id="booking-end"
                      type="time"
                      aria-invalid={Boolean(form.formState.errors.endTime)}
                      {...form.register("endTime")}
                    />
                  </FormField>
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-medium">
                    Which children need care? <span className="text-destructive">*</span>
                  </p>
                  {children.length === 0 ? (
                    <EmptyState
                      icon={PlusCircle}
                      title="Add a child first"
                      description="We need a child profile so the sitter knows who they'll be caring for."
                      action={
                        <Button asChild>
                          <Link href="/parent/children">Add a child</Link>
                        </Button>
                      }
                      className="py-8"
                    />
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {children.map((child) => {
                        const checked = selectedChildIds.includes(child.id);
                        return (
                          <label
                            key={child.id}
                            className={cn(
                              "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors",
                              checked ? "border-primary bg-primary/5" : "hover:border-primary/40",
                            )}
                          >
                            <input
                              type="checkbox"
                              className="accent-primary size-4"
                              checked={checked}
                              onChange={(event) => {
                                const next = event.target.checked
                                  ? [...selectedChildIds, child.id]
                                  : selectedChildIds.filter((id) => id !== child.id);
                                form.setValue("childIds", next, { shouldValidate: true });
                              }}
                            />
                            <span className="min-w-0">
                              <span className="block text-sm font-medium">
                                {child.firstName} {child.lastName}
                              </span>
                              <span className="text-muted-foreground block text-xs">
                                {child.allergies.length > 0
                                  ? `Allergies: ${child.allergies.join(", ")}`
                                  : "No allergies listed"}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                  {form.formState.errors.childIds ? (
                    <p role="alert" className="text-destructive text-xs font-medium">
                      {form.formState.errors.childIds.message}
                    </p>
                  ) : null}
                </div>

                <FormField
                  label="Care address"
                  htmlFor="booking-address"
                  error={form.formState.errors.address?.message}
                  hint="Only shared with the sitter after they accept."
                  required
                >
                  <Input
                    id="booking-address"
                    autoComplete="street-address"
                    aria-invalid={Boolean(form.formState.errors.address)}
                    {...form.register("address")}
                  />
                </FormField>

                <FormField
                  label="Notes for the sitter"
                  htmlFor="booking-notes"
                  error={form.formState.errors.notes?.message}
                  hint="Routines, bedtime, allergies, parking — anything helpful."
                >
                  <Textarea
                    id="booking-notes"
                    rows={4}
                    placeholder="e.g. Dinner is in the fridge, bedtime is 7:30pm, and the dog is friendly."
                    {...form.register("notes")}
                  />
                </FormField>
              </CardContent>
            </Card>
          ) : null}

          {step === 2 ? (
            <Card>
              <CardHeader>
                <CardTitle>Review your request</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formError ? (
                  <p role="alert" className="text-destructive text-sm">
                    {formError}
                  </p>
                ) : null}

                <dl className="space-y-3 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-muted-foreground flex items-center gap-2">
                      <Users className="size-4" aria-hidden="true" />
                      Sitter
                    </dt>
                    <dd className="text-right font-medium">{sitter?.displayName ?? "—"}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-muted-foreground flex items-center gap-2">
                      <CalendarDays className="size-4" aria-hidden="true" />
                      When
                    </dt>
                    <dd className="text-right font-medium">
                      {date ? formatLongDate(date) : "—"}
                      <span className="text-muted-foreground block text-xs font-normal">
                        {formatTimeRange(startTime, endTime)}
                      </span>
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-muted-foreground flex items-center gap-2">
                      <Users className="size-4" aria-hidden="true" />
                      Children
                    </dt>
                    <dd className="max-w-[60%] text-right font-medium">
                      {selectedChildren.map((child) => `${child.firstName} ${child.lastName}`).join(", ") ||
                        "—"}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-muted-foreground flex items-center gap-2">
                      <MapPin className="size-4" aria-hidden="true" />
                      Address
                    </dt>
                    <dd className="max-w-[60%] text-right font-medium">
                      {form.watch("address") || "—"}
                    </dd>
                  </div>
                  <Separator />
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-muted-foreground flex items-center gap-2">
                      <CreditCard className="size-4" aria-hidden="true" />
                      Estimated total
                    </dt>
                    <dd className="text-right font-semibold">
                      {price ? formatMoney(price.total) : "—"}
                      <span className="text-muted-foreground block text-xs font-normal">
                        Payment due after acceptance
                      </span>
                    </dd>
                  </div>
                </dl>

                {form.watch("notes") ? (
                  <div className="rounded-lg bg-muted/60 p-3">
                    <p className="text-xs font-medium">Notes</p>
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                      {form.watch("notes")}
                    </p>
                  </div>
                ) : null}

                <p className="text-muted-foreground text-xs leading-relaxed">
                  By sending a request you agree to our cancellation policy: free cancellation up to
                  24 hours before care begins. The sitter has 24 hours to respond.
                </p>
              </CardContent>
            </Card>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => (step === 0 ? router.push("/parent/bookings") : setStep(step - 1))}
            >
              <ArrowLeft className="size-4" />
              {step === 0 ? "Cancel" : "Back"}
            </Button>
            <Button
              onClick={goNext}
              disabled={createBooking.isPending || (step === 1 && children.length === 0)}
            >
              {createBooking.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {step === 2 ? "Send request" : "Continue"}
              {step === 2 ? null : <ArrowRight className="size-4" />}
            </Button>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24">
          <Card>
            <CardHeader>
              <CardTitle>Price estimate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-sm">
              {sitter ? (
                <>
                  <div className="flex items-center gap-2.5 pb-1">
                    <span className="bg-muted relative size-9 overflow-hidden rounded-full">
                      <Image
                        src={sitter.photoUrl}
                        alt={sitter.displayName}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">{sitter.displayName}</p>
                      <p className="text-muted-foreground text-[11px]">
                        {formatCurrency(sitter.hourlyRate)}/hour
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">
                      {price?.hours ?? 0} hours × {formatCurrency(sitter.hourlyRate)}
                    </span>
                    <span>{formatMoney(price?.subtotal ?? 0)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Service fee (8%)</span>
                    <span>{formatMoney(price?.serviceFee ?? 0)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between gap-3 font-semibold">
                    <span>Total</span>
                    <span>{formatMoney(price?.total ?? 0)}</span>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    You&apos;re not charged yet. Payment is collected after the sitter accepts your
                    request.
                  </p>
                  {date ? (
                    <p className="text-muted-foreground rounded-lg bg-muted/60 p-2.5 text-xs">
                      {formatDate(date, "EEE, MMM d")} · {formatTimeRange(startTime, endTime)}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Choose a sitter to see your price estimate.
                </p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Loader2, Mail, Percent, RotateCcw, Save, Wallet } from "lucide-react";
import { toast } from "sonner";
import { FormField } from "@/components/forms/form-field";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminSettings, useUpdateAdminSettings } from "@/hooks/use-admin";
import { getErrorMessage } from "@/lib/api/client";
import { formatCurrency } from "@/lib/format";
import { adminSettingsSchema, type AdminSettingsValues } from "@/schemas/profile";

const PAYOUT_LABELS = {
  weekly: "Weekly (every Friday)",
  biweekly: "Bi-weekly (every other Friday)",
  monthly: "Monthly (first business day)",
} as const;

export function AdminSettingsPage() {
  const settingsQuery = useAdminSettings();
  const updateSettings = useUpdateAdminSettings();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<AdminSettingsValues>({
    resolver: zodResolver(adminSettingsSchema),
    values: settingsQuery.data
      ? {
          commissionRate: Math.round(settingsQuery.data.commissionRate * 1000) / 10,
          serviceFeeRate: Math.round(settingsQuery.data.serviceFeeRate * 1000) / 10,
          currency: settingsQuery.data.currency,
          payoutSchedule: settingsQuery.data.payoutSchedule,
          supportEmail: settingsQuery.data.supportEmail,
        }
      : undefined,
    defaultValues: {
      commissionRate: 15,
      serviceFeeRate: 8,
      currency: "USD",
      payoutSchedule: "weekly",
      supportEmail: "support@babysitterconnect.com",
    },
  });

  if (settingsQuery.isPending) return <PageSkeleton />;

  if (settingsQuery.isError || !settingsQuery.data) {
    return (
      <div>
        <PageHeader title="Platform settings" />
        <ErrorState
          title="Settings didn't load"
          description="Platform configuration is temporarily unavailable."
          onRetry={() => void settingsQuery.refetch()}
        />
      </div>
    );
  }

  const watchedCommission = form.watch("commissionRate");
  const watchedServiceFee = form.watch("serviceFeeRate");
  const exampleRate = 25;
  const exampleHours = 4;
  const exampleSubtotal = exampleRate * exampleHours;
  const exampleServiceFee = Math.round(exampleSubtotal * (watchedServiceFee / 100) * 100) / 100;
  const exampleTotal = Math.round((exampleSubtotal + exampleServiceFee) * 100) / 100;
  const exampleCommission = Math.round(exampleSubtotal * (watchedCommission / 100) * 100) / 100;
  const exampleSitter = Math.round((exampleSubtotal - exampleCommission) * 100) / 100;

  function onSubmit(values: AdminSettingsValues) {
    setFormError(null);
    updateSettings.mutate(
      {
        commissionRate: values.commissionRate / 100,
        serviceFeeRate: values.serviceFeeRate / 100,
        currency: values.currency.toUpperCase(),
        payoutSchedule: values.payoutSchedule,
        supportEmail: values.supportEmail,
      },
      {
        onSuccess: () => toast.success("Platform settings saved"),
        onError: (error) => setFormError(getErrorMessage(error)),
      },
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Configuration"
        title="Platform settings"
        description="Pricing and payout rules for the marketplace. Be deliberate — these affect every new booking."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <Card>
          <CardHeader>
            <CardTitle>Pricing & payouts</CardTitle>
            <CardDescription>
              Rates apply to new bookings only. Existing payments keep the rate they were charged.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {formError ? (
                <p role="alert" className="text-destructive text-sm">
                  {formError}
                </p>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <FormField
                  label="Sitter commission (%)"
                  htmlFor="settings-commission"
                  error={form.formState.errors.commissionRate?.message}
                  hint="Deducted from the sitter's subtotal."
                  required
                >
                  <div className="relative">
                    <Percent
                      className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                      aria-hidden="true"
                    />
                    <Input
                      id="settings-commission"
                      type="number"
                      min={0}
                      max={50}
                      step={0.5}
                      inputMode="decimal"
                      className="pl-9"
                      aria-invalid={Boolean(form.formState.errors.commissionRate)}
                      {...form.register("commissionRate", { valueAsNumber: true })}
                    />
                  </div>
                </FormField>
                <FormField
                  label="Parent service fee (%)"
                  htmlFor="settings-service-fee"
                  error={form.formState.errors.serviceFeeRate?.message}
                  hint="Added to the family's booking total."
                  required
                >
                  <div className="relative">
                    <Percent
                      className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                      aria-hidden="true"
                    />
                    <Input
                      id="settings-service-fee"
                      type="number"
                      min={0}
                      max={30}
                      step={0.5}
                      inputMode="decimal"
                      className="pl-9"
                      aria-invalid={Boolean(form.formState.errors.serviceFeeRate)}
                      {...form.register("serviceFeeRate", { valueAsNumber: true })}
                    />
                  </div>
                </FormField>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FormField
                  label="Currency"
                  htmlFor="settings-currency"
                  error={form.formState.errors.currency?.message}
                  required
                >
                  <div className="relative">
                    <Wallet
                      className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                      aria-hidden="true"
                    />
                    <Input
                      id="settings-currency"
                      maxLength={3}
                      className="pl-9 uppercase"
                      aria-invalid={Boolean(form.formState.errors.currency)}
                      {...form.register("currency")}
                    />
                  </div>
                </FormField>
                <FormField
                  label="Payout schedule"
                  htmlFor="settings-payout-schedule"
                  error={form.formState.errors.payoutSchedule?.message}
                  required
                >
                  <Select
                    value={form.watch("payoutSchedule")}
                    onValueChange={(value) =>
                      form.setValue(
                        "payoutSchedule",
                        value as AdminSettingsValues["payoutSchedule"],
                        { shouldValidate: true, shouldDirty: true },
                      )
                    }
                  >
                    <SelectTrigger id="settings-payout-schedule" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PAYOUT_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <FormField
                label="Support email"
                htmlFor="settings-support-email"
                error={form.formState.errors.supportEmail?.message}
                hint="Shown on receipts and dispute notifications."
                required
              >
                <div className="relative">
                  <Mail
                    className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                    aria-hidden="true"
                  />
                  <Input
                    id="settings-support-email"
                    type="email"
                    className="pl-9"
                    aria-invalid={Boolean(form.formState.errors.supportEmail)}
                    {...form.register("supportEmail")}
                  />
                </div>
              </FormField>

              <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={!form.formState.isDirty || updateSettings.isPending}
                >
                  <RotateCcw className="size-4" />
                  Discard changes
                </Button>
                <Button type="submit" disabled={updateSettings.isPending}>
                  {updateSettings.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Save settings
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Example booking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-xs">
                {exampleHours} hours at {formatCurrency(exampleRate)}/hour
              </p>
              <dl className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Sitter subtotal</dt>
                  <dd>{formatCurrency(exampleSubtotal)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">
                    Service fee ({watchedServiceFee || 0}%)
                  </dt>
                  <dd>{formatCurrency(exampleServiceFee)}</dd>
                </div>
                <div className="flex justify-between gap-2 border-t pt-2 font-semibold">
                  <dt>Family pays</dt>
                  <dd>{formatCurrency(exampleTotal)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">
                    Commission ({watchedCommission || 0}%)
                  </dt>
                  <dd>−{formatCurrency(exampleCommission)}</dd>
                </div>
                <div className="text-primary flex justify-between gap-2 border-t pt-2 font-semibold">
                  <dt>Sitter receives</dt>
                  <dd>{formatCurrency(exampleSitter)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardContent>
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Clock className="text-primary size-4" aria-hidden="true" />
                Payout timing
              </p>
              <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                Earnings become payable after care is marked complete and the review window closes.
                The schedule here controls the next transfer batch.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

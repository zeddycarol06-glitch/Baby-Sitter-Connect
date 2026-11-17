"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bell, Loader2, Lock, LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { FormField } from "@/components/forms/form-field";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { useParentProfile, useUpdateParentProfile } from "@/hooks/use-parent";
import { getErrorMessage } from "@/lib/api/client";
import { parentProfileSchema, type ParentProfileValues } from "@/schemas/profile";
import { useAuthStore } from "@/store/auth-store";

const NOTIFICATIONS = [
  { id: "booking-updates", label: "Booking updates", description: "Requests, acceptances, and reminders." },
  { id: "messages", label: "New messages", description: "When your sitter sends a message." },
  { id: "payments", label: "Payment receipts", description: "Charges, refunds, and receipts." },
  { id: "marketing", label: "Tips & offers", description: "Occasional childcare guides and local offers." },
];

export function ParentSettingsPageContent() {
  const { data, isPending, isError, refetch } = useParentProfile();
  const updateProfile = useUpdateParentProfile();
  const setUser = useAuthStore((state) => state.setUser);
  const { signOut, user } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<Record<string, boolean>>({
    "booking-updates": true,
    messages: true,
    payments: true,
    marketing: false,
  });

  const form = useForm<ParentProfileValues>({
    resolver: zodResolver(parentProfileSchema),
    values: data
      ? {
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          phone: data.user.phone ?? "",
          address: data.profile.address,
          city: data.profile.city,
          state: data.profile.state,
          zip: data.profile.zip,
          emergencyContactName: data.profile.emergencyContactName,
          emergencyContactPhone: data.profile.emergencyContactPhone,
        }
      : undefined,
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
    },
  });

  if (isPending) return <PageSkeleton />;

  if (isError || !data) {
    return (
      <div>
        <PageHeader title="Account settings" />
        <ErrorState
          title="Settings didn't load"
          description="We couldn't retrieve your profile."
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  function onSubmit(values: ParentProfileValues) {
    setFormError(null);
    updateProfile.mutate(
      {
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        address: values.address,
        city: values.city,
        state: values.state,
        zip: values.zip,
        emergencyContactName: values.emergencyContactName,
        emergencyContactPhone: values.emergencyContactPhone,
      },
      {
        onSuccess: (response) => {
          setUser({
            id: response.user.id,
            email: response.user.email,
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            role: response.user.role,
            avatarUrl: response.user.avatarUrl,
          });
          toast.success("Profile updated");
        },
        onError: (error) => setFormError(getErrorMessage(error)),
      },
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Account settings"
        description="Keep your family details current so sitters arrive prepared."
      />

      <Card>
        <CardHeader>
          <CardTitle>Family profile</CardTitle>
          <CardDescription>
            Your address is only shared with a sitter after they accept a booking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {formError ? (
              <p role="alert" className="text-destructive text-sm">
                {formError}
              </p>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                label="First name"
                htmlFor="settings-first-name"
                error={form.formState.errors.firstName?.message}
                required
              >
                <Input
                  id="settings-first-name"
                  autoComplete="given-name"
                  aria-invalid={Boolean(form.formState.errors.firstName)}
                  {...form.register("firstName")}
                />
              </FormField>
              <FormField
                label="Last name"
                htmlFor="settings-last-name"
                error={form.formState.errors.lastName?.message}
                required
              >
                <Input
                  id="settings-last-name"
                  autoComplete="family-name"
                  aria-invalid={Boolean(form.formState.errors.lastName)}
                  {...form.register("lastName")}
                />
              </FormField>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Email" htmlFor="settings-email">
                <Input id="settings-email" value={data.user.email} readOnly disabled />
              </FormField>
              <FormField
                label="Phone"
                htmlFor="settings-phone"
                error={form.formState.errors.phone?.message}
              >
                <Input id="settings-phone" type="tel" autoComplete="tel" {...form.register("phone")} />
              </FormField>
            </div>

            <Separator />

            <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
              <FormField
                label="Street address"
                htmlFor="settings-address"
                error={form.formState.errors.address?.message}
                required
              >
                <Input
                  id="settings-address"
                  autoComplete="street-address"
                  aria-invalid={Boolean(form.formState.errors.address)}
                  {...form.register("address")}
                />
              </FormField>
              <FormField
                label="City"
                htmlFor="settings-city"
                error={form.formState.errors.city?.message}
                required
              >
                <Input id="settings-city" autoComplete="address-level2" {...form.register("city")} />
              </FormField>
              <FormField
                label="ZIP"
                htmlFor="settings-zip"
                error={form.formState.errors.zip?.message}
                required
              >
                <Input id="settings-zip" autoComplete="postal-code" {...form.register("zip")} />
              </FormField>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <FormField label="State" htmlFor="settings-state" error={form.formState.errors.state?.message} required>
                <Input id="settings-state" autoComplete="address-level1" {...form.register("state")} />
              </FormField>
              <FormField
                label="Emergency contact"
                htmlFor="settings-emergency-name"
                error={form.formState.errors.emergencyContactName?.message}
                required
              >
                <Input id="settings-emergency-name" {...form.register("emergencyContactName")} />
              </FormField>
              <FormField
                label="Emergency phone"
                htmlFor="settings-emergency-phone"
                error={form.formState.errors.emergencyContactPhone?.message}
                required
              >
                <Input
                  id="settings-emergency-phone"
                  type="tel"
                  {...form.register("emergencyContactPhone")}
                />
              </FormField>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="size-4" aria-hidden="true" />
            Notifications
          </CardTitle>
          <CardDescription>Choose what lands in your inbox and notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {NOTIFICATIONS.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor={`notification-${item.id}`} className="text-sm font-medium">
                  {item.label}
                </Label>
                <p className="text-muted-foreground text-xs">{item.description}</p>
              </div>
              <Switch
                id={`notification-${item.id}`}
                checked={preferences[item.id] ?? false}
                onCheckedChange={(checked) => {
                  setPreferences((current) => ({ ...current, [item.id]: checked }));
                  toast.success("Notification preference updated");
                }}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4" aria-hidden="true" />
            Security & account
          </CardTitle>
          <CardDescription>Manage how you sign in and your account status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Password</p>
              <p className="text-muted-foreground text-xs">
                Last updated when you created your account.
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/forgot-password">
                <Lock className="size-3.5" />
                Reset password
              </a>
            </Button>
          </div>
          <Separator />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Sign out of this device</p>
              <p className="text-muted-foreground text-xs">
                Signed in as {user?.email ?? data.user.email}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => void signOut()}>
              <LogOut className="size-3.5" />
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

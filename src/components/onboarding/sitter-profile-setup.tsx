"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Camera,
  Check,
  Loader2,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { FormField } from "@/components/forms/form-field";
import { Logo } from "@/components/layout/logo";
import { ErrorState } from "@/components/shared/error-state";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useSitterProfile, useUpdateSitterProfile } from "@/hooks/use-sitters";
import { getErrorMessage } from "@/lib/api/client";
import { CITIES, LANGUAGES } from "@/lib/constants";
import { sitterOnboardingSchema, type SitterOnboardingValues } from "@/schemas/profile";
import { cn } from "@/lib/utils";

const steps = ["Profile information", "Availability", "Verification"] as const;

export function SitterProfileSetup() {
  const router = useRouter();
  const { user } = useAuth();
  const profileQuery = useSitterProfile();
  const updateProfile = useUpdateSitterProfile();
  const [formError, setFormError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const url = previewUrlRef.current;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, []);

  const form = useForm<SitterOnboardingValues>({
    resolver: zodResolver(sitterOnboardingSchema),
    values: profileQuery.data
      ? {
          aboutYou: profileQuery.data.bio,
          baseLocation: profileQuery.data.city,
          certifications: profileQuery.data.certifications?.join(", ") ?? "",
          language: profileQuery.data.languages[0] ?? "",
          yearsExperience: profileQuery.data.experienceYears,
          dateOfBirth: profileQuery.data.dateOfBirth ?? "",
        }
      : undefined,
    defaultValues: {
      aboutYou: "",
      baseLocation: "",
      certifications: "",
      language: "",
      yearsExperience: 0,
      dateOfBirth: "",
    },
    mode: "onBlur",
  });

  const values = form.watch();
  const profile = profileQuery.data;
  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : "Your name";

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setPhotoPreview(url);
    setPhotoName(file.name);
  }

  function onSubmit(values: SitterOnboardingValues) {
    setFormError(null);
    const certifications = values.certifications
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    updateProfile.mutate(
      {
        bio: values.aboutYou,
        city: values.baseLocation,
        headline: `${values.yearsExperience} years of caring experience in ${values.baseLocation}`,
        languages: [
          values.language,
          ...(profile?.languages.filter((language) => language !== values.language) ?? []),
        ],
        experienceYears: values.yearsExperience,
        certifications,
        dateOfBirth: values.dateOfBirth,
        photoUrl: photoPreview ?? profile?.photoUrl,
      },
      {
        onSuccess: () => {
          toast.success("Profile information saved", {
            description: "Next up: set your availability.",
          });
          router.push("/sitter/verification");
        },
        onError: (error) => setFormError(getErrorMessage(error)),
      },
    );
  }

  return (
    <div className="bg-background flex min-h-dvh flex-col">
      <header className="bg-brand-green text-white">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo tone="brand" classNameText="text-white" />
            <span className="hidden h-6 w-px bg-white/30 sm:block" aria-hidden="true" />
            <span className="hidden text-sm font-medium text-white/90 sm:block">
              BabySitter Profile
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs sm:inline-flex">
              <MapPin className="size-3.5" aria-hidden="true" />
              Location automation · {profile?.city ?? "Seattle, WA"}
            </span>
            <Link href="/sitter" className="text-xs font-medium text-white/90 hover:text-white">
              Save &amp; exit
            </Link>
          </div>
        </div>

        <div className="container-page pb-9 pt-4 sm:pb-12 sm:pt-6">
          <p className="text-xs font-semibold tracking-[0.18em] text-white/80 uppercase">
            Your village starts here
          </p>
          <h1 className="font-heading mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            BabySitter Profile
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/85 sm:text-base">
            Step 1 of 3 — tell families who you are and where you care.
          </p>

          <ol className="mt-6 flex flex-wrap gap-2" aria-label="Profile setup progress">
            {steps.map((step, index) => (
              <li
                key={step}
                aria-current={index === 0 ? "step" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium",
                  index === 0 ? "bg-white text-brand-green-dark" : "bg-white/15 text-white/80",
                )}
              >
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full text-[10px]",
                    index === 0 ? "bg-brand-green text-white" : "bg-white/20",
                  )}
                >
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </header>

      <main className="container-page grid flex-1 items-start gap-6 py-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8">
        {profileQuery.isPending ? (
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8" aria-busy="true">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="mt-6 h-28 w-full" />
            <Skeleton className="mt-4 h-12 w-full" />
            <Skeleton className="mt-4 h-12 w-full" />
            <Skeleton className="mt-4 h-36 w-full" />
            <span className="sr-only">Loading your profile…</span>
          </div>
        ) : profileQuery.isError || !profile ? (
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            <ErrorState
              title="Profile didn't load"
              description="We couldn't load your sitter profile. Try again to continue setup."
              onRetry={() => void profileQuery.refetch()}
            />
          </div>
        ) : (
          <>
            <section className="rounded-3xl border border-border bg-card p-5 shadow-[0_24px_60px_-45px_rgba(31,26,22,0.55)] sm:p-8">
              <div className="flex items-center gap-3">
                <span className="bg-brand-green-soft text-brand-green-dark flex size-10 items-center justify-center rounded-full">
                  <Sparkles className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-heading text-xl font-semibold">Profile information</h2>
                  <p className="text-muted-foreground text-xs">
                    You can edit everything later from your dashboard.
                  </p>
                </div>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-7 space-y-7" noValidate>
                {formError ? (
                  <p role="alert" className="text-destructive rounded-xl bg-destructive/10 p-3 text-sm">
                    {formError}
                  </p>
                ) : null}

                <fieldset className="space-y-3">
                  <legend className="text-sm font-medium">Your photo</legend>
                  <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-border bg-muted/30 p-4 sm:flex-row sm:items-center">
                    <UserAvatar
                      src={photoPreview ?? profile.photoUrl}
                      name={displayName}
                      className="size-20 text-xl"
                    />
                    <div className="min-w-0 flex-1">
                      <label
                        htmlFor="sitter-photo"
                        className="border-brand-green/40 text-brand-green-dark hover:bg-brand-green-soft inline-flex cursor-pointer items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium transition-colors"
                      >
                        <Camera className="size-4" aria-hidden="true" />
                        {photoName ? "Change photo" : "Upload a photo"}
                      </label>
                      <input
                        id="sitter-photo"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handlePhotoChange}
                      />
                      <p className="text-muted-foreground mt-2 truncate text-xs">
                        {photoName ?? "A friendly face helps families feel at ease. JPG or PNG."}
                      </p>
                    </div>
                  </div>
                </fieldset>

                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    label="Base location"
                    htmlFor="base-location"
                    error={form.formState.errors.baseLocation?.message}
                    hint="Where you're available to care."
                    required
                  >
                    <Input
                      id="base-location"
                      list="base-location-options"
                      autoComplete="address-level2"
                      placeholder="Seattle, WA"
                      className="h-11 rounded-xl"
                      aria-invalid={Boolean(form.formState.errors.baseLocation)}
                      {...form.register("baseLocation")}
                    />
                    <datalist id="base-location-options">
                      {CITIES.map((city) => (
                        <option key={city} value={city} />
                      ))}
                    </datalist>
                  </FormField>

                  <FormField
                    label="Language"
                    htmlFor="sitter-language"
                    error={form.formState.errors.language?.message}
                    hint="The language you'll care in."
                    required
                  >
                    <Controller
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger
                            id="sitter-language"
                            className="h-11 w-full rounded-xl"
                            aria-invalid={Boolean(form.formState.errors.language)}
                          >
                            <SelectValue placeholder="Choose a language" />
                          </SelectTrigger>
                          <SelectContent>
                            {LANGUAGES.map((language) => (
                              <SelectItem key={language} value={language}>
                                {language}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormField>

                  <FormField
                    label="Years of experience"
                    htmlFor="years-experience"
                    error={form.formState.errors.yearsExperience?.message}
                    required
                  >
                    <Input
                      id="years-experience"
                      type="number"
                      min={0}
                      max={60}
                      step={1}
                      inputMode="numeric"
                      className="h-11 rounded-xl"
                      aria-invalid={Boolean(form.formState.errors.yearsExperience)}
                      {...form.register("yearsExperience", { valueAsNumber: true })}
                    />
                  </FormField>

                  <FormField
                    label="DOB"
                    htmlFor="sitter-dob"
                    error={form.formState.errors.dateOfBirth?.message}
                    hint="Only used to confirm you're an adult."
                    required
                  >
                    <Input
                      id="sitter-dob"
                      type="date"
                      className="h-11 rounded-xl"
                      aria-invalid={Boolean(form.formState.errors.dateOfBirth)}
                      {...form.register("dateOfBirth")}
                    />
                  </FormField>
                </div>

                <FormField
                  label="Certifications"
                  htmlFor="sitter-certifications"
                  error={form.formState.errors.certifications?.message}
                  hint="Separate with commas — for example: CPR, First aid, Early childhood education."
                >
                  <Input
                    id="sitter-certifications"
                    placeholder="CPR, First aid"
                    className="h-11 rounded-xl"
                    {...form.register("certifications")}
                  />
                </FormField>

                <FormField
                  label="About you"
                  htmlFor="about-you"
                  error={form.formState.errors.aboutYou?.message}
                  hint="Share the ages you enjoy caring for, routines you're confident with, and how you keep families updated."
                  required
                >
                  <Textarea
                    id="about-you"
                    rows={6}
                    placeholder="I'm a patient, energetic sitter who loves story time and outdoor play..."
                    className="rounded-xl"
                    aria-invalid={Boolean(form.formState.errors.aboutYou)}
                    {...form.register("aboutYou")}
                  />
                </FormField>

                <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <Button asChild type="button" variant="ghost" className="rounded-full">
                    <Link href="/sitter">
                      <ArrowLeft className="size-4" aria-hidden="true" />
                      Back to dashboard
                    </Link>
                  </Button>
                  <Button
                    type="submit"
                    className="h-12 rounded-full bg-brand-terracotta px-7 text-white hover:bg-brand-terracotta-dark"
                    size="lg"
                    disabled={updateProfile.isPending}
                  >
                    {updateProfile.isPending ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <ArrowRight className="size-4" aria-hidden="true" />
                    )}
                    {updateProfile.isPending ? "Saving…" : "Next"}
                  </Button>
                </div>
              </form>
            </section>

            <aside className="space-y-4">
              <div className="rounded-3xl border border-border bg-card p-5 shadow-[0_18px_40px_-36px_rgba(31,26,22,0.55)]">
                <p className="text-brand-terracotta text-xs font-semibold tracking-[0.16em] uppercase">
                  Live preview
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <UserAvatar
                    src={photoPreview ?? profile.photoUrl}
                    name={displayName}
                    className="size-12"
                  />
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-sm font-semibold">
                      {displayName}
                      <BadgeCheck className="text-brand-green-dark size-3.5" aria-hidden="true" />
                    </p>
                    <p className="text-muted-foreground flex items-center gap-1 text-[11px]">
                      <MapPin className="size-3" aria-hidden="true" />
                      {values.baseLocation || "Your city"}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground mt-4 text-xs leading-relaxed">
                  {values.aboutYou || "Your introduction will appear here as you write it."}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-4">
                  {values.certifications
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
                    .slice(0, 4)
                    .map((item) => (
                      <span
                        key={item}
                        className="bg-brand-green-soft text-brand-green-dark rounded-full px-2 py-0.5 text-[10px] font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  {values.language ? (
                    <span className="bg-muted rounded-full px-2 py-0.5 text-[10px] font-medium">
                      {values.language}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-5">
                <p className="text-sm font-semibold">Your setup checklist</p>
                <ul className="mt-3 space-y-2.5">
                  {[
                    { label: "Base location", done: values.baseLocation.length > 1 },
                    { label: "Language", done: values.language.length > 0 },
                    { label: "Years of experience", done: values.yearsExperience >= 0 },
                    { label: "Date of birth", done: values.dateOfBirth.length > 0 },
                    { label: "About you", done: values.aboutYou.length >= 20 },
                  ].map((item) => (
                    <li key={item.label} className="flex items-center gap-2 text-xs">
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-full",
                          item.done ? "bg-brand-green text-white" : "bg-muted text-muted-foreground",
                        )}
                      >
                        {item.done ? <Check className="size-3" aria-hidden="true" /> : null}
                      </span>
                      <span className={item.done ? "text-foreground" : "text-muted-foreground"}>
                        {item.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-muted/60 flex gap-3 rounded-3xl p-5">
                <ShieldCheck className="text-brand-green-dark mt-0.5 size-5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold">Why we ask</p>
                  <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                    A complete profile helps families feel confident, and speeds up your verification
                    review.
                  </p>
                </div>
              </div>
            </aside>
          </>
        )}
      </main>
    </div>
  );
}

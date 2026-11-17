"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { BadgeCheck, Loader2, MapPin, Star, Wallet } from "lucide-react";
import { toast } from "sonner";
import { FormField } from "@/components/forms/form-field";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/skeletons";
import { StarRating } from "@/components/shared/star-rating";
import { VerificationStatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSitterProfile, useUpdateSitterProfile } from "@/hooks/use-sitters";
import { getErrorMessage } from "@/lib/api/client";
import { CITIES, LANGUAGES, SITTER_SKILLS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import { sitterProfileSchema, type SitterProfileValues } from "@/schemas/profile";
import { cn } from "@/lib/utils";

export function SitterProfilePageContent() {
  const profileQuery = useSitterProfile();
  const updateProfile = useUpdateSitterProfile();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<SitterProfileValues>({
    resolver: zodResolver(sitterProfileSchema),
    values: profileQuery.data
      ? {
          displayName: profileQuery.data.displayName,
          headline: profileQuery.data.headline,
          bio: profileQuery.data.bio,
          city: profileQuery.data.city,
          hourlyRate: profileQuery.data.hourlyRate,
          experienceYears: profileQuery.data.experienceYears,
          languages: profileQuery.data.languages,
          skills: profileQuery.data.skills,
        }
      : undefined,
    defaultValues: {
      displayName: "",
      headline: "",
      bio: "",
      city: "",
      hourlyRate: 25,
      experienceYears: 0,
      languages: [],
      skills: [],
    },
  });

  if (profileQuery.isPending) return <PageSkeleton />;

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div>
        <PageHeader title="Profile" />
        <ErrorState
          title="Profile didn't load"
          description="We couldn't retrieve your public profile."
          onRetry={() => void profileQuery.refetch()}
        />
      </div>
    );
  }

  const profile = profileQuery.data;
  const languages = form.watch("languages");
  const skills = form.watch("skills");

  function toggleLanguage(language: string) {
    const next = languages.includes(language)
      ? languages.filter((item) => item !== language)
      : [...languages, language];
    form.setValue("languages", next, { shouldValidate: true, shouldDirty: true });
  }

  function toggleSkill(skill: string) {
    const next = skills.includes(skill)
      ? skills.filter((item) => item !== skill)
      : [...skills, skill];
    form.setValue("skills", next, { shouldValidate: true, shouldDirty: true });
  }

  function onSubmit(values: SitterProfileValues) {
    setFormError(null);
    updateProfile.mutate(
      {
        displayName: values.displayName,
        headline: values.headline,
        bio: values.bio,
        city: values.city,
        hourlyRate: values.hourlyRate,
        experienceYears: values.experienceYears,
        languages: values.languages,
        skills: values.skills,
      },
      {
        onSuccess: () => toast.success("Profile updated"),
        onError: (error) => setFormError(getErrorMessage(error)),
      },
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Public profile"
        title="Your sitter profile"
        description="This is what families see when they find you. A warm, specific profile earns more requests."
        actions={
          <Button asChild variant="outline">
            <Link href={`/sitters/${profile.id}`}>Preview public page</Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <Card>
          <CardHeader>
            <CardTitle>Profile details</CardTitle>
            <CardDescription>Changes go live immediately after saving.</CardDescription>
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
                  label="Display name"
                  htmlFor="profile-display-name"
                  error={form.formState.errors.displayName?.message}
                  hint="First name and last initial works well."
                  required
                >
                  <Input
                    id="profile-display-name"
                    autoComplete="name"
                    aria-invalid={Boolean(form.formState.errors.displayName)}
                    {...form.register("displayName")}
                  />
                </FormField>
                <FormField
                  label="City"
                  htmlFor="profile-city"
                  error={form.formState.errors.city?.message}
                  required
                >
                  <Input
                    id="profile-city"
                    list="profile-city-options"
                    autoComplete="address-level2"
                    aria-invalid={Boolean(form.formState.errors.city)}
                    {...form.register("city")}
                  />
                  <datalist id="profile-city-options">
                    {CITIES.map((city) => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                </FormField>
              </div>

              <FormField
                label="Headline"
                htmlFor="profile-headline"
                error={form.formState.errors.headline?.message}
                hint="One line that captures your approach. Max 120 characters."
                required
              >
                <Input
                  id="profile-headline"
                  aria-invalid={Boolean(form.formState.errors.headline)}
                  {...form.register("headline")}
                />
              </FormField>

              <FormField
                label="About you"
                htmlFor="profile-bio"
                error={form.formState.errors.bio?.message}
                hint="Share your experience, favourite ages, and how you keep families updated."
                required
              >
                <Textarea
                  id="profile-bio"
                  rows={6}
                  aria-invalid={Boolean(form.formState.errors.bio)}
                  {...form.register("bio")}
                />
              </FormField>

              <div className="grid gap-3 sm:grid-cols-2">
                <FormField
                  label="Hourly rate (USD)"
                  htmlFor="profile-rate"
                  error={form.formState.errors.hourlyRate?.message}
                  hint="Families see this rate before booking."
                  required
                >
                  <Input
                    id="profile-rate"
                    type="number"
                    min={10}
                    max={150}
                    step={1}
                    inputMode="numeric"
                    aria-invalid={Boolean(form.formState.errors.hourlyRate)}
                    {...form.register("hourlyRate", { valueAsNumber: true })}
                  />
                </FormField>
                <FormField
                  label="Years of experience"
                  htmlFor="profile-experience"
                  error={form.formState.errors.experienceYears?.message}
                  required
                >
                  <Input
                    id="profile-experience"
                    type="number"
                    min={0}
                    max={60}
                    step={1}
                    inputMode="numeric"
                    aria-invalid={Boolean(form.formState.errors.experienceYears)}
                    {...form.register("experienceYears", { valueAsNumber: true })}
                  />
                </FormField>
              </div>

              <fieldset>
                <legend className="text-sm font-medium">Languages</legend>
                <p className="text-muted-foreground mb-2 text-xs">
                  Select every language you can comfortably care in.
                </p>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((language) => {
                    const active = languages.includes(language);
                    return (
                      <button
                        key={language}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleLanguage(language)}
                        className={cn(
                          "focus-visible:ring-ring/50 rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:ring-3 focus-visible:outline-none",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:bg-muted",
                        )}
                      >
                        {language}
                      </button>
                    );
                  })}
                </div>
                {form.formState.errors.languages?.message ? (
                  <p role="alert" className="text-destructive mt-1.5 text-xs font-medium">
                    {form.formState.errors.languages.message}
                  </p>
                ) : null}
              </fieldset>

              <fieldset>
                <legend className="text-sm font-medium">Skills & specialities</legend>
                <p className="text-muted-foreground mb-2 text-xs">
                  Pick the areas where you genuinely shine.
                </p>
                <div className="flex flex-wrap gap-2">
                  {SITTER_SKILLS.map((skill) => {
                    const active = skills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleSkill(skill)}
                        className={cn(
                          "focus-visible:ring-ring/50 rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:ring-3 focus-visible:outline-none",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:bg-muted",
                        )}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
                {form.formState.errors.skills?.message ? (
                  <p role="alert" className="text-destructive mt-1.5 text-xs font-medium">
                    {form.formState.errors.skills.message}
                  </p>
                ) : null}
              </fieldset>

              <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={!form.formState.isDirty || updateProfile.isPending}
                >
                  Discard changes
                </Button>
                <Button type="submit" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                  Save profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <UserAvatar src={profile.photoUrl} name={profile.displayName} className="size-12" />
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-sm font-semibold">
                    {profile.displayName}
                    {profile.verified ? (
                      <BadgeCheck className="text-primary size-3.5" aria-label="Verified sitter" />
                    ) : null}
                  </p>
                  <p className="text-muted-foreground flex items-center gap-1 text-[11px]">
                    <MapPin className="size-3" aria-hidden="true" />
                    {profile.city}
                  </p>
                  <div className="mt-1.5">
                    <StarRating rating={profile.rating} reviewCount={profile.reviewCount} />
                  </div>
                </div>
              </div>

              <p className="mt-3 text-xs leading-relaxed">{profile.headline}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {skills.slice(0, 4).map((skill) => (
                  <span key={skill} className="bg-muted rounded-full px-2 py-0.5 text-[10px]">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-3 text-xs">
                <div>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Wallet className="size-3" aria-hidden="true" />
                    Rate
                  </p>
                  <p className="mt-0.5 font-semibold">{formatCurrency(profile.hourlyRate)}/hr</p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Star className="size-3" aria-hidden="true" />
                    Experience
                  </p>
                  <p className="mt-0.5 font-semibold">{profile.experienceYears} years</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3">
                <span className="text-muted-foreground text-[11px]">Verification</span>
                <VerificationStatusBadge status={profile.verificationStatus} />
              </div>
              <p className="text-muted-foreground mt-3 text-[11px]">
                Joined {formatDate(profile.joinedAt, "MMMM yyyy")} · {profile.completedBookings}{" "}
                completed bookings
              </p>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardContent>
              <p className="text-sm font-semibold">A profile that books</p>
              <ul className="text-muted-foreground mt-1.5 space-y-1.5 text-xs leading-relaxed">
                <li>• Name the ages you&apos;re strongest with.</li>
                <li>• Mention routines you&apos;re confident running.</li>
                <li>• Keep your rate within the local range.</li>
                <li>• Add certifications you actually hold.</li>
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

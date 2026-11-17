"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarCheck,
  Clock,
  GraduationCap,
  Languages,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { SkeletonCardGrid } from "@/components/shared/skeletons";
import { StarRating } from "@/components/shared/star-rating";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useAuth } from "@/hooks/use-auth";
import { useSitter, useSitterAvailability, useSitterReviews } from "@/hooks/use-sitters";
import { DAY_NAMES } from "@/lib/constants";
import { formatCurrency, formatDate, formatRelative, formatTimeRange } from "@/lib/format";

export function SitterProfileView({ sitterId }: { sitterId: string }) {
  const { user } = useAuth();
  const sitterQuery = useSitter(sitterId);
  const reviewsQuery = useSitterReviews(sitterId);
  const availabilityQuery = useSitterAvailability(sitterId);

  const sitter = sitterQuery.data;
  const reviews = reviewsQuery.data ?? [];
  const availability = availabilityQuery.data ?? [];

  if (sitterQuery.isPending) {
    return (
      <div className="container-page py-10">
        <SkeletonCardGrid count={3} />
      </div>
    );
  }

  if (sitterQuery.isError || !sitter) {
    return (
      <div className="container-page py-16">
        <ErrorState
          title="We couldn't load this profile"
          description="This sitter may no longer be available, or the profile failed to load."
          onRetry={() => void sitterQuery.refetch()}
        />
        <div className="mt-6 text-center">
          <Button asChild variant="outline">
            <Link href="/search">
              <ArrowLeft className="size-4" />
              Back to search
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const bookingHref =
    user?.role === "parent"
      ? `/parent/bookings/new?sitter=${sitter.id}`
      : `/login?next=${encodeURIComponent(`/parent/bookings/new?sitter=${sitter.id}`)}`;

  return (
    <div>
      <div className={`h-40 bg-gradient-to-r sm:h-52 ${sitter.coverGradient}`} />

      <div className="container-page -mt-16 pb-16 sm:-mt-20">
        <div className="mb-4">
          <Button asChild variant="secondary" size="sm" className="backdrop-blur">
            <Link href="/search">
              <ArrowLeft className="size-4" />
              Back to search
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-6 ring-1 ring-foreground/10">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <span className="ring-card bg-muted relative size-24 shrink-0 overflow-hidden rounded-2xl ring-4">
                  <Image
                    src={sitter.photoUrl}
                    alt={sitter.displayName}
                    fill
                    sizes="96px"
                    className="object-cover"
                    priority
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                      {sitter.displayName}
                    </h1>
                    {sitter.verified ? (
                      <Badge className="border-emerald-300/60 bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200">
                        <BadgeCheck className="size-3.5" aria-hidden="true" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Verification in progress</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed sm:text-base">
                    {sitter.headline}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                    <StarRating rating={sitter.rating} reviewCount={sitter.reviewCount} size="md" />
                    <span className="text-muted-foreground inline-flex items-center gap-1">
                      <MapPin className="size-3.5" aria-hidden="true" />
                      {sitter.city}
                    </span>
                    <span className="text-muted-foreground inline-flex items-center gap-1">
                      <Clock className="size-3.5" aria-hidden="true" />
                      Replies in ~{sitter.responseTimeHours}h
                    </span>
                    <span className="text-muted-foreground inline-flex items-center gap-1">
                      <CalendarCheck className="size-3.5" aria-hidden="true" />
                      {sitter.completedBookings} bookings completed
                    </span>
                  </div>
                </div>
              </div>

              <Separator className="my-5" />

              <div className="grid grid-cols-3 divide-x text-center">
                <div className="px-2">
                  <p className="font-heading text-xl font-semibold">{sitter.experienceYears} yrs</p>
                  <p className="text-muted-foreground text-[11px]">Experience</p>
                </div>
                <div className="px-2">
                  <p className="font-heading text-xl font-semibold">{sitter.completedBookings}</p>
                  <p className="text-muted-foreground text-[11px]">Bookings</p>
                </div>
                <div className="px-2">
                  <p className="font-heading text-xl font-semibold">{sitter.rating.toFixed(1)}</p>
                  <p className="text-muted-foreground text-[11px]">Rating</p>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>About {sitter.displayName.split(" ")[0]}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-muted-foreground text-sm leading-relaxed">{sitter.bio}</p>

                <div>
                  <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                    <Sparkles className="text-primary size-4" aria-hidden="true" />
                    Skills &amp; specialties
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {sitter.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="font-normal">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                      <Languages className="text-primary size-4" aria-hidden="true" />
                      Languages
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {sitter.languages.join(", ")}
                    </p>
                  </div>
                  <div>
                    <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                      <GraduationCap className="text-primary size-4" aria-hidden="true" />
                      Member since
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {formatDate(sitter.joinedAt, "MMMM yyyy")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly availability</CardTitle>
              </CardHeader>
              <CardContent>
                {availabilityQuery.isPending ? (
                  <div className="space-y-2" aria-busy="true">
                    {[0, 1, 2].map((index) => (
                      <div key={index} className="bg-muted h-8 animate-pulse rounded-md" />
                    ))}
                  </div>
                ) : (
                  <ul className="divide-y">
                    {availability.map((slot) => (
                      <li
                        key={slot.id}
                        className="flex items-center justify-between gap-4 py-2.5 text-sm"
                      >
                        <span className="font-medium">{DAY_NAMES[slot.dayOfWeek]}</span>
                        {slot.isAvailable ? (
                          <span className="text-muted-foreground">
                            {formatTimeRange(slot.startTime, slot.endTime)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/70 text-xs">Not available</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-muted-foreground mt-3 text-xs">
                  Availability is a guide — message {sitter.displayName.split(" ")[0]} to arrange
                  something outside these hours.
                </p>
              </CardContent>
            </Card>

            <section aria-labelledby="reviews-heading">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h2 id="reviews-heading" className="text-xl font-semibold">
                    Reviews from families
                  </h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {sitter.reviewCount} verified reviews · {sitter.rating.toFixed(1)} average
                  </p>
                </div>
                <StarRating rating={sitter.rating} size="md" showValue={false} />
              </div>

              {reviewsQuery.isPending ? (
                <div className="space-y-3" aria-busy="true">
                  {[0, 1].map((index) => (
                    <div key={index} className="bg-muted h-28 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : reviewsQuery.isError ? (
                <ErrorState
                  compact
                  title="Reviews didn't load"
                  onRetry={() => void reviewsQuery.refetch()}
                />
              ) : reviews.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="No reviews yet"
                  description="Be the first family to share how care went."
                />
              ) : (
                <ul className="space-y-3">
                  {reviews.map((review) => (
                    <li key={review.id} className="bg-card rounded-xl p-4 ring-1 ring-foreground/10">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            src={review.parentAvatarUrl}
                            name={review.parentName}
                            className="size-8"
                          />
                          <div>
                            <p className="text-sm font-semibold">{review.parentName}</p>
                            <p className="text-muted-foreground text-[11px]">
                              {formatRelative(review.createdAt)}
                            </p>
                          </div>
                        </div>
                        <StarRating rating={review.rating} showValue={false} />
                      </div>
                      <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                        {review.comment}
                      </p>
                      {review.response ? (
                        <div className="bg-muted/60 mt-3 rounded-lg p-3">
                          <p className="text-xs font-semibold">
                            {sitter.displayName.split(" ")[0]}&apos;s response
                          </p>
                          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                            {review.response}
                          </p>
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="lg:sticky lg:top-24">
            <Card className="gap-4">
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold tracking-tight">
                    {formatCurrency(sitter.hourlyRate)}
                  </span>
                  <span className="text-muted-foreground text-sm">/ hour</span>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  An 8% service fee is added at checkout. No hidden costs.
                </p>

                <div className="mt-4 space-y-2">
                  <Button asChild className="w-full" size="lg">
                    <Link href={bookingHref}>
                      {user?.role === "parent" ? "Request this sitter" : "Sign in to book"}
                    </Link>
                  </Button>
                  {user?.role === "parent" ? (
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/parent/messages">
                        <MessageSquare className="size-4" />
                        Message first
                      </Link>
                    </Button>
                  ) : null}
                </div>

                <Separator className="my-4" />

                <ul className="space-y-2.5 text-xs">
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="text-primary mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                    <span className="text-muted-foreground">
                      {sitter.verified
                        ? "Identity and background check complete."
                        : "Identity and background check still in progress."}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="text-primary mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                    <span className="text-muted-foreground">
                      {sitter.reviewCount} verified reviews from booked families.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CalendarCheck
                      className="text-primary mt-0.5 size-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-muted-foreground">
                      Free cancellation up to 24 hours before care.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </aside>
        </div>

        <div className="mt-12">
          <SectionHeading
            align="left"
            eyebrow="Keep looking"
            title="Other sitters you might like"
            description="Every profile is reviewed by our safety team before it goes live."
          />
          <div className="mt-5">
            <Button asChild variant="outline">
              <Link href="/search">Browse all sitters</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

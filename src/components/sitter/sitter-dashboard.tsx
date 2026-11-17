"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  Inbox,
  Star,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { BookingCard } from "@/components/bookings/booking-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/skeletons";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useSitterProfile, useSitterSummary } from "@/hooks/use-sitters";
import { formatCurrency, formatDate } from "@/lib/format";

export function SitterDashboard() {
  const { user } = useAuth();
  const summaryQuery = useSitterSummary();
  const profileQuery = useSitterProfile();

  if (summaryQuery.isPending || profileQuery.isPending) return <PageSkeleton />;

  if (summaryQuery.isError || !summaryQuery.data || profileQuery.isError || !profileQuery.data) {
    return (
      <div>
        <PageHeader title="Your sitter dashboard" />
        <ErrorState
          title="We couldn't load your dashboard"
          description="Your bookings, earnings, and profile may be temporarily unavailable."
          onRetry={() => {
            void summaryQuery.refetch();
            void profileQuery.refetch();
          }}
        />
      </div>
    );
  }

  const summary = summaryQuery.data;
  const profile = profileQuery.data;
  const maxEarning = Math.max(...summary.weeklyEarnings.map((day) => day.amount), 1);

  return (
    <div>
      <PageHeader
        eyebrow={formatDate(new Date(), "EEEE, MMMM d")}
        title={`Hello, ${user?.firstName ?? profile.displayName.split(" ")[0]}`}
        description="Here's how your week of care is shaping up."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/sitter/schedule">
                <Clock className="size-4" />
                Edit availability
              </Link>
            </Button>
            <Button asChild>
              <Link href="/sitter/requests">
                <Inbox className="size-4" />
                {summary.pendingRequests.length} new{" "}
                {summary.pendingRequests.length === 1 ? "request" : "requests"}
              </Link>
            </Button>
          </>
        }
      />

      {profile.verificationStatus !== "verified" ? (
        <div className="border-amber-300/60 bg-amber-50 dark:bg-amber-500/10 mb-6 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <BadgeCheck className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">
                {profile.verificationStatus === "rejected"
                  ? "Your verification needs attention"
                  : "Finish verification to get discovered"}
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                Verified sitters appear higher in search and can accept more bookings.
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="shrink-0">
            <Link href="/sitter/verification">Review documents</Link>
          </Button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="This month"
          value={formatCurrency(summary.earningsThisMonth)}
          icon={Wallet}
          hint="After platform commission"
          trend="up"
        />
        <StatCard
          label="Pending payout"
          value={formatCurrency(summary.pendingPayout)}
          icon={TrendingUp}
          hint="Releases on the next payout run"
        />
        <StatCard
          label="Completed bookings"
          value={String(summary.completedBookings)}
          icon={CheckCircle2}
          hint="Lifetime care visits"
        />
        <StatCard
          label="Rating"
          value={`${summary.rating.toFixed(1)} / 5`}
          icon={Star}
          hint={`${summary.reviewCount} reviews`}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>New requests</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/sitter/requests">
                View all
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {summary.pendingRequests.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No pending requests"
                description="Keep your availability current and your profile fresh — families are searching every day."
                action={
                  <Button asChild variant="outline">
                    <Link href="/sitter/schedule">Update availability</Link>
                  </Button>
                }
                className="py-8"
              />
            ) : (
              <div className="space-y-3">
                {summary.pendingRequests.slice(0, 2).map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    perspective="sitter"
                    href={`/sitter/requests/${booking.id}`}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>This week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-32 items-end justify-between gap-2" role="img" aria-label="Weekly earnings chart">
                {summary.weeklyEarnings.map((day) => (
                  <div key={day.day} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-muted-foreground text-[10px]">
                      {day.amount > 0 ? `$${Math.round(day.amount)}` : ""}
                    </span>
                    <div
                      className="bg-primary/80 w-full rounded-t-md"
                      style={{ height: `${Math.max((day.amount / maxEarning) * 88, 4)}px` }}
                    />
                    <span className="text-muted-foreground text-[10px]">{day.day}</span>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground mt-3 text-xs">
                {formatCurrency(summary.weeklyEarnings.reduce((sum, day) => sum + day.amount, 0))}{" "}
                earned this week
              </p>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardContent className="space-y-2 text-sm">
              <p className="flex items-center gap-2 font-semibold">
                <Eye className="text-primary size-4" aria-hidden="true" />
                {summary.profileViews} profile views
              </p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Profiles with a complete bio, photo, and verified badge get up to 3× more requests.
              </p>
              <Button asChild variant="link" size="sm" className="h-auto px-0 text-xs">
                <Link href="/sitter/profile">Polish your profile</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <section className="mt-8" aria-labelledby="upcoming-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 id="upcoming-heading" className="text-lg font-semibold">
              Upcoming care
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Confirmed bookings on your calendar.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="shrink-0">
            <Link href="/sitter/requests">
              All bookings
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        {summary.upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No upcoming bookings"
            description="Once a family books you, confirmed care will appear here."
          />
        ) : (
          <div className="grid gap-3 xl:grid-cols-2">
            {summary.upcoming.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                perspective="sitter"
                href={`/sitter/requests/${booking.id}`}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

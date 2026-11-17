"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  MessageSquare,
  Plus,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { BookingCard } from "@/components/bookings/booking-card";
import { SitterCard } from "@/components/sitters/sitter-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/skeletons";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useParentSummary } from "@/hooks/use-parent";
import { formatCurrency, formatDate } from "@/lib/format";

export function ParentDashboard() {
  const { user } = useAuth();
  const { data, isPending, isError, refetch } = useParentSummary();

  if (isPending) return <PageSkeleton />;

  if (isError || !data) {
    return (
      <div>
        <PageHeader title="Your family dashboard" />
        <ErrorState
          title="We couldn't load your dashboard"
          description="Your bookings and family details didn't come through."
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  const nextBooking = data.upcoming[0];

  return (
    <div>
      <PageHeader
        eyebrow={formatDate(new Date(), "EEEE, MMMM d")}
        title={`Hello, ${user?.firstName ?? "there"}`}
        description="Here's what's happening with your family's care."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/parent/children">
                <Plus className="size-4" />
                Add a child
              </Link>
            </Button>
            <Button asChild>
              <Link href="/parent/bookings/new">
                <CalendarPlus className="size-4" />
                Book a sitter
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Upcoming bookings"
          value={String(data.upcoming.length)}
          icon={CalendarDays}
          hint={nextBooking ? `Next ${formatDate(nextBooking.date, "MMM d")}` : "Nothing on the calendar"}
        />
        <StatCard
          label="Children"
          value={String(data.activeChildren)}
          icon={Users}
          hint="Profiles with care notes"
        />
        <StatCard
          label="Unread messages"
          value={String(data.unreadMessages)}
          icon={MessageSquare}
          hint={data.unreadMessages > 0 ? "Your sitter is waiting" : "All caught up"}
        />
        <StatCard
          label="Total spent"
          value={formatCurrency(data.totalSpent)}
          icon={Wallet}
          hint="Across all completed bookings"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Next up</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/parent/bookings">
                All bookings
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {nextBooking ? (
              <div className="space-y-4">
                <BookingCard
                  booking={nextBooking}
                  perspective="parent"
                  href={`/parent/bookings/${nextBooking.id}`}
                />
                <div className="bg-accent/50 rounded-xl p-4">
                  <p className="flex items-center gap-1.5 text-sm font-semibold">
                    <Sparkles className="text-primary size-4" aria-hidden="true" />
                    Before the sitter arrives
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                    Update care notes for {nextBooking.childNames.join(" & ")}, leave emergency
                    contacts visible, and keep any medications in a known spot.
                  </p>
                  <Button asChild variant="link" size="sm" className="mt-1 h-auto px-0 text-xs">
                    <Link href={`/parent/bookings/${nextBooking.id}`}>Review booking details</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={CalendarPlus}
                title="No upcoming bookings"
                description="Find a trusted sitter for your next date night, workday, or overnight."
                action={
                  <Button asChild>
                    <Link href="/search">Find a sitter</Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your children</CardTitle>
          </CardHeader>
          <CardContent>
            {data.activeChildren === 0 ? (
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Add a child profile so sitters know routines, allergies, and the little details
                  that matter.
                </p>
                <Button asChild className="w-full">
                  <Link href="/parent/children">
                    <Plus className="size-4" />
                    Add your first child
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {data.activeChildren} {data.activeChildren === 1 ? "profile" : "profiles"} ready for
                  your next booking.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/parent/children">Manage children</Link>
                </Button>
              </div>
            )}

            <div className="mt-4 border-t pt-4">
              <p className="text-sm font-semibold">Quick actions</p>
              <div className="mt-2 grid gap-1.5">
                {[
                  { label: "Messages", href: "/parent/messages", icon: MessageSquare },
                  { label: "Payments & receipts", href: "/parent/payments", icon: Wallet },
                  { label: "Account settings", href: "/parent/settings", icon: Users },
                ].map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="hover:bg-muted flex items-center justify-between rounded-lg px-2.5 py-2 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <action.icon className="text-muted-foreground size-4" aria-hidden="true" />
                      {action.label}
                    </span>
                    <ArrowRight className="text-muted-foreground size-3.5" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="mt-8" aria-labelledby="recommended-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 id="recommended-heading" className="text-lg font-semibold">
              Recommended for your family
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Highly rated sitters near you, based on your past bookings.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="shrink-0">
            <Link href="/search">
              See all
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
        {data.recommendedSitters.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No recommendations yet"
            description="Book your first sitter and we'll start suggesting great matches."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.recommendedSitters.slice(0, 3).map((sitter) => (
              <SitterCard key={sitter.id} sitter={sitter} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

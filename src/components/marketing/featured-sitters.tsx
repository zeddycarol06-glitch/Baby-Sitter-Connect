"use client";

import Link from "next/link";
import { ArrowRight, SearchX } from "lucide-react";
import { SitterCard } from "@/components/sitters/sitter-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { SkeletonCardGrid } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { useFeaturedSitters } from "@/hooks/use-sitters";

export function FeaturedSitters() {
  const { data, isPending, isError, refetch } = useFeaturedSitters();

  return (
    <section className="bg-muted/30 border-y py-16 sm:py-20">
      <div className="container-page">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-brand-terracotta text-xs font-semibold tracking-[0.16em] uppercase">
              Meet a few favourites
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-balance sm:text-4xl">
              Sitters families keep coming back to
            </h2>
            <p className="text-muted-foreground mt-3 text-base leading-relaxed">
              Verified, reviewed, and ready for your next date night, workday, or overnight.
            </p>
          </div>
          <Button asChild variant="outline" className="shrink-0">
            <Link href="/search">
              Browse all sitters
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-8">
          {isPending ? <SkeletonCardGrid count={4} /> : null}
          {isError ? (
            <ErrorState
              title="We couldn't load sitters"
              description="The sitter list didn't come through. Check your connection and try again."
              onRetry={() => void refetch()}
            />
          ) : null}
          {data && data.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No sitters to show yet"
              description="New sitters are joining every week. Try searching your area in the meantime."
              action={
                <Button asChild>
                  <Link href="/search">Search sitters</Link>
                </Button>
              }
            />
          ) : null}
          {data && data.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {data.slice(0, 4).map((sitter) => (
                <SitterCard key={sitter.id} sitter={sitter} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

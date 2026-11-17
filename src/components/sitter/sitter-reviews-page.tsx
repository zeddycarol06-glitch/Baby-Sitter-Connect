"use client";

import { useMemo, useState } from "react";
import { Loader2, MessageSquareQuote, Star, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/skeletons";
import { StarRating } from "@/components/shared/star-rating";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useReviews, useRespondToReview } from "@/hooks/use-reviews";
import { useSitterProfile, useSitterSummary } from "@/hooks/use-sitters";
import { getErrorMessage } from "@/lib/api/client";
import { formatDate } from "@/lib/format";
import type { Review } from "@/types";
import { cn } from "@/lib/utils";

type Filter = "all" | "awaiting";

export function SitterReviewsPageContent() {
  const reviewsQuery = useReviews();
  const profileQuery = useSitterProfile();
  const summaryQuery = useSitterSummary();
  const [filter, setFilter] = useState<Filter>("all");
  const [replyingTo, setReplyingTo] = useState<Review | null>(null);

  const reviews = useMemo(() => reviewsQuery.data ?? [], [reviewsQuery.data]);

  const distribution = useMemo(() => {
    return [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: reviews.filter((review) => review.rating === rating).length,
    }));
  }, [reviews]);

  const awaiting = reviews.filter((review) => !review.response).length;
  const visible = filter === "awaiting" ? reviews.filter((review) => !review.response) : reviews;

  if (reviewsQuery.isPending || profileQuery.isPending || summaryQuery.isPending) {
    return <PageSkeleton />;
  }

  if (reviewsQuery.isError || profileQuery.isError || summaryQuery.isError || !profileQuery.data) {
    return (
      <div>
        <PageHeader title="Reviews" />
        <ErrorState
          title="Reviews didn't load"
          description="We couldn't retrieve the feedback families left for you."
          onRetry={() => {
            void reviewsQuery.refetch();
            void profileQuery.refetch();
            void summaryQuery.refetch();
          }}
        />
      </div>
    );
  }

  const profile = profileQuery.data;
  const summary = summaryQuery.data;
  const maxCount = Math.max(...distribution.map((item) => item.count), 1);
  const responded = reviews.filter((review) => review.response).length;

  return (
    <div>
      <PageHeader
        eyebrow="Reputation"
        title="Reviews"
        description="Every review is a chance to show families how you care. Replying builds trust and lifts your ranking."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Overall rating
            </p>
            <div className="mt-1.5 flex items-end gap-2">
              <span className="font-heading text-3xl font-semibold">{profile.rating.toFixed(1)}</span>
              <span className="text-muted-foreground mb-1 text-xs">/ 5</span>
            </div>
            <StarRating rating={profile.rating} showValue={false} className="mt-1" />
            <p className="text-muted-foreground mt-1 text-xs">
              {summary.reviewCount} reviews received
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Five-star reviews
            </p>
            <p className="mt-1.5 text-3xl font-semibold">
              {reviews.filter((review) => review.rating === 5).length}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {reviews.length > 0
                ? `${Math.round((reviews.filter((review) => review.rating === 5).length / reviews.length) * 100)}% of all reviews`
                : "No reviews yet"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Awaiting a reply
            </p>
            <p className="mt-1.5 text-3xl font-semibold">{awaiting}</p>
            <p className="text-muted-foreground mt-1 text-xs">
              {awaiting === 0 ? "You're all caught up" : "A short reply goes a long way"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Response rate
            </p>
            <p className="mt-1.5 text-3xl font-semibold">
              {reviews.length === 0 ? "—" : `${Math.round((responded / reviews.length) * 100)}%`}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              Sitters who reply get repeat bookings
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_18rem] lg:items-start">
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="bg-muted inline-flex rounded-lg p-1" role="tablist" aria-label="Filter reviews">
              {(
                [
                  { value: "all", label: `All (${reviews.length})` },
                  { value: "awaiting", label: `Awaiting reply (${awaiting})` },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="tab"
                  aria-selected={filter === option.value}
                  onClick={() => setFilter(option.value)}
                  className={cn(
                    "focus-visible:ring-ring/50 rounded-md px-3 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
                    filter === option.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-muted-foreground text-xs">
              {visible.length} {visible.length === 1 ? "review" : "reviews"}
            </p>
          </div>

          {visible.length === 0 ? (
            <EmptyState
              icon={Star}
              title={filter === "awaiting" ? "No reviews awaiting a reply" : "No reviews yet"}
              description={
                filter === "awaiting"
                  ? "You've replied to every review. Nice work building relationships."
                  : "Complete your first booking and ask the family for honest feedback. Reviews appear here."
              }
              action={
                filter === "awaiting" ? (
                  <Button variant="outline" onClick={() => setFilter("all")}>
                    View all reviews
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-4">
              {visible.map((review) => (
                <article
                  key={review.id}
                  className="bg-card rounded-xl p-4 ring-1 ring-foreground/10 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        src={review.parentAvatarUrl}
                        name={review.parentName}
                        className="size-10"
                      />
                      <div>
                        <p className="text-sm font-semibold">{review.parentName}</p>
                        <p className="text-muted-foreground text-[11px]">
                          {formatDate(review.createdAt, "MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <StarRating rating={review.rating} showValue={false} />
                  </div>

                  <p className="mt-3 text-sm leading-relaxed">{review.comment}</p>

                  {review.response ? (
                    <div className="bg-muted/60 mt-3 rounded-lg border-l-2 border-primary/50 p-3">
                      <p className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase">
                        <MessageSquareQuote className="size-3" aria-hidden="true" />
                        Your reply
                      </p>
                      <p className="mt-1 text-xs leading-relaxed">{review.response}</p>
                    </div>
                  ) : (
                    <div className="mt-3 flex justify-end">
                      <Button variant="outline" size="sm" onClick={() => setReplyingTo(review)}>
                        <ThumbsUp className="size-3.5" />
                        Reply publicly
                      </Button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rating breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {distribution.map((item) => (
                <div key={item.rating} className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground w-3 text-right">{item.rating}</span>
                  <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                  <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                    <div
                      className="bg-amber-400 h-full rounded-full"
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-muted-foreground w-5 text-right">{item.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card size="sm">
            <CardContent>
              <p className="text-sm font-semibold">How to reply well</p>
              <ul className="text-muted-foreground mt-1.5 space-y-1.5 text-xs leading-relaxed">
                <li>• Thank the family by name.</li>
                <li>• Mention a specific moment from the booking.</li>
                <li>• Keep it warm and brief — two or three sentences.</li>
                <li>• For criticism, acknowledge it and stay professional.</li>
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>

      {replyingTo ? (
        <ReplyDialog
          key={replyingTo.id}
          review={replyingTo}
          open={Boolean(replyingTo)}
          onOpenChange={(open) => {
            if (!open) setReplyingTo(null);
          }}
        />
      ) : null}
    </div>
  );
}

function ReplyDialog({
  review,
  open,
  onOpenChange,
}: {
  review: Review;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const respond = useRespondToReview();
  const [response, setResponse] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    if (response.trim().length < 10) {
      setError("Write at least 10 characters.");
      return;
    }
    respond.mutate(
      { id: review.id, response },
      {
        onSuccess: () => {
          toast.success("Reply published");
          onOpenChange(false);
        },
        onError: (mutationError) => setError(getErrorMessage(mutationError)),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reply to {review.parentName}</DialogTitle>
          <DialogDescription>
            Your reply appears publicly under the review on your profile.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/60 rounded-lg p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold">{review.parentName}</span>
            <StarRating rating={review.rating} showValue={false} />
          </div>
          <p className="mt-1.5 text-xs leading-relaxed">{review.comment}</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="review-response" className="text-sm font-medium">
            Your public reply
          </label>
          <Textarea
            id="review-response"
            rows={4}
            value={response}
            aria-invalid={Boolean(error)}
            onChange={(event) => {
              setResponse(event.target.value);
              setError(null);
            }}
            placeholder="Thank you so much — it was a joy spending the afternoon with…"
          />
          <p className="text-muted-foreground text-xs">{response.length}/500 characters</p>
        </div>

        {error ? (
          <p role="alert" className="text-destructive text-sm font-medium">
            {error}
          </p>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={respond.isPending}>
            {respond.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Publish reply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

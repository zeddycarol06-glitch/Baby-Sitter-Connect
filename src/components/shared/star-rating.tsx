import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
  showValue?: boolean;
  className?: string;
}

export function StarRating({ rating, reviewCount, size = "sm", showValue = true, className }: StarRatingProps) {
  const rounded = Math.round(rating);
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className="flex items-center gap-0.5"
        role="img"
        aria-label={`Rated ${rating.toFixed(1)} out of 5${reviewCount ? ` from ${reviewCount} reviews` : ""}`}
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={cn(
              size === "sm" ? "size-3.5" : "size-4",
              index < rounded
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30 fill-transparent",
            )}
            aria-hidden="true"
          />
        ))}
      </span>
      {showValue ? (
        <span className={cn("font-medium", size === "sm" ? "text-xs" : "text-sm")}>
          {rating.toFixed(1)}
          {reviewCount !== undefined ? (
            <span className="text-muted-foreground font-normal"> ({reviewCount})</span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  error?: boolean;
}

export function StarRatingInput({ value, onChange, error }: StarRatingInputProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Your rating"
      className={cn("flex gap-1", error && "rounded-md ring-1 ring-destructive/40 p-1")}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
          onClick={() => onChange(star)}
          className="focus-visible:ring-ring/50 rounded-md p-0.5 focus-visible:ring-3 focus-visible:outline-none"
        >
          <Star
            className={cn(
              "size-7 transition-colors",
              star <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30 fill-transparent",
            )}
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  );
}

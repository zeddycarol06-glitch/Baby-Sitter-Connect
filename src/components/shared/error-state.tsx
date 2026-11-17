"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

export function ErrorState({
  title = "Something didn't load",
  description = "We hit a snag while loading this section. Please try again.",
  onRetry,
  className,
  compact = false,
}: ErrorStateProps) {
  const { status } = useAuth();
  const signedOut = status === "unauthenticated";
  return (
    <div
      role="alert"
      className={cn(
        "border-destructive/20 bg-destructive/5 flex flex-col items-center justify-center gap-2 rounded-xl border px-6 py-10 text-center",
        compact && "py-6",
        className,
      )}
    >
      <AlertTriangle className="text-destructive size-5" aria-hidden="true" />
      <h2 className="text-sm font-semibold">{signedOut ? "Your session expired" : title}</h2>
      <p className="text-muted-foreground max-w-md text-sm">
        {signedOut ? "Sign in again to pick up where you left off." : description}
      </p>
      {onRetry && !signedOut ? (
        <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
          <RefreshCw className="size-3.5" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}

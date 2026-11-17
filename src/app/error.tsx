"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="bg-muted/20 flex min-h-dvh flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <span className="bg-destructive/10 text-destructive mx-auto flex size-12 items-center justify-center rounded-full">
          <AlertTriangle className="size-5" aria-hidden="true" />
        </span>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="text-muted-foreground mx-auto mt-3 max-w-md text-sm leading-relaxed">
          We hit an unexpected snag while rendering this page. Your data is safe — try again, or head
          back home.
        </p>
        {error.digest ? (
          <p className="text-muted-foreground mt-2 font-mono text-[11px]">Reference: {error.digest}</p>
        ) : null}

        <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
          <Button onClick={reset}>
            <RefreshCw className="size-4" />
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="size-4" />
              Back home
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

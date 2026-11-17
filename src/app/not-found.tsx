import Link from "next/link";
import { Compass, Home, Search } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="bg-muted/20 flex min-h-dvh flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          This page wandered off
        </h1>
        <p className="text-muted-foreground mx-auto mt-3 max-w-md text-sm leading-relaxed">
          The page you&apos;re looking for may have moved, or the link might be out of date. Let&apos;s get you
          back to something useful.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
          <Button asChild>
            <Link href="/">
              <Home className="size-4" />
              Back home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search">
              <Search className="size-4" />
              Find a sitter
            </Link>
          </Button>
        </div>

        <div className="text-muted-foreground mt-10 flex items-center justify-center gap-2 text-xs">
          <Compass className="size-3.5" aria-hidden="true" />
          Looking for your dashboard? Sign in and we&apos;ll take you there.
        </div>
      </div>
    </main>
  );
}

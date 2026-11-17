"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_HOME } from "@/lib/constants";
import type { Role } from "@/types";
import type { ReactNode } from "react";

export function RoleGuard({ role, children }: { role: Role; children: ReactNode }) {
  const { user, status } = useAuth();
  const router = useRouter();
  const shouldRedirect = status === "unauthenticated" || (user !== null && user.role !== role);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (user && user.role !== role) {
      router.replace(ROLE_HOME[user.role]);
    }
  }, [status, user, role, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center" aria-busy="true">
        <div className="w-full max-w-md space-y-4 px-6">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-32 w-full" />
        </div>
        <span className="sr-only">Checking your session…</span>
      </div>
    );
  }

  if (shouldRedirect) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <ShieldAlert className="text-muted-foreground size-8" aria-hidden="true" />
        <div>
          <h1 className="text-xl font-semibold">This area is for {role}s</h1>
          <p className="text-muted-foreground mt-1 text-sm">Taking you to the right place…</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}

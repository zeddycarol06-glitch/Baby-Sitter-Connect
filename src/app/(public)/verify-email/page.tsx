import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthShell } from "@/components/layout/auth-shell";
import { VerifyEmailContent } from "@/components/auth/verify-email-content";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Verify your email",
  description: "Confirm your email address to finish setting up your account.",
};

export default function VerifyEmailPage() {
  return (
    <AuthShell
      title="One last step"
      description="We just need to confirm your email address before you start using BabySitter Connect."
    >
      <Suspense
        fallback={
          <div className="space-y-4" aria-busy="true">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </AuthShell>
  );
}

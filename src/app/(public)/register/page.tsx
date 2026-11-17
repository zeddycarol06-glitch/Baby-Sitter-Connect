import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/layout/auth-shell";
import { RegisterFormQuery } from "@/components/forms/register-form-query";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Join BabySitter Connect as a parent or a babysitter.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Whether you need care or want to offer it, it starts with a profile you can trust."
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/login" className="text-brand-terracotta font-medium hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <Suspense
        fallback={
          <div className="space-y-4" aria-busy="true">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        }
      >
        <RegisterFormQuery />
      </Suspense>
    </AuthShell>
  );
}

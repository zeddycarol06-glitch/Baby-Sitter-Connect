"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/schemas/auth";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    toast.success(`Reset link sent to ${values.email}`);
    setSent(true);
    setSubmitting(false);
  }

  if (sent) {
    return (
      <div className="space-y-5">
        <div className="border-primary/20 bg-primary/5 flex items-start gap-3 rounded-xl border p-4">
          <CheckCircle2 className="text-primary mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold">Check your inbox</p>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              If an account exists for that email, we&apos;ve sent a password reset link. It expires
              in 30 minutes.
            </p>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
          In this demo no email is actually sent. You can{" "}
          <Link href="/reset-password" className="text-primary font-medium hover:underline">
            open the reset screen
          </Link>{" "}
          directly.
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="text-muted-foreground flex items-start gap-2.5 rounded-lg bg-muted/60 p-3 text-xs leading-relaxed">
        <Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Enter the email associated with your account and we&apos;ll send a secure reset link.
      </div>
      <FormField label="Email address" htmlFor="forgot-email" error={form.formState.errors.email?.message} required>
        <Input
          id="forgot-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(form.formState.errors.email)}
          {...form.register("email")}
        />
      </FormField>
      <Button type="submit" className="w-full" size="lg" disabled={submitting}>
        {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
        {submitting ? "Sending…" : "Send reset link"}
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        Remembered it?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

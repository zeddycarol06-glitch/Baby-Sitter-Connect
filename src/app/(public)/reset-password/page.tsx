import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/layout/auth-shell";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";

export const metadata: Metadata = {
  title: "Set a new password",
  description: "Choose a new password for your BabySitter Connect account.",
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Set a new password"
      description="Choose something strong and memorable. You'll use it the next time you sign in."
      footer={
        <p>
          Having trouble?{" "}
          <Link href="/forgot-password" className="text-primary font-medium hover:underline">
            Request another link
          </Link>
        </p>
      }
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/layout/auth-shell";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Request a secure link to reset your BabySitter Connect password.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      description="It happens to everyone. We'll help you get back into your account securely."
      footer={
        <p>
          Need a hand?{" "}
          <Link href="/#faq" className="text-primary font-medium hover:underline">
            Visit the help centre
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}

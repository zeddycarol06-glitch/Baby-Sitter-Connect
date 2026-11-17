"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, MailCheck, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [sending, setSending] = useState(false);

  async function resend() {
    setSending(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setSending(false);
    toast.success("Verification email sent again");
  }

  return (
    <div className="space-y-6">
      <div className="border-primary/20 bg-primary/5 flex items-start gap-3 rounded-xl border p-4">
        <MailCheck className="text-primary mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold">Check your inbox</p>
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
            We sent a verification link
            {email ? (
              <>
                {" "}
                to <span className="text-foreground font-medium">{email}</span>
              </>
            ) : null}
            . Click it to activate your account. The link expires in 24 hours.
          </p>
        </div>
      </div>

      <ul className="text-muted-foreground space-y-3 text-sm">
        <li className="flex gap-2.5">
          <CheckCircle2 className="text-primary mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Can&apos;t find it? Check your spam or promotions folder.
        </li>
        <li className="flex gap-2.5">
          <CheckCircle2 className="text-primary mt-0.5 size-4 shrink-0" aria-hidden="true" />
          In this demo, email delivery is mocked — no message is actually sent.
        </li>
      </ul>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button onClick={() => void resend()} disabled={sending} className="flex-1">
          {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          {sending ? "Sending…" : "Resend email"}
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    </div>
  );
}

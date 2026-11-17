import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "@/components/layout/logo";

const highlights = [
  {
    icon: ShieldCheck,
    title: "Verified sitters",
    description: "ID checks and background screening before a profile goes live.",
  },
  {
    icon: HeartHandshake,
    title: "Built for real families",
    description: "Clear profiles, honest reviews, and children's needs front and centre.",
  },
  {
    icon: Sparkles,
    title: "Calm from start to finish",
    description: "Transparent pricing and secure payments — no surprises.",
  },
];

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="bg-brand-cream flex min-h-dvh flex-col">
      <div className="bg-brand-green text-white">
        <div className="container-page flex h-16 items-center justify-between">
          <Link
            href="/"
            className="text-white/90 hover:text-white inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back home
          </Link>
          <Logo tone="brand" classNameText="text-brand-terracotta" />
        </div>
      </div>

      <div className="container-page grid flex-1 items-center gap-12 py-10 sm:py-14 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:py-16">
        <div className="hidden lg:block">
          <p className="text-brand-terracotta text-xs font-semibold tracking-[0.18em] uppercase">
            Your village starts here
          </p>
          <h2 className="font-heading text-brand-ink mt-3 max-w-lg text-4xl leading-[1.06] font-semibold text-balance xl:text-5xl">
            Big love for your little ones — starting with people you trust.
          </h2>
          <p className="text-brand-muted mt-4 max-w-md text-base leading-relaxed">
            Join a neighbourhood of families and sitters who plan dates, work late, and make room for
            what matters most.
          </p>

          <div className="mt-9 space-y-5">
            {highlights.map((item) => (
              <div key={item.title} className="flex gap-3">
                <span className="bg-brand-green-soft text-brand-green-dark flex size-9 shrink-0 items-center justify-center rounded-full">
                  <item.icon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-brand-ink text-sm font-semibold">{item.title}</p>
                  <p className="text-brand-muted text-xs leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <figure className="bg-card mt-10 max-w-md rounded-2xl border border-border p-5 shadow-[0_18px_40px_-30px_rgba(31,26,22,0.5)]">
            <blockquote className="font-heading text-brand-ink text-lg leading-snug">
              &ldquo;The profile gave me everything I needed to feel confident leaving my daughter
              with someone new.&rdquo;
            </blockquote>
            <figcaption className="text-brand-muted mt-3 text-xs">
              Hannah B. · parent in Seattle
            </figcaption>
          </figure>
        </div>

        <div className="mx-auto w-full max-w-md lg:max-w-none">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-[0_24px_60px_-40px_rgba(31,26,22,0.6)] sm:p-8">
            <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{description}</p>
            <div className="mt-6">{children}</div>
            {footer ? <div className="text-muted-foreground mt-6 text-sm">{footer}</div> : null}
          </div>
          <p className="text-muted-foreground mt-6 text-center text-xs">
            © {new Date().getFullYear()} BabySitter Connect · Demo environment
          </p>
        </div>
      </div>
    </div>
  );
}

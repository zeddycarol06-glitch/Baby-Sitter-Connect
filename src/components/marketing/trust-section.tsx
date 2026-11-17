import Link from "next/link";
import {
  BadgeCheck,
  CreditCard,
  FileCheck2,
  HeartHandshake,
  Lock,
  MessageCircle,
  ShieldCheck,
  Star,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const checks = [
  {
    icon: UserCheck,
    title: "Identity verification",
    description:
      "Government-issued ID is checked before a sitter profile goes live, so you always know who's arriving.",
  },
  {
    icon: FileCheck2,
    title: "Background screening",
    description:
      "Criminal background checks are reviewed by our safety team, with re-checks on a rolling basis.",
  },
  {
    icon: HeartHandshake,
    title: "Reference & experience review",
    description:
      "We look at childcare experience, certifications, and references — not just a friendly photo.",
  },
  {
    icon: CreditCard,
    title: "Secure, cash-free payments",
    description:
      "Payments are held safely and released after care. Refunds and cancellations follow clear rules.",
  },
  {
    icon: MessageCircle,
    title: "Messaging built in",
    description:
      "Share routines, allergies, and last-minute changes without handing out your phone number.",
  },
  {
    icon: ShieldCheck,
    title: "Real human support",
    description:
      "Our trust & safety team is on call for urgent issues, disputes, and anything that feels off.",
  },
];

export function TrustSection() {
  return (
    <section id="trust" className="container-page scroll-mt-20 py-16 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-brand-terracotta text-xs font-semibold tracking-[0.16em] uppercase">
            Trust &amp; safety
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-balance sm:text-4xl">
            Peace of mind is part of the service
          </h2>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">
            Leaving your child with someone new takes courage. We built every layer of BabySitter
            Connect to earn that trust — clearly, calmly, and consistently.
          </p>

          <div className="bg-brand-green-soft mt-6 rounded-2xl p-5">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Lock className="text-brand-green-dark size-4" aria-hidden="true" />
              Your data stays yours
            </p>
            <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
              Addresses and phone numbers are only shared with a sitter after a booking is accepted.
              We never sell family data.
            </p>
          </div>

          <Button
            asChild
            size="lg"
            className="mt-6 h-11 rounded-full bg-brand-terracotta px-6 text-white hover:bg-brand-terracotta-dark"
          >
            <Link href="/search">
              Explore verified sitters
              <BadgeCheck className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {checks.map((check) => (
            <div key={check.title} className="bg-card rounded-xl p-5 ring-1 ring-foreground/10">
              <span className="bg-brand-green-soft text-brand-green-dark flex size-9 items-center justify-center rounded-lg">
                <check.icon className="size-4" aria-hidden="true" />
              </span>
              <h3 className="mt-3 text-sm font-semibold">{check.title}</h3>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{check.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const testimonials = [
  {
    quote:
      "I booked Maya for a last-minute work trip and she was incredible. The profile, reviews, and verification made the decision feel easy.",
    name: "Hannah B.",
    detail: "Parent in Seattle",
    avatar: "/avatars/hannah.svg",
  },
  {
    quote:
      "As a sitter, I love that payments and scheduling are handled. I can focus on the kids instead of chasing invoices.",
    name: "Elena R.",
    detail: "Sitter in Seattle",
    avatar: "/avatars/elena.svg",
  },
  {
    quote:
      "The nightly updates were thoughtful without being overwhelming. We came home to happy kids and a tidy kitchen.",
    name: "Daniel & Chloe",
    detail: "Parents in Bellevue",
    avatar: "/avatars/daniel.svg",
  },
];

export function Testimonials() {
  return (
    <section className="bg-brand-green relative overflow-hidden py-16 text-white sm:py-20">
      <div
        className="absolute -top-24 -right-16 size-80 rounded-full bg-white/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="container-page relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold tracking-[0.16em] text-white/75 uppercase">
            From our community
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-balance sm:text-4xl">
            Calmer evenings, happier families
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.name}
              className="flex flex-col rounded-2xl bg-white/12 p-6 backdrop-blur"
            >
              <div className="flex gap-0.5" role="img" aria-label="Rated 5 out of 5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className="size-3.5 fill-amber-300 text-amber-300"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-pretty">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 text-sm">
                <span className="font-semibold">{testimonial.name}</span>
                <span className="text-white/75"> · {testimonial.detail}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

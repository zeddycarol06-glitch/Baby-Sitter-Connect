import Link from "next/link";
import { ArrowRight, ChevronDown, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    question: "How are babysitters verified?",
    answer:
      "Every sitter submits a government-issued ID, references, and any relevant certifications. We run a background check through our screening partner and review the results before a profile is marked verified. Sitters with pending checks are clearly labelled in search.",
  },
  {
    question: "How much does it cost to book?",
    answer:
      "You pay the sitter's hourly rate plus an 8% service fee, shown before you confirm. There are no subscriptions and no hidden charges. Payment is collected securely in the app.",
  },
  {
    question: "Can I meet a sitter before booking?",
    answer:
      "Yes. Use in-app messaging to ask questions, share routines, or arrange a quick video call. Many families do a short meet-and-greet before their first booking.",
  },
  {
    question: "What happens if plans change?",
    answer:
      "You can cancel from your bookings page. Cancellations more than 24 hours before the start time are refunded in full, minus payment processing where applicable. Last-minute cancellations may be partially refunded.",
  },
  {
    question: "How do sitters get paid?",
    answer:
      "After a booking is completed, the sitter's earnings are released to their payout account on the next scheduled payout run. A 15% platform commission is deducted from the booking subtotal.",
  },
  {
    question: "Do you support overnight or recurring care?",
    answer:
      "Many sitters offer overnight care and recurring weekly bookings. Filter by skills like overnight care, or message a sitter directly to arrange a repeating schedule.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="container-page scroll-mt-20 py-16 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-brand-terracotta text-xs font-semibold tracking-[0.16em] uppercase">FAQ</p>
          <h2 className="mt-2 text-3xl font-semibold text-balance sm:text-4xl">
            Questions, answered
          </h2>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            Still curious? We&apos;re happy to help — the answer might already be here.
          </p>
          <div className="bg-brand-green-soft mt-6 rounded-xl p-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Mail className="text-brand-green-dark size-4" aria-hidden="true" />
              Talk to a human
            </p>
            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
              Our support team replies within one business day.
            </p>
            <Button asChild variant="link" size="sm" className="mt-1 h-auto px-0 text-xs">
              <a href="mailto:hello@babysitterconnect.com">hello@babysitterconnect.com</a>
            </Button>
          </div>
        </div>

        <div className="divide-y rounded-2xl border px-6">
          {faqs.map((faq) => (
            <details key={faq.question} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                {faq.question}
                <ChevronDown
                  className="text-muted-foreground size-4 shrink-0 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="text-muted-foreground mt-2.5 pr-8 text-sm leading-relaxed">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SitterCta() {
  return (
    <section className="container-page pb-16 sm:pb-20">
      <div className="bg-brand-cream relative overflow-hidden rounded-3xl border border-black/5 px-6 py-12 text-center sm:px-12">
        <span className="bg-brand-green-soft text-brand-green-dark inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium">
          <Sparkles className="size-3.5" aria-hidden="true" />
          For babysitters
        </span>
        <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold text-balance sm:text-4xl">
          Turn your patience and warmth into a flexible income
        </h2>
        <p className="text-brand-muted mx-auto mt-3 max-w-xl text-base leading-relaxed">
          Set your own rate and availability, get paid securely, and build a profile families trust.
          Verification support is included.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="h-11 rounded-full bg-brand-terracotta px-6 text-white hover:bg-brand-terracotta-dark"
          >
            <Link href="/register?role=sitter">
              Become a sitter
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-11 rounded-full border-black/10 px-6 hover:bg-black/5"
          >
            <Link href="/#trust">How verification works</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

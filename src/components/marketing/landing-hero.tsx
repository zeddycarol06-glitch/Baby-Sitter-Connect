import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, MapPin, Search, ShieldCheck, HeartHandshake } from "lucide-react";
import { HeroDateField } from "@/components/marketing/hero-date-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CITIES } from "@/lib/constants";

const steps = [
  {
    icon: Search,
    title: "Search nearby",
    description:
      "Filter by city, date, hourly rate, languages, and the skills that matter for your child.",
  },
  {
    icon: HeartHandshake,
    title: "Find your person",
    description:
      "Read real reviews, check verification badges, and message sitters before you commit.",
  },
  {
    icon: ShieldCheck,
    title: "Book and relax",
    description:
      "Pay securely through the app. Your sitter gets the details, and you get peace of mind.",
  },
];

export function LandingHero() {
  return (
    <section className="bg-brand-cream relative overflow-hidden">
      <div className="container-page grid items-center gap-10 pt-10 sm:pt-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:pt-16">
        <div className="max-w-xl">
          <h1 className="font-heading text-brand-ink text-[2.6rem] leading-[1.02] font-semibold tracking-tight text-balance sm:text-6xl lg:text-[4.25rem]">
            Big love for
            <br className="hidden sm:block" /> your little ones.
          </h1>
          <p className="text-brand-muted mt-6 max-w-md text-[15px] leading-relaxed text-pretty sm:text-base">
            Life is full. Find a babysitter who makes room for it. Connect with caring people in
            your neighborhood, and feel good about your time away.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-brand-terracotta px-7 text-white shadow-sm hover:bg-brand-terracotta-dark"
            >
              <Link href="/search">Find your sitter</Link>
            </Button>

            <Link
              href="/register?role=sitter"
              className="group text-brand-ink inline-flex items-center gap-2 text-sm"
            >
              <span>
                Are you a sitter?{" "}
                <span className="font-medium underline underline-offset-4">Join us</span>
              </span>
              <ArrowRight
                className="text-brand-terracotta size-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] rounded-br-[3.5rem] bg-brand-green-soft shadow-[0_24px_60px_-30px_rgba(31,26,22,0.45)] sm:aspect-[5/4] lg:aspect-[4/3]">
            <Image
              src="/images/hero-care.webp"
              alt="A mother and her toddler building a tower of colourful blocks together in their living room"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 52vw"
              className="scale-[1.12] object-cover"
            />
          </div>

          <div className="absolute -bottom-5 left-2 flex items-center gap-3 rounded-2xl bg-card p-3 pr-5 shadow-[0_18px_40px_-24px_rgba(31,26,22,0.5)] sm:left-4">
            <span className="bg-brand-green-soft text-brand-green-dark flex size-10 shrink-0 items-center justify-center rounded-full">
              <Heart className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-foreground text-sm font-semibold">Their happy place.</p>
              <p className="text-muted-foreground text-xs">Your peace of mind.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page pt-14 pb-10 sm:pt-16 sm:pb-14">
        <form
          action="/search"
          method="get"
          className="rounded-3xl border border-border bg-card p-5 shadow-[0_18px_50px_-32px_rgba(31,26,22,0.45)] sm:p-6"
        >
          <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.18em] uppercase">
            Your village starts here
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_auto] lg:items-center lg:gap-6">
            <div className="flex items-start gap-3">
              <MapPin className="text-brand-muted mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <label htmlFor="hero-city" className="text-foreground block text-sm font-semibold">
                  Where do you need care?
                </label>
                <Input
                  id="hero-city"
                  name="city"
                  list="hero-city-options"
                  placeholder="Enter your city or ZIP code"
                  className="text-brand-muted placeholder:text-brand-muted/80 mt-0.5 h-9 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                />
                <datalist id="hero-city-options">
                  {CITIES.map((city) => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="bg-border hidden h-12 w-px lg:block" aria-hidden="true" />

            <HeroDateField id="hero-date" name="date" label="When do you need a hand?" />

            <Button
              type="submit"
              size="lg"
              className="h-12 w-full rounded-full bg-brand-terracotta px-7 text-white shadow-sm hover:bg-brand-terracotta-dark sm:col-span-2 lg:col-span-1 lg:w-auto"
            >
              Explore sitters
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="container-page scroll-mt-20 py-16 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-brand-terracotta text-xs font-semibold tracking-[0.16em] uppercase">
          How it works
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-balance sm:text-4xl">
          Good care, without the guesswork
        </h2>
        <p className="text-muted-foreground mt-3 text-base leading-relaxed">
          Three simple steps between you and a safe, happy evening.
        </p>
      </div>

      <ol className="mt-12 grid gap-6 md:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.title} className="bg-card relative rounded-2xl p-6 ring-1 ring-foreground/10">
            <span className="bg-brand-terracotta/10 text-brand-terracotta absolute top-5 right-5 font-heading text-sm font-semibold">
              0{index + 1}
            </span>
            <span className="bg-brand-green-soft text-brand-green-dark flex size-11 items-center justify-center rounded-xl">
              <step.icon className="size-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

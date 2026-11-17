import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { Separator } from "@/components/ui/separator";
import { USE_MOCKS } from "@/lib/constants";

const columns = [
  {
    title: "Families",
    links: [
      { label: "Find a sitter", href: "/search" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Trust & safety", href: "/#trust" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Sitters",
    links: [
      { label: "Become a sitter", href: "/register?role=sitter" },
      { label: "Verification", href: "/#trust" },
      { label: "Sitter dashboard", href: "/sitter" },
      { label: "Earnings", href: "/sitter/earnings" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/#how-it-works" },
      { label: "Help centre", href: "/#faq" },
      { label: "Contact", href: "mailto:hello@babysitterconnect.com" },
      { label: "Admin", href: "/admin" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-border/70 bg-brand-cream border-t">
      <div className="container-page py-12">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm space-y-4">
            <Logo />
            <p className="text-muted-foreground text-sm leading-relaxed">
              Calm, reliable childcare from sitters you can trust. Verified profiles, secure
              payments, and real reviews from local families.
            </p>
            <p className="text-muted-foreground text-xs">
              Demo experience · All accounts and data are fictional.
            </p>
          </div>
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-sm font-semibold">{column.title}</h2>
              <ul className="mt-3 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <Separator className="my-8" />
        <div className="text-muted-foreground flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} BabySitter Connect. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span
              className="bg-emerald-500 size-1.5 rounded-full"
              aria-hidden="true"
            />
            {USE_MOCKS ? "Running against the mock API" : "Connected to the live API"}
          </p>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  href?: string;
  className?: string;
  compact?: boolean;
  tone?: "brand" | "inherit";
  classNameText?: string;
}

/** Warm, abstract "embrace" mark used as the BabySitter Connect brand glyph. */
function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("size-8 shrink-0", className)}
      fill="none"
    >
      <path
        d="M6.4 7.6c0 6.9 4.2 12.6 9.6 12.6s9.6-5.7 9.6-12.6"
        stroke="currentColor"
        strokeWidth="4.2"
        strokeLinecap="round"
      />
      <path
        d="M9.2 6.4 13 10.2"
        stroke="currentColor"
        strokeWidth="4.2"
        strokeLinecap="round"
      />
      <path
        d="M6.4 7.6 3 5.2"
        stroke="currentColor"
        strokeWidth="4.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({
  href = "/",
  className,
  compact = false,
  tone = "brand",
  classNameText,
}: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2 rounded-lg focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        className,
      )}
      aria-label="BabySitter Connect home"
    >
      <BrandMark className={tone === "brand" ? "text-brand-terracotta" : undefined} />
      {!compact && (
        <span
          className={cn(
            "font-heading text-lg leading-none font-semibold tracking-tight sm:text-xl",
            tone === "brand" ? "text-brand-terracotta" : "text-foreground",
            classNameText,
          )}
        >
          BabySitter
          <span className="opacity-70">- Connect</span>
        </span>
      )}
    </Link>
  );
}

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/shared/star-rating";
import { formatCurrency } from "@/lib/format";
import type { SitterProfile, SitterWithAvailability } from "@/types";

export function SitterCard({ sitter }: { sitter: SitterProfile | SitterWithAvailability }) {
  const nextAvailable = "nextAvailable" in sitter ? sitter.nextAvailable : undefined;

  return (
    <article className="bg-card group card-hover flex flex-col overflow-hidden rounded-3xl border border-border shadow-[0_16px_40px_-32px_rgba(31,26,22,0.6)]">
      <div className={`relative h-20 bg-gradient-to-r ${sitter.coverGradient}`}>
        {sitter.verified ? (
          <Badge className="bg-background/90 text-foreground absolute top-2.5 right-2.5 gap-1 border-0 text-[11px] backdrop-blur">
            <BadgeCheck className="text-brand-green-dark size-3.5" aria-hidden="true" />
            Verified
          </Badge>
        ) : (
          <Badge className="bg-background/90 text-muted-foreground absolute top-2.5 right-2.5 border-0 text-[11px] backdrop-blur">
            Verification in progress
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4">
        <div className="-mt-6 flex items-end justify-between">
          <span className="ring-background bg-muted relative size-14 shrink-0 overflow-hidden rounded-full ring-4">
            <Image
              src={sitter.photoUrl}
              alt={`${sitter.displayName}'s profile photo`}
              fill
              sizes="56px"
              className="object-cover"
            />
          </span>
          <span className="text-brand-terracotta text-sm font-semibold">
            {formatCurrency(sitter.hourlyRate)}
            <span className="text-muted-foreground text-xs font-normal">/hr</span>
          </span>
        </div>

        <div className="mt-2.5 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-heading text-base leading-snug font-semibold">
              <Link href={`/sitters/${sitter.id}`} className="hover:underline">
                {sitter.displayName}
              </Link>
            </h3>
          </div>
          <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs leading-relaxed">
            {sitter.headline}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <StarRating rating={sitter.rating} reviewCount={sitter.reviewCount} />
            <span className="text-muted-foreground inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden="true" />
              {sitter.city}
            </span>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1">
            {sitter.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-[10px] font-normal">
                {skill}
              </Badge>
            ))}
            {sitter.skills.length > 3 ? (
              <Badge variant="secondary" className="text-[10px] font-normal">
                +{sitter.skills.length - 3}
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3">
          <span className="text-muted-foreground inline-flex items-center gap-1 text-[11px]">
            <Clock className="size-3.5" aria-hidden="true" />
            {nextAvailable ?? `Replies in ~${sitter.responseTimeHours}h`}
          </span>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="rounded-full border-brand-terracotta/30 text-brand-terracotta hover:bg-brand-terracotta hover:text-white"
          >
            <Link href={`/sitters/${sitter.id}`}>View profile</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

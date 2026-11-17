import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 text-3xl font-semibold text-balance sm:text-4xl">{title}</h2>
      {description ? (
        <p className="text-muted-foreground mt-3 text-base leading-relaxed text-pretty">{description}</p>
      ) : null}
    </div>
  );
}

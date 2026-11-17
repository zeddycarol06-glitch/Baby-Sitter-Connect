import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function StatCard({ label, value, icon: Icon, hint, trend = "neutral", className }: StatCardProps) {
  return (
    <Card className={cn("gap-3", className)}>
      <CardContent className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight">{value}</p>
          {hint ? (
            <p
              className={cn(
                "mt-1 text-xs",
                trend === "up"
                  ? "text-emerald-700 dark:text-emerald-400"
                  : trend === "down"
                    ? "text-rose-700 dark:text-rose-400"
                    : "text-muted-foreground",
              )}
            >
              {hint}
            </p>
          ) : null}
        </div>
        <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  );
}

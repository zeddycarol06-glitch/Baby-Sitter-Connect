"use client";

import { useState } from "react";
import { CalendarClock, Clock, Loader2, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useSitterAvailability, useSitterProfile, useUpdateAvailability } from "@/hooks/use-sitters";
import { getErrorMessage } from "@/lib/api/client";
import { DAY_NAMES } from "@/lib/constants";
import { hoursBetween } from "@/lib/format";
import type { Availability, UpdateAvailabilityPayload } from "@/types";
import { cn } from "@/lib/utils";

type Row = UpdateAvailabilityPayload["availability"][number];

export function SitterSchedulePageContent() {
  const profileQuery = useSitterProfile();
  const availabilityQuery = useSitterAvailability(profileQuery.data?.id ?? "");

  if (profileQuery.isPending) return <PageSkeleton />;

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div>
        <PageHeader title="Availability" />
        <ErrorState
          title="We couldn't load your profile"
          onRetry={() => void profileQuery.refetch()}
        />
      </div>
    );
  }

  if (availabilityQuery.isPending) return <PageSkeleton />;

  if (availabilityQuery.isError) {
    return (
      <div>
        <PageHeader title="Availability" />
        <ErrorState
          title="Availability didn't load"
          description="Try again in a moment."
          onRetry={() => void availabilityQuery.refetch()}
        />
      </div>
    );
  }

  return (
    <AvailabilityEditor
      sitterId={profileQuery.data.id}
      initial={availabilityQuery.data}
      key={availabilityQuery.data.map((slot) => `${slot.dayOfWeek}${slot.startTime}${slot.endTime}${slot.isAvailable}`).join("-")}
    />
  );
}

function AvailabilityEditor({ sitterId, initial }: { sitterId: string; initial: Availability[] }) {
  const [rows, setRows] = useState<Row[]>(
    [...initial]
      .sort((left, right) => left.dayOfWeek - right.dayOfWeek)
      .map((slot) => ({
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: slot.isAvailable,
      })),
  );
  const [error, setError] = useState<string | null>(null);
  const updateAvailability = useUpdateAvailability(sitterId);

  const weeklyHours = rows.reduce(
    (sum, row) => (row.isAvailable ? sum + hoursBetween(row.startTime, row.endTime) : sum),
    0,
  );

  function updateRow(dayOfWeek: number, patch: Partial<Row>) {
    setRows((current) =>
      current.map((row) => (row.dayOfWeek === dayOfWeek ? { ...row, ...patch } : row)),
    );
    setError(null);
  }

  function copyToWeekdays() {
    const monday = rows.find((row) => row.dayOfWeek === 1);
    if (!monday) return;
    setRows((current) =>
      current.map((row) =>
        row.dayOfWeek >= 1 && row.dayOfWeek <= 5
          ? { ...row, startTime: monday.startTime, endTime: monday.endTime, isAvailable: monday.isAvailable }
          : row,
      ),
    );
    toast.success("Monday's hours applied to weekdays");
  }

  function save() {
    const invalid = rows.find((row) => row.isAvailable && row.startTime >= row.endTime);
    if (invalid) {
      setError(`${DAY_NAMES[invalid.dayOfWeek]} needs an end time after its start time.`);
      return;
    }
    updateAvailability.mutate(
      { availability: rows },
      {
        onSuccess: () => toast.success("Availability updated"),
        onError: (mutationError) => setError(getErrorMessage(mutationError)),
      },
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Schedule"
        title="Your weekly availability"
        description="Families search by the hours you're free. Keep this current so requests match your real life."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem] lg:items-start">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Weekly hours</CardTitle>
            <Button variant="outline" size="sm" onClick={copyToWeekdays}>
              Copy Monday to weekdays
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {rows.map((row) => (
              <div
                key={row.dayOfWeek}
                className={cn(
                  "flex flex-col gap-2 rounded-lg px-2 py-2.5 sm:flex-row sm:items-center sm:justify-between",
                  !row.isAvailable && "opacity-60",
                )}
              >
                <div className="flex items-center gap-3 sm:w-40">
                  <Switch
                    checked={row.isAvailable}
                    onCheckedChange={(checked) =>
                      updateRow(row.dayOfWeek, { isAvailable: checked })
                    }
                    aria-label={`Available on ${DAY_NAMES[row.dayOfWeek]}`}
                  />
                  <span className="text-sm font-medium">{DAY_NAMES[row.dayOfWeek]}</span>
                </div>
                {row.isAvailable ? (
                  <div className="flex items-center gap-2">
                    <label className="sr-only" htmlFor={`start-${row.dayOfWeek}`}>
                      {DAY_NAMES[row.dayOfWeek]} start time
                    </label>
                    <input
                      id={`start-${row.dayOfWeek}`}
                      type="time"
                      value={row.startTime}
                      onChange={(event) =>
                        updateRow(row.dayOfWeek, { startTime: event.target.value })
                      }
                      className="border-input bg-background focus-visible:ring-ring/50 h-8 rounded-lg border px-2 text-sm outline-none focus-visible:ring-3"
                    />
                    <span className="text-muted-foreground text-xs">to</span>
                    <label className="sr-only" htmlFor={`end-${row.dayOfWeek}`}>
                      {DAY_NAMES[row.dayOfWeek]} end time
                    </label>
                    <input
                      id={`end-${row.dayOfWeek}`}
                      type="time"
                      value={row.endTime}
                      onChange={(event) =>
                        updateRow(row.dayOfWeek, { endTime: event.target.value })
                      }
                      className="border-input bg-background focus-visible:ring-ring/50 h-8 rounded-lg border px-2 text-sm outline-none focus-visible:ring-3"
                    />
                    <span className="text-muted-foreground ml-1 hidden w-14 text-right text-xs sm:block">
                      {hoursBetween(row.startTime, row.endTime)}h
                    </span>
                  </div>
                ) : (
                  <p className="text-muted-foreground px-1 text-xs">Unavailable</p>
                )}
              </div>
            ))}

            {error ? (
              <p role="alert" className="text-destructive px-2 pt-2 text-sm font-medium">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() =>
                  setRows(
                    [...initial]
                      .sort((left, right) => left.dayOfWeek - right.dayOfWeek)
                      .map((slot) => ({
                        dayOfWeek: slot.dayOfWeek,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        isAvailable: slot.isAvailable,
                      })),
                  )
                }
              >
                <RotateCcw className="size-4" />
                Reset
              </Button>
              <Button onClick={save} disabled={updateAvailability.isPending}>
                {updateAvailability.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save availability
              </Button>
            </div>
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="size-4" aria-hidden="true" />
                Weekly summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-3xl font-semibold">{weeklyHours} hrs</p>
              <p className="text-muted-foreground mt-1 text-xs">Available across the week</p>
              <div className="mt-3 space-y-1.5 text-xs">
                {rows
                  .filter((row) => row.isAvailable)
                  .map((row) => (
                    <div key={row.dayOfWeek} className="flex justify-between gap-3">
                      <span className="text-muted-foreground">{DAY_NAMES[row.dayOfWeek]}</span>
                      <span>
                        {row.startTime}–{row.endTime}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardContent>
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Clock className="text-primary size-4" aria-hidden="true" />
                Booking tip
              </p>
              <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                Sitters with weekend and evening availability receive about twice as many requests.
                Add a short Saturday window if you can.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

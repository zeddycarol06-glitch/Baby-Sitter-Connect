"use client";

import { useMemo } from "react";
import { BarChart3, Download, MapPin, TrendingUp, XCircle } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { SkeletonTable } from "@/components/shared/skeletons";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminReports } from "@/hooks/use-admin";
import { formatCurrency, formatMoney } from "@/lib/format";
import type { AdminReportRow } from "@/types";

export function AdminReportsPage() {
  const reportsQuery = useAdminReports();

  const reports = useMemo(() => reportsQuery.data ?? [], [reportsQuery.data]);
  const totals = useMemo(
    () =>
      reports.reduce(
        (sum, row) => ({
          bookings: sum.bookings + row.bookings,
          revenue: sum.revenue + row.revenue,
          commission: sum.commission + row.commission,
          cancellations: sum.cancellations + row.cancellations,
        }),
        { bookings: 0, revenue: 0, commission: 0, cancellations: 0 },
      ),
    [reports],
  );

  if (reportsQuery.isPending) {
    return (
      <div>
        <PageHeader title="Reports" />
        <SkeletonTable rows={5} columns={5} />
      </div>
    );
  }

  if (reportsQuery.isError) {
    return (
      <div>
        <PageHeader title="Reports" />
        <ErrorState
          title="Reports didn't load"
          description="Marketplace reporting is temporarily unavailable."
          onRetry={() => void reportsQuery.refetch()}
        />
      </div>
    );
  }

  const maxRevenue = Math.max(...reports.map((row) => row.revenue), 1);

  function exportCsv() {
    const header = ["City", "Bookings", "Revenue", "Commission", "Cancellations"];
    const lines = reports.map((row) =>
      [row.label, row.bookings, row.revenue, row.commission, row.cancellations]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "babysitter-connect-report.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Analytics"
        title="Reports"
        description="Where care is happening, where revenue comes from, and where cancellations cluster."
        actions={
          <Button variant="outline" onClick={exportCsv} disabled={reports.length === 0}>
            <Download className="size-4" />
            Export CSV
          </Button>
        }
      />

      {reports.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No report data yet"
          description="Once sitters and bookings exist at scale, city-level performance will appear here."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total bookings"
              value={String(totals.bookings)}
              icon={BarChart3}
              hint={`Across ${reports.length} cities`}
            />
            <StatCard
              label="Gross revenue"
              value={formatCurrency(totals.revenue)}
              icon={TrendingUp}
              hint="Paid bookings only"
              trend="up"
            />
            <StatCard
              label="Commission"
              value={formatCurrency(totals.commission)}
              icon={MapPin}
              hint="Platform take"
            />
            <StatCard
              label="Cancellations"
              value={String(totals.cancellations)}
              icon={XCircle}
              hint={
                totals.bookings > 0
                  ? `${Math.round((totals.cancellations / totals.bookings) * 100)}% of bookings`
                  : "No bookings yet"
              }
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by city</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="flex h-56 items-end gap-4"
                  role="img"
                  aria-label="Revenue by city bar chart"
                >
                  {reports.map((row) => (
                    <div key={row.label} className="group flex flex-1 flex-col items-center gap-1.5">
                      <span className="text-muted-foreground text-[10px]">
                        {formatCurrency(row.revenue)}
                      </span>
                      <div
                        className="bg-primary/75 group-hover:bg-primary w-full max-w-14 rounded-t-md transition-colors"
                        style={{ height: `${Math.max((row.revenue / maxRevenue) * 170, 4)}px` }}
                        title={`${row.label}: ${formatCurrency(row.revenue)}`}
                      />
                      <span className="text-muted-foreground line-clamp-2 text-center text-[10px]">
                        {row.label.replace(", WA", "")}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cancellation watch</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[...reports]
                    .sort((left, right) => right.cancellations - left.cancellations)
                    .map((row) => {
                      const rate = row.bookings > 0 ? (row.cancellations / row.bookings) * 100 : 0;
                      return (
                        <li key={row.label}>
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="font-medium">{row.label}</span>
                            <span className="text-muted-foreground">
                              {row.cancellations}/{row.bookings} · {Math.round(rate)}%
                            </span>
                          </div>
                          <div className="bg-muted mt-1 h-1.5 overflow-hidden rounded-full">
                            <div
                              className="h-full rounded-full bg-rose-400"
                              style={{ width: `${Math.min(rate, 100)}%` }}
                            />
                          </div>
                        </li>
                      );
                    })}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>City breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-border overflow-hidden rounded-xl border">
                <Table>
                  <caption className="sr-only">Marketplace performance by city</caption>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead>City</TableHead>
                      <TableHead className="text-right">Bookings</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Commission</TableHead>
                      <TableHead className="text-right">Cancellations</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((row: AdminReportRow) => (
                      <TableRow key={row.label}>
                        <TableCell className="font-medium">{row.label}</TableCell>
                        <TableCell className="text-right text-sm">{row.bookings}</TableCell>
                        <TableCell className="text-right text-sm font-semibold">
                          {formatMoney(row.revenue)}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-right text-sm">
                          {formatMoney(row.commission)}
                        </TableCell>
                        <TableCell className="text-right text-sm">{row.cancellations}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

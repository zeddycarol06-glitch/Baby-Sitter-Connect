"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, MapPin, RotateCcw, Search, SearchX, SlidersHorizontal } from "lucide-react";
import { SitterCard } from "@/components/sitters/sitter-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Pagination } from "@/components/shared/pagination";
import { SkeletonCardGrid } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { useSitters } from "@/hooks/use-sitters";
import { CITIES, LANGUAGES } from "@/lib/constants";
import type { SitterSearchParams } from "@/types";

interface Filters {
  city: string;
  date: string;
  startTime: string;
  endTime: string;
  maxRate: string;
  minRating: string;
  language: string;
  minExperience: string;
  sort: NonNullable<SitterSearchParams["sort"]>;
}

const DEFAULT_FILTERS: Filters = {
  city: "",
  date: "",
  startTime: "",
  endTime: "",
  maxRate: "",
  minRating: "",
  language: "",
  minExperience: "",
  sort: "recommended",
};

const PAGE_SIZE = 6;

export function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const debouncedQuery = useDebounce(query, 350);
  const [filters, setFilters] = useState<Filters>({
    city: searchParams.get("city") ?? "",
    date: searchParams.get("date") ?? "",
    startTime: searchParams.get("startTime") ?? "",
    endTime: searchParams.get("endTime") ?? "",
    maxRate: searchParams.get("maxRate") ?? "",
    minRating: searchParams.get("minRating") ?? "",
    language: searchParams.get("language") ?? "",
    minExperience: searchParams.get("minExperience") ?? "",
    sort: (searchParams.get("sort") as Filters["sort"]) || "recommended",
  });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const params: SitterSearchParams = {
    q: debouncedQuery || undefined,
    city: filters.city || undefined,
    date: filters.date || undefined,
    startTime: filters.startTime || undefined,
    endTime: filters.endTime || undefined,
    maxRate: filters.maxRate ? Number(filters.maxRate) : undefined,
    minRating: filters.minRating ? Number(filters.minRating) : undefined,
    language: filters.language || undefined,
    minExperience: filters.minExperience ? Number(filters.minExperience) : undefined,
    sort: filters.sort,
    page,
    pageSize: PAGE_SIZE,
  };

  const { data, isPending, isError, isFetching, refetch } = useSitters(params);

  useEffect(() => {
    const next = new URLSearchParams();
    if (debouncedQuery) next.set("q", debouncedQuery);
    if (filters.city) next.set("city", filters.city);
    if (filters.date) next.set("date", filters.date);
    if (filters.startTime) next.set("startTime", filters.startTime);
    if (filters.endTime) next.set("endTime", filters.endTime);
    if (filters.maxRate) next.set("maxRate", filters.maxRate);
    if (filters.minRating) next.set("minRating", filters.minRating);
    if (filters.language) next.set("language", filters.language);
    if (filters.minExperience) next.set("minExperience", filters.minExperience);
    if (filters.sort !== "recommended") next.set("sort", filters.sort);
    if (page > 1) next.set("page", String(page));
    const qs = next.toString();
    router.replace(qs ? `/search?${qs}` : "/search", { scroll: false });
  }, [debouncedQuery, filters, page, router]);

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
    setQuery("");
    setPage(1);
  }

  const activeFilterCount = [
    query,
    filters.city,
    filters.date,
    filters.startTime,
    filters.endTime,
    filters.maxRate,
    filters.minRating,
    filters.language,
    filters.minExperience,
  ].filter(Boolean).length;

  return (
    <div className="bg-brand-cream min-h-dvh">
      <div className="border-border/60 border-b">
        <div className="container-page py-8 sm:py-10">
          <p className="text-brand-terracotta text-xs font-semibold tracking-[0.18em] uppercase">
            Browse sitters
          </p>
          <h1 className="font-heading mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Find care that fits your family
          </h1>
          <p className="text-brand-muted mt-2 max-w-2xl text-sm leading-relaxed sm:text-base">
            Compare verified sitters by rate, experience, languages, and the skills your child needs
            most.
          </p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search
                className="text-brand-muted pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, skill, or keyword"
                className="h-12 rounded-full bg-card pr-4 pl-11 shadow-[0_10px_30px_-22px_rgba(31,26,22,0.6)]"
                aria-label="Search sitters"
              />
            </div>
            <Button
              variant="outline"
              className="h-12 rounded-full bg-card px-5 lg:hidden"
              onClick={() => setShowFilters((visible) => !visible)}
              aria-expanded={showFilters}
            >
              <SlidersHorizontal className="size-4" />
              Filters
              {activeFilterCount > 0 ? (
                <span className="bg-brand-terracotta text-white ml-1 flex size-5 items-center justify-center rounded-full text-[10px]">
                  {activeFilterCount}
                </span>
              ) : null}
            </Button>
          </div>
        </div>
      </div>

      <div className="container-page grid gap-6 py-6 lg:grid-cols-[18rem_1fr] lg:py-8">
        <aside
          aria-label="Search filters"
          className={`${showFilters ? "block" : "hidden"} lg:block`}
        >
          <div className="bg-card rounded-3xl border border-border p-5 shadow-[0_18px_40px_-34px_rgba(31,26,22,0.6)] lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold">
                <Filter className="text-brand-terracotta size-4" aria-hidden="true" />
                Filters
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-brand-terracotta h-7 text-xs"
                onClick={resetFilters}
              >
                <RotateCcw className="size-3" />
                Reset
              </Button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">City</Label>
                <Select
                  value={filters.city || "any"}
                  onValueChange={(value) => updateFilter("city", value === "any" ? "" : value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Anywhere nearby" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Anywhere nearby</SelectItem>
                    {CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="filter-date" className="text-xs">
                  Date
                </Label>
                <Input
                  id="filter-date"
                  type="date"
                  value={filters.date}
                  onChange={(event) => updateFilter("date", event.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="filter-start" className="text-xs">
                    From
                  </Label>
                  <Input
                    id="filter-start"
                    type="time"
                    value={filters.startTime}
                    onChange={(event) => updateFilter("startTime", event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="filter-end" className="text-xs">
                    Until
                  </Label>
                  <Input
                    id="filter-end"
                    type="time"
                    value={filters.endTime}
                    onChange={(event) => updateFilter("endTime", event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Maximum rate</Label>
                <Select
                  value={filters.maxRate || "any"}
                  onValueChange={(value) => updateFilter("maxRate", value === "any" ? "" : value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Any rate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any rate</SelectItem>
                    <SelectItem value="20">Up to $20/hr</SelectItem>
                    <SelectItem value="22">Up to $22/hr</SelectItem>
                    <SelectItem value="25">Up to $25/hr</SelectItem>
                    <SelectItem value="30">Up to $30/hr</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Rating</Label>
                <Select
                  value={filters.minRating || "any"}
                  onValueChange={(value) => updateFilter("minRating", value === "any" ? "" : value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any rating</SelectItem>
                    <SelectItem value="4.5">4.5+ stars</SelectItem>
                    <SelectItem value="4.8">4.8+ stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Language</Label>
                <Select
                  value={filters.language || "any"}
                  onValueChange={(value) => updateFilter("language", value === "any" ? "" : value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Any language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any language</SelectItem>
                    {LANGUAGES.map((language) => (
                      <SelectItem key={language} value={language}>
                        {language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Experience</Label>
                <Select
                  value={filters.minExperience || "any"}
                  onValueChange={(value) =>
                    updateFilter("minExperience", value === "any" ? "" : value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Any experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any experience</SelectItem>
                    <SelectItem value="3">3+ years</SelectItem>
                    <SelectItem value="5">5+ years</SelectItem>
                    <SelectItem value="8">8+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </aside>

        <section aria-labelledby="results-heading">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 id="results-heading" className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="text-brand-green-dark size-4" aria-hidden="true" />
              {data ? (
                <>
                  {data.total} {data.total === 1 ? "sitter" : "sitters"} found
                  {filters.city ? ` near ${filters.city}` : ""}
                </>
              ) : (
                "Finding sitters…"
              )}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">Sort</span>
              <Select
                value={filters.sort}
                onValueChange={(value) => updateFilter("sort", value as Filters["sort"])}
              >
                <SelectTrigger className="h-8 w-40" aria-label="Sort results">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="rating">Highest rated</SelectItem>
                  <SelectItem value="price_asc">Price: low to high</SelectItem>
                  <SelectItem value="price_desc">Price: high to low</SelectItem>
                  <SelectItem value="experience">Most experienced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div aria-busy={isFetching} aria-live="polite">
            {isPending ? <SkeletonCardGrid count={6} /> : null}

            {isError ? (
              <ErrorState
                onRetry={() => void refetch()}
                title="We couldn't load sitters"
                description="The search request failed. Adjust your filters or try again in a moment."
              />
            ) : null}

            {data && data.data.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title="No sitters match those filters"
                description="Try widening your search — remove the date, raise the maximum rate, or look in a nearby city."
                action={
                  <Button onClick={resetFilters} variant="outline">
                    <RotateCcw className="size-4" />
                    Clear filters
                  </Button>
                }
              />
            ) : null}

            {data && data.data.length > 0 ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {data.data.map((sitter) => (
                    <SitterCard key={sitter.id} sitter={sitter} />
                  ))}
                </div>
                <Pagination
                  page={data.page}
                  totalPages={data.totalPages}
                  totalItems={data.total}
                  pageSize={data.pageSize}
                  onPageChange={(nextPage) => {
                    setPage(nextPage);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </>
            ) : null}

            {data && data.data.length > 0 ? (
              <p className="text-brand-muted mt-8 rounded-2xl border border-dashed border-brand-muted/30 bg-card/60 p-4 text-center text-xs leading-relaxed">
                Some sitters may still have a background check in progress. Look for the{" "}
                <span className="text-foreground font-medium">Verified</span> badge for fully
                screened profiles.{" "}
                <Link href="/#trust" className="text-brand-terracotta underline">
                  Learn about our safety process
                </Link>
                .
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { SearchPageContent } from "@/components/search/search-page-content";
import { SkeletonCardGrid } from "@/components/shared/skeletons";

export const metadata: Metadata = {
  title: "Find a babysitter",
  description:
    "Browse verified babysitters near you, filter by rate, availability, languages, and skills.",
};

export default function SearchPage() {
  return (
    <PublicShell>
      <Suspense
        fallback={
          <div className="container-page py-16">
            <SkeletonCardGrid count={6} />
          </div>
        }
      >
        <SearchPageContent />
      </Suspense>
    </PublicShell>
  );
}

import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { SitterProfileView } from "@/components/sitters/sitter-profile-view";

export const metadata: Metadata = {
  title: "Sitter profile",
  description:
    "Read reviews, check availability, and request a booking with a verified BabySitter Connect sitter.",
};

export default async function SitterProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PublicShell>
      <SitterProfileView sitterId={id} />
    </PublicShell>
  );
}

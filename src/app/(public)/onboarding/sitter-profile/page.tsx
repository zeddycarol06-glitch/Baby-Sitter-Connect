import type { Metadata } from "next";
import { RoleGuard } from "@/components/auth/role-guard";
import { SitterProfileSetup } from "@/components/onboarding/sitter-profile-setup";

export const metadata: Metadata = {
  title: "Set up your sitter profile",
  description: "Tell families about yourself and where you care.",
};

export default function SitterProfileSetupPage() {
  return (
    <RoleGuard role="sitter">
      <SitterProfileSetup />
    </RoleGuard>
  );
}

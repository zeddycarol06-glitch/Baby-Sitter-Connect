import { RoleGuard } from "@/components/auth/role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import type { ReactNode } from "react";

export default function SitterLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard role="sitter">
      <DashboardShell role="sitter">{children}</DashboardShell>
    </RoleGuard>
  );
}

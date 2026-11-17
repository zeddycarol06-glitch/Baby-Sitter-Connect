import { RoleGuard } from "@/components/auth/role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import type { ReactNode } from "react";

export default function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard role="parent">
      <DashboardShell role="parent">{children}</DashboardShell>
    </RoleGuard>
  );
}

"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle, Menu, Sparkles } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { NotificationBell } from "@/components/layout/notification-bell";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { NAV_ITEMS, ROLE_LABELS } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";
import type { Role } from "@/types";

function SidebarLinks({ role }: { role: Role }) {
  const pathname = usePathname();
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const home = `/${role}`;

  return (
    <nav aria-label={`${role} navigation`} className="flex flex-1 flex-col gap-1 px-3">
      {NAV_ITEMS[role].map((item) => {
        const active = item.href === home ? pathname === home : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group focus-visible:ring-ring/50 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:outline-none",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon
              className={cn(
                "size-4 shrink-0",
                active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
              )}
              aria-hidden="true"
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBody({ role }: { role: Role }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>
      <p className="text-muted-foreground px-5 pb-3 text-xs font-medium tracking-wide uppercase">
        {ROLE_LABELS[role]}
      </p>
      <SidebarLinks role={role} />
      <div className="p-3">
        <div className="bg-accent/60 rounded-xl p-3.5">
          <p className="flex items-center gap-1.5 text-xs font-semibold">
            <Sparkles className="size-3.5" aria-hidden="true" />
            {role === "parent"
              ? "Need care tonight?"
              : role === "sitter"
                ? "Grow your bookings"
                : "Mock data mode"}
          </p>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
            {role === "parent"
              ? "Browse trusted sitters near you in minutes."
              : role === "sitter"
                ? "Complete verification to appear higher in search."
                : "Every metric here comes from the in-browser mock API."}
          </p>
          <Button asChild variant="link" size="sm" className="mt-1 h-auto px-0 text-xs">
            {role === "parent" ? (
              <Link href="/search">Find a sitter →</Link>
            ) : role === "sitter" ? (
              <Link href="/sitter/verification">Review verification →</Link>
            ) : (
              <Link href="/admin/verification">Review queue →</Link>
            )}
          </Button>
        </div>
        <Link
          href="/#faq"
          className="text-muted-foreground hover:text-foreground mt-3 flex items-center gap-2 px-2 py-2 text-xs"
        >
          <HelpCircle className="size-3.5" aria-hidden="true" />
          Help & support
        </Link>
      </div>
    </div>
  );
}

export function DashboardShell({ role, children }: { role: Role; children: ReactNode }) {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const { user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  return (
    <div className="bg-muted/20 min-h-dvh">
      <a
        href="#main-content"
        className="bg-primary text-primary-foreground focus:ring-ring sr-only z-50 rounded-md px-4 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:ring-2"
      >
        Skip to content
      </a>

      <aside className="bg-sidebar border-sidebar-border fixed inset-y-0 left-0 z-30 hidden w-64 border-r lg:block">
        <SidebarBody role={role} />
      </aside>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarBody role={role} />
        </SheetContent>
      </Sheet>

      <div className="lg:pl-64">
        <header className="border-border/60 bg-background/85 sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="size-5" />
            </Button>
            <div className="lg:hidden">
              <Logo compact />
            </div>
            <p className="text-muted-foreground hidden text-sm sm:block">
              {user ? `Welcome back, ${user.firstName}` : "Welcome back"}
            </p>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <NotificationBell />
            <UserMenu />
          </div>
        </header>
        <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

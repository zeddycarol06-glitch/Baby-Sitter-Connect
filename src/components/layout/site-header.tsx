"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Menu } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { NotificationBell } from "@/components/layout/notification-bell";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_HOME } from "@/lib/constants";

const marketingLinks = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Find a sitter", href: "/search" },
  { label: "Become a sitter", href: "/register?role=sitter" },
];

export function SiteHeader() {
  const { user, status } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-brand-green text-white">
      <div className="container-page flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
        <div className="flex items-center gap-3">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/15 hover:text-white lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle asChild>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobile navigation" className="mt-6 flex flex-col gap-1 px-2">
                {marketingLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="hover:bg-muted rounded-lg px-3 py-2.5 text-sm font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href={user ? ROLE_HOME[user.role] : "/login"}
                  onClick={() => setMenuOpen(false)}
                  className="hover:bg-muted rounded-lg px-3 py-2.5 text-sm font-medium"
                >
                  {user ? "Go to dashboard" : "Log in"}
                </Link>
                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <span className="text-muted-foreground text-sm">Appearance</span>
                  <ThemeToggle />
                </div>
                <div className="mt-4 grid gap-2">
                  <Button
                    asChild
                    className="rounded-full bg-brand-terracotta text-white hover:bg-brand-terracotta-dark"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Link href="/search">Find your sitter</Link>
                  </Button>
                  {!user ? (
                    <Button asChild variant="outline" onClick={() => setMenuOpen(false)}>
                      <Link href="/register">Create an account</Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline" onClick={() => setMenuOpen(false)}>
                      <Link href={ROLE_HOME[user.role]}>
                        <LayoutDashboard className="size-4" />
                        Dashboard
                      </Link>
                    </Button>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          <nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">
            {marketingLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/90 hover:text-white text-sm font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {status !== "loading" ? (
              <Link
                href={user ? ROLE_HOME[user.role] : "/login"}
                className="text-white/90 hover:text-white text-sm font-medium transition-colors"
              >
                {user ? "Dashboard" : "Log in"}
              </Link>
            ) : null}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-1 sm:flex">
            <ThemeToggle className="text-white hover:bg-white/15 hover:text-white" />
            {user ? <NotificationBell className="text-white hover:bg-white/15 hover:text-white" /> : null}
          </div>

          <Button
            asChild
            size="sm"
            className="hidden h-10 rounded-full bg-brand-terracotta px-5 text-white shadow-sm hover:bg-brand-terracotta-dark sm:inline-flex"
          >
            <Link href="/search">Find your sitter</Link>
          </Button>

          {user ? <UserMenu className="text-white" /> : null}

          <Logo tone="brand" classNameText="text-brand-terracotta" />
        </div>
      </div>
    </header>
  );
}

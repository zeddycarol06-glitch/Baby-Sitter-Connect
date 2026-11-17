import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  BarChart3,
  CalendarClock,
  CalendarDays,
  CreditCard,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Scale,
  Settings,
  Star,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import type { Role } from "@/types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: Record<Role, NavItem[]> = {
  parent: [
    { label: "Overview", href: "/parent", icon: LayoutDashboard },
    { label: "Bookings", href: "/parent/bookings", icon: CalendarDays },
    { label: "Messages", href: "/parent/messages", icon: MessageSquare },
    { label: "Children", href: "/parent/children", icon: Users },
    { label: "Payments", href: "/parent/payments", icon: CreditCard },
    { label: "Settings", href: "/parent/settings", icon: Settings },
  ],
  sitter: [
    { label: "Overview", href: "/sitter", icon: LayoutDashboard },
    { label: "Requests", href: "/sitter/requests", icon: Inbox },
    { label: "Messages", href: "/sitter/messages", icon: MessageSquare },
    { label: "Schedule", href: "/sitter/schedule", icon: CalendarClock },
    { label: "Earnings", href: "/sitter/earnings", icon: Wallet },
    { label: "Verification", href: "/sitter/verification", icon: BadgeCheck },
    { label: "Profile", href: "/sitter/profile", icon: UserRound },
    { label: "Reviews", href: "/sitter/reviews", icon: Star },
  ],
  admin: [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Verification", href: "/admin/verification", icon: BadgeCheck },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Bookings", href: "/admin/bookings", icon: CalendarDays },
    { label: "Payments", href: "/admin/payments", icon: CreditCard },
    { label: "Disputes", href: "/admin/disputes", icon: Scale },
    { label: "Reports", href: "/admin/reports", icon: BarChart3 },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
};

export const ROLE_LABELS: Record<Role, string> = {
  parent: "Parent workspace",
  sitter: "Sitter workspace",
  admin: "Admin console",
};

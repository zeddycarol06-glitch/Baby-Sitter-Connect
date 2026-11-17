"use client";

import { useSearchParams } from "next/navigation";
import { RegisterForm } from "@/components/forms/register-form";

export function RegisterFormQuery() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const defaultRole = roleParam === "sitter" ? "sitter" : "parent";
  return <RegisterForm defaultRole={defaultRole} />;
}

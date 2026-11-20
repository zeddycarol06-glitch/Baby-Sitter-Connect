"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Baby, Eye, EyeOff, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { registerUser } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/api/client";
import { ROLE_HOME } from "@/lib/constants";
import { registerSchema, type RegisterValues } from "@/schemas/auth";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

export function RegisterForm({ defaultRole = "parent" }: { defaultRole?: "parent" | "sitter" }) {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: defaultRole,
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const role = form.watch("role");
  const errors = form.formState.errors;

  async function onSubmit(values: RegisterValues) {
    setFormError(null);
    setSubmitting(true);
    try {
      const user = await registerUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone || undefined,
        password: values.password,
        role: values.role,
      });
      setUser(user);
      toast.success("Your account is ready. Welcome!");
      router.replace(user.role === "sitter" ? "/onboarding/sitter-profile" : ROLE_HOME[user.role]);
      router.refresh();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {formError ? (
        <div
          role="alert"
          className="border-destructive/20 bg-destructive/5 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {formError}
        </div>
      ) : null}

      <FormField label="I'm joining as a…" htmlFor="role-parent" error={errors.role?.message}>
        <RadioGroup
          value={role}
          onValueChange={(value) => form.setValue("role", value as "parent" | "sitter", { shouldValidate: true })}
          className="grid grid-cols-2 gap-3"
        >
          <Label
            htmlFor="role-parent"
            className={cn(
              "hover:border-brand-terracotta/50 flex cursor-pointer flex-col items-start gap-1 rounded-xl border p-3.5 transition-colors",
              role === "parent" && "border-brand-terracotta bg-brand-terracotta/5",
            )}
          >
            <span className="flex w-full items-center justify-between">
              <Users className="text-brand-terracotta size-4" aria-hidden="true" />
              <RadioGroupItem value="parent" id="role-parent" />
            </span>
            <span className="text-sm font-semibold">Parent</span>
            <span className="text-muted-foreground text-xs font-normal">Find and book trusted care</span>
          </Label>
          <Label
            htmlFor="role-sitter"
            className={cn(
              "hover:border-brand-terracotta/50 flex cursor-pointer flex-col items-start gap-1 rounded-xl border p-3.5 transition-colors",
              role === "sitter" && "border-brand-terracotta bg-brand-terracotta/5",
            )}
          >
            <span className="flex w-full items-center justify-between">
              <Baby className="text-brand-terracotta size-4" aria-hidden="true" />
              <RadioGroupItem value="sitter" id="role-sitter" />
            </span>
            <span className="text-sm font-semibold">Babysitter</span>
            <span className="text-muted-foreground text-xs font-normal">Offer care and earn</span>
          </Label>
        </RadioGroup>
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="First name" htmlFor="firstName" error={errors.firstName?.message} required>
          <Input
            id="firstName"
            autoComplete="given-name"
            className="h-11 rounded-xl"
            aria-invalid={Boolean(errors.firstName)}
            {...form.register("firstName")}
          />
        </FormField>
        <FormField label="Last name" htmlFor="lastName" error={errors.lastName?.message} required>
          <Input
            id="lastName"
            autoComplete="family-name"
            className="h-11 rounded-xl"
            aria-invalid={Boolean(errors.lastName)}
            {...form.register("lastName")}
          />
        </FormField>
      </div>

      <FormField label="Email address" htmlFor="register-email" error={errors.email?.message} required>
        <Input
          id="register-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="h-11 rounded-xl"
          aria-invalid={Boolean(errors.email)}
          {...form.register("email")}
        />
      </FormField>

      <FormField
        label="Phone number"
        htmlFor="phone"
        error={errors.phone?.message}
        hint="Optional — only shared with sitters you book."
      >
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          placeholder="(206) 555-0100"
          className="h-11 rounded-xl"
          {...form.register("phone")}
        />
      </FormField>

      <FormField label="Password" htmlFor="register-password" error={errors.password?.message} required>
        <div className="relative">
          <Input
            id="register-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            className="h-11 rounded-xl pr-10"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "register-password-error" : "register-password-hint"}
            {...form.register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex w-10 items-center justify-center"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </FormField>

      <FormField label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword?.message} required>
        <Input
          id="confirmPassword"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          className="h-11 rounded-xl"
          aria-invalid={Boolean(errors.confirmPassword)}
          {...form.register("confirmPassword")}
        />
      </FormField>

      <div className="space-y-1.5">
        <div className="flex items-start gap-2.5">
          <Checkbox
            id="acceptTerms"
            checked={form.watch("acceptTerms")}
            onCheckedChange={(checked) =>
              form.setValue("acceptTerms", checked === true, { shouldValidate: true })
            }
            aria-invalid={Boolean(errors.acceptTerms)}
          />
          <Label htmlFor="acceptTerms" className="text-muted-foreground text-xs leading-relaxed font-normal">
            I agree to the{" "}
            <Link href="/#faq" className="text-brand-terracotta underline">
              terms of service
            </Link>{" "}
            and{" "}
            <Link href="/#trust" className="text-brand-terracotta underline">
              privacy policy
            </Link>
            .
          </Label>
        </div>
        {errors.acceptTerms ? (
          <p role="alert" className="text-destructive text-xs font-medium">
            {errors.acceptTerms.message}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        className="h-12 w-full rounded-full bg-brand-terracotta text-white hover:bg-brand-terracotta-dark"
        size="lg"
        disabled={submitting}
      >
        {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
        {submitting ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}

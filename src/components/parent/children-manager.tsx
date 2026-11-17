"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Cake, Loader2, Pencil, Plus, StickyNote, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { FormField } from "@/components/forms/form-field";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { SkeletonCardGrid } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateChild, useChildren, useDeleteChild, useUpdateChild } from "@/hooks/use-parent";
import { getErrorMessage } from "@/lib/api/client";
import { calculateAge, formatDate } from "@/lib/format";
import { childSchema, type ChildValues } from "@/schemas/profile";
import type { Child } from "@/types";
import { cn } from "@/lib/utils";

export function ChildrenManager() {
  const { data, isPending, isError, refetch } = useChildren();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Child | null>(null);
  const [deleting, setDeleting] = useState<Child | null>(null);
  const deleteChild = useDeleteChild();

  if (isPending) return <SkeletonCardGrid count={4} />;

  if (isError) {
    return (
      <ErrorState
        title="We couldn't load your children"
        description="Profiles didn't come through. Please try again."
        onRetry={() => void refetch()}
      />
    );
  }

  const children = data ?? [];

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />
          Add a child
        </Button>
      </div>

      {children.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No child profiles yet"
          description="Add each child's age, allergies, and routines so sitters can prepare before they arrive."
          action={
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="size-4" />
              Add your first child
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {children.map((child) => (
            <article
              key={child.id}
              className="bg-card flex flex-col rounded-xl p-4 ring-1 ring-foreground/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-11 items-center justify-center rounded-full text-sm font-semibold",
                      child.avatarColor,
                    )}
                    aria-hidden="true"
                  >
                    {child.firstName.charAt(0)}
                    {child.lastName.charAt(0)}
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold">
                      {child.firstName} {child.lastName}
                    </h2>
                    <p className="text-muted-foreground flex items-center gap-1 text-xs">
                      <Cake className="size-3" aria-hidden="true" />
                      {calculateAge(child.dateOfBirth)} years old
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setEditing(child)}
                    aria-label={`Edit ${child.firstName}`}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setDeleting(child)}
                    aria-label={`Remove ${child.firstName}`}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>

              <dl className="mt-3 flex-1 space-y-2 text-xs">
                <div>
                  <dt className="text-muted-foreground">Birthday</dt>
                  <dd className="mt-0.5">{formatDate(child.dateOfBirth, "MMMM d, yyyy")}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="size-3" aria-hidden="true" />
                    Allergies
                  </dt>
                  <dd className="mt-0.5">
                    {child.allergies.length > 0 ? (
                      <span className="flex flex-wrap gap-1">
                        {child.allergies.map((allergy) => (
                          <span
                            key={allergy}
                            className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] text-rose-900 dark:bg-rose-500/15 dark:text-rose-200"
                          >
                            {allergy}
                          </span>
                        ))}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">None listed</span>
                    )}
                  </dd>
                </div>
                {child.specialNeeds ? (
                  <div>
                    <dt className="text-muted-foreground">Support needs</dt>
                    <dd className="mt-0.5 leading-relaxed">{child.specialNeeds}</dd>
                  </div>
                ) : null}
                {child.notes ? (
                  <div>
                    <dt className="text-muted-foreground flex items-center gap-1">
                      <StickyNote className="size-3" aria-hidden="true" />
                      Notes
                    </dt>
                    <dd className="mt-0.5 leading-relaxed">{child.notes}</dd>
                  </div>
                ) : null}
              </dl>
            </article>
          ))}
        </div>
      )}

      <ChildDialog open={addOpen} onOpenChange={setAddOpen} />
      {editing ? (
        <ChildDialog
          key={editing.id}
          open={Boolean(editing)}
          onOpenChange={(open) => {
            if (!open) setEditing(null);
          }}
          child={editing}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title={`Remove ${deleting?.firstName ?? "this child"}?`}
        description="Their profile and care notes will be deleted. Past bookings stay in your history."
        confirmLabel="Remove profile"
        destructive
        loading={deleteChild.isPending}
        onConfirm={() => {
          if (!deleting) return;
          deleteChild.mutate(deleting.id, {
            onSuccess: () => {
              toast.success(`${deleting.firstName}'s profile was removed`);
              setDeleting(null);
            },
            onError: (error) => toast.error(getErrorMessage(error)),
          });
        }}
      />
    </div>
  );
}

function ChildDialog({
  open,
  onOpenChange,
  child,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  child?: Child;
}) {
  const createChild = useCreateChild();
  const updateChild = useUpdateChild();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<ChildValues>({
    resolver: zodResolver(childSchema),
    defaultValues: {
      firstName: child?.firstName ?? "",
      lastName: child?.lastName ?? "",
      dateOfBirth: child?.dateOfBirth ?? "",
      allergies: child?.allergies.join(", ") ?? "",
      specialNeeds: child?.specialNeeds ?? "",
      notes: child?.notes ?? "",
    },
  });

  const submitting = createChild.isPending || updateChild.isPending;

  function onSubmit(values: ChildValues) {
    setFormError(null);
    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      dateOfBirth: values.dateOfBirth,
      allergies: values.allergies
        ? values.allergies
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
      specialNeeds: values.specialNeeds || undefined,
      notes: values.notes || undefined,
    };

    const onSuccess = () => {
      toast.success(child ? "Profile updated" : `${values.firstName} was added`);
      onOpenChange(false);
      form.reset();
    };

    if (child) {
      updateChild.mutate(
        { id: child.id, payload },
        { onSuccess, onError: (error) => setFormError(getErrorMessage(error)) },
      );
    } else {
      createChild.mutate(payload, {
        onSuccess,
        onError: (error) => setFormError(getErrorMessage(error)),
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{child ? `Edit ${child.firstName}` : "Add a child"}</DialogTitle>
          <DialogDescription>
            These details help sitters prepare. You can change them at any time.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {formError ? (
            <p role="alert" className="text-destructive text-sm">
              {formError}
            </p>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="First name"
              htmlFor="child-first-name"
              error={form.formState.errors.firstName?.message}
              required
            >
              <Input
                id="child-first-name"
                autoComplete="off"
                aria-invalid={Boolean(form.formState.errors.firstName)}
                {...form.register("firstName")}
              />
            </FormField>
            <FormField
              label="Last name"
              htmlFor="child-last-name"
              error={form.formState.errors.lastName?.message}
              required
            >
              <Input
                id="child-last-name"
                autoComplete="off"
                aria-invalid={Boolean(form.formState.errors.lastName)}
                {...form.register("lastName")}
              />
            </FormField>
          </div>

          <FormField
            label="Date of birth"
            htmlFor="child-dob"
            error={form.formState.errors.dateOfBirth?.message}
            required
          >
            <Input
              id="child-dob"
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              aria-invalid={Boolean(form.formState.errors.dateOfBirth)}
              {...form.register("dateOfBirth")}
            />
          </FormField>

          <FormField
            label="Allergies"
            htmlFor="child-allergies"
            error={form.formState.errors.allergies?.message}
            hint="Separate multiple allergies with commas."
          >
            <Input
              id="child-allergies"
              placeholder="Peanuts, dairy"
              {...form.register("allergies")}
            />
          </FormField>

          <FormField
            label="Support needs"
            htmlFor="child-special-needs"
            error={form.formState.errors.specialNeeds?.message}
          >
            <Textarea
              id="child-special-needs"
              rows={2}
              placeholder="Sensory sensitivities, medical needs, or anything a sitter should know."
              {...form.register("specialNeeds")}
            />
          </FormField>

          <FormField
            label="Notes & routines"
            htmlFor="child-notes"
            error={form.formState.errors.notes?.message}
          >
            <Textarea
              id="child-notes"
              rows={3}
              placeholder="Bedtime, favourite books, comfort items…"
              {...form.register("notes")}
            />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {child ? "Save changes" : "Add child"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

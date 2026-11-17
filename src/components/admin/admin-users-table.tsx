"use client";

import { useRef, useState } from "react";
import { Search, ShieldCheck, UserCheck, UserX, Users } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { SkeletonTable } from "@/components/shared/skeletons";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminUsers, useUpdateUserStatus } from "@/hooks/use-admin";
import { useAuth } from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/api/client";
import { formatDate, formatRelative } from "@/lib/format";
import type { Role, User, UserStatus } from "@/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

const ROLE_STYLES: Record<Role, string> = {
  parent: "border-sky-300/60 bg-sky-100 text-sky-900 dark:bg-sky-500/15 dark:text-sky-200",
  sitter: "border-teal-300/60 bg-teal-100 text-teal-900 dark:bg-teal-500/15 dark:text-teal-200",
  admin: "border-violet-300/60 bg-violet-100 text-violet-900 dark:bg-violet-500/15 dark:text-violet-200",
};

const STATUS_STYLES: Record<UserStatus, string> = {
  active:
    "border-emerald-300/60 bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200",
  suspended: "border-rose-300/60 bg-rose-100 text-rose-900 dark:bg-rose-500/15 dark:text-rose-200",
  pending:
    "border-amber-300/60 bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200",
};

export function AdminUsersTable() {
  const { user: currentUser } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<Role | "all">("all");
  const [status, setStatus] = useState<UserStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [pendingChange, setPendingChange] = useState<{ user: User; status: UserStatus } | null>(
    null,
  );
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateStatus = useUpdateUserStatus();

  const usersQuery = useAdminUsers({
    q: query || undefined,
    role: role === "all" ? undefined : role,
    status: status === "all" ? undefined : status,
    page,
    pageSize: PAGE_SIZE,
  });

  function onSearchChange(value: string) {
    setSearchInput(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setQuery(value);
      setPage(1);
    }, 350);
  }

  const result = usersQuery.data;

  return (
    <div>
      <PageHeader
        eyebrow="People"
        title="Users"
        description="Search everyone on the platform, review account health, and suspend bad actors."
        actions={
          result ? (
            <p className="text-muted-foreground text-sm">
              {result.total} {result.total === 1 ? "account" : "accounts"}
            </p>
          ) : null
        }
      />

      <Card className="mb-4">
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              value={searchInput}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by name or email…"
              aria-label="Search users"
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={role}
              onValueChange={(value) => {
                setRole(value as Role | "all");
                setPage(1);
              }}
            >
              <SelectTrigger aria-label="Filter by role" className="w-36">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="parent">Parents</SelectItem>
                <SelectItem value="sitter">Sitters</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as UserStatus | "all");
                setPage(1);
              }}
            >
              <SelectTrigger aria-label="Filter by status" className="w-36">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {usersQuery.isPending ? (
        <SkeletonTable rows={8} columns={5} />
      ) : usersQuery.isError || !result ? (
        <ErrorState
          title="Users didn't load"
          description="The account directory is temporarily unavailable."
          onRetry={() => void usersQuery.refetch()}
        />
      ) : result.data.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No matching accounts"
          description="Try a different search term or clear the role and status filters."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSearchInput("");
                setQuery("");
                setRole("all");
                setStatus("all");
                setPage(1);
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <div className="border-border overflow-hidden rounded-xl border">
            <Table>
              <caption className="sr-only">Platform users</caption>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Account</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Joined</TableHead>
                  <TableHead className="hidden xl:table-cell">Last active</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.data.map((user) => {
                  const isSelf = user.id === currentUser?.id;
                  const nextStatus: UserStatus =
                    user.status === "suspended" ? "active" : "suspended";
                  const actionLabel =
                    user.status === "suspended"
                      ? "Reactivate"
                      : user.status === "pending"
                        ? "Approve"
                        : "Suspend";
                  const ActionIcon =
                    user.status === "suspended"
                      ? UserCheck
                      : user.status === "pending"
                        ? ShieldCheck
                        : UserX;

                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <UserAvatar src={user.avatarUrl} name={`${user.firstName} ${user.lastName}`} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {user.firstName} {user.lastName}
                              {isSelf ? (
                                <span className="text-muted-foreground ml-1.5 text-[10px]">(you)</span>
                              ) : null}
                            </p>
                            <p className="text-muted-foreground truncate text-xs">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("capitalize", ROLE_STYLES[user.role])}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("capitalize", STATUS_STYLES[user.status])}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden text-xs whitespace-nowrap lg:table-cell">
                        {formatDate(user.createdAt, "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden text-xs whitespace-nowrap xl:table-cell">
                        {formatRelative(user.lastActiveAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isSelf}
                          onClick={() => setPendingChange({ user, status: nextStatus })}
                        >
                          <ActionIcon className="size-3.5" />
                          {actionLabel}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            totalItems={result.total}
            pageSize={result.pageSize}
            onPageChange={setPage}
          />
        </>
      )}

      <ConfirmDialog
        open={Boolean(pendingChange)}
        onOpenChange={(open) => {
          if (!open) setPendingChange(null);
        }}
        title={
          pendingChange
            ? `${pendingChange.status === "suspended" ? "Suspend" : "Activate"} ${pendingChange.user.firstName}?`
            : "Update account"
        }
        description={
          pendingChange?.status === "suspended"
            ? "They'll be signed out and blocked from booking or accepting care until reactivated."
            : "They'll regain full access to the marketplace immediately."
        }
        confirmLabel={pendingChange?.status === "suspended" ? "Suspend account" : "Activate account"}
        destructive={pendingChange?.status === "suspended"}
        loading={updateStatus.isPending}
        onConfirm={() => {
          if (!pendingChange) return;
          updateStatus.mutate(
            { id: pendingChange.user.id, status: pendingChange.status },
            {
              onSuccess: () => {
                toast.success(
                  pendingChange.status === "suspended"
                    ? "Account suspended"
                    : "Account activated",
                );
                setPendingChange(null);
              },
              onError: (error) => toast.error(getErrorMessage(error)),
            },
          );
        }}
      />
    </div>
  );
}

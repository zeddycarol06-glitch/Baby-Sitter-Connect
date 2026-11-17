"use client";

import { useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  Lock,
  ShieldCheck,
  Upload,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/skeletons";
import { DocumentStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSitterProfile } from "@/hooks/use-sitters";
import {
  useUploadVerificationDocument,
  useVerificationDocuments,
} from "@/hooks/use-verification";
import { getErrorMessage } from "@/lib/api/client";
import { formatDate } from "@/lib/format";
import type { VerificationDocument, VerificationDocumentType } from "@/types";
import { cn } from "@/lib/utils";

const DOCUMENT_TYPES: {
  type: VerificationDocumentType;
  label: string;
  description: string;
  required: boolean;
}[] = [
  {
    type: "government_id",
    label: "Government-issued photo ID",
    description: "Driver's license, passport, or state ID. Make sure all four corners are visible.",
    required: true,
  },
  {
    type: "background_check",
    label: "Background check",
    description: "A current national or state background check from the last 12 months.",
    required: true,
  },
  {
    type: "certificate",
    label: "CPR or first-aid certificate",
    description: "An unexpired CPR, first-aid, or childcare certification.",
    required: false,
  },
];

const DOCUMENT_LABELS: Record<VerificationDocumentType, string> = {
  government_id: "Government ID",
  background_check: "Background check",
  certificate: "CPR / first aid certificate",
};

const STATUS_COPY = {
  verified: {
    title: "You're verified",
    description:
      "Your documents are approved. The verified badge now appears on your profile and in search results.",
    className:
      "border-emerald-300/60 bg-emerald-50 text-emerald-950 dark:bg-emerald-500/10 dark:text-emerald-100",
    icon: CheckCircle2,
    iconClass: "text-emerald-600 dark:text-emerald-400",
  },
  pending: {
    title: "Documents in review",
    description:
      "Our trust & safety team is reviewing your uploads. Most reviews finish within one business day.",
    className:
      "border-amber-300/60 bg-amber-50 text-amber-950 dark:bg-amber-500/10 dark:text-amber-100",
    icon: Clock3,
    iconClass: "text-amber-600 dark:text-amber-400",
  },
  rejected: {
    title: "Something needs another look",
    description:
      "One or more documents couldn't be approved. Check the notes below and upload a replacement.",
    className:
      "border-rose-300/60 bg-rose-50 text-rose-950 dark:bg-rose-500/10 dark:text-rose-100",
    icon: AlertCircle,
    iconClass: "text-rose-600 dark:text-rose-400",
  },
  unverified: {
    title: "Verification not started",
    description:
      "Upload the required documents to earn your verified badge and rank higher in family searches.",
    className: "border-border bg-muted/50",
    icon: ShieldCheck,
    iconClass: "text-primary",
  },
} as const;

function latestForType(
  documents: VerificationDocument[],
  type: VerificationDocumentType,
): VerificationDocument | undefined {
  return documents
    .filter((document) => document.type === type)
    .sort((left, right) => new Date(right.uploadedAt).getTime() - new Date(left.uploadedAt).getTime())[0];
}

export function SitterVerificationPageContent() {
  const profileQuery = useSitterProfile();
  const documentsQuery = useVerificationDocuments();
  const [uploadType, setUploadType] = useState<VerificationDocumentType | null>(null);

  if (profileQuery.isPending || documentsQuery.isPending) return <PageSkeleton />;

  if (profileQuery.isError || documentsQuery.isError || !profileQuery.data) {
    return (
      <div>
        <PageHeader title="Verification" />
        <ErrorState
          title="Verification didn't load"
          description="We couldn't retrieve your documents."
          onRetry={() => {
            void profileQuery.refetch();
            void documentsQuery.refetch();
          }}
        />
      </div>
    );
  }

  const profile = profileQuery.data;
  const documents = documentsQuery.data ?? [];
  const statusCopy = STATUS_COPY[profile.verificationStatus];
  const StatusIcon = statusCopy.icon;

  const requiredDocuments = DOCUMENT_TYPES.filter((item) => item.required);
  const approvedRequired = requiredDocuments.filter(
    (item) => latestForType(documents, item.type)?.status === "approved",
  ).length;
  const completion = Math.round((approvedRequired / requiredDocuments.length) * 100);

  const reviewable = [...documents].sort(
    (left, right) => new Date(right.uploadedAt).getTime() - new Date(left.uploadedAt).getTime(),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Trust & safety"
        title="Verification"
        description="Verified sitters get discovered first and booked more often. Everything here is reviewed by a real person."
        actions={
          <Button onClick={() => setUploadType("government_id")}>
            <Upload className="size-4" />
            Upload a document
          </Button>
        }
      />

      <div className={cn("rounded-xl border p-4 sm:p-5", statusCopy.className)}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <StatusIcon className={cn("mt-0.5 size-5 shrink-0", statusCopy.iconClass)} aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">{statusCopy.title}</p>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed opacity-80">
                {statusCopy.description}
              </p>
            </div>
          </div>
          <div className="min-w-40 shrink-0">
            <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium">
              <span>Required documents</span>
              <span>
                {approvedRequired}/{requiredDocuments.length}
              </span>
            </div>
            <Progress value={completion} aria-label="Required verification documents approved" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <Card>
          <CardHeader>
            <CardTitle>Document checklist</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {DOCUMENT_TYPES.map((item) => {
              const document = latestForType(documents, item.type);
              return (
                <div key={item.type} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
                        document?.status === "approved"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                          : document?.status === "rejected"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {document?.status === "approved" ? (
                        <CheckCircle2 className="size-4" aria-hidden="true" />
                      ) : document?.status === "rejected" ? (
                        <XCircle className="size-4" aria-hidden="true" />
                      ) : (
                        <FileText className="size-4" aria-hidden="true" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                        {item.label}
                        {item.required ? (
                          <span className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
                            Required
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
                            Optional
                          </span>
                        )}
                        {document ? <DocumentStatusBadge status={document.status} /> : null}
                      </p>
                      <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                        {item.description}
                      </p>
                      {document ? (
                        <p className="text-muted-foreground mt-1.5 text-[11px]">
                          {document.fileName} · uploaded {formatDate(document.uploadedAt, "MMM d, yyyy")}
                          {document.reviewedAt
                            ? ` · reviewed ${formatDate(document.reviewedAt, "MMM d, yyyy")}`
                            : ""}
                        </p>
                      ) : (
                        <p className="text-muted-foreground mt-1.5 text-[11px]">No file uploaded yet.</p>
                      )}
                      {document?.rejectionReason ? (
                        <p className="mt-2 rounded-md bg-rose-100 px-2 py-1.5 text-[11px] leading-relaxed text-rose-900 dark:bg-rose-500/15 dark:text-rose-200">
                          <span className="font-semibold">Reviewer note: </span>
                          {document.rejectionReason}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 self-start sm:self-center"
                    onClick={() => setUploadType(item.type)}
                  >
                    <Upload className="size-3.5" />
                    {document ? "Replace" : "Upload"}
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>How review works</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-xs">
                <li className="flex gap-2.5">
                  <span className="bg-primary/10 text-primary flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                    1
                  </span>
                  <span className="text-muted-foreground leading-relaxed">
                    Upload clear, full-page photos or PDFs. Blurry or cropped files are the most
                    common reason for rejection.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <span className="bg-primary/10 text-primary flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                    2
                  </span>
                  <span className="text-muted-foreground leading-relaxed">
                    A trust & safety reviewer checks each document. Most reviews finish within one
                    business day.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <span className="bg-primary/10 text-primary flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                    3
                  </span>
                  <span className="text-muted-foreground leading-relaxed">
                    When the required documents are approved, your verified badge goes live
                    automatically.
                  </span>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardContent>
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Lock className="text-primary size-4" aria-hidden="true" />
                Your privacy
              </p>
              <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                Documents are encrypted at rest and visible only to the verification team. Families
                never see your ID or background check.
              </p>
            </CardContent>
          </Card>

          {profile.verificationStatus === "verified" ? (
            <Card size="sm">
              <CardContent>
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <BadgeCheck className="text-primary size-4" aria-hidden="true" />
                  Badge active
                </p>
                <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                  Your profile is verified. Keep certificates current — expired documents may pause
                  new bookings until they&apos;re replaced.
                </p>
              </CardContent>
            </Card>
          ) : null}
        </aside>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload history</CardTitle>
        </CardHeader>
        <CardContent>
          {reviewable.length === 0 ? (
            <p className="text-muted-foreground py-4 text-sm">
              Nothing uploaded yet. Start with your government ID.
            </p>
          ) : (
            <ul className="divide-y">
              {reviewable.map((document) => (
                <li key={document.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <FileText className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{document.fileName}</p>
                      <p className="text-muted-foreground text-[11px]">
                        {DOCUMENT_LABELS[document.type]} · {formatDate(document.uploadedAt, "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <DocumentStatusBadge status={document.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {uploadType ? (
        <UploadDocumentDialog
          key={uploadType}
          open={Boolean(uploadType)}
          defaultType={uploadType}
          onOpenChange={(open) => {
            if (!open) setUploadType(null);
          }}
        />
      ) : null}
    </div>
  );
}

function UploadDocumentDialog({
  open,
  onOpenChange,
  defaultType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType: VerificationDocumentType;
}) {
  const uploadDocument = useUploadVerificationDocument();
  const [type, setType] = useState<VerificationDocumentType>(defaultType);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    if (!fileName) {
      setError("Choose a PDF or image to upload.");
      return;
    }
    uploadDocument.mutate(
      { type, fileName },
      {
        onSuccess: () => {
          toast.success("Document uploaded — we'll review it shortly");
          onOpenChange(false);
        },
        onError: (mutationError) => setError(getErrorMessage(mutationError)),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload a document</DialogTitle>
          <DialogDescription>
            PDF, JPG, or PNG up to 10MB. Make sure the whole document is visible and readable.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="document-type">Document type</Label>
            <Select value={type} onValueChange={(value) => setType(value as VerificationDocumentType)}>
              <SelectTrigger id="document-type" className="w-full">
                <SelectValue placeholder="Choose a document type" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((item) => (
                  <SelectItem key={item.type} value={item.type}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="document-file">File</Label>
            <Input
              id="document-file"
              type="file"
              accept="image/*,.pdf"
              aria-invalid={Boolean(error && !fileName)}
              onChange={(event) => {
                setFileName(event.target.files?.[0]?.name ?? "");
                setError(null);
              }}
            />
            <p className="text-muted-foreground text-xs">
              Mock upload stores the file name only — nothing leaves your browser.
            </p>
          </div>

          {error ? (
            <p role="alert" className="text-destructive text-sm font-medium">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={uploadDocument.isPending}>
            {uploadDocument.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            Upload for review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

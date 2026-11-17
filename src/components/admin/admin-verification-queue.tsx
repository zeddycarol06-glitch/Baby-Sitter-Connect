"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  BadgeCheck,
  Check,
  FileText,
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { SkeletonList } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useReviewVerificationDocument,
  useVerificationQueue,
} from "@/hooks/use-verification";
import { getErrorMessage } from "@/lib/api/client";
import { formatDate, formatRelative } from "@/lib/format";
import type { VerificationDocument, VerificationDocumentType } from "@/types";

const DOCUMENT_LABELS: Record<VerificationDocumentType, string> = {
  government_id: "Government ID",
  background_check: "Background check",
  certificate: "CPR / first aid certificate",
};

const DOCUMENT_PREVIEW: Record<VerificationDocumentType, string> = {
  government_id: "/documents/sample-id.svg",
  background_check: "/documents/sample-document.svg",
  certificate: "/documents/sample-document.svg",
};

export function AdminVerificationQueue() {
  const queueQuery = useVerificationQueue();
  const reviewDocument = useReviewVerificationDocument();
  const [typeFilter, setTypeFilter] = useState<VerificationDocumentType | "all">("all");
  const [previewing, setPreviewing] = useState<VerificationDocument | null>(null);
  const [rejecting, setRejecting] = useState<VerificationDocument | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const documents = useMemo(() => queueQuery.data ?? [], [queueQuery.data]);
  const visible = useMemo(
    () => (typeFilter === "all" ? documents : documents.filter((doc) => doc.type === typeFilter)),
    [documents, typeFilter],
  );

  if (queueQuery.isPending) {
    return (
      <div>
        <PageHeader title="Verification queue" />
        <SkeletonList rows={4} />
      </div>
    );
  }

  if (queueQuery.isError) {
    return (
      <div>
        <PageHeader title="Verification queue" />
        <ErrorState
          title="Queue didn't load"
          description="Pending verification documents are temporarily unavailable."
          onRetry={() => void queueQuery.refetch()}
        />
      </div>
    );
  }

  function approve(document: VerificationDocument) {
    setReviewingId(document.id);
    reviewDocument.mutate(
      { id: document.id, status: "approved" },
      {
        onSuccess: () => {
          toast.success(`${document.fileName} approved`);
          setPreviewing(null);
        },
        onError: (error) => toast.error(getErrorMessage(error)),
        onSettled: () => setReviewingId(null),
      },
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Trust & safety"
        title="Verification queue"
        description="Review sitter documents carefully. Approving a document can automatically verify a sitter, so check the details match."
        actions={
          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as VerificationDocumentType | "all")}
          >
            <SelectTrigger aria-label="Filter by document type" className="w-52">
              <SelectValue placeholder="All document types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All document types</SelectItem>
              <SelectItem value="government_id">Government ID</SelectItem>
              <SelectItem value="background_check">Background check</SelectItem>
              <SelectItem value="certificate">CPR / first aid certificate</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <div className="mb-4 flex items-center gap-2 text-sm">
        <ShieldCheck className="text-primary size-4" aria-hidden="true" />
        <span className="font-medium">{documents.length}</span>
        <span className="text-muted-foreground">
          {documents.length === 1 ? "document" : "documents"} awaiting review
        </span>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={BadgeCheck}
          title="Queue is clear"
          description={
            documents.length === 0
              ? "Every pending document has been reviewed. New uploads will appear here."
              : "No pending documents match this filter. Try another document type."
          }
          action={
            documents.length > 0 ? (
              <Button variant="outline" onClick={() => setTypeFilter("all")}>
                Clear filter
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((document) => (
            <Card key={document.id} className="gap-4">
              <CardContent className="flex h-full flex-col">
                <div className="border-border bg-muted/40 relative aspect-[4/3] overflow-hidden rounded-lg border">
                  <Image
                    src={DOCUMENT_PREVIEW[document.type]}
                    alt={`Preview of ${document.fileName}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                  <span className="bg-background/90 absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-semibold">
                    {DOCUMENT_LABELS[document.type]}
                  </span>
                </div>

                <div className="mt-3 flex-1">
                  <p className="truncate text-sm font-semibold">{document.sitterName}</p>
                  <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-[11px]">
                    <FileText className="size-3" aria-hidden="true" />
                    <span className="truncate">{document.fileName}</span>
                  </p>
                  <p className="text-muted-foreground mt-1 text-[11px]">
                    Uploaded {formatRelative(document.uploadedAt)} ·{" "}
                    {formatDate(document.uploadedAt, "MMM d, yyyy")}
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewing(document)}
                    className="w-full"
                  >
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => approve(document)}
                    disabled={reviewDocument.isPending && reviewingId === document.id}
                    className="w-full"
                  >
                    {reviewDocument.isPending && reviewingId === document.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Check className="size-3.5" />
                    )}
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive col-span-2 w-full"
                    onClick={() => setRejecting(document)}
                  >
                    <X className="size-3.5" />
                    Reject with a reason
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {previewing ? (
        <PreviewDialog
          key={previewing.id}
          document={previewing}
          open={Boolean(previewing)}
          approving={reviewDocument.isPending && reviewingId === previewing.id}
          onApprove={() => approve(previewing)}
          onReject={() => {
            setRejecting(previewing);
            setPreviewing(null);
          }}
          onOpenChange={(open) => {
            if (!open) setPreviewing(null);
          }}
        />
      ) : null}

      {rejecting ? (
        <RejectDialog
          key={rejecting.id}
          document={rejecting}
          open={Boolean(rejecting)}
          onOpenChange={(open) => {
            if (!open) setRejecting(null);
          }}
        />
      ) : null}
    </div>
  );
}

function PreviewDialog({
  document,
  open,
  approving,
  onApprove,
  onReject,
  onOpenChange,
}: {
  document: VerificationDocument;
  open: boolean;
  approving: boolean;
  onApprove: () => void;
  onReject: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{document.sitterName} · {DOCUMENT_LABELS[document.type]}</DialogTitle>
          <DialogDescription>
            {document.fileName} · uploaded {formatDate(document.uploadedAt, "MMMM d, yyyy")}
          </DialogDescription>
        </DialogHeader>

        <div className="border-border bg-muted/40 relative aspect-[16/10] overflow-hidden rounded-lg border">
          <Image
            src={DOCUMENT_PREVIEW[document.type]}
            alt={`Preview of ${document.fileName}`}
            fill
            className="object-contain"
            sizes="(max-width: 640px) 100vw, 672px"
          />
        </div>

        <p className="text-muted-foreground text-xs leading-relaxed">
          This is a sample document rendered by the mock API. In production, the original upload
          would appear here with zoom and download controls.
        </p>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button type="button" variant="outline" className="text-destructive" onClick={onReject}>
            <X className="size-4" />
            Reject
          </Button>
          <Button type="button" onClick={onApprove} disabled={approving}>
            {approving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RejectDialog({
  document,
  open,
  onOpenChange,
}: {
  document: VerificationDocument;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const reviewDocument = useReviewVerificationDocument();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    if (reason.trim().length < 10) {
      setError("Give the sitter a clear reason (at least 10 characters).");
      return;
    }
    reviewDocument.mutate(
      { id: document.id, status: "rejected", reason: reason.trim() },
      {
        onSuccess: () => {
          toast.success(`${document.sitterName} was asked to re-upload`);
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
          <DialogTitle>Reject this document</DialogTitle>
          <DialogDescription>
            {document.sitterName} will see your note and can upload a replacement. Be specific and
            kind.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <label htmlFor="rejection-reason" className="text-sm font-medium">
            Reason for rejection
          </label>
          <Textarea
            id="rejection-reason"
            rows={4}
            value={reason}
            aria-invalid={Boolean(error)}
            onChange={(event) => {
              setReason(event.target.value);
              setError(null);
            }}
            placeholder="The expiry date is cut off — please upload a photo showing the full document."
          />
          <p className="text-muted-foreground text-xs">{reason.length}/300 characters</p>
        </div>

        {error ? (
          <p role="alert" className="text-destructive text-sm font-medium">
            {error}
          </p>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={submit}
            disabled={reviewDocument.isPending}
          >
            {reviewDocument.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Reject document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { SkeletonList } from "@/components/shared/skeletons";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConversations, useMarkConversationRead, useMessages, useSendMessage } from "@/hooks/use-messages";
import { useAuth } from "@/hooks/use-auth";
import { formatRelative, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export function MessagesWorkspace({ perspective }: { perspective: "parent" | "sitter" }) {
  const { user } = useAuth();
  const conversationsQuery = useConversations();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showThreadOnMobile, setShowThreadOnMobile] = useState(false);
  const [draft, setDraft] = useState("");
  const markedRead = useRef<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);

  const conversations = conversationsQuery.data ?? [];
  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedId) ?? conversations[0];
  const activeId = selectedConversation?.id ?? "";

  const messagesQuery = useMessages(activeId);
  const sendMessage = useSendMessage(activeId);
  const markRead = useMarkConversationRead();
  const messages = messagesQuery.data ?? [];

  useEffect(() => {
    if (!activeId) return;
    if (selectedConversation && selectedConversation.unreadCount > 0 && !markedRead.current.has(activeId)) {
      markedRead.current.add(activeId);
      markRead.mutate(activeId);
    }
  }, [activeId, selectedConversation, markRead]);

  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages.length, activeId]);

  function submitMessage() {
    const body = draft.trim();
    if (!body) return;
    sendMessage.mutate(body, {
      onSuccess: () => setDraft(""),
      onError: () => toast.error("Message didn't send. Please try again."),
    });
  }

  if (conversationsQuery.isPending) {
    return <SkeletonList rows={5} />;
  }

  if (conversationsQuery.isError) {
    return (
      <ErrorState
        title="Messages didn't load"
        description="We couldn't retrieve your conversations."
        onRetry={() => void conversationsQuery.refetch()}
      />
    );
  }

  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No conversations yet"
        description={
          perspective === "parent"
            ? "Once you request a sitter, you can message them here to share routines and ask questions."
            : "When a parent books you, your conversation will appear here."
        }
        action={
          <Button asChild>
            <Link href={perspective === "parent" ? "/search" : "/sitter/requests"}>
              {perspective === "parent" ? "Find a sitter" : "View requests"}
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="bg-card overflow-hidden rounded-xl ring-1 ring-foreground/10">
      <div className="grid h-[calc(100dvh-11rem)] min-h-[34rem] md:grid-cols-[18rem_1fr]">
        <aside
          className={cn(
            "border-border flex flex-col border-r",
            showThreadOnMobile && "hidden md:flex",
          )}
          aria-label="Conversations"
        >
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">
              Conversations{" "}
              <span className="text-muted-foreground font-normal">({conversations.length})</span>
            </h2>
          </div>
          <ul className="flex-1 overflow-y-auto">
            {conversations.map((conversation) => {
              const active = conversation.id === activeId;
              return (
                <li key={conversation.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(conversation.id);
                      setShowThreadOnMobile(true);
                    }}
                    className={cn(
                      "hover:bg-muted/60 flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                      active && "bg-primary/5",
                    )}
                    aria-current={active ? "true" : undefined}
                  >
                    <UserAvatar
                      src={conversation.otherPartyAvatar}
                      name={conversation.otherPartyName}
                      className="size-9 shrink-0"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium">
                          {conversation.otherPartyName}
                        </span>
                        <span className="text-muted-foreground shrink-0 text-[10px]">
                          {formatRelative(conversation.lastMessageAt)}
                        </span>
                      </span>
                      <span className="text-muted-foreground mt-0.5 line-clamp-1 block text-xs">
                        {conversation.lastMessage}
                      </span>
                    </span>
                    {conversation.unreadCount > 0 ? (
                      <span className="bg-primary text-primary-foreground mt-1 flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold">
                        {conversation.unreadCount}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <section
          className={cn("flex min-h-0 flex-col", !showThreadOnMobile && "hidden md:flex")}
          aria-label="Message thread"
        >
          {selectedConversation ? (
            <>
              <div className="border-border flex items-center justify-between gap-3 border-b px-4 py-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="md:hidden"
                    onClick={() => setShowThreadOnMobile(false)}
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="size-4" />
                  </Button>
                  <UserAvatar
                    src={selectedConversation.otherPartyAvatar}
                    name={selectedConversation.otherPartyName}
                    className="size-8"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {selectedConversation.otherPartyName}
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                      {perspective === "parent" ? "Your sitter" : "Parent"} · Booking{" "}
                      {selectedConversation.bookingId.slice(-6)}
                    </p>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm" className="shrink-0">
                  <Link
                    href={
                      perspective === "parent"
                        ? `/parent/bookings/${selectedConversation.bookingId}`
                        : `/sitter/requests/${selectedConversation.bookingId}`
                    }
                  >
                    <CalendarDays className="size-3.5" />
                    <span className="hidden sm:inline">View booking</span>
                  </Link>
                </Button>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
                {messagesQuery.isPending ? (
                  <div className="space-y-3" aria-busy="true">
                    {[0, 1, 2].map((index) => (
                      <div key={index} className="bg-muted h-12 w-2/3 animate-pulse rounded-xl" />
                    ))}
                  </div>
                ) : messagesQuery.isError ? (
                  <ErrorState
                    compact
                    title="This conversation didn't load"
                    onRetry={() => void messagesQuery.refetch()}
                  />
                ) : messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground max-w-xs text-center text-sm">
                      No messages yet. Say hello and share anything the other person should know.
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const mine = message.senderId === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={cn("flex", mine ? "justify-end" : "justify-start")}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] rounded-2xl px-3.5 py-2 sm:max-w-[70%]",
                            mine
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-muted rounded-bl-sm",
                          )}
                        >
                          {!mine ? (
                            <p className="mb-0.5 text-[11px] font-medium opacity-80">
                              {message.senderName}
                            </p>
                          ) : null}
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.body}
                          </p>
                          <p
                            className={cn(
                              "mt-1 text-right text-[10px]",
                              mine ? "text-primary-foreground/70" : "text-muted-foreground",
                            )}
                          >
                            {formatTime(message.createdAt.slice(11, 16))}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <form
                className="border-border flex items-center gap-2 border-t p-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  submitMessage();
                }}
              >
                <label htmlFor="message-input" className="sr-only">
                  Message
                </label>
                <Input
                  id="message-input"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Write a message…"
                  maxLength={1000}
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!draft.trim() || sendMessage.isPending}
                  aria-label="Send message"
                >
                  <Send className="size-4" />
                </Button>
              </form>
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
}

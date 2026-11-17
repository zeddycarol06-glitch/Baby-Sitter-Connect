import { request } from "@/lib/api/client";
import type { Conversation, Message } from "@/types";

export async function getConversations(): Promise<Conversation[]> {
  return request<Conversation[]>({ url: "/conversations" });
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  return request<Message[]>({ url: `/conversations/${conversationId}/messages` });
}

export async function sendMessage(conversationId: string, body: string): Promise<Message> {
  return request<Message>({
    url: `/conversations/${conversationId}/messages`,
    method: "post",
    data: { body },
  });
}

export async function markConversationRead(conversationId: string): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>({
    url: `/conversations/${conversationId}/read`,
    method: "post",
  });
}

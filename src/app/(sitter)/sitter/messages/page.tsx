import { MessagesWorkspace } from "@/components/messages/messages-workspace";
import { PageHeader } from "@/components/shared/page-header";

export default function SitterMessagesPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Messages"
        title="Conversations"
        description="Coordinate arrival times, routines, and care updates with parents."
      />
      <MessagesWorkspace perspective="sitter" />
    </div>
  );
}

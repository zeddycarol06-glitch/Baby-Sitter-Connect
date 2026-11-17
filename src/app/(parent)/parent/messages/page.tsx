import { MessagesWorkspace } from "@/components/messages/messages-workspace";
import { PageHeader } from "@/components/shared/page-header";

export default function ParentMessagesPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Messages"
        title="Conversations"
        description="Keep everything about your booking in one place."
      />
      <MessagesWorkspace perspective="parent" />
    </div>
  );
}

import { ChildrenManager } from "@/components/parent/children-manager";
import { PageHeader } from "@/components/shared/page-header";

export default function ParentChildrenPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Children"
        title="Your children"
        description="The more a sitter knows, the smoother the first visit feels."
      />
      <ChildrenManager />
    </div>
  );
}

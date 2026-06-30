import { AdminShell } from "@/components/admin/admin-shell";
import { WorkEditorForm } from "@/components/admin/work-editor-form";

export default function AdminWorkNewPage() {
  return (
    <AdminShell
      title="New Work"
      description="新規作成した作品は works.json と画像ファイルに保存されます。"
    >
      <WorkEditorForm mode="create" />
    </AdminShell>
  );
}

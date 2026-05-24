import { AdminShell } from "@/components/admin/admin-shell";
import { WorkEditorForm } from "@/components/admin/work-editor-form";

export default function AdminWorkNewPage() {
  return (
    <AdminShell
      title="New Work"
      description="新規作成画面の骨組みです。保存機能と画像アップロードは次段階で接続します。"
    >
      <WorkEditorForm mode="create" />
    </AdminShell>
  );
}

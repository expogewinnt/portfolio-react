import { AdminShell } from "@/components/admin/admin-shell";
import { DemoWorkEditorForm } from "@/components/admin/demo-work-editor-form";

export default function DemoAdminWorkNewPage() {
  return (
    <AdminShell
      mode="demo"
      title="New Demo Work"
      description="新規作成した作品は localStorage のデモデータとして保存されます。"
    >
      <DemoWorkEditorForm mode="create" />
    </AdminShell>
  );
}

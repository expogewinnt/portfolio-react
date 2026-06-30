import { DemoWorksList } from "@/components/admin/demo-works-list";
import { AdminShell } from "@/components/admin/admin-shell";

export default function DemoAdminWorksPage() {
  return (
    <AdminShell
      mode="demo"
      title="Demo Works"
      description="デモ用の作品一覧です。追加・編集・削除は localStorage に反映されます。"
    >
      <DemoWorksList />
    </AdminShell>
  );
}

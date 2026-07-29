import { DemoWorksList } from "@/components/admin/demo-works-list";
import { AdminShell } from "@/components/admin/admin-shell";

export default function DemoAdminWorksPage() {
  return (
    <AdminShell
      mode="demo"
      title="Demo Works"
      description="デモ用の作品一覧です。ドラッグ＆ドロップで表示順を変更できます。変更は localStorage に反映されます。"
    >
      <DemoWorksList />
    </AdminShell>
  );
}

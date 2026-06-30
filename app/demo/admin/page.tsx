import { DemoDashboardContent } from "@/components/admin/demo-dashboard-content";
import { AdminShell } from "@/components/admin/admin-shell";

export default function DemoAdminDashboardPage() {
  return (
    <AdminShell
      mode="demo"
      title="Demo Dashboard"
      description="採用担当者向けデモモードです。変更はブラウザ内の localStorage にのみ保存されます。"
    >
      <DemoDashboardContent />
    </AdminShell>
  );
}

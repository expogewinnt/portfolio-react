import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { WorkEditorForm } from "@/components/admin/work-editor-form";
import { getAdminWorkById } from "@/lib/admin-works";

export default async function AdminWorkDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const work = await getAdminWorkById(id);

  if (!work) {
    notFound();
  }

  return (
    <AdminShell title={work.ttl} description="本番ギャラリー用の編集画面です。">
      <WorkEditorForm mode="edit" work={work} />
    </AdminShell>
  );
}

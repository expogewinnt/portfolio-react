import Link from "next/link";
import { ProductionWorksList } from "@/components/admin/production-works-list";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminWorks } from "@/lib/admin-works";

export default async function AdminWorksPage() {
  const adminWorks = await getAdminWorks();

  return (
    <AdminShell
      title="Works"
      description="本番ギャラリー用の作品一覧です。ドラッグ＆ドロップで表示順を変更できます。"
    >
      <section className="adminPanel">
        <div className="adminPanelHeader">
          <h2 className="adminPanelTitle">All Works</h2>
          <Link href="/admin/works/new" className="adminPrimaryButton adminInlineButton">
            New Work
          </Link>
        </div>
        <ProductionWorksList works={adminWorks} />
      </section>
    </AdminShell>
  );
}

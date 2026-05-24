import Link from "next/link";
import { AdminNavButton } from "@/components/admin/admin-nav-button";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminWorks } from "@/lib/admin-works";

export default async function AdminDashboardPage() {
  const adminWorks = await getAdminWorks();
  const latestWorks = adminWorks.slice(0, 3);

  return (
    <AdminShell
      title="Dashboard"
      description="公開ギャラリーの管理基盤です。現在はローカルデータを参照する土台段階です。"
    >
      <section className="adminStatsGrid">
        <article className="adminStatCard">
          <span className="adminStatLabel">Works</span>
          <strong className="adminStatValue">{adminWorks.length}</strong>
        </article>
        <article className="adminStatCard">
          <span className="adminStatLabel">Auth</span>
          <strong className="adminStatValue">Cookie Login</strong>
        </article>
        <article className="adminStatCard">
          <span className="adminStatLabel">Storage</span>
          <strong className="adminStatValue">Local Copy</strong>
        </article>
      </section>

      <section className="adminPanel">
        <div className="adminPanelHeader">
          <h2 className="adminPanelTitle">Recent Works</h2>
          <Link href="/admin/works" className="adminTextLink">
            全件を見る
          </Link>
        </div>
        <div className="adminList">
          {latestWorks.map((work) => (
            <div key={work.id} className="adminListItem">
              <div>
                <p className="adminListTitle">{work.ttl}</p>
                <p className="adminMuted">{work.id}</p>
              </div>
              <AdminNavButton
                href={`/admin/works/${work.id}`}
                label="Edit"
                className="adminSecondaryButton"
              />
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}

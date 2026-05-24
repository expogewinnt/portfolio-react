/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { deleteWorkAction } from "@/app/admin/actions";
import { AdminNavButton } from "@/components/admin/admin-nav-button";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminWorks } from "@/lib/admin-works";

export default async function AdminWorksPage() {
  const adminWorks = await getAdminWorks();

  return (
    <AdminShell title="Works">
      <section className="adminPanel">
        <div className="adminPanelHeader">
          <h2 className="adminPanelTitle">All Works</h2>
          <Link href="/admin/works/new" className="adminPrimaryButton adminInlineButton">
            New Work
          </Link>
        </div>
        <div className="adminTable">
          {adminWorks.map((work, index) => (
            <div key={work.id} className="adminTableRow">
              <div className="adminTableNumber">
                {String(adminWorks.length - index).padStart(3, "0")}
              </div>
              <div className="adminTableThumb">
                <img src={`/images/small/${work.img}`} alt={work.ttl} />
              </div>
              <div className="adminTableBody">
                <p className="adminListTitle">{work.ttl}</p>
                <p className="adminMuted">{work.charge}</p>
              </div>
              <div className="adminTableMeta">
                <AdminNavButton
                  href={`/admin/works/${work.id}`}
                  label="Edit"
                  className="adminSecondaryButton"
                />
                <form action={deleteWorkAction}>
                  <input type="hidden" name="id" value={work.id} />
                  <ConfirmDeleteButton className="adminInlineDangerButton" />
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}

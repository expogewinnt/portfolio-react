"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminLoadingPanel } from "@/components/admin/admin-loading-panel";
import { AdminNavButton } from "@/components/admin/admin-nav-button";
import { useGalleryContext } from "@/components/admin/gallery-context";
import { getWorkImageSrc, htmlUnescape } from "@/lib/gallery-utils";

export function DemoWorksList() {
  const router = useRouter();
  const { works, isReady, deleteWork } = useGalleryContext();

  if (!isReady) {
    return <AdminLoadingPanel />;
  }

  return (
    <section className="adminPanel">
      <div className="adminPanelHeader">
        <h2 className="adminPanelTitle">All Demo Works</h2>
        <Link href="/demo/admin/works/new" className="adminPrimaryButton adminInlineButton">
          New Demo Work
        </Link>
      </div>
      <div className="adminTable">
        {works.map((work, index) => (
          <div key={work.id} className="adminTableRow">
            <div className="adminTableNumber">
              {String(works.length - index).padStart(3, "0")}
            </div>
            <div className="adminTableThumb">
              <img src={getWorkImageSrc(work)} alt={htmlUnescape(work.ttl)} />
            </div>
            <div className="adminTableBody">
              <p className="adminListTitle">{htmlUnescape(work.ttl)}</p>
              <p className="adminMuted">{htmlUnescape(work.charge)}</p>
            </div>
            <div className="adminTableMeta">
              <AdminNavButton
                href={`/demo/admin/works/${work.id}`}
                label="Edit"
                className="adminSecondaryButton"
              />
              <button
                type="button"
                className="adminInlineDangerButton"
                onClick={() => {
                  if (!window.confirm("この作品を削除します。よろしいですか？")) {
                    return;
                  }

                  deleteWork(work.id);
                  router.refresh();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

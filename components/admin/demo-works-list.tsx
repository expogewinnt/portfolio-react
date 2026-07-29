"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminLoadingPanel } from "@/components/admin/admin-loading-panel";
import { AdminNavButton } from "@/components/admin/admin-nav-button";
import { useGalleryContext } from "@/components/admin/gallery-context";
import {
  SortableWorksTable,
  type SortableWorkRow
} from "@/components/admin/sortable-works-table";
import { getWorkImageSrc, htmlUnescape } from "@/lib/gallery-utils";

export function DemoWorksList() {
  const router = useRouter();
  const { works, isReady, deleteWork, reorderWorks } = useGalleryContext();

  if (!isReady) {
    return <AdminLoadingPanel />;
  }

  const rows: SortableWorkRow[] = works.map((work) => ({
    id: work.id,
    title: htmlUnescape(work.ttl),
    charge: htmlUnescape(work.charge),
    imageSrc: getWorkImageSrc(work)
  }));

  return (
    <section className="adminPanel">
      <div className="adminPanelHeader">
        <h2 className="adminPanelTitle">All Demo Works</h2>
        <Link href="/demo/admin/works/new" className="adminPrimaryButton adminInlineButton">
          New Demo Work
        </Link>
      </div>
      <SortableWorksTable
        works={rows}
        onReorder={async (orderedIds) => {
          const ok = reorderWorks(orderedIds);
          if (!ok) {
            throw new Error("並び替えに失敗しました。");
          }
          router.refresh();
        }}
        renderActions={(work) => (
          <>
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
          </>
        )}
      />
    </section>
  );
}

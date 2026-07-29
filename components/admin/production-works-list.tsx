"use client";

import { useRouter } from "next/navigation";
import { deleteWorkAction, reorderWorksAction } from "@/app/admin/actions";
import { AdminNavButton } from "@/components/admin/admin-nav-button";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import {
  SortableWorksTable,
  type SortableWorkRow
} from "@/components/admin/sortable-works-table";
import { getAdminWorkPreviewSrc } from "@/lib/admin-work-image";
import type { AdminWork } from "@/lib/admin-works";
import { htmlUnescape } from "@/lib/gallery-utils";

type ProductionWorksListProps = {
  works: AdminWork[];
};

export function ProductionWorksList({ works }: ProductionWorksListProps) {
  const router = useRouter();

  const rows: SortableWorkRow[] = works.map((work) => ({
    id: work.id,
    title: htmlUnescape(work.ttl),
    charge: htmlUnescape(work.charge),
    imageSrc: getAdminWorkPreviewSrc(work)
  }));

  return (
    <SortableWorksTable
      works={rows}
      onReorder={async (orderedIds) => {
        const result = await reorderWorksAction(orderedIds);
        if (result.error) {
          throw new Error(result.error);
        }
        router.refresh();
      }}
      renderActions={(work) => (
        <>
          <AdminNavButton
            href={`/admin/works/${work.id}`}
            label="Edit"
            className="adminSecondaryButton"
          />
          <form action={deleteWorkAction}>
            <input type="hidden" name="id" value={work.id} />
            <ConfirmDeleteButton className="adminInlineDangerButton" />
          </form>
        </>
      )}
    />
  );
}

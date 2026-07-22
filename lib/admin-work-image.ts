import { getMicroCmsImageSrc } from "@/lib/microcms-image";
import type { AdminWork } from "@/lib/admin-works";

export function getAdminWorkPreviewSrc(work: AdminWork) {
  if (work.imageUrl) {
    return getMicroCmsImageSrc(work.imageUrl, "small");
  }

  return `/images/small/${work.img}`;
}

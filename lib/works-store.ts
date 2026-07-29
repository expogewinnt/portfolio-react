import "server-only";

import { isMicroCmsConfigured } from "@/lib/cms-config";
import {
  createWorkInMicroCms,
  deleteWorkFromMicroCms,
  readWorksFromMicroCms,
  reorderWorksInMicroCms,
  updateWorkInMicroCms
} from "@/lib/microcms-client";
import {
  createWorkInLocal,
  deleteWorkFromLocal,
  readWorksFromLocal,
  reorderWorksInLocal,
  updateWorkInLocal
} from "@/lib/works-store-local";
import type { WorkItem } from "@/lib/works";

export function htmlUnescape(value: string) {
  return value.replaceAll("&amp;", "&");
}

export async function readWorks(): Promise<WorkItem[]> {
  if (isMicroCmsConfigured()) {
    return readWorksFromMicroCms();
  }

  return readWorksFromLocal();
}

export async function createWork(input: {
  title: string;
  charge: string;
  imageFile: File;
}) {
  if (isMicroCmsConfigured()) {
    await createWorkInMicroCms(input);
    return;
  }

  await createWorkInLocal(input);
}

export async function deleteWorkByImageName(imageName: string) {
  if (isMicroCmsConfigured()) {
    throw new Error("deleteWorkByImageName is not supported for microCMS. Use deleteWorkById.");
  }

  return deleteWorkFromLocal(imageName);
}

export async function deleteWorkById(id: string) {
  if (isMicroCmsConfigured()) {
    await deleteWorkFromMicroCms(id);
    return true;
  }

  throw new Error("deleteWorkById requires microCMS configuration.");
}

export async function updateWorkByImageName(input: {
  imageName: string;
  title: string;
  charge: string;
}) {
  if (isMicroCmsConfigured()) {
    throw new Error("updateWorkByImageName is not supported for microCMS. Use updateWorkById.");
  }

  return updateWorkInLocal(input);
}

export async function updateWorkById(input: {
  id: string;
  title: string;
  charge: string;
}) {
  if (isMicroCmsConfigured()) {
    await updateWorkInMicroCms(input);
    return true;
  }

  throw new Error("updateWorkById requires microCMS configuration.");
}

export async function reorderWorks(galleryOrderedWorks: Array<{ id?: string; img: string }>) {
  if (isMicroCmsConfigured()) {
    const ids = galleryOrderedWorks.map((work) => {
      if (!work.id) {
        throw new Error("microCMS の作品 ID が取得できません。");
      }
      return work.id;
    });
    await reorderWorksInMicroCms(ids);
    return;
  }

  await reorderWorksInLocal(galleryOrderedWorks.map((work) => work.img));
}

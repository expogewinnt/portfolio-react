import "server-only";

import { getMicroCmsConfig } from "@/lib/cms-config";
import type { WorkItem } from "@/lib/works";

const WORKS_ENDPOINT = "works";
const WORKS_LIMIT = 100;

type MicroCmsImage = {
  url: string;
  height?: number;
  width?: number;
};

type MicroCmsWorkContent = {
  id: string;
  title: string;
  charge: string;
  image: MicroCmsImage;
  order?: number;
  publishedAt?: string;
  revisedAt?: string;
};

type MicroCmsListResponse = {
  contents: MicroCmsWorkContent[];
  totalCount: number;
};

export class MicroCmsError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "MicroCmsError";
    this.status = status;
  }
}

function requireMicroCmsConfig() {
  const config = getMicroCmsConfig();
  if (!config) {
    throw new Error("microCMS is not configured.");
  }

  return config;
}

function htmlEscape(value: string) {
  return value.replaceAll("&", "&amp;");
}

function toWorkItem(content: MicroCmsWorkContent): WorkItem {
  const imageUrl = content.image?.url ?? "";

  return {
    id: content.id,
    ttl: content.title,
    charge: content.charge,
    img: imageUrl ? imageUrl.split("/").at(-1) ?? content.id : content.id,
    imageUrl,
    sortOrder: typeof content.order === "number" ? content.order : undefined
  };
}

function sortMicroCmsContents(contents: MicroCmsWorkContent[]) {
  return [...contents].sort((a, b) => {
    const aOrder = a.order;
    const bOrder = b.order;
    const aHasOrder = typeof aOrder === "number";
    const bHasOrder = typeof bOrder === "number";

    if (aHasOrder && bHasOrder && aOrder !== bOrder) {
      return aOrder - bOrder;
    }

    if (aHasOrder !== bHasOrder) {
      return aHasOrder ? -1 : 1;
    }

    return (a.publishedAt ?? "").localeCompare(b.publishedAt ?? "");
  });
}

async function parseErrorResponse(response: Response) {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message ?? response.statusText;
  } catch {
    return response.statusText;
  }
}

async function microCmsRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const { serviceDomain, apiKey } = requireMicroCmsConfig();
  const response = await fetch(`https://${serviceDomain}.microcms.io/api/v1${path}`, {
    ...init,
    headers: {
      "X-MICROCMS-API-KEY": apiKey,
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const message = await parseErrorResponse(response);
    throw new MicroCmsError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function uploadMedia(file: File) {
  const { serviceDomain, apiKey } = requireMicroCmsConfig();
  const formData = new FormData();
  formData.append("file", file, file.name);

  const response = await fetch(`https://${serviceDomain}.microcms-management.io/api/v1/media`, {
    method: "POST",
    headers: {
      "X-MICROCMS-API-KEY": apiKey
    },
    body: formData
  });

  if (!response.ok) {
    const message = await parseErrorResponse(response);
    throw new MicroCmsError(response.status, message);
  }

  const body = (await response.json()) as { url: string };
  return body.url;
}

export async function readWorksFromMicroCms(): Promise<WorkItem[]> {
  const response = await microCmsRequest<MicroCmsListResponse>(
    `/${WORKS_ENDPOINT}?limit=${WORKS_LIMIT}&orders=order,publishedAt`
  );

  return sortMicroCmsContents(response.contents).map(toWorkItem);
}

export async function getWorkFromMicroCms(id: string) {
  const content = await microCmsRequest<MicroCmsWorkContent>(`/${WORKS_ENDPOINT}/${id}`);
  return toWorkItem(content);
}

async function getNextSortOrder() {
  const works = await readWorksFromMicroCms();
  // order 未設定の既存データは、現在のギャラリー順の位置を仮の番号として扱う
  const maxOrder = works.reduce((max, work, index) => {
    return Math.max(max, work.sortOrder ?? index + 1);
  }, works.length);

  return maxOrder + 1;
}

export async function createWorkInMicroCms(input: {
  title: string;
  charge: string;
  imageFile: File;
}) {
  const imageUrl = await uploadMedia(input.imageFile);
  const order = await getNextSortOrder();
  const baseContent = {
    title: htmlEscape(input.title),
    charge: htmlEscape(input.charge),
    image: imageUrl
  };

  try {
    await microCmsRequest<MicroCmsWorkContent>(`/${WORKS_ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...baseContent,
        order
      })
    });
  } catch (error) {
    // order フィールド未作成のサービス向けフォールバック
    if (
      error instanceof MicroCmsError &&
      /order/i.test(error.message) &&
      /unexpected key/i.test(error.message)
    ) {
      await microCmsRequest<MicroCmsWorkContent>(`/${WORKS_ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(baseContent)
      });
      return;
    }

    throw error;
  }
}

export async function updateWorkInMicroCms(input: {
  id: string;
  title: string;
  charge: string;
}) {
  await microCmsRequest<MicroCmsWorkContent>(`/${WORKS_ENDPOINT}/${input.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: htmlEscape(input.title),
      charge: htmlEscape(input.charge)
    })
  });
}

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>
) {
  let index = 0;

  async function runNext(): Promise<void> {
    while (index < items.length) {
      const current = index;
      index += 1;
      await worker(items[current]);
    }
  }

  const runners = Array.from({ length: Math.min(concurrency, items.length) }, () => runNext());
  await Promise.all(runners);
}

export async function reorderWorksInMicroCms(galleryOrderedIds: string[]) {
  try {
    const currentWorks = await readWorksFromMicroCms();
    const currentOrderById = new Map(
      currentWorks.map((work) => [work.id ?? "", work.sortOrder])
    );

    const updates = galleryOrderedIds
      .map((id, index) => ({
        id,
        order: index + 1
      }))
      .filter(({ id, order }) => currentOrderById.get(id) !== order);

    if (updates.length === 0) {
      return;
    }

    await runWithConcurrency(updates, 6, async ({ id, order }) => {
      await microCmsRequest<MicroCmsWorkContent>(`/${WORKS_ENDPOINT}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ order })
      });
    });
  } catch (error) {
    if (
      error instanceof MicroCmsError &&
      /order/i.test(error.message) &&
      /unexpected key/i.test(error.message)
    ) {
      throw new Error(
        "microCMS の works API に数字フィールド `order` を追加してください（並び替え用）。"
      );
    }

    throw error;
  }
}

export async function deleteWorkFromMicroCms(id: string) {
  await microCmsRequest<void>(`/${WORKS_ENDPOINT}/${id}`, {
    method: "DELETE"
  });
}

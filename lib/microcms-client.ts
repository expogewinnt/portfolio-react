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
    imageUrl
  };
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
    `/${WORKS_ENDPOINT}?limit=${WORKS_LIMIT}&orders=publishedAt`
  );

  return response.contents.map(toWorkItem);
}

export async function getWorkFromMicroCms(id: string) {
  const content = await microCmsRequest<MicroCmsWorkContent>(`/${WORKS_ENDPOINT}/${id}`);
  return toWorkItem(content);
}

export async function createWorkInMicroCms(input: {
  title: string;
  charge: string;
  imageFile: File;
}) {
  const imageUrl = await uploadMedia(input.imageFile);

  await microCmsRequest<MicroCmsWorkContent>(`/${WORKS_ENDPOINT}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: htmlEscape(input.title),
      charge: htmlEscape(input.charge),
      image: imageUrl
    })
  });
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

export async function deleteWorkFromMicroCms(id: string) {
  await microCmsRequest<void>(`/${WORKS_ENDPOINT}/${id}`, {
    method: "DELETE"
  });
}

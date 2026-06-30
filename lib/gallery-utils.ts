import { DEMO_WORKS_LIMIT } from "@/lib/gallery-constants";
import { parseSiteTitleLines, sanitizeSiteTitle } from "@/lib/site-title-utils";
import type { WorkItem } from "@/lib/works";

export type AdminGalleryItem = WorkItem & {
  id: string;
  previewUrl?: string;
};

export function htmlEscape(value: string) {
  return value.replaceAll("&", "&amp;");
}

export function htmlUnescape(value: string) {
  return value.replaceAll("&amp;", "&");
}

export function getDemoInitialWorks(works: WorkItem[]): WorkItem[] {
  return works.slice(-DEMO_WORKS_LIMIT);
}

export function toDemoWorks(works: WorkItem[]): AdminGalleryItem[] {
  return [...works].reverse().map((work, index) => ({
    ...work,
    id: `work-${String(index + 1).padStart(3, "0")}`
  }));
}

export function ensureWorkIds(works: AdminGalleryItem[]): AdminGalleryItem[] {
  return works.map((work, index) => ({
    ...work,
    id: work.id || `work-${String(index + 1).padStart(3, "0")}`
  }));
}

export function getWorkImageSrc(work: AdminGalleryItem) {
  return work.previewUrl ?? `/images/small/${work.img}`;
}

export function formatCopyright(siteTitle: string, year: number) {
  const [line1, line2] = parseSiteTitleLines(siteTitle);
  const normalizedTitle = [line1, line2].filter(Boolean).join(" ").trim();
  return `COPYRIGHT © ${year} ${normalizedTitle} ALL RIGHT RESERVED.`;
}

export function formatSiteTitleLines(siteTitle: string) {
  return siteTitle.split("\n");
}

function getNextImageNumber(works: AdminGalleryItem[]) {
  return works.reduce((currentMax, work) => {
    const matched = work.img.match(/^(\d+)/);
    const value = matched ? Number.parseInt(matched[1], 10) : 0;
    return Math.max(currentMax, value);
  }, 0) + 1;
}

export function createGalleryItem(
  works: AdminGalleryItem[],
  input: { title: string; charge: string; previewUrl: string }
): AdminGalleryItem {
  const nextNumber = getNextImageNumber(works);
  const paddedNumber = String(nextNumber).padStart(2, "0");

  return {
    id: `work-${crypto.randomUUID()}`,
    ttl: htmlEscape(input.title),
    charge: htmlEscape(input.charge),
    img: `${paddedNumber}_demo-upload.jpg`,
    previewUrl: input.previewUrl
  };
}


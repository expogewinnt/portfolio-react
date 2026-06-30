import { DEFAULT_SITE_TITLE } from "@/lib/gallery-constants";

export const SITE_TITLE_LINE_MAX_LENGTH = 30;
export const SITE_TITLE_LINE_COUNT = 2;

const DISALLOWED_CHARS = /[^\x20-\x7E]|[<>&]/g;

export function sanitizeSiteTitleLine(value: string): string {
  return value.replace(DISALLOWED_CHARS, "").slice(0, SITE_TITLE_LINE_MAX_LENGTH);
}

export function parseSiteTitleLines(siteTitle: string): [string, string] {
  const lines = siteTitle.split("\n", SITE_TITLE_LINE_COUNT);
  return [
    sanitizeSiteTitleLine(lines[0] ?? ""),
    sanitizeSiteTitleLine(lines[1] ?? "")
  ];
}

export function joinSiteTitleLines(line1: string, line2: string): string {
  const first = sanitizeSiteTitleLine(line1);
  const second = sanitizeSiteTitleLine(line2);

  if (!first && !second) {
    return DEFAULT_SITE_TITLE;
  }

  if (!second) {
    return first;
  }

  return `${first}\n${second}`;
}

export function sanitizeSiteTitle(siteTitle: string): string {
  const [line1, line2] = parseSiteTitleLines(siteTitle);
  return joinSiteTitleLines(line1, line2);
}

import { describe, expect, it } from "vitest";
import { DEFAULT_SITE_TITLE } from "@/lib/gallery-constants";
import {
  joinSiteTitleLines,
  parseSiteTitleLines,
  sanitizeSiteTitle,
  sanitizeSiteTitleLine
} from "@/lib/site-title-utils";

describe("sanitizeSiteTitleLine", () => {
  it("removes disallowed characters and truncates to 30 chars", () => {
    const input = "Hello<script>世界&<>";
    const repeated = "A".repeat(40);

    expect(sanitizeSiteTitleLine(input)).toBe("Helloscript");
    expect(sanitizeSiteTitleLine(repeated)).toHaveLength(30);
  });
});

describe("sanitizeSiteTitle", () => {
  it("keeps two ASCII lines within limits", () => {
    expect(sanitizeSiteTitle("LINE ONE\nLINE TWO")).toBe("LINE ONE\nLINE TWO");
  });

  it("falls back to default title when both lines are empty", () => {
    expect(sanitizeSiteTitle("\n")).toBe(DEFAULT_SITE_TITLE);
  });
});

describe("parseSiteTitleLines", () => {
  it("returns at most two sanitized lines", () => {
    expect(parseSiteTitleLines("A\nB\nC")).toEqual(["A", "B"]);
  });
});

describe("joinSiteTitleLines", () => {
  it("joins two non-empty lines with a newline", () => {
    expect(joinSiteTitleLines("FIRST", "SECOND")).toBe("FIRST\nSECOND");
  });

  it("returns a single line when the second line is empty", () => {
    expect(joinSiteTitleLines("ONLY", "")).toBe("ONLY");
  });
});

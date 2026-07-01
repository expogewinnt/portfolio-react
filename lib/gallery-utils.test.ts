import { describe, expect, it } from "vitest";
import { DEMO_WORKS_LIMIT } from "@/lib/gallery-constants";
import {
  formatCopyright,
  getDemoInitialWorks,
  getWorkImageSrc,
  htmlEscape,
  htmlUnescape,
  toDemoWorks
} from "@/lib/gallery-utils";
import type { WorkItem } from "@/lib/works";

function createWork(index: number): WorkItem {
  return {
    ttl: `Title ${index}`,
    charge: `Charge ${index}`,
    img: `${String(index).padStart(2, "0")}_sample.jpg`
  };
}

describe("htmlEscape / htmlUnescape", () => {
  it("escapes and unescapes ampersands", () => {
    expect(htmlEscape("A & B")).toBe("A &amp; B");
    expect(htmlUnescape("A &amp; B")).toBe("A & B");
  });
});

describe("getDemoInitialWorks", () => {
  it(`returns the latest ${DEMO_WORKS_LIMIT} works`, () => {
    const works = Array.from({ length: 25 }, (_, index) => createWork(index + 1));
    const initial = getDemoInitialWorks(works);

    expect(initial).toHaveLength(DEMO_WORKS_LIMIT);
    expect(initial[0]?.img).toBe("06_sample.jpg");
    expect(initial.at(-1)?.img).toBe("25_sample.jpg");
  });
});

describe("toDemoWorks", () => {
  it("reverses order and assigns sequential ids", () => {
    const works = [createWork(1), createWork(2)];
    const demoWorks = toDemoWorks(works);

    expect(demoWorks).toHaveLength(2);
    expect(demoWorks[0]?.id).toBe("work-001");
    expect(demoWorks[0]?.img).toBe("02_sample.jpg");
    expect(demoWorks[1]?.img).toBe("01_sample.jpg");
  });
});

describe("getWorkImageSrc", () => {
  it("prefers previewUrl over static image path", () => {
    const src = getWorkImageSrc({
      id: "work-001",
      ttl: "Title",
      charge: "Charge",
      img: "01_sample.jpg",
      previewUrl: "data:image/jpeg;base64,abc"
    });

    expect(src).toBe("data:image/jpeg;base64,abc");
  });
});

describe("formatCopyright", () => {
  it("builds copyright text from sanitized title lines", () => {
    expect(formatCopyright("LINE ONE\nLINE TWO", 2026)).toBe(
      "COPYRIGHT © 2026 LINE ONE LINE TWO ALL RIGHT RESERVED."
    );
  });
});

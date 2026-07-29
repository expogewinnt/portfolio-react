import { describe, expect, it } from "vitest";
import { adminOrderToGalleryOrder, reorderByIds } from "@/lib/works-order";

describe("reorderByIds", () => {
  it("reorders items by id list", () => {
    const items = [
      { id: "a", value: 1 },
      { id: "b", value: 2 },
      { id: "c", value: 3 }
    ];

    expect(reorderByIds(items, ["c", "a", "b"]).map((item) => item.id)).toEqual([
      "c",
      "a",
      "b"
    ]);
  });

  it("throws when ids are incomplete", () => {
    expect(() => reorderByIds([{ id: "a" }, { id: "b" }], ["a"])).toThrow(
      "並び替え対象の件数が一致しません。"
    );
  });
});

describe("adminOrderToGalleryOrder", () => {
  it("reverses admin display order into gallery storage order", () => {
    expect(adminOrderToGalleryOrder(["new", "mid", "old"])).toEqual(["old", "mid", "new"]);
  });
});

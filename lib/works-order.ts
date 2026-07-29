export function reorderByIds<T extends { id: string }>(items: T[], orderedIds: string[]): T[] {
  const byId = new Map(items.map((item) => [item.id, item]));

  if (orderedIds.length !== items.length) {
    throw new Error("並び替え対象の件数が一致しません。");
  }

  const next = orderedIds.map((id) => {
    const item = byId.get(id);
    if (!item) {
      throw new Error(`並び替え対象が見つかりません: ${id}`);
    }
    return item;
  });

  if (new Set(orderedIds).size !== orderedIds.length) {
    throw new Error("並び替え ID が重複しています。");
  }

  return next;
}

/** Admin 表示順（新しい側が上）→ ギャラリー保存順（古い側が先） */
export function adminOrderToGalleryOrder<T>(adminOrdered: T[]): T[] {
  return [...adminOrdered].reverse();
}

export type WorkItem = {
  id?: string;
  charge: string;
  img: string;
  ttl: string;
  imageUrl?: string;
  /** ギャラリー表示順（小さいほど先）。microCMS の order フィールドに対応 */
  sortOrder?: number;
};

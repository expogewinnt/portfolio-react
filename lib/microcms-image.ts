import type { GalleryImageSize } from "@/lib/gallery-view-utils";

export function getMicroCmsImageSrc(imageUrl: string, size: GalleryImageSize) {
  const baseUrl = imageUrl.split("?")[0];

  switch (size) {
    case "small":
      return `${baseUrl}?w=320&h=180&fit=crop`;
    case "sp":
      return `${baseUrl}?w=1200`;
    case "big":
      return `${baseUrl}?w=1600`;
    default:
      return baseUrl;
  }
}

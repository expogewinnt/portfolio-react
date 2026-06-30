export type GalleryImageSize = "small" | "big" | "sp";

export type GalleryViewItem = {
  img: string;
  ttl: string;
  charge: string;
  key?: string;
  previewUrl?: string;
};

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": "\u00a0"
};

export function decodeHtml(value: string) {
  return value.replace(
    /&(?:amp|lt|gt|quot|#39|apos|nbsp);/g,
    (match) => HTML_ENTITIES[match] ?? match
  );
}

export function parseHash(length: number) {
  if (typeof window === "undefined") {
    return null;
  }

  const hash = window.location.hash;
  if (!hash) {
    return null;
  }

  const value = Number.parseInt(hash.replace("#", ""), 10);
  if (Number.isNaN(value) || value < 1 || value > length) {
    return null;
  }

  return value - 1;
}

export function updateHash(index: number | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (index === null) {
    history.pushState("", document.title, window.location.pathname + window.location.search);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    return;
  }

  window.location.hash = `#${index + 1}`;
}

export function preloadImages(urls: string[], onProgress: (progress: number) => void) {
  let loaded = 0;

  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const image = new Image();

          const done = () => {
            loaded += 1;
            onProgress(Math.floor((loaded / urls.length) * 100));
            resolve();
          };

          image.onload = done;
          image.onerror = done;
          image.src = url;
        })
    )
  );
}

export function formatChargeForMobile(charge: string) {
  const decoded = decodeHtml(charge);
  return decoded.replace(/■/g, "\n■").trim();
}

export function getDefaultImageSrc(item: GalleryViewItem, size: GalleryImageSize) {
  return `/images/${size}/${item.img}`;
}

export function getDemoImageSrc(item: GalleryViewItem, size: GalleryImageSize) {
  return item.previewUrl ?? `/images/${size}/${item.img}`;
}

export function getGalleryItemKey(item: GalleryViewItem, index: number) {
  return item.key ?? `${item.img}-${index}`;
}

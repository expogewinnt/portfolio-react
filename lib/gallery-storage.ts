import {
  DEFAULT_SITE_TITLE,
  GALLERY_STORAGE_KEY
} from "@/lib/gallery-constants";
import type { AdminGalleryItem } from "@/lib/gallery-utils";
import { ensureWorkIds, toDemoWorks } from "@/lib/gallery-utils";
import { sanitizeSiteTitle } from "@/lib/site-title-utils";
import type { WorkItem } from "@/lib/works";

export type GalleryStorageState = {
  works: AdminGalleryItem[];
  siteTitle: string;
};

function createInitialState(initialWorks: WorkItem[]): GalleryStorageState {
  return {
    works: toDemoWorks(initialWorks),
    siteTitle: DEFAULT_SITE_TITLE
  };
}

export function readGalleryStorage(): GalleryStorageState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(GALLERY_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as GalleryStorageState;
    if (!Array.isArray(parsed.works) || typeof parsed.siteTitle !== "string") {
      return null;
    }

    return {
      works: ensureWorkIds(parsed.works),
      siteTitle: sanitizeSiteTitle(parsed.siteTitle)
    };
  } catch {
    return null;
  }
}

export function writeGalleryStorage(state: GalleryStorageState) {
  window.localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(state));
}

export function loadOrSeedGallery(initialWorks: WorkItem[]): GalleryStorageState {
  const stored = readGalleryStorage();
  if (stored) {
    return stored;
  }

  const initialState = createInitialState(initialWorks);
  writeGalleryStorage(initialState);
  return initialState;
}

export function resetGalleryStorage(initialWorks: WorkItem[]): GalleryStorageState {
  const initialState = createInitialState(initialWorks);
  writeGalleryStorage(initialState);
  return initialState;
}

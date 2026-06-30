"use client";

import { useCallback, useEffect, useState } from "react";
import { compressImageToDataUrl } from "@/lib/gallery-image";
import {
  loadOrSeedGallery,
  resetGalleryStorage,
  writeGalleryStorage,
  type GalleryStorageState
} from "@/lib/gallery-storage";
import { sanitizeSiteTitle } from "@/lib/site-title-utils";
import {
  createGalleryItem,
  htmlEscape,
  type AdminGalleryItem
} from "@/lib/gallery-utils";
import type { WorkItem } from "@/lib/works";

type CreateWorkInput = {
  title: string;
  charge: string;
  imageFile: File;
};

type UpdateWorkInput = {
  title: string;
  charge: string;
};

export function useGalleryData(initialWorks: WorkItem[]) {
  const [works, setWorks] = useState<AdminGalleryItem[]>([]);
  const [siteTitle, setSiteTitleState] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persist = useCallback((nextState: GalleryStorageState) => {
    try {
      writeGalleryStorage(nextState);
      setWorks(nextState.works);
      setSiteTitleState(nextState.siteTitle);
      setError(null);
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "QuotaExceededError") {
        setError("保存容量の上限に達しました。不要な作品を削除するか、デモをリセットしてください。");
        return;
      }

      setError("データの保存に失敗しました。");
    }
  }, []);

  useEffect(() => {
    const state = loadOrSeedGallery(initialWorks);
    setWorks(state.works);
    setSiteTitleState(state.siteTitle);
    setIsReady(true);
  }, [initialWorks]);

  const getWorkById = useCallback(
    (id: string) => works.find((work) => work.id === id) ?? null,
    [works]
  );

  const setSiteTitle = useCallback(
    (title: string) => {
      const sanitized = sanitizeSiteTitle(title);
      persist({
        works,
        siteTitle: sanitized
      });
    },
    [persist, works]
  );

  const createWork = useCallback(
    async (input: CreateWorkInput) => {
      setError(null);

      try {
        const previewUrl = await compressImageToDataUrl(input.imageFile);
        const nextItem = createGalleryItem(works, {
          title: input.title,
          charge: input.charge,
          previewUrl
        });
        const nextWorks = [nextItem, ...works];

        persist({
          works: nextWorks,
          siteTitle
        });
      } catch {
        setError("作品の保存に失敗しました。");
      }
    },
    [persist, siteTitle, works]
  );

  const updateWork = useCallback(
    (id: string, input: UpdateWorkInput) => {
      setError(null);

      const targetIndex = works.findIndex((work) => work.id === id);
      if (targetIndex === -1) {
        setError("対象の作品が見つかりません。");
        return false;
      }

      const nextWorks = [...works];
      nextWorks[targetIndex] = {
        ...nextWorks[targetIndex],
        ttl: htmlEscape(input.title),
        charge: htmlEscape(input.charge)
      };

      persist({
        works: nextWorks,
        siteTitle
      });

      return true;
    },
    [persist, siteTitle, works]
  );

  const deleteWork = useCallback(
    (id: string) => {
      setError(null);

      const nextWorks = works.filter((work) => work.id !== id);
      if (nextWorks.length === works.length) {
        return false;
      }

      persist({
        works: nextWorks,
        siteTitle
      });

      return true;
    },
    [persist, siteTitle, works]
  );

  const resetToInitial = useCallback(() => {
    setError(null);
    const state = resetGalleryStorage(initialWorks);
    setWorks(state.works);
    setSiteTitleState(state.siteTitle);
  }, [initialWorks]);

  return {
    works,
    siteTitle,
    isReady,
    error,
    setError,
    getWorkById,
    setSiteTitle,
    createWork,
    updateWork,
    deleteWork,
    resetToInitial
  };
}

"use client";

import { createContext, useContext } from "react";
import { useGalleryData } from "@/hooks/use-gallery-data";
import type { WorkItem } from "@/lib/works";

type GalleryContextValue = ReturnType<typeof useGalleryData>;

const GalleryContext = createContext<GalleryContextValue | null>(null);

type AdminGalleryProviderProps = {
  initialWorks: WorkItem[];
  children: React.ReactNode;
};

export function AdminGalleryProvider({
  initialWorks,
  children
}: AdminGalleryProviderProps) {
  const value = useGalleryData(initialWorks);

  return <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>;
}

export function useGalleryContext() {
  const context = useContext(GalleryContext);

  if (!context) {
    throw new Error("useGalleryContext must be used within AdminGalleryProvider.");
  }

  return context;
}

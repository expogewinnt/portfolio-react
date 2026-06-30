"use client";

import { useGalleryContext } from "@/components/admin/gallery-context";
import { parseSiteTitleLines } from "@/lib/site-title-utils";

export function SiteTitleDisplay({ className }: { className?: string }) {
  const { siteTitle } = useGalleryContext();
  const [line1, line2] = parseSiteTitleLines(siteTitle);

  return (
    <span className={className}>
      <span>{line1}</span>
      <br />
      <span>{line2}</span>
    </span>
  );
}

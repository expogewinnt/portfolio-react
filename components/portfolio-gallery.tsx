"use client";

import { GalleryView } from "@/components/gallery-view";
import type { WorkItem } from "@/lib/works";

const SITE_TITLE = "HIROKATSU SUZUKI PORTFOLIO WEB AND VISUAL COMMUNICATION";

export function PortfolioGallery({ works }: { works: WorkItem[] }) {
  return (
    <GalleryView
      items={works}
      siteTitle={
        <>
          HIROKATSU SUZUKI PORTFOLIO
          <br />
          WEB AND VISUAL COMMUNICATION
        </>
      }
      copyrightText="COPYLIGHT © 2016 HIROKATSU SUZUKI ALL RIGHT RESERVED."
      documentTitle={SITE_TITLE}
    />
  );
}

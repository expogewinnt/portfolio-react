"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { AdminLoadingPanel } from "@/components/admin/admin-loading-panel";
import { SiteTitleDisplay } from "@/components/admin/site-title-display";
import { useGalleryContext } from "@/components/admin/gallery-context";
import { GalleryView } from "@/components/gallery-view";
import { COPYRIGHT_YEAR } from "@/lib/gallery-constants";
import { formatCopyright } from "@/lib/gallery-utils";
import { parseSiteTitleLines } from "@/lib/site-title-utils";
import { getDemoImageSrc } from "@/lib/gallery-view-utils";

export function DemoGalleryPage() {
  const router = useRouter();
  const { works, siteTitle, isReady, resetToInitial } = useGalleryContext();

  const displayItems = useMemo(
    () =>
      [...works].reverse().map((work) => ({
        ...work,
        key: work.id
      })),
    [works]
  );

  const documentTitle = useMemo(() => {
    const [line1, line2] = parseSiteTitleLines(siteTitle);
    return [line1, line2].filter(Boolean).join(" ");
  }, [siteTitle]);
  const copyrightText = formatCopyright(siteTitle, COPYRIGHT_YEAR);

  if (!isReady) {
    return (
      <div className="loader">
        <div className="loadingTxt fadeIn">
          <p className="lead">CONTENTS LOADING...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="adminDemoGalleryRoot">
      <div className="adminDemoFloatingBar">
        <span className="adminDemoBadge">採用担当者向けデモモード</span>
        <div className="adminDemoFloatingActions">
          <Link href="/demo/admin" className="adminDemoFloatingLink">
            デモ管理画面
          </Link>
          <button
            type="button"
            className="adminDemoFloatingButton"
            onClick={() => {
              if (
                !window.confirm(
                  "デモデータを初期状態（直近10件・デフォルトタイトル）に戻します。よろしいですか？"
                )
              ) {
                return;
              }

              resetToInitial();
              router.refresh();
            }}
          >
            リセット
          </button>
        </div>
      </div>

      <GalleryView
        items={displayItems}
        siteTitle={<SiteTitleDisplay />}
        copyrightText={copyrightText}
        documentTitle={documentTitle}
        getImageSrc={getDemoImageSrc}
      />
    </div>
  );
}

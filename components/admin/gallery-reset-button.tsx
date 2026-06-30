"use client";

import { useRouter } from "next/navigation";
import { useGalleryContext } from "@/components/admin/gallery-context";

export function GalleryResetButton({ className }: { className?: string }) {
  const router = useRouter();
  const { resetToInitial } = useGalleryContext();

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (
          !window.confirm(
            "デモデータを初期状態（直近10件・デフォルトタイトル）に戻します。よろしいですか？"
          )
        ) {
          return;
        }

        resetToInitial();
        router.push("/demo/admin/works");
        router.refresh();
      }}
    >
      データを初期状態に戻す
    </button>
  );
}

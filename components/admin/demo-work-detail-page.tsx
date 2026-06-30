"use client";

import { notFound } from "next/navigation";
import { AdminLoadingPanel } from "@/components/admin/admin-loading-panel";
import { AdminShell } from "@/components/admin/admin-shell";
import { DemoWorkEditorForm } from "@/components/admin/demo-work-editor-form";
import { useGalleryContext } from "@/components/admin/gallery-context";
import { htmlUnescape } from "@/lib/gallery-utils";

export function DemoWorkDetailPage({ id }: { id: string }) {
  const { getWorkById, isReady } = useGalleryContext();

  if (!isReady) {
    return (
      <AdminShell
        mode="demo"
        title="Demo Work Detail"
        description="デモデータを読み込み中です。"
      >
        <AdminLoadingPanel />
      </AdminShell>
    );
  }

  const work = getWorkById(id);

  if (!work) {
    notFound();
  }

  return (
    <AdminShell
      mode="demo"
      title={htmlUnescape(work.ttl)}
      description="デモデータの編集画面です。変更は localStorage に保存されます。"
    >
      <DemoWorkEditorForm mode="edit" work={work} />
    </AdminShell>
  );
}

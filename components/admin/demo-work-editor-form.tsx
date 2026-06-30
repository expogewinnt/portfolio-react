"use client";
/* eslint-disable @next/next/no-img-element */

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useGalleryContext } from "@/components/admin/gallery-context";
import { getWorkImageSrc, htmlUnescape } from "@/lib/gallery-utils";
import type { AdminGalleryItem } from "@/lib/gallery-utils";

type DemoWorkEditorFormProps = {
  mode: "create" | "edit";
  work?: AdminGalleryItem | null;
};

export function DemoWorkEditorForm({ mode, work }: DemoWorkEditorFormProps) {
  const router = useRouter();
  const { createWork, updateWork, deleteWork, error, setError } = useGalleryContext();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(mode === "edit" ? htmlUnescape(work?.ttl ?? "") : "");
  const [charge, setCharge] = useState(mode === "edit" ? htmlUnescape(work?.charge ?? "") : "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);
    setError(null);

    if (!title.trim()) {
      setLocalError("Title は必須です。");
      return;
    }

    if (!charge.trim()) {
      setLocalError("Credit は必須です。");
      return;
    }

    if (mode === "create") {
      if (!imageFile) {
        setLocalError("画像ファイルを選択してください。");
        return;
      }

      startTransition(async () => {
        await createWork({
          title: title.trim(),
          charge: charge.trim(),
          imageFile
        });

        router.push("/demo/admin/works");
        router.refresh();
      });

      return;
    }

    if (!work) {
      setLocalError("対象の作品が見つかりません。");
      return;
    }

    startTransition(() => {
      const updated = updateWork(work.id, {
        title: title.trim(),
        charge: charge.trim()
      });

      if (updated) {
        router.push(`/demo/admin/works/${work.id}`);
        router.refresh();
      }
    });
  };

  const handleDelete = () => {
    if (!work) {
      return;
    }

    if (!window.confirm("この作品を削除します。よろしいですか？")) {
      return;
    }

    startTransition(() => {
      const deleted = deleteWork(work.id);
      if (deleted) {
        router.push("/demo/admin/works");
        router.refresh();
      }
    });
  };

  const displayError = localError ?? error;

  if (mode === "create") {
    return (
      <section className="adminPanel">
        <div className="adminPanelHeader">
          <div>
            <h2 className="adminPanelTitle">New Demo Work</h2>
            <p className="adminMuted">
              タイトル、担当内容、画像を登録すると localStorage のデモデータへ反映します。
            </p>
          </div>
        </div>
        <form className="adminFormGrid" onSubmit={handleSubmit}>
          <label className="adminField adminFieldFull">
            <span>Title</span>
            <input
              name="title"
              type="text"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <label className="adminField adminFieldFull">
            <span>Credit</span>
            <textarea
              name="charge"
              rows={5}
              required
              value={charge}
              onChange={(event) => setCharge(event.target.value)}
              placeholder="■JavaScript authoring ■CSS authoring ■Launch : 2026.5"
            />
          </label>
          <label className="adminField adminFieldFull">
            <span>Image</span>
            <input
              name="image"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              required
              onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
            />
          </label>
          {displayError ? <p className="adminError">{displayError}</p> : null}
          <div className="adminActions">
            <button type="submit" className="adminPrimaryButton" disabled={isPending}>
              {isPending ? "Saving..." : "Create Work"}
            </button>
          </div>
        </form>
      </section>
    );
  }

  return (
    <section className="adminPanel">
      <div className="adminPanelHeader">
        <div>
          <h2 className="adminPanelTitle">Demo Work Detail</h2>
        </div>
      </div>
      <form className="adminFormGrid" onSubmit={handleSubmit}>
        <label className="adminField">
          <span>Title</span>
          <input
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </label>
        <label className="adminField">
          <span>Release ID</span>
          <input defaultValue={work?.id ?? "draft"} readOnly />
        </label>
        <label className="adminField adminFieldFull">
          <span>Credit</span>
          <textarea
            name="charge"
            value={charge}
            onChange={(event) => setCharge(event.target.value)}
            rows={5}
            required
          />
        </label>
        <div className="adminField adminFieldFull">
          <span>Preview</span>
          <div className="adminPreviewCard">
            {work ? (
              <>
                <img
                  src={getWorkImageSrc(work)}
                  alt={htmlUnescape(work.ttl)}
                  className="adminPreviewImage"
                />
                <div>
                  <p className="adminPreviewTitle">{htmlUnescape(work.ttl)}</p>
                  <p className="adminMuted">{work.img}</p>
                </div>
              </>
            ) : (
              <p className="adminMuted">作品が見つかりません。</p>
            )}
          </div>
        </div>
        {displayError ? <p className="adminError">{displayError}</p> : null}
        {work ? (
          <div className="adminActions">
            <button type="submit" className="adminPrimaryButton" disabled={isPending}>
              {isPending ? "Saving..." : "Update Work"}
            </button>
            <button
              type="button"
              className="adminDangerButton"
              disabled={isPending}
              onClick={handleDelete}
            >
              Delete Work
            </button>
          </div>
        ) : null}
      </form>
    </section>
  );
}

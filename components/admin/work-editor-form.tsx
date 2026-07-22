"use client";
/* eslint-disable @next/next/no-img-element */

import { useActionState } from "react";
import {
  createWorkAction,
  deleteWorkAction,
  updateWorkAction,
  type WorkFormState
} from "@/app/admin/actions";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import type { AdminWork } from "@/lib/admin-works";
import { getAdminWorkPreviewSrc } from "@/lib/admin-work-image";
import { htmlUnescape } from "@/lib/gallery-utils";

type WorkEditorFormProps = {
  mode: "create" | "edit";
  work?: AdminWork | null;
};

export function WorkEditorForm({ mode, work }: WorkEditorFormProps) {
  const [state, formAction, isPending] = useActionState<WorkFormState, FormData>(
    mode === "create" ? createWorkAction : updateWorkAction,
    {}
  );

  if (mode === "create") {
    return (
      <section className="adminPanel">
        <div className="adminPanelHeader">
          <div>
            <h2 className="adminPanelTitle">New Work</h2>
            <p className="adminMuted">
              タイトル、担当内容、画像を登録すると `works.json` と画像セットへ反映します。
            </p>
          </div>
        </div>
        <form action={formAction} className="adminFormGrid">
          <label className="adminField adminFieldFull">
            <span>Title</span>
            <input name="title" type="text" required />
          </label>
          <label className="adminField adminFieldFull">
            <span>Credit</span>
            <textarea
              name="charge"
              rows={5}
              required
              placeholder="■JavaScript authoring ■CSS authoring ■Launch : 2026.5"
            />
          </label>
          <label className="adminField adminFieldFull">
            <span>Image</span>
            <input name="image" type="file" accept="image/png,image/jpeg,image/webp" required />
          </label>
          {state.error ? <p className="adminError">{state.error}</p> : null}
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
          <h2 className="adminPanelTitle">Work Detail</h2>
        </div>
      </div>
      <form action={formAction} className="adminFormGrid">
        <input type="hidden" name="id" value={work?.id ?? ""} />
        <label className="adminField">
          <span>Title</span>
          <input name="title" defaultValue={htmlUnescape(work?.ttl ?? "")} required />
        </label>
        <label className="adminField">
          <span>Release ID</span>
          <input defaultValue={work?.id ?? "draft"} readOnly />
        </label>
        <label className="adminField adminFieldFull">
          <span>Credit</span>
          <textarea
            name="charge"
            defaultValue={htmlUnescape(work?.charge ?? "")}
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
                  src={getAdminWorkPreviewSrc(work)}
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
        {state.error ? <p className="adminError">{state.error}</p> : null}
        {work ? (
          <div className="adminActions">
            <button type="submit" className="adminPrimaryButton" disabled={isPending}>
              {isPending ? "Saving..." : "Update Work"}
            </button>
            <ConfirmDeleteButton
              className="adminDangerButton"
              label="Delete Work"
              formAction={deleteWorkAction}
              name="id"
              value={work.id}
            />
          </div>
        ) : null}
      </form>
    </section>
  );
}

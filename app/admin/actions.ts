"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, getAdminConfig, getAdminSetupMessage } from "@/lib/admin-config";
import { isMicroCmsConfigured } from "@/lib/cms-config";
import { MicroCmsError } from "@/lib/microcms-client";
import {
  createWork,
  deleteWorkById,
  deleteWorkByImageName,
  updateWorkById,
  updateWorkByImageName
} from "@/lib/works-store";
import { getAdminWorkById } from "@/lib/admin-works";

export type LoginState = {
  error?: string;
};

export type WorkFormState = {
  error?: string;
};

function toWorkFormError(error: unknown): string {
  if (error instanceof MicroCmsError) {
    return `microCMS への保存に失敗しました: ${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "保存に失敗しました。";
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const config = getAdminConfig();
  if (!config) {
    return {
      error: getAdminSetupMessage()
    };
  }

  if (username !== config.username || password !== config.password) {
    return {
      error: "ログイン情報が一致しません。"
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, config.sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });

  redirect("/admin");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/login");
}

export async function createWorkAction(
  _prevState: WorkFormState,
  formData: FormData
): Promise<WorkFormState> {
  const title = String(formData.get("title") ?? "").trim();
  const charge = String(formData.get("charge") ?? "").trim();
  const imageFile = formData.get("image");

  if (!title) {
    return { error: "Title は必須です。" };
  }

  if (!charge) {
    return { error: "Credit は必須です。" };
  }

  if (!(imageFile instanceof File) || imageFile.size === 0) {
    return { error: "画像ファイルを選択してください。" };
  }

  try {
    await createWork({ title, charge, imageFile });
  } catch (error) {
    return { error: toWorkFormError(error) };
  }

  redirect("/admin/works");
}

export async function deleteWorkAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const work = await getAdminWorkById(id);

  if (!work) {
    redirect("/admin/works");
  }

  try {
    if (isMicroCmsConfigured()) {
      if (!work.id) {
        redirect("/admin/works");
      }
      await deleteWorkById(work.id);
    } else {
      await deleteWorkByImageName(work.img);
    }
  } catch (error) {
    console.error(error);
    redirect("/admin/works");
  }

  redirect("/admin/works");
}

export async function updateWorkAction(
  _prevState: WorkFormState,
  formData: FormData
): Promise<WorkFormState> {
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const charge = String(formData.get("charge") ?? "").trim();
  const work = await getAdminWorkById(id);

  if (!work) {
    return { error: "対象の作品が見つかりません。" };
  }

  if (!title) {
    return { error: "Title は必須です。" };
  }

  if (!charge) {
    return { error: "Credit は必須です。" };
  }

  try {
    if (isMicroCmsConfigured()) {
      if (!work.id) {
        return { error: "microCMS の作品 ID が取得できません。" };
      }

      await updateWorkById({
        id: work.id,
        title,
        charge
      });
    } else {
      await updateWorkByImageName({
        imageName: work.img,
        title,
        charge
      });
    }
  } catch (error) {
    return { error: toWorkFormError(error) };
  }

  redirect(`/admin/works/${id}`);
}

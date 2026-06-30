"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, getAdminConfig, getAdminSetupMessage } from "@/lib/admin-config";
import { createWork, deleteWorkByImageName, updateWorkByImageName } from "@/lib/works-store";
import { getAdminWorkById } from "@/lib/admin-works";

export type LoginState = {
  error?: string;
};

export type WorkFormState = {
  error?: string;
};

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

  await createWork({ title, charge, imageFile });
  redirect("/admin/works");
}

export async function deleteWorkAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const work = await getAdminWorkById(id);

  if (!work) {
    redirect("/admin/works");
  }

  await deleteWorkByImageName(work.img);
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

  await updateWorkByImageName({
    imageName: work.img,
    title,
    charge
  });

  redirect(`/admin/works/${id}`);
}

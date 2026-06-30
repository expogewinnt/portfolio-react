import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminSetupMessage, isAdminConfigured } from "@/lib/admin-config";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  const isConfigured = isAdminConfigured();

  return (
    <main className="adminLoginPage">
      <section className="adminLoginCard">
        <p className="adminEyebrow">Portfolio Admin</p>
        <h1 className="adminLoginTitle">Login</h1>
        {isConfigured ? (
          <p className="adminDescription">
            本番管理画面です。ログイン情報は `.env.local` で管理しています。
          </p>
        ) : (
          <p className="adminError">{getAdminSetupMessage()}</p>
        )}
        <LoginForm disabled={!isConfigured} />
      </section>
    </main>
  );
}

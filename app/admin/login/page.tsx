import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <main className="adminLoginPage">
      <section className="adminLoginCard">
        <p className="adminEyebrow">Portfolio Admin</p>
        <h1 className="adminLoginTitle">Login</h1>
        <p className="adminDescription">
          初期値は `admin / portfolio-local` です。運用時は環境変数で置き換えてください。
        </p>
        <LoginForm />
      </section>
    </main>
  );
}

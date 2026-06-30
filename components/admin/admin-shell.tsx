"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/admin/actions";
import { GalleryResetButton } from "@/components/admin/gallery-reset-button";
import { DEMO_WORKS_LIMIT } from "@/lib/gallery-constants";

type AdminShellProps = {
  mode?: "production" | "demo";
  title: string;
  description?: string;
  children: React.ReactNode;
};

const productionNavItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/works", label: "Works" },
  { href: "/admin/works/new", label: "New Work" }
];

const demoNavItems = [
  { href: "/demo/admin", label: "Demo Dashboard" },
  { href: "/demo/admin/works", label: "Demo Works" },
  { href: "/demo/admin/works/new", label: "New Demo Work" }
];

export function AdminShell({
  mode = "production",
  title,
  description,
  children
}: AdminShellProps) {
  const router = useRouter();
  const isDemo = mode === "demo";
  const navItems = isDemo ? demoNavItems : productionNavItems;

  return (
    <div className="adminRoot">
      <aside className="adminSidebar">
        <p className="adminBrand">Admin</p>
        {isDemo ? (
          <>
            <div className="adminDemoSidebarBadge">採用担当者向けデモモード</div>
            <p className="adminSidebarNote">
              初期データは直近 {DEMO_WORKS_LIMIT} 件。変更は localStorage のみに保存されます。
            </p>
          </>
        ) : null}
        <nav className="adminNav">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="adminNavLink">
              {item.label}
            </Link>
          ))}
        </nav>
        {isDemo ? (
          <GalleryResetButton className="adminGhostButton adminResetButton" />
        ) : (
          <>
            <Link href="/demo/admin" className="adminNavLink">
              デモ管理へ
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="adminGhostButton">
                Logout
              </button>
            </form>
          </>
        )}
      </aside>
      <div className="adminContent">
        {isDemo ? (
          <div className="adminDemoBanner">
            <div className="adminDemoBannerText">
              <strong>採用担当者向けデモモード</strong>
              <p className="adminMuted">
                この管理画面での操作は公開ギャラリー（/）に影響しません。
              </p>
            </div>
            <button
              type="button"
              className="adminPrimaryButton adminDemoBannerButton"
              onClick={() => router.push("/demo")}
            >
              デモギャラリーを開く
            </button>
          </div>
        ) : null}
        <div className="adminContentInner">
          <header className="adminHeader">
            <div>
              <h1 className="adminTitle">{title}</h1>
              {description ? <p className="adminDescription">{description}</p> : null}
            </div>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}

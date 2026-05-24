import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";

type AdminShellProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/works", label: "Works" },
  { href: "/admin/works/new", label: "New Work" }
];

export function AdminShell({
  title,
  description,
  children
}: AdminShellProps) {
  return (
    <div className="adminRoot">
      <aside className="adminSidebar">
        <p className="adminBrand">Admin</p>
        <nav className="adminNav">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="adminNavLink">
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={logoutAction}>
          <button type="submit" className="adminGhostButton">
            Logout
          </button>
        </form>
      </aside>
      <div className="adminContent">
        <header className="adminHeader">
          <div>
            <h1 className="adminTitle">{title}</h1>
            {description ? <p className="adminDescription">{description}</p> : null}
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

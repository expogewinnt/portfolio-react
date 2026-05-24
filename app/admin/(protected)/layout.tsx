import { requireAdminAuth } from "@/lib/admin-auth";

export default async function ProtectedAdminLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdminAuth();

  return children;
}

import { AdminGalleryProvider } from "@/components/admin/gallery-context";
import { getDemoInitialWorks } from "@/lib/gallery-utils";
import { readWorks } from "@/lib/works-store";

export default async function DemoLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialWorks = getDemoInitialWorks(await readWorks());

  return <AdminGalleryProvider initialWorks={initialWorks}>{children}</AdminGalleryProvider>;
}

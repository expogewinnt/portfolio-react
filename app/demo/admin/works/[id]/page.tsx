import { DemoWorkDetailPage } from "@/components/admin/demo-work-detail-page";

export default async function DemoAdminWorkDetailRoute({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <DemoWorkDetailPage id={id} />;
}

"use client";

import { AdminLoadingPanel } from "@/components/admin/admin-loading-panel";
import { DemoSiteTitleForm } from "@/components/admin/demo-site-title-form";
import { useGalleryContext } from "@/components/admin/gallery-context";

export function DemoDashboardContent() {
  const { works, isReady } = useGalleryContext();

  if (!isReady) {
    return <AdminLoadingPanel />;
  }

  return (
    <>
      <section className="adminStatsGrid">
        <article className="adminStatCard">
          <span className="adminStatLabel">Works</span>
          <strong className="adminStatValue">{works.length}</strong>
        </article>
        <article className="adminStatCard">
          <span className="adminStatLabel">Mode</span>
          <strong className="adminStatValue">Demo</strong>
        </article>
        <article className="adminStatCard">
          <span className="adminStatLabel">Storage</span>
          <strong className="adminStatValue">localStorage</strong>
        </article>
      </section>

      <DemoSiteTitleForm />
    </>
  );
}

import type { WorkItem } from "@/lib/works";
import { readWorks } from "@/lib/works-store";

export type AdminWork = WorkItem & {
  id: string;
};

export async function getAdminWorks(): Promise<AdminWork[]> {
  const works = await readWorks();

  return [...works].reverse().map((work, index) => ({
    ...work,
    id: work.id ?? `work-${String(index + 1).padStart(3, "0")}`
  }));
}

export async function getAdminWorkById(id: string) {
  const works = await getAdminWorks();
  return works.find((work) => work.id === id) ?? null;
}

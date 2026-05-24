import { PortfolioGallery } from "@/components/portfolio-gallery";
import { readWorks } from "@/lib/works-store";

export default async function Page() {
  const works = await readWorks();

  return <PortfolioGallery works={works} />;
}

import { notFound } from "next/navigation";

import { HomePageContent } from "@/app/page";
import { site } from "@/data/site";

const HOME_SLIDE_COUNT = 6;

export const metadata = {
  title: "首页",
  description: site.tagline,
};

export function generateStaticParams() {
  return Array.from({ length: HOME_SLIDE_COUNT }, (_, index) => ({
    page: String(index + 1),
  }));
}

export default async function HomeSlidePage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const pageNumber = Number(page);

  if (
    !Number.isInteger(pageNumber) ||
    String(pageNumber) !== page ||
    pageNumber < 1 ||
    pageNumber > HOME_SLIDE_COUNT
  ) {
    notFound();
  }

  return <HomePageContent initialIndex={pageNumber - 1} />;
}

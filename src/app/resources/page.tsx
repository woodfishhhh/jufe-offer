import { Suspense } from "react";
import { ResourceBoard } from "@/components/resources/resource-board";
import { Skeleton } from "@/components/ui/skeleton";
import { site } from "@/data/site";

export const metadata = {
  title: "资源页",
  description: `浏览${site.name}整理的实习校招、编程学习、竞赛、开源和校内资源。`,
};

export default function ResourcesPage() {
  return (
    <div className="bg-background">
      <Suspense
        fallback={
          <div
            className="mx-auto max-w-[1280px] px-5 pt-24 pb-12 sm:px-8 sm:pt-28 sm:pb-16"
            aria-live="polite"
          >
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="mt-10 h-10 w-full rounded-full" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <Skeleton key={index} className="h-[230px] rounded-2xl" />
              ))}
            </div>
          </div>
        }
      >
        <ResourceBoard />
      </Suspense>
    </div>
  );
}

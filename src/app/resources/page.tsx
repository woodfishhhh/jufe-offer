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
    <div className="bg-background h-dvh min-h-0 overflow-hidden">
      <Suspense
        fallback={
          <div
            className="mx-auto max-w-[1440px] px-5 pt-[var(--nav-clearance)] pb-12 sm:px-8 sm:pb-16"
            aria-live="polite"
          >
            <div className="grid gap-8 min-[1024px]:grid-cols-[220px_minmax(0,1fr)]">
              <Skeleton className="hidden h-[560px] rounded-2xl min-[1024px]:block" />
              <div>
                <Skeleton className="h-24 w-full rounded-2xl" />
                <div className="mt-5 grid grid-cols-1 gap-4 min-[768px]:grid-cols-3">
                  {[260, 340, 290, 380, 310, 270].map((height, index) => (
                    <Skeleton
                      key={index}
                      className="mb-4 w-full break-inside-avoid rounded-2xl"
                      style={{ height }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        }
      >
        <ResourceBoard />
      </Suspense>
    </div>
  );
}

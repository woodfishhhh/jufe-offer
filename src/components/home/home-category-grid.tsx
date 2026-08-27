"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { HOME_CATEGORY_PREVIEWS } from "@/data/categories";
import { scheduleIdle } from "@/lib/client-performance";
import { requestResourceList } from "@/lib/client-resources";

type CategoryCount = { total: number };

let cachedCounts: Map<string, CategoryCount> | null = null;
let countsRequest: Promise<Map<string, CategoryCount>> | null = null;

async function requestCounts() {
  countsRequest ??= requestResourceList("")
    .then((resources) => {
      const counts = new Map<string, CategoryCount>();
      for (const resource of resources) {
        const current = counts.get(resource.category) ?? { total: 0 };
        counts.set(resource.category, {
          total: current.total + 1,
        });
      }
      cachedCounts = counts;
      return counts;
    })
    .finally(() => {
      countsRequest = null;
    });
  return countsRequest;
}

export function HomeCategoryGrid() {
  const [counts, setCounts] = useState(cachedCounts);

  useEffect(() => {
    let cancelled = false;
    const cancelIdle = scheduleIdle(() => {
      void requestCounts()
        .then((next) => {
          if (!cancelled) setCounts(new Map(next));
        })
        .catch(() => {});
    }, 900);
    return () => {
      cancelled = true;
      cancelIdle();
    };
  }, []);

  return (
    <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-8 sm:grid-cols-3 sm:gap-3 lg:gap-4">
      {HOME_CATEGORY_PREVIEWS.map((item, index) => (
        <Link
          key={item.category}
          href={`/resources?category=${encodeURIComponent(item.category)}`}
          className="group block h-full"
        >
          <Card className="studio-card bg-background/72 hover:border-foreground h-full gap-0 p-3 backdrop-blur-md sm:p-5">
            <span className="flex items-start justify-between gap-3">
              <span>
                <span className="text-muted-foreground block text-[10px] tracking-[0.16em]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="mt-2 block text-sm font-semibold sm:text-base">
                  {item.category}
                </span>
              </span>
              <ArrowUpRight className="text-muted-foreground group-hover:text-foreground size-4 transition-transform duration-150 ease-[var(--ease-out)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
            <span className="text-muted-foreground mt-3 block text-xs sm:mt-5">
              {counts ? `${counts.get(item.category)?.total ?? 0} 个资源` : "资源统计中"}
            </span>
          </Card>
        </Link>
      ))}
    </div>
  );
}

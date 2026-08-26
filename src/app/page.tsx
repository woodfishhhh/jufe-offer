import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { FlowingWaves } from "@/components/flowing-waves";
import { DeferredCommunityPanel } from "@/components/home/deferred-community-panel";
import { EmblemCanvas } from "@/components/home/emblem-canvas";
import { HomeDeck } from "@/components/home/home-deck";
import { ResourcePreviewCard } from "@/components/home/resource-preview-card";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { HOME_CATEGORY_PREVIEWS } from "@/data/categories";
import { site } from "@/data/site";
import { prisma } from "@/lib/prisma";
import { toResourceDto } from "@/lib/resources";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "首页",
  description: site.tagline,
};

const HIGHLIGHT_LIMIT = 6;

async function loadHomeData() {
  try {
    const [featured, categoryCounts] = await Promise.all([
      prisma.resource.findMany({
        where: { isFeatured: true },
        orderBy: { updatedAt: "desc" },
        take: HIGHLIGHT_LIMIT,
      }),
      prisma.resource.groupBy({ by: ["category"], _count: { _all: true } }),
    ]);

    const highlights =
      featured.length > 0
        ? featured
        : await prisma.resource.findMany({
            orderBy: { updatedAt: "desc" },
            take: HIGHLIGHT_LIMIT,
          });

    return {
      highlights: highlights.map(toResourceDto),
      showFeaturedBadge: featured.length > 0,
      countByCategory: new Map(
        categoryCounts.map((item) => [item.category, item._count._all]),
      ),
    };
  } catch {
    return {
      highlights: [],
      showFeaturedBadge: false,
      countByCategory: new Map<string, number>(),
    };
  }
}

const highlightGridClasses = [
  "lg:col-span-7",
  "lg:col-span-5 lg:translate-y-2",
  "lg:col-span-3",
  "lg:col-span-3",
  "lg:col-span-3",
  "lg:col-span-3",
];

export default async function HomePage() {
  const { highlights, showFeaturedBadge, countByCategory } = await loadHomeData();
  const highlightTitle = showFeaturedBadge ? "精选资源(持续更新 )" : "最近收录";

  return (
    <HomeDeck className="bg-background text-foreground">
      <section className="border-border relative overflow-hidden border-b lg:h-[calc(100svh-4rem)] lg:min-h-0">
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div className="home-orb home-orb--one" />
          <div className="home-orb home-orb--two" />
        </div>
        <FlowingWaves className="opacity-85" />

        <div className="relative grid h-full min-h-0 w-full grid-rows-[58%_42%] gap-0 lg:grid-cols-2 lg:grid-rows-1 lg:items-stretch">
          <ScrollReveal className="relative z-10 mx-auto flex min-h-0 w-full max-w-[760px] flex-col justify-center px-5 py-6 sm:px-8 sm:py-10 lg:mx-0 lg:max-w-none lg:px-16 lg:py-24 xl:px-24">
            <p className="text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase">
              JUFE / Student resource index
            </p>
            <h1 className="font-display mt-4 text-[64px] leading-[0.78] font-bold tracking-[-0.075em] sm:mt-7 sm:text-[112px] lg:text-[138px]">
              <span className="block">江财</span>
              <span className="ml-[0.38em] block">OFFER</span>
            </h1>
            <p className="text-muted-foreground mt-6 max-w-sm text-base leading-7 sm:mt-10 sm:text-lg sm:leading-8">
              {site.tagline}
            </p>
            <div className="mt-6 flex flex-nowrap items-center gap-2 sm:mt-9 sm:flex-wrap sm:gap-3">
              <Link
                href="/resources"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "group shrink-0 gap-2 px-5 sm:px-6",
                )}
              >
                浏览全部资源
                <ArrowUpRight className="transition-transform duration-150 ease-[var(--ease-out)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                href="#qq-group"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "shrink-0 px-4 sm:px-6",
                )}
              >
                加入社群
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal
            className="relative z-10 min-h-0 overflow-hidden bg-[#0a0a0a] lg:min-h-[calc(100svh-4rem)]"
            delay={80}
          >
            <div className="relative h-full min-h-0 lg:min-h-[calc(100svh-4rem)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.1),transparent_42%)]" />
              <div className="pointer-events-none absolute inset-x-6 top-6 z-10 flex items-center justify-between text-[10px] tracking-[0.18em] text-white/60 uppercase sm:inset-x-10 sm:top-10">
                <span>School emblem</span>
                <span>GLB / 01</span>
              </div>
              <EmblemCanvas className="min-h-0 lg:min-h-[calc(100svh-4rem)]" />
              <div className="pointer-events-none absolute inset-x-6 bottom-6 z-10 flex items-end justify-between text-[10px] tracking-[0.18em] text-white/60 uppercase sm:inset-x-10 sm:bottom-10">
                <span>Jiangxi University of Finance &amp; Economics</span>
                <span>1923—2026</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="border-border relative overflow-hidden border-b lg:h-[calc(100svh-4rem)] lg:min-h-0">
        <div className="mx-auto flex h-full max-w-[1280px] flex-col justify-center px-5 py-8 sm:px-8 sm:py-12 lg:py-14">
          <ScrollReveal className="flex flex-wrap items-end justify-between gap-3 sm:gap-5">
            <div className="flex items-end gap-5">
              <span className="text-muted-foreground pb-1 font-mono text-xs">02</span>
              <div>
                <p className="text-muted-foreground mb-3 text-xs tracking-[0.18em] uppercase">
                  Resource index
                </p>
                <h2 className="font-display text-3xl font-bold tracking-[-0.045em] sm:text-6xl">
                  学习，从这里开始
                </h2>
              </div>
            </div>
            <Link
              href="/resources"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              全部资源
              <ArrowUpRight />
            </Link>
          </ScrollReveal>

          <form
            action="/resources"
            method="get"
            className="mt-9 flex max-w-[720px] items-center gap-2"
            role="search"
          >
            <div className="relative min-w-0 flex-1">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 z-10 size-4 -translate-y-1/2" />
              <Input
                type="search"
                name="q"
                placeholder="搜索实习、竞赛、学习资源…"
                aria-label="搜索资源"
                className="bg-background/86 h-12 pl-11 backdrop-blur-md"
              />
            </div>
            <Button type="submit" size="lg" className="size-12 px-0 sm:w-auto sm:px-6">
              <Search className="sm:hidden" />
              <span className="sr-only sm:not-sr-only">搜索</span>
            </Button>
          </form>

          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-8 sm:grid-cols-3 sm:gap-3 lg:gap-4">
            {HOME_CATEGORY_PREVIEWS.map((item, index) => (
              <Link
                key={item.category}
                href={`/resources?category=${encodeURIComponent(item.category)}`}
                className="group block"
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
                    {countByCategory.get(item.category) ?? 0} 个资源
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {highlights.length > 0 ? (
        <section className="border-border relative overflow-hidden border-b lg:h-[calc(100svh-4rem)] lg:min-h-0">
          <div className="mx-auto flex h-full max-w-[1280px] flex-col px-5 py-6 sm:px-8 sm:py-8 lg:py-8">
            <ScrollReveal className="flex shrink-0 flex-nowrap items-end justify-between gap-3 sm:gap-6">
              <div className="flex min-w-0 items-end gap-3 sm:gap-5">
                <span className="text-muted-foreground pb-1 font-mono text-xs">03</span>
                <h2 className="font-display text-3xl font-bold tracking-[-0.045em] sm:text-5xl lg:text-6xl">
                  {highlightTitle}
                </h2>
              </div>
              <Link
                href="/resources"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-10 shrink-0 px-4 sm:h-12 sm:px-6",
                )}
              >
                全部资源
                <ArrowUpRight />
              </Link>
            </ScrollReveal>

            <div className="mt-5 grid min-h-0 flex-1 grid-rows-6 gap-2.5 sm:mt-6 sm:grid-cols-3 sm:grid-rows-2 sm:gap-4 lg:mt-8 lg:grid-cols-12 lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-5">
              {highlights.map((resource, index) => (
                <ScrollReveal
                  key={resource.id}
                  className={cn("h-full min-h-0 min-w-0", highlightGridClasses[index])}
                  delay={Math.min(index * 55, 220)}
                >
                  <ResourcePreviewCard
                    resource={resource}
                    showFeaturedBadge={showFeaturedBadge}
                    prominent={index < 2}
                    compact
                  />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <DeferredCommunityPanel />
    </HomeDeck>
  );
}

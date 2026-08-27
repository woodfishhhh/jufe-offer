import Link from "next/link";
import { ArrowUpRight, Github, Heart, Search } from "lucide-react";
import { FlameWrap } from "@/components/canvasui/FlameWrap";
import { FlowingWaves } from "@/components/flowing-waves";
import { DeferredCommunityPanel } from "@/components/home/deferred-community-panel";
import { EmblemCanvas } from "@/components/home/emblem-canvas";
import { HomeCategoryGrid } from "@/components/home/home-category-grid";
import { HomeDeck } from "@/components/home/home-deck";
import { TiltLink } from "@/components/home/tilt-link";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "首页",
  description: site.tagline,
};

export default function HomePage() {
  return (
    <HomeDeck className="bg-background text-foreground">
      <section className="border-border relative overflow-hidden border-b lg:h-full lg:min-h-0">
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div className="home-orb home-orb--one" />
          <div className="home-orb home-orb--two" />
        </div>
        <FlowingWaves className="opacity-85" />

        <div className="relative grid h-full min-h-0 w-full grid-rows-[58%_42%] gap-0 lg:grid-cols-2 lg:grid-rows-1 lg:items-stretch">
          <ScrollReveal className="relative z-10 mx-auto flex min-h-0 w-full max-w-[760px] flex-col justify-center px-5 pt-20 pb-6 sm:px-8 sm:pt-24 sm:pb-10 lg:mx-0 lg:max-w-none lg:px-16 lg:py-24 xl:px-24">
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
            className="relative z-10 min-h-0 overflow-hidden bg-[#0a0a0a] lg:min-h-full"
            delay={80}
          >
            <div className="relative h-full min-h-0 lg:min-h-full">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.1),transparent_42%)]" />
              <div className="pointer-events-none absolute inset-x-6 top-6 z-10 flex items-center justify-between text-[10px] tracking-[0.18em] text-white/60 uppercase sm:inset-x-10 sm:top-10">
                <span>GLB / 01</span>
              </div>
              <EmblemCanvas className="min-h-0 lg:min-h-full" />
              <div className="pointer-events-none absolute inset-x-6 bottom-6 z-10 flex items-end justify-between text-[10px] tracking-[0.18em] text-white/60 uppercase sm:inset-x-10 sm:bottom-10">
                <span>Jiangxi University of Finance &amp; Economics</span>
                <span>1923—2026</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <DeferredCommunityPanel />

      <section className="border-border relative overflow-hidden border-b lg:h-full lg:min-h-0">
        <div className="mx-auto flex h-full max-w-[1280px] flex-col justify-center px-5 py-8 sm:px-8 sm:py-12 lg:py-14">
          <ScrollReveal className="flex flex-wrap items-end justify-between gap-3 sm:gap-5">
            <div className="flex items-end gap-5">
              <span className="text-muted-foreground pb-1 font-mono text-xs">03</span>
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

          <HomeCategoryGrid />
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#080808] text-white lg:h-full lg:min-h-0">
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute top-[-20%] right-[-10%] size-[min(72vw,880px)] rounded-full border border-white/[0.055]" />
          <div className="absolute right-[4%] bottom-[-38%] size-[min(58vw,680px)] rounded-full border border-white/[0.045]" />
          <Github className="absolute right-[5%] bottom-[-8%] size-[min(42vw,520px)] text-white/[0.025]" />
        </div>

        <div className="relative mx-auto flex h-full max-w-[1280px] flex-col justify-center px-5 pt-[calc(var(--nav-clearance)+0.75rem)] pb-6 sm:px-8 sm:pt-[calc(var(--nav-clearance)+1rem)] sm:pb-8">
          <ScrollReveal className="grid items-end gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)] lg:gap-12">
            <div>
              <div className="flex items-end gap-5">
                <span className="pb-1 font-mono text-xs text-white/40">04</span>
                <div>
                  <p className="mb-3 text-xs tracking-[0.18em] text-white/48 uppercase">
                    Open source / build together
                  </p>
                  <h2 className="font-display max-w-3xl text-3xl leading-[0.98] font-bold tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                    欢迎各位参与共建与共享
                  </h2>
                </div>
              </div>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-white/56 sm:mt-7 sm:text-base sm:leading-7">
                JUFE OFFER
                是由同学共同维护的开放项目。欢迎补充资源、完善体验、提出建议，让有价值的信息流向更多江财人。
              </p>
              <Link
                href="https://github.com/woodfishhhh/jufe-offer"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "mt-5 gap-2 bg-white text-black hover:bg-white/90 sm:mt-7",
                )}
              >
                访问 GitHub 仓库
                <ArrowUpRight className="size-4" />
              </Link>
            </div>

            <FlameWrap
              color={[1, 0, 42 / 255]}
              intensity={0.55}
              height={200}
              spread={8}
              radius={37}
              speed={0.25}
              scale={1}
              turbulence={0.93}
              turbulenceScale={1.95}
              turbulenceReach={61}
              sparks={3}
              sparkSize={0.6}
              sparkDensity={0.8}
              sparkSpeed={1}
              rim={2.5}
              melt={0}
              distortion={8.5}
              smoke={0.5}
              ember={1.8}
              scorch={0}
            >
              <TiltLink
                href="https://github.com/woodfishhhh/jufe-offer"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="在 GitHub 查看 woodfishhhh/jufe-offer 仓库"
                className="group block rounded-[1.75rem] border border-white/12 bg-[#111] p-5 text-white transition-[border-color,background-color] duration-150 hover:border-white/24 hover:bg-[#151515] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:p-7"
              >
                <span className="flex items-center justify-between gap-4">
                  <span className="grid size-11 place-items-center rounded-full border border-white/12 bg-white/[0.06]">
                    <Github className="size-5" />
                  </span>
                  <ArrowUpRight className="size-5 text-white/42 transition-transform duration-150 ease-[var(--ease-out)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
                </span>
                <span className="mt-7 block text-[10px] tracking-[0.2em] text-white/38 uppercase">
                  Public repository
                </span>
                <span className="mt-2 block font-mono text-lg tracking-[-0.035em] sm:text-2xl">
                  woodfishhhh / jufe-offer
                </span>
                <span className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-4 font-mono text-[9px] tracking-[0.12em] text-white/38 uppercase">
                  <span>Open source</span>
                  <span aria-hidden="true">/</span>
                  <span>Next.js</span>
                  <span aria-hidden="true">/</span>
                  <span>TypeScript</span>
                </span>
              </TiltLink>
            </FlameWrap>
          </ScrollReveal>

          <ScrollReveal
            className="mt-6 border-t border-white/10 pt-4 sm:mt-8 sm:pt-5"
            delay={80}
          >
            <div className="mb-3 flex items-center gap-2 text-xs tracking-[0.16em] text-white/42 uppercase sm:mb-4">
              <Heart className="size-3.5" />
              <span>特别感谢</span>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
              <div className="flex items-center gap-3 rounded-2xl border border-white/9 bg-white/[0.025] px-4 py-3 sm:px-5 sm:py-4">
                <span className="text-xl" aria-hidden="true">
                  🌈
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">哈奇瓦乐ò.óMono</span>
                  <span className="mt-1 block text-xs text-white/44">
                    提供校徽 3D 资产
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/9 bg-white/[0.025] px-4 py-3 sm:px-5 sm:py-4">
                <span className="text-xl" aria-hidden="true">
                  🐮
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">JunieXD、MIUMA</span>
                  <span className="mt-1 block text-xs text-white/44">
                    对 JUFE OFFER 的一线支持
                  </span>
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </HomeDeck>
  );
}

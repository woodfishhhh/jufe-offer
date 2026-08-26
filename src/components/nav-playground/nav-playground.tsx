"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { FluidNav } from "@/components/fluid-nav";
import { ResilientImage } from "@/components/resilient-image";
import { SiteLogoMark } from "@/components/site-logo-mark";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

type NavStyle = "island" | "split" | "wide" | "dock" | "morph";

const STYLES: { id: NavStyle; label: string; note: string }[] = [
  { id: "island", label: "中心岛", note: "一整块胶囊浮在画面上方。" },
  {
    id: "split",
    label: "三件套",
    note: "标志、导航、操作拆成三块独立磨砂胶囊。站点正在用这个。",
  },
  { id: "wide", label: "宽条", note: "接近全宽但留边，页面从底下穿过去。" },
  { id: "dock", label: "底栏", note: "图标停在底部，更像拇指操作。" },
  { id: "morph", label: "胶囊", note: "先收成标志，悬停或聚焦后再展开。" },
];

function NavSurface({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("nav-surface nav-surface--css", className)}>{children}</div>;
}

function BrandMark({ asButton = false }: { asButton?: boolean }) {
  const content = (
    <>
      <SiteLogoMark className="size-7 border-black/10 sm:size-8" />
      <span className="site-header__brand-label">JUFE</span>
    </>
  );

  if (asButton) {
    return (
      <button type="button" className="site-header__brand" aria-label="展开导航">
        {content}
      </button>
    );
  }

  return <span className="site-header__brand">{content}</span>;
}

function ManageChip() {
  return (
    <span className="site-header__action inline-flex items-center justify-center">
      管理
    </span>
  );
}

function PlaygroundNav({
  style,
  activeHref,
  onSelect,
}: {
  style: NavStyle;
  activeHref: string;
  onSelect: (href: string) => void;
}) {
  if (style === "split") {
    return (
      <div className="nav-layer is-split">
        <NavSurface className="playground-chip">
          <BrandMark />
        </NavSurface>
        <NavSurface className="playground-chip">
          <FluidNav activeHref={activeHref} onSelect={onSelect} />
        </NavSurface>
        <NavSurface className="playground-chip">
          <ManageChip />
        </NavSurface>
      </div>
    );
  }

  if (style === "wide") {
    return (
      <div className="nav-layer is-wide">
        <NavSurface className="playground-wide">
          <BrandMark />
          <FluidNav activeHref={activeHref} onSelect={onSelect} />
          <ManageChip />
        </NavSurface>
      </div>
    );
  }

  if (style === "dock") {
    return (
      <div className="nav-layer is-dock">
        <NavSurface className="playground-dock">
          <FluidNav variant="dock" activeHref={activeHref} onSelect={onSelect} />
        </NavSurface>
      </div>
    );
  }

  if (style === "morph") {
    return (
      <div className="nav-layer">
        <NavSurface className="playground-morph">
          <BrandMark asButton />
          <div className="playground-morph__panel">
            <div className="playground-morph__row">
              <FluidNav activeHref={activeHref} onSelect={onSelect} />
              <ManageChip />
            </div>
          </div>
        </NavSurface>
      </div>
    );
  }

  return (
    <div className="nav-layer">
      <NavSurface className="playground-island">
        <BrandMark />
        <FluidNav activeHref={activeHref} onSelect={onSelect} />
        <ManageChip />
      </NavSurface>
    </div>
  );
}

export function NavPlayground() {
  const [style, setStyle] = useState<NavStyle>("split");
  const [activeHref, setActiveHref] = useState("/");
  const current = STYLES.find((item) => item.id === style)!;

  return (
    <div className={cn("nav-playground", style === "dock" && "is-dock")}>
      <div id="nav-playground-scene" className="nav-playground__scene">
        <section className="nav-playground__band nav-playground__band--ink">
          <p className="nav-playground__kicker">Floating / Overlay / Frost</p>
          <h1 className="nav-playground__display">
            浮动
            <span className="block">导航</span>
          </h1>
          <p className="nav-playground__copy">
            导航不再占掉页面最上方一条。它浮在内容上面，页面滑动时从磨砂底下穿过去。
          </p>
          <span className="nav-playground__giant" aria-hidden="true">
            FROST
          </span>
        </section>

        <section className="nav-playground__band nav-playground__band--paper">
          <div className="nav-playground__columns">
            <p className="nav-playground__kicker">Paper field</p>
            <p>
              浅色纸面最容易看出磨砂的厚度。往下滚，看胶囊有没有把标题和色块一起糊进去，而不是盖一层实心白块。
            </p>
            <p>
              {site.tagline}
              实习、竞赛、校招和学习入口都该能从这块磨砂后面透出来，而不是被一条实心顶栏截断。
            </p>
          </div>
        </section>

        <section className="nav-playground__band nav-playground__band--stripe">
          <div className="nav-playground__stack">
            <p className="nav-playground__kicker">Hard edges</p>
            <h2>色块切开之后，模糊才看得出来。</h2>
            <p>
              红、墨、米三色硬切。磨砂应该把边缘糊进胶囊里；如果只是半透明白块，这里会立刻穿帮。
            </p>
          </div>
        </section>

        <section className="nav-playground__band nav-playground__band--type">
          <p className="nav-playground__kicker">Dense type</p>
          <h2 className="nav-playground__display">
            江财
            <span className="block">OFFER</span>
          </h2>
          <p className="nav-playground__copy">
            继续滑。大字、校徽、深底，用来检查导航有没有真的盖在内容上，而不是把第一屏往下挤开。
          </p>
          <div className="nav-playground__mark">
            <ResilientImage
              src={site.logoSrc}
              alt=""
              width={320}
              height={320}
              sizes="320px"
              className="h-full w-full object-cover"
            />
          </div>
        </section>
      </div>

      <PlaygroundNav
        key={style}
        style={style}
        activeHref={activeHref}
        onSelect={setActiveHref}
      />

      <div className="nav-playground__controls">
        <div className="nav-playground__panel">
          <div className="nav-playground__panel-top">
            <p>样式实验室</p>
            <Link href="/">返回站点</Link>
          </div>
          <div className="nav-playground__chips" role="tablist" aria-label="导航样式">
            {STYLES.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={style === item.id}
                className={cn("nav-playground__chip", style === item.id && "is-active")}
                onClick={() => setStyle(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="nav-playground__note">
            {current.note}
            {style === "morph" ? " 把指针放上去，或用键盘走进去。" : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

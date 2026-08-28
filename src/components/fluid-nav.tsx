"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { siteNavItems } from "@/data/nav";
import { cn } from "@/lib/utils";

type Indicator = {
  left: number;
  width: number;
  ready: boolean;
};

export function FluidNav({
  activeHref: activeHrefProp,
  onSelect,
  variant = "links",
}: {
  activeHref?: string;
  onSelect?: (href: string) => void;
  variant?: "links" | "dock";
}) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<Record<string, HTMLElement | null>>({});
  const [indicator, setIndicator] = useState<Indicator>({
    left: 0,
    width: 0,
    ready: false,
  });

  const fallbackHref =
    pathname === "/" || /^\/[1-6]$/.test(pathname)
      ? "/"
      : (siteNavItems.find((item) => item.href !== "/" && pathname.startsWith(item.href))
          ?.href ?? "/");
  const activeHref = activeHrefProp ?? fallbackHref;

  const updateIndicator = useCallback(() => {
    const nav = navRef.current;
    const activeLink = linkRefs.current[activeHref];
    if (!nav || !activeLink) return;

    setIndicator({
      left: activeLink.offsetLeft,
      width: activeLink.offsetWidth,
      ready: true,
    });
  }, [activeHref]);

  useLayoutEffect(() => {
    updateIndicator();
    const nav = navRef.current;
    if (!nav) return;

    const resizeObserver = new ResizeObserver(updateIndicator);
    resizeObserver.observe(nav);
    window.addEventListener("resize", updateIndicator);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateIndicator);
    };
  }, [updateIndicator]);

  return (
    <nav
      ref={navRef}
      className={cn("fluid-nav", variant === "dock" && "fluid-nav--dock")}
      aria-label="主导航"
    >
      <span
        className="fluid-nav__indicator"
        aria-hidden="true"
        style={{
          width: indicator.width,
          transform: `translateX(${indicator.left}px)`,
          opacity: indicator.ready ? 1 : 0,
        }}
      />
      {siteNavItems.map(({ href, label, icon: Icon }) => {
        const active = activeHref === href;
        const className = cn("fluid-nav__link", active && "is-active");
        const content = (
          <>
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </>
        );

        if (onSelect) {
          return (
            <button
              key={href}
              type="button"
              ref={(element) => {
                linkRefs.current[href] = element;
              }}
              aria-current={active ? "page" : undefined}
              className={className}
              onClick={() => onSelect(href)}
            >
              {content}
            </button>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            ref={(element) => {
              linkRefs.current[href] = element;
            }}
            aria-current={active ? "page" : undefined}
            className={className}
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
}

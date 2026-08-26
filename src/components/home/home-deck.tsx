"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { shouldReduceEffects } from "@/lib/client-performance";
import { cn } from "@/lib/utils";

const WHEEL_THRESHOLD = 42;
const TOUCH_THRESHOLD = 56;
const SLIDE_DURATION = 0.92;
const EDGE_EPSILON = 1;

type GsapApi = typeof import("gsap").gsap;

let gsapPromise: Promise<GsapApi> | null = null;

function loadGsap() {
  gsapPromise ??= import("gsap").then((module) => module.gsap);
  return gsapPromise;
}

interface ScrollableState {
  clientHeight: number;
  scrollHeight: number;
  scrollTop: number;
}

function getTargetElement(target: EventTarget | null) {
  if (target instanceof Element) return target;
  return target instanceof Node ? target.parentElement : null;
}

function getScrollableStates(
  target: EventTarget | null,
  boundary: HTMLElement,
): ScrollableState[] {
  let element = getTargetElement(target);
  if (!element || !boundary.contains(element)) return [];

  const states: ScrollableState[] = [];
  while (element) {
    const style = window.getComputedStyle(element);
    const scrollable = /^(auto|scroll|overlay)$/.test(style.overflowY);
    if (scrollable && element.scrollHeight > element.clientHeight + EDGE_EPSILON) {
      states.push({
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
        scrollTop: element.scrollTop,
      });
    }
    if (element === boundary) break;
    element = element.parentElement;
  }
  return states;
}

function canConsume(states: ScrollableState[], deltaY: number) {
  return states.some((state) => {
    if (deltaY > 0) {
      return state.scrollTop < state.scrollHeight - state.clientHeight - EDGE_EPSILON;
    }
    return deltaY < 0 && state.scrollTop > EDGE_EPSILON;
  });
}

function isFormTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    Boolean(target.closest("input, textarea, select, button, [contenteditable]"))
  );
}

export function HomeDeck({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const slides = Children.toArray(children);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const goToSlideRef = useRef<(index: number) => void>(() => {});
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || slides.length === 0) return;
    const deckViewport = viewport;
    const deckTrack = track;

    window.scrollTo(0, 0);

    let currentIndex = 0;
    let locked = false;
    let unlockTimer: number | null = null;
    let touchStartY = 0;
    let touchTarget: EventTarget | null = null;
    let touchScrollableStates: ScrollableState[] = [];
    let activeAnimation: Animation | null = null;
    let activeGsap: GsapApi | null = null;
    let transitionToken = 0;
    let destroyed = false;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function finishTransition(token: number) {
      if (token !== transitionToken || destroyed) return;
      locked = false;
    }

    function animateWithBrowser(targetY: number, token: number) {
      const finalTransform = `translate3d(0, ${targetY}px, 0)`;
      if (typeof deckTrack.animate !== "function") {
        deckTrack.style.transform = finalTransform;
        finishTransition(token);
        return;
      }
      activeAnimation?.cancel();
      activeAnimation = deckTrack.animate(
        [
          { transform: window.getComputedStyle(deckTrack).transform },
          { transform: finalTransform },
        ],
        {
          duration: SLIDE_DURATION * 1000,
          easing: "cubic-bezier(0.645, 0.045, 0.355, 1)",
          fill: "forwards",
        },
      );
      activeAnimation.onfinish = () => {
        deckTrack.style.transform = finalTransform;
        activeAnimation?.cancel();
        activeAnimation = null;
        finishTransition(token);
      };
      activeAnimation.oncancel = () => finishTransition(token);
    }

    function warmMotionEngine() {
      if (!shouldReduceEffects()) void loadGsap().catch(() => {});
    }

    function syncPosition(index: number, immediate = false) {
      currentIndex = Math.max(0, Math.min(slides.length - 1, index));
      setActiveIndex(currentIndex);
      locked = true;
      const token = ++transitionToken;
      const targetY = -deckViewport.clientHeight * currentIndex;
      if (unlockTimer !== null) window.clearTimeout(unlockTimer);
      activeAnimation?.cancel();
      activeGsap?.killTweensOf(deckTrack);

      if (immediate || motionQuery.matches) {
        deckTrack.style.transform = `translate3d(0, ${targetY}px, 0)`;
        finishTransition(token);
      } else if (shouldReduceEffects()) {
        animateWithBrowser(targetY, token);
      } else {
        void loadGsap()
          .then((gsap) => {
            if (destroyed || token !== transitionToken) return;
            activeGsap = gsap;
            gsap.to(deckTrack, {
              y: targetY,
              duration: SLIDE_DURATION,
              ease: "power3.inOut",
              overwrite: true,
              onComplete: () => finishTransition(token),
            });
          })
          .catch(() => animateWithBrowser(targetY, token));
      }
      unlockTimer = window.setTimeout(
        () => {
          finishTransition(token);
          unlockTimer = null;
        },
        immediate || motionQuery.matches ? 0 : SLIDE_DURATION * 1000 + 80,
      );
    }

    function step(direction: -1 | 1) {
      if (locked) return;
      const next = Math.max(0, Math.min(slides.length - 1, currentIndex + direction));
      if (next === currentIndex) return;
      syncPosition(next);
    }

    goToSlideRef.current = (index) => {
      if (locked || index === currentIndex) return;
      syncPosition(index);
    };

    function handleWheel(event: WheelEvent) {
      if (Math.abs(event.deltaY) < WHEEL_THRESHOLD || isFormTarget(event.target)) return;
      if (canConsume(getScrollableStates(event.target, deckViewport), event.deltaY))
        return;
      const direction = event.deltaY > 0 ? 1 : -1;
      const next = Math.max(0, Math.min(slides.length - 1, currentIndex + direction));
      event.preventDefault();
      if (next === currentIndex) return;
      step(direction);
    }

    function handleDeckClick(event: MouseEvent) {
      const anchor = getTargetElement(event.target)?.closest<HTMLAnchorElement>(
        "a[href^='#']",
      );
      const hash = anchor?.getAttribute("href");
      if (!anchor || !hash || hash.length < 2) return;

      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target || !deckTrack.contains(target)) return;
      const targetIndex = Array.from(deckTrack.children).findIndex((slide) =>
        slide.contains(target),
      );
      if (targetIndex < 0) return;

      event.preventDefault();
      history.replaceState(null, "", hash);
      goToSlideRef.current(targetIndex);
    }

    function handleTouchStart(event: TouchEvent) {
      warmMotionEngine();
      touchStartY = event.touches[0]?.clientY ?? 0;
      touchTarget = event.target;
      touchScrollableStates = getScrollableStates(event.target, deckViewport);
    }

    function handleTouchEnd(event: TouchEvent) {
      if (touchTarget instanceof Element && touchTarget.closest("canvas")) return;
      const deltaY = touchStartY - (event.changedTouches[0]?.clientY ?? touchStartY);
      if (Math.abs(deltaY) < TOUCH_THRESHOLD || canConsume(touchScrollableStates, deltaY))
        return;
      const direction = deltaY > 0 ? 1 : -1;
      const next = Math.max(0, Math.min(slides.length - 1, currentIndex + direction));
      if (next === currentIndex) return;
      step(direction);
      touchTarget = null;
      touchScrollableStates = [];
    }

    function handleKeydown(event: KeyboardEvent) {
      if (isFormTarget(event.target)) return;
      if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ") {
        event.preventDefault();
        step(1);
      } else if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        step(-1);
      }
    }

    function handleResize() {
      transitionToken += 1;
      activeAnimation?.cancel();
      activeGsap?.killTweensOf(deckTrack);
      deckTrack.style.transform = `translate3d(0, ${-deckViewport.clientHeight * currentIndex}px, 0)`;
      locked = false;
    }

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(deckViewport);
    deckViewport.addEventListener("wheel", handleWheel, { passive: false });
    deckViewport.addEventListener("pointermove", warmMotionEngine, {
      once: true,
      passive: true,
    });
    deckViewport.addEventListener("click", handleDeckClick);
    deckViewport.addEventListener("touchstart", handleTouchStart, { passive: true });
    deckViewport.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeydown);
    deckTrack.style.transform = "translate3d(0, 0, 0)";

    return () => {
      destroyed = true;
      transitionToken += 1;
      resizeObserver.disconnect();
      deckViewport.removeEventListener("wheel", handleWheel);
      deckViewport.removeEventListener("pointermove", warmMotionEngine);
      deckViewport.removeEventListener("click", handleDeckClick);
      deckViewport.removeEventListener("touchstart", handleTouchStart);
      deckViewport.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeydown);
      if (unlockTimer !== null) window.clearTimeout(unlockTimer);
      activeAnimation?.cancel();
      activeGsap?.killTweensOf(deckTrack);
      goToSlideRef.current = () => {};
    };
  }, [slides.length]);

  return (
    <div className={cn("home-deck", className)}>
      <div ref={viewportRef} className="home-deck__viewport">
        <div ref={trackRef} className="home-deck__track">
          {slides}
        </div>
        <nav className="home-deck__dots" aria-label="首页分屏导航">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`第 ${index + 1} 屏`}
              aria-current={activeIndex === index ? "true" : undefined}
              className={cn("home-deck__dot", activeIndex === index && "is-active")}
              onClick={(event) => {
                event.currentTarget.blur();
                goToSlideRef.current(index);
              }}
            />
          ))}
        </nav>
      </div>
    </div>
  );
}

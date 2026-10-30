"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import styles from "./site-preloader.module.css";

const MINIMUM_DURATION = 850;
const MAXIMUM_DURATION = 3000;

/** The root layout keeps this mounted, so client-side navigation never replays it. */
export function SitePreloader() {
  const [visible, setVisible] = useState(true);
  const [skipped, setSkipped] = useState(false);
  const reducedMotion = useReducedMotion();
  const screenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;
    const startedAt = performance.now();
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cancelled = false;
    let readyTimer: ReturnType<typeof setTimeout> | undefined;
    const deadline = setTimeout(() => setVisible(false), MAXIMUM_DURATION);

    const finish = () => {
      if (cancelled) return;
      const minimum = motionPreference.matches ? 0 : MINIMUM_DURATION;
      readyTimer = setTimeout(
        () => {
          clearTimeout(deadline);
          setVisible(false);
        },
        Math.max(0, minimum - (performance.now() - startedAt)),
      );
    };

    // Wait for the initial document and fonts, never for optional Canvas/3D effects.
    const onLoad = () => {
      void document.fonts.ready.then(finish, finish);
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });

    const onKeyDown = (event: KeyboardEvent) => {
      // Reveal the page before keyboard users start navigating its controls.
      if (event.key === "Escape" || event.key === "Tab") {
        setSkipped(true);
        setVisible(false);
      }
    };
    const onVisibilityChange = () => {
      if (screenRef.current) {
        screenRef.current.dataset.paused = String(document.hidden);
      }
    };
    onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("keydown", onKeyDown, { capture: true });

    return () => {
      cancelled = true;
      clearTimeout(deadline);
      clearTimeout(readyTimer);
      window.removeEventListener("load", onLoad);
      window.removeEventListener("keydown", onKeyDown, { capture: true });
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [visible]);

  return (
    <>
      <noscript>
        <style>{"[data-site-preloader] { display: none !important; }"}</style>
      </noscript>
      <AnimatePresence>
        {visible && (
          <motion.div
            ref={screenRef}
            className={styles.screen}
            data-site-preloader=""
            initial={false}
            exit={reducedMotion || skipped ? { opacity: 0 } : { y: "-100%" }}
            transition={{
              duration: skipped ? 0 : reducedMotion ? 0.15 : 0.65,
              ease: [0.76, 0, 0.24, 1],
            }}
            onWheel={(event) => event.stopPropagation()}
          >
            <div className={styles.topline} aria-hidden="true">
              <span>JUFE / STUDENT RESOURCE INDEX</span>
              <span className={styles.edition}>为下一站，做好准备。</span>
            </div>

            <div className={styles.center}>
              <div className={styles.symbol} aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </div>
              <div className={styles.wordmark} aria-hidden="true">
                <span>JUFE</span>
                <span>
                  OFFER<span className={styles.dot}>.</span>
                </span>
              </div>
              <p className={styles.caption}>实习、竞赛、学习资源。</p>
            </div>

            <div className={styles.bottomline}>
              <div className={styles.status} role="status" aria-live="polite">
                <span className={styles.statusDot} aria-hidden="true" />
                正在打开江财 OFFER
              </div>
              <button
                type="button"
                className={styles.skip}
                onClick={() => {
                  setSkipped(true);
                  setVisible(false);
                }}
              >
                跳过动画 <span aria-hidden="true">↗</span>
              </button>
              <div className={styles.track} aria-hidden="true">
                <span />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

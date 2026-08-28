"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ArrowUpRight, Copy } from "lucide-react";
import { toast } from "sonner";
import { DecryptReveal } from "@/components/canvasui/DecryptReveal";
import { ExternalLink } from "@/components/external-link";
import { FlowingWaves } from "@/components/flowing-waves";
import {
  CommunityFloatingQrCard,
  CommunityPassShell,
} from "@/components/home/community-pass-shell";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Button, buttonVariants } from "@/components/ui/button";
import { site } from "@/data/site";
import { scheduleIdle } from "@/lib/client-performance";
import { cn } from "@/lib/utils";

const RESTING_TRANSFORM = "rotateX(2deg) rotateY(-6deg)";

export function QqGroupPanel() {
  const stageRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const [decryptReady, setDecryptReady] = useState(false);

  useEffect(() => {
    return scheduleIdle(() => setDecryptReady(true), 700);
  }, []);

  useEffect(
    () => () => {
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    const scene = sceneRef.current;
    if (!scene) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / Math.max(bounds.width, 1) - 0.5;
    const y = (event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5;
    const rotateX = 2 - y * 5;
    const rotateY = -6 + x * 8;

    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = window.requestAnimationFrame(() => {
      scene.style.transition = "transform 180ms ease";
      scene.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    });
  }

  function handlePointerLeave() {
    const scene = sceneRef.current;
    if (!scene) return;
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = window.requestAnimationFrame(() => {
      scene.style.transition = "transform 500ms var(--ease-out)";
      scene.style.transform = RESTING_TRANSFORM;
    });
  }

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(site.qqGroupNumber);
      toast.success("群号已复制");
    } catch {
      toast.error("复制失败，请手动复制");
    }
  }

  const actionContent = (
    <div className="community-pass__actions">
      <ExternalLink
        href={site.qqGroupJoinUrl}
        className={cn(buttonVariants({ size: "lg" }), "community-pass__join")}
      >
        一键加入群聊
        <ArrowUpRight />
      </ExternalLink>
      <Button
        type="button"
        variant="ghost"
        size="lg"
        onClick={() => void copyNumber()}
        className="community-pass__copy-button"
      >
        <Copy />
        {site.qqGroupNumber}
      </Button>
    </div>
  );

  return (
    <section ref={stageRef} id="qq-group" className="community-stage">
      <FlowingWaves className="text-white opacity-18" />
      <div className="community-stage__glow" aria-hidden="true" />

      <div className="community-stage__inner">
        <ScrollReveal className="community-stage__header">
          <div className="community-stage__index">
            <span>02</span>
            <span className="community-stage__index-line" />
            <span>Community</span>
          </div>
          <p>JUFE / COMPUTER SCIENCE NETWORK</p>
        </ScrollReveal>

        <ScrollReveal className="community-stage__viewport" delay={80}>
          <div
            className="community-stage__interaction"
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          >
            <div ref={sceneRef} className="community-stage__scene">
              <div className="community-pass__depth community-pass__depth--far" />
              <div className="community-pass__depth community-pass__depth--near" />

              {decryptReady ? (
                <DecryptReveal
                  className="community-stage__decrypt"
                  radius={520}
                  softness={0.46}
                  cell={8}
                  aspect={0.74}
                  colored={1}
                  brightness={1}
                  legibility={1}
                  contrast={1.08}
                  exposure={1}
                  scramble={0.12}
                  scrambleSpeed={7}
                  edgeWidth={0.18}
                  edgeFlicker={0.8}
                  edgeGlow={1.1}
                  edgeTint={0.4}
                  aberration={5}
                  passthrough={0}
                  threshold={0.028}
                  smoothing={0.18}
                  background="#0d0d0d"
                  color="#b91b20"
                >
                  <CommunityPassShell actions={actionContent} />
                  <CommunityFloatingQrCard />
                </DecryptReveal>
              ) : (
                <div className="community-stage__decrypt">
                  <CommunityPassShell actions={actionContent} />
                  <CommunityFloatingQrCard />
                </div>
              )}

              <div className="community-stage__caption" aria-hidden="true">
                <span>JXUFE — 2026</span>
                <span>STUDENT COMMUNITY</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

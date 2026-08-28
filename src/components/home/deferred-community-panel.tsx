"use client";

import { useEffect, useRef, useState, type ComponentType, type RefObject } from "react";
import { ArrowUpRight, Copy } from "lucide-react";
import { FlowingWaves } from "@/components/flowing-waves";
import { ResilientImage } from "@/components/resilient-image";
import { site } from "@/data/site";
import { useEffectsMode } from "@/hooks/use-effects-mode";
import { scheduleIdle } from "@/lib/client-performance";

function CommunityLitePanel({
  containerRef,
}: {
  containerRef: RefObject<HTMLElement | null>;
}) {
  const [copied, setCopied] = useState(false);

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(site.qqGroupNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section
      ref={containerRef}
      id="qq-group"
      className="community-stage community-stage--lite"
    >
      <FlowingWaves className="text-white opacity-18" />
      <div className="community-lite">
        <div className="community-stage__index">
          <span>02</span>
          <span className="community-stage__index-line" />
          <span>Community</span>
        </div>

        <div className="community-lite__card">
          <div className="community-lite__copy">
            <p>{site.qqGroupPurpose}</p>
            <h2>{site.communityCardTitle}</h2>
            <div className="community-lite__actions">
              <a href={site.qqGroupJoinUrl} target="_blank" rel="noreferrer">
                一键加入群聊
                <ArrowUpRight />
              </a>
              <button type="button" onClick={() => void copyNumber()}>
                <Copy />
                {copied ? "已复制" : site.qqGroupNumber}
              </button>
            </div>
          </div>

          <div className="community-lite__qr">
            <ResilientImage
              src={site.qqGroupQrSrc}
              alt={`${site.qqGroupName}群二维码`}
              width={400}
              height={400}
              loading="eager"
              sizes="(max-width: 767px) 132px, 220px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function DeferredCommunityPanel() {
  const containerRef = useRef<HTMLElement>(null);
  const [panel, setPanel] = useState<ComponentType | null>(null);
  const [fallback, setFallback] = useState(false);
  const [nearby, setNearby] = useState(false);
  const effectsMode = useEffectsMode();

  useEffect(() => {
    if (effectsMode !== "enhanced") return;
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      ([entry]) => setNearby(entry?.isIntersecting ?? false),
      { rootMargin: "30% 0px", threshold: 0.01 },
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [effectsMode]);

  useEffect(() => {
    if (effectsMode !== "enhanced" || !nearby || fallback || panel) return;
    let cancelled = false;

    const load = () => {
      import("@/components/qq-group-panel")
        .then((module) => {
          if (!cancelled) setPanel(() => module.QqGroupPanel);
        })
        .catch(() => {
          if (!cancelled) setFallback(true);
        });
    };

    const cancelIdle = scheduleIdle(load, 900);
    return () => {
      cancelled = true;
      cancelIdle();
    };
  }, [effectsMode, fallback, nearby, panel]);

  const Panel = panel;
  return Panel ? <Panel /> : <CommunityLitePanel containerRef={containerRef} />;
}

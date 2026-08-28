"use client";

import dynamic from "next/dynamic";
import { ArrowUpRight, Github, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useEffectsMode } from "@/hooks/use-effects-mode";
import { formatRepositoryStars, type RepositoryCardData } from "@/lib/repository-card";

const DriftWall = dynamic(
  () => import("@/components/drift-wall").then((module) => module.DriftWall),
  { ssr: false },
);

function CampusProjectsLite({ projects }: { projects: RepositoryCardData[] }) {
  return (
    <div className="campus-projects-lite" aria-label="当前 Star 数最多的三个校内开源项目">
      {projects.map((project, index) => (
        <a
          key={project.href}
          href={project.href}
          target="_blank"
          rel="noreferrer"
          className="campus-projects-lite__card"
        >
          <span className="campus-projects-lite__meta">
            <span>#{String(index + 1).padStart(2, "0")}</span>
            <span>
              <Github aria-hidden="true" />
              {project.primaryLanguage ?? "Open source"}
            </span>
          </span>
          <strong>
            {project.owner} / {project.name}
          </strong>
          <small>{project.description}</small>
          <span className="campus-projects-lite__footer">
            <span>
              <Star aria-hidden="true" /> {formatRepositoryStars(project.stars)}
            </span>
            <ArrowUpRight aria-hidden="true" />
          </span>
        </a>
      ))}
    </div>
  );
}

export function ResponsiveCampusProjectsWall({
  projects,
}: {
  projects: RepositoryCardData[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const effectsMode = useEffectsMode();
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || effectsMode !== "enhanced") return;

    const observer = new IntersectionObserver(
      ([entry]) => setNearViewport(entry?.isIntersecting ?? false),
      { rootMargin: "20% 0px", threshold: 0.01 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [effectsMode]);

  return (
    <div ref={containerRef} className="campus-projects-stage__responsive-wall">
      {effectsMode === "enhanced" && nearViewport ? (
        <DriftWall items={projects} />
      ) : (
        <CampusProjectsLite projects={projects} />
      )}
    </div>
  );
}

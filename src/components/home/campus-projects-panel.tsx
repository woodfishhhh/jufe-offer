import Link from "next/link";
import { ArrowUpRight, Github, GitPullRequest, Star, Users } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { formatRepositoryStars, type RepositoryCardData } from "@/lib/repository-card";
import { cn } from "@/lib/utils";

export function CampusProjectsPanel({ projects }: { projects: RepositoryCardData[] }) {
  const topProjects = [...projects]
    .sort(
      (left, right) =>
        (right.stars ?? -1) - (left.stars ?? -1) ||
        left.name.localeCompare(right.name, "zh-CN"),
    )
    .slice(0, 3);

  return (
    <section className="campus-projects-stage" aria-labelledby="campus-projects-title">
      <div className="campus-projects-stage__glow" aria-hidden="true" />
      <div className="campus-projects-stage__shell">
        <div className="campus-projects-stage__copy">
          <div className="campus-projects-stage__eyebrow">
            <span>04</span>
            <span>Campus open source</span>
          </div>
          <Github className="campus-projects-stage__icon" aria-hidden="true" />
          <h2 id="campus-projects-title">
            <span>让校内项目</span>
            <span>被更多同学看见</span>
          </h2>
          <p>
            从资源导航、编辑器到竞赛工具，每一个仓库都可以成为一次协作的起点。找项目、提
            Issue、交 PR，也欢迎把你的作品加入这里。
          </p>
          <div className="campus-projects-stage__stats" aria-label="校内项目互助方式">
            <span>
              <Users />
              找到同伴
            </span>
            <span>
              <GitPullRequest />
              参与共建
            </span>
          </div>
          <Link
            href="/resources?category=%E6%A0%A1%E5%86%85%E5%BC%80%E6%BA%90%E9%A1%B9%E7%9B%AE"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-white text-black hover:bg-white/90",
            )}
          >
            查看校内项目
            <ArrowUpRight />
          </Link>
        </div>

        <div className="campus-projects-stage__wall">
          {topProjects.length ? (
            <div
              className="campus-projects-lite"
              aria-label="当前 Star 数最多的三个校内开源项目"
            >
              {topProjects.map((project, index) => (
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
          ) : (
            <div className="campus-projects-stage__empty" role="status">
              <Github aria-hidden="true" />
              <span>暂无校内开源项目</span>
              <small>项目通过审核后会出现在这里</small>
            </div>
          )}
          <div className="campus-projects-stage__wall-label" aria-hidden="true">
            <span>{topProjects.length.toString().padStart(2, "0")} repositories</span>
            <span>HIGHEST STARRED / OPEN</span>
          </div>
        </div>
      </div>
    </section>
  );
}

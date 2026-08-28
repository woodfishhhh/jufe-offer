import Link from "next/link";
import { ArrowUpRight, Github, GitPullRequest, Users } from "lucide-react";
import { DriftWall } from "@/components/drift-wall";
import { buttonVariants } from "@/components/ui/button";
import type { RepositoryCardData } from "@/lib/repository-card";
import { cn } from "@/lib/utils";

export function CampusProjectsPanel({ projects }: { projects: RepositoryCardData[] }) {
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
          {projects.length ? (
            <DriftWall items={projects} />
          ) : (
            <div className="campus-projects-stage__empty" role="status">
              <Github aria-hidden="true" />
              <span>暂无校内开源项目</span>
              <small>项目通过审核后会出现在这里</small>
            </div>
          )}
          <div className="campus-projects-stage__wall-label" aria-hidden="true">
            <span>{projects.length.toString().padStart(2, "0")} repositories</span>
            <span>DRAG / HOVER / OPEN</span>
          </div>
        </div>
      </div>
    </section>
  );
}

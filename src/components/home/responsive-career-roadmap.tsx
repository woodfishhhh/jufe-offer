"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { useEffectsMode } from "@/hooks/use-effects-mode";

const EnhancedCareerRoadmap = dynamic(
  () =>
    import("@/components/home/career-roadmap-panel").then(
      (module) => module.CareerRoadmapPanel,
    ),
  { ssr: false },
);

const MOBILE_CAREERS = [
  {
    name: "前端",
    title: "前端工程师",
    code: "Frontend",
    description: "把设计和业务变成真实、流畅、可访问的网页产品。",
    href: "https://roadmap.sh/frontend",
    steps: ["HTML · CSS", "JavaScript · TypeScript", "React · Vue", "工程化 · 测试"],
  },
  {
    name: "后端",
    title: "后端工程师",
    code: "Backend",
    description: "设计稳定的服务、数据模型和接口，支撑产品持续运行。",
    href: "https://roadmap.sh/backend",
    steps: ["Java · Go · Python", "MySQL · Redis", "服务框架", "部署 · 监控"],
  },
  {
    name: "全栈",
    title: "全栈工程师",
    code: "Full stack",
    description: "贯通界面、服务和部署，独立完成一个可上线的产品闭环。",
    href: "https://roadmap.sh/full-stack",
    steps: ["React · Next.js", "REST · RPC", "SQL · Auth", "CI/CD · 上线"],
  },
  {
    name: "AI",
    title: "AI 工程师",
    code: "AI engineer",
    description: "把大模型能力接入真实场景，做出可评估、可迭代的智能应用。",
    href: "https://roadmap.sh/ai-engineer",
    steps: ["Python · API", "Prompt · LLM", "RAG · Agent", "评测 · 部署"],
  },
  {
    name: "数据",
    title: "数据工程师",
    code: "Data",
    description: "建设稳定的数据采集、计算和治理链路，为分析与智能应用提供底座。",
    href: "https://roadmap.sh/data-engineer",
    steps: ["Python · SQL", "ETL · 建模", "Spark · Flink", "质量 · 调度"],
  },
  {
    name: "运维",
    title: "DevOps 工程师",
    code: "DevOps",
    description: "打通开发、测试和运维流程，让软件可以快速、稳定地持续交付。",
    href: "https://roadmap.sh/devops",
    steps: ["Linux · 网络", "Docker · K8s", "CI/CD · GitOps", "可观测性"],
  },
] as const;

function LiteCareerRoadmap() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = MOBILE_CAREERS[selectedIndex];

  return (
    <section className="career-lite" aria-labelledby="career-lite-title">
      <div className="career-lite__grid" aria-hidden="true" />
      <div className="career-lite__shell">
        <header className="career-lite__header">
          <div>
            <p>
              <span>03</span> Career map
            </p>
            <h2 id="career-lite-title">选一条路，开始积累</h2>
          </div>
          <span>从基础到作品</span>
        </header>

        <div className="career-lite__tabs" role="tablist" aria-label="职业方向">
          {MOBILE_CAREERS.map((career, index) => (
            <button
              key={career.name}
              type="button"
              role="tab"
              aria-selected={selectedIndex === index}
              className={selectedIndex === index ? "is-active" : undefined}
              onClick={() => setSelectedIndex(index)}
            >
              {career.name}
            </button>
          ))}
        </div>

        <div className="career-lite__card" role="tabpanel" aria-live="polite">
          <div className="career-lite__intro">
            <span>{selected.code}</span>
            <h3>{selected.title}</h3>
            <p>{selected.description}</p>
          </div>
          <ol className="career-lite__steps">
            {selected.steps.map((step, index) => (
              <li key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step}</strong>
              </li>
            ))}
          </ol>
          <Link href={selected.href} target="_blank" rel="noreferrer">
            查看完整路线
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ResponsiveCareerRoadmap() {
  const effectsMode = useEffectsMode();
  return effectsMode === "enhanced" ? <EnhancedCareerRoadmap /> : <LiteCareerRoadmap />;
}

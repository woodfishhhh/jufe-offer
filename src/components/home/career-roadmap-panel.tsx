"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { OptionWheel } from "@/components/option-wheel";
import { CareerTechStackMatter } from "@/components/home/career-tech-stack-matter";
import { CAREER_TECHNOLOGY_STACKS } from "@/data/career-technologies";

const careerPaths = [
  {
    name: "前端工程师",
    code: "FRONTEND ENGINEER",
    description: "把设计和业务变成真实、流畅、可访问的网页产品。",
    steps: [
      ["Web 基础", "HTML · CSS"],
      ["编程语言", "JavaScript · TypeScript"],
      ["主流框架", "React · Vue"],
      ["工程能力", "Git · Vite · 测试"],
      ["项目实践", "性能 · 部署 · 协作"],
    ],
  },
  {
    name: "后端工程师",
    code: "BACKEND ENGINEER",
    description: "设计稳定的服务、数据模型和接口，支撑产品持续运行。",
    steps: [
      ["一门语言", "Java · Go · Python"],
      ["数据基础", "MySQL · Redis"],
      ["Web 框架", "Spring · Gin · FastAPI"],
      ["系统能力", "消息队列 · 缓存"],
      ["交付上线", "Linux · Docker · 监控"],
    ],
  },
  {
    name: "全栈工程师",
    code: "FULL-STACK ENGINEER",
    description: "贯通界面、服务和部署，独立完成一个可上线的产品闭环。",
    steps: [
      ["产品界面", "React · Next.js"],
      ["接口设计", "REST · RPC"],
      ["数据与权限", "SQL · Auth"],
      ["工程交付", "Git · CI/CD"],
      ["完整作品", "需求 · 上线 · 迭代"],
    ],
  },
  {
    name: "Android 工程师",
    code: "ANDROID ENGINEER",
    description: "围绕 Android 平台构建稳定、流畅并适配多设备的移动应用。",
    steps: [
      ["语言基础", "Kotlin · Java"],
      ["开发工具", "Android Studio · Gradle"],
      ["界面开发", "Compose · Material"],
      ["应用架构", "Jetpack · MVVM"],
      ["质量发布", "测试 · 性能 · Play"],
    ],
  },
  {
    name: "DevOps 工程师",
    code: "DEVOPS ENGINEER",
    description: "打通开发、测试和运维流程，让软件可以快速、稳定地持续交付。",
    steps: [
      ["系统基础", "Linux · Shell · 网络"],
      ["容器平台", "Docker · Kubernetes"],
      ["持续交付", "CI/CD · GitOps"],
      ["基础设施", "Terraform · Ansible"],
      ["可观测性", "Metrics · Logs · Traces"],
    ],
  },
  {
    name: "DevSecOps 工程师",
    code: "DEVSECOPS ENGINEER",
    description: "把安全检查嵌入研发与交付链路，在提速的同时持续降低风险。",
    steps: [
      ["安全基础", "威胁建模 · OWASP"],
      ["代码检查", "SAST · SCA · Secrets"],
      ["供应链", "SBOM · 镜像扫描"],
      ["平台防护", "IAM · Policy · K8s"],
      ["响应治理", "监控 · 漏洞 · 合规"],
    ],
  },
  {
    name: "数据分析师",
    code: "DATA ANALYST",
    description: "把业务问题转成指标、分析与结论，为产品和经营决策提供依据。",
    steps: [
      ["分析工具", "Excel · SQL"],
      ["统计基础", "描述统计 · 假设检验"],
      ["数据处理", "Python · Pandas"],
      ["可视化", "Tableau · Power BI"],
      ["业务表达", "指标 · 报告 · 汇报"],
    ],
  },
  {
    name: "AI 工程师",
    code: "AI ENGINEER",
    description: "把大模型能力接入真实场景，做出可评估、可迭代的智能应用。",
    steps: [
      ["开发基础", "Python · API"],
      ["模型调用", "Prompt · LLM"],
      ["知识增强", "RAG · 向量数据库"],
      ["智能流程", "Agent · Tools"],
      ["生产能力", "评测 · 观测 · 部署"],
    ],
  },
  {
    name: "数据科学家",
    code: "DATA SCIENTIST",
    description: "用统计、实验和机器学习从复杂数据中发现规律并验证业务价值。",
    steps: [
      ["数理基础", "概率 · 统计 · 线代"],
      ["分析语言", "Python · SQL · R"],
      ["机器学习", "特征 · 模型 · 评估"],
      ["实验推断", "A/B Test · 因果"],
      ["业务落地", "洞察 · 沟通 · 决策"],
    ],
  },
  {
    name: "数据工程师",
    code: "DATA ENGINEER",
    description: "建设稳定的数据采集、计算和治理链路，为分析与智能应用提供底座。",
    steps: [
      ["语言基础", "Python · SQL"],
      ["数据处理", "Pandas · ETL"],
      ["数据仓库", "建模 · 指标体系"],
      ["大数据栈", "Spark · Flink"],
      ["工程治理", "Airflow · 质量 · 调度"],
    ],
  },
  {
    name: "机器学习工程师",
    code: "MACHINE LEARNING ENGINEER",
    description: "把机器学习模型训练、优化并部署成可持续运行的生产能力。",
    steps: [
      ["数理基础", "概率 · 线代 · 优化"],
      ["开发基础", "Python · NumPy"],
      ["模型框架", "PyTorch · Scikit-learn"],
      ["训练实验", "特征 · 调参 · 评估"],
      ["部署服务", "Serving · 推理优化"],
    ],
  },
  {
    name: "产品设计师",
    code: "PRODUCT DESIGNER",
    description: "从用户问题出发，设计清晰、易用并能被研发落地的产品体验。",
    steps: [
      ["用户研究", "访谈 · 画像 · 场景"],
      ["信息架构", "流程 · 导航 · 内容"],
      ["交互设计", "线框图 · 状态 · 反馈"],
      ["视觉系统", "Figma · Design System"],
      ["验证交付", "原型 · 测试 · 标注"],
    ],
  },
  {
    name: "数据库工程师",
    code: "DATABASE ENGINEER",
    description: "设计、维护和优化关键数据系统，保障一致性、性能与可恢复性。",
    steps: [
      ["数据库基础", "SQL · 关系模型"],
      ["内核原理", "索引 · 事务 · 锁"],
      ["架构设计", "分库 · 复制 · 分片"],
      ["可靠性", "备份 · 恢复 · 高可用"],
      ["性能治理", "监控 · 调优 · 容量"],
    ],
  },
  {
    name: "iOS 工程师",
    code: "IOS ENGINEER",
    description: "使用 Apple 平台技术构建细腻、可靠并符合生态规范的移动应用。",
    steps: [
      ["语言工具", "Swift · Xcode"],
      ["界面开发", "SwiftUI · UIKit"],
      ["应用架构", "MVVM · Concurrency"],
      ["数据网络", "URLSession · Core Data"],
      ["测试发布", "XCTest · App Store"],
    ],
  },
  {
    name: "区块链工程师",
    code: "BLOCKCHAIN ENGINEER",
    description: "开发可信的链上协议、智能合约和连接真实业务的去中心化应用。",
    steps: [
      ["基础原理", "密码学 · 共识 · 网络"],
      ["合约开发", "Solidity · EVM"],
      ["开发工具", "Foundry · Hardhat"],
      ["应用连接", "Web3.js · 钱包"],
      ["安全实践", "审计 · 测试 · Gas"],
    ],
  },
  {
    name: "测试工程师",
    code: "QUALITY ASSURANCE ENGINEER",
    description: "通过系统化测试和质量工程，尽早发现风险并守住产品体验。",
    steps: [
      ["质量基础", "测试策略 · 风险"],
      ["用例设计", "边界 · 状态 · 场景"],
      ["自动化", "Playwright · Pytest"],
      ["专项测试", "接口 · 性能 · 安全"],
      ["质量平台", "CI · 报告 · 度量"],
    ],
  },
  {
    name: "软件架构师",
    code: "SOFTWARE ARCHITECT",
    description: "在复杂约束下规划系统边界与演进路线，平衡交付、质量和成本。",
    steps: [
      ["工程深度", "语言 · 数据 · 网络"],
      ["架构建模", "DDD · C4 · API"],
      ["分布式", "缓存 · 消息 · 一致性"],
      ["质量属性", "性能 · 安全 · 韧性"],
      ["技术决策", "ADR · 演进 · 沟通"],
    ],
  },
  {
    name: "网络安全工程师",
    code: "CYBERSECURITY ENGINEER",
    description: "识别、预防和响应系统安全威胁，保护业务、数据与基础设施。",
    steps: [
      ["系统网络", "Linux · TCP/IP"],
      ["应用安全", "OWASP · 代码审计"],
      ["身份密码", "IAM · PKI · 加密"],
      ["攻防工具", "SIEM · EDR · 渗透"],
      ["安全运营", "响应 · 合规 · 复盘"],
    ],
  },
  {
    name: "UX 设计师",
    code: "UX DESIGNER",
    description: "研究用户行为与任务流程，让产品更易理解、更高效也更包容。",
    steps: [
      ["研究方法", "访谈 · 问卷 · 观察"],
      ["体验建模", "旅程 · 画像 · 场景"],
      ["交互原型", "流程 · 线框 · Figma"],
      ["可用性", "测试 · 无障碍"],
      ["体验度量", "数据 · 洞察 · 迭代"],
    ],
  },
  {
    name: "技术文档工程师",
    code: "TECHNICAL WRITER",
    description: "把复杂技术转化为准确、清晰且可持续维护的文档与知识体系。",
    steps: [
      ["技术基础", "代码 · API · Git"],
      ["内容设计", "受众 · 结构 · 示例"],
      ["文档工程", "Markdown · Docs as Code"],
      ["接口文档", "OpenAPI · SDK"],
      ["持续维护", "评审 · 搜索 · 本地化"],
    ],
  },
  {
    name: "游戏开发工程师",
    code: "GAMEPLAY ENGINEER",
    description: "把玩法、美术和交互实现为流畅、有反馈并可持续迭代的游戏体验。",
    steps: [
      ["编程基础", "C++ · C# · 算法"],
      ["游戏引擎", "Unity · Unreal"],
      ["核心系统", "渲染 · 物理 · 动画"],
      ["玩法开发", "输入 · AI · UI"],
      ["性能发布", "Profiler · 多平台"],
    ],
  },
  {
    name: "游戏服务端工程师",
    code: "GAME SERVER ENGINEER",
    description: "构建低延迟、高并发并能承载实时玩法与玩家状态的服务端系统。",
    steps: [
      ["开发语言", "Go · C++ · Java"],
      ["网络协议", "TCP · UDP · WebSocket"],
      ["服务架构", "房间 · 匹配 · 状态同步"],
      ["数据系统", "Redis · SQL · 消息队列"],
      ["稳定运营", "压测 · 监控 · 容灾"],
    ],
  },
  {
    name: "MLOps 工程师",
    code: "MLOPS ENGINEER",
    description: "连接模型研发与生产平台，让训练、发布、监控和回滚成为稳定流程。",
    steps: [
      ["机器学习", "数据 · 训练 · 评估"],
      ["平台基础", "Docker · Kubernetes"],
      ["流水线", "Airflow · Kubeflow"],
      ["模型管理", "MLflow · Registry"],
      ["线上治理", "Serving · 监控 · 漂移"],
    ],
  },
  {
    name: "产品经理",
    code: "PRODUCT MANAGER",
    description: "连接用户、业务与研发，定义值得解决的问题并推动产品持续交付。",
    steps: [
      ["用户业务", "调研 · 市场 · 场景"],
      ["需求定义", "目标 · 优先级 · 范围"],
      ["方案表达", "PRD · 原型 · 流程"],
      ["数据验证", "指标 · 实验 · 复盘"],
      ["协同交付", "研发 · 设计 · 运营"],
    ],
  },
  {
    name: "研发经理",
    code: "ENGINEERING MANAGER",
    description: "通过技术判断、项目管理和团队建设，持续提升研发组织的交付能力。",
    steps: [
      ["技术判断", "架构 · 质量 · 风险"],
      ["项目管理", "范围 · 排期 · 依赖"],
      ["团队建设", "招聘 · 反馈 · 成长"],
      ["工程效能", "流程 · 平台 · 度量"],
      ["组织协同", "目标 · 沟通 · 复盘"],
    ],
  },
  {
    name: "开发者关系工程师",
    code: "DEVELOPER RELATIONS ENGINEER",
    description: "连接产品与开发者社区，用内容、示例和反馈推动技术被真正采用。",
    steps: [
      ["技术能力", "API · SDK · Demo"],
      ["内容表达", "文章 · 视频 · 演讲"],
      ["社区运营", "活动 · 答疑 · 反馈"],
      ["开源协作", "GitHub · Issue · PR"],
      ["增长度量", "采用 · 留存 · 洞察"],
    ],
  },
  {
    name: "BI 分析师",
    code: "BUSINESS INTELLIGENCE ANALYST",
    description: "建设可信的指标和看板体系，让组织能快速理解经营与业务状态。",
    steps: [
      ["数据查询", "SQL · 数据仓库"],
      ["指标体系", "口径 · 维度 · 模型"],
      ["BI 工具", "Power BI · Tableau"],
      ["看板设计", "可视化 · 叙事 · 预警"],
      ["数据治理", "权限 · 质量 · 自助分析"],
    ],
  },
  {
    name: "网络工程师",
    code: "NETWORK ENGINEER",
    description: "规划、建设和维护可靠的网络基础设施，保障连接、性能与安全。",
    steps: [
      ["网络基础", "TCP/IP · OSI · 子网"],
      ["路由交换", "VLAN · OSPF · BGP"],
      ["网络服务", "DNS · DHCP · VPN"],
      ["自动化", "Python · Ansible · API"],
      ["运维安全", "监控 · 防火墙 · 排障"],
    ],
  },
  {
    name: "前线部署工程师（FDE）",
    code: "FORWARD DEPLOYED ENGINEER",
    description: "深入客户现场，把复杂业务需求快速落成可运行、可扩展的技术方案。",
    steps: [
      ["工程基础", "全栈 · 数据 · 云平台"],
      ["系统集成", "API · ETL · 权限"],
      ["现场交付", "部署 · 迁移 · 排障"],
      ["方案能力", "需求 · 原型 · 架构"],
      ["客户协作", "沟通 · 培训 · 复盘"],
    ],
  },
] as const;

const roadmapSlugs = [
  "frontend",
  "backend",
  "full-stack",
  "android",
  "devops",
  "devsecops",
  "data-analyst",
  "ai-engineer",
  "ai-data-scientist",
  "data-engineer",
  "machine-learning",
  "product-design",
  "postgresql-dba",
  "ios",
  "blockchain",
  "qa",
  "software-architect",
  "cyber-security",
  "ux-design",
  "technical-writer",
  "game-developer",
  "server-side-game-developer",
  "mlops",
  "product-manager",
  "engineering-manager",
  "devrel",
  "bi-analyst",
  "network-engineer",
  "forward-deployed-engineer",
] as const satisfies readonly string[];

export function CareerRoadmapPanel() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const selected = careerPaths[selectedIndex];
  const technologies = CAREER_TECHNOLOGY_STACKS[selectedIndex];
  const roadmapUrl = `https://roadmap.sh/${roadmapSlugs[selectedIndex]}`;

  return (
    <section className="career-roadmap-stage" aria-label="职业技术栈选择">
      <div className="career-roadmap-stage__grid" aria-hidden="true" />
      <div className="career-roadmap-stage__shell">
        <div className="career-roadmap-stage__content">
          <div className="career-wheel-panel">
            <p>拖动、滚动或使用方向键</p>
            <OptionWheel
              items={careerPaths.map((path) => path.name)}
              onChange={(index) => setSelectedIndex(index)}
              fontSize={3}
              tilt={0}
              blur={1}
              fade={0.05}
              minOpacity={0}
              inset={-50}
              spacing={1.4}
              smoothing={130}
              side="right"
              loop
              className="career-wheel"
            />
            <span className="career-wheel-panel__marker" aria-hidden="true" />
          </div>

          <div className="career-stack-panel" aria-live="polite">
            <CareerTechStackMatter technologies={technologies} />
            <header className="career-stack-panel__header">
              <div>
                <div className="career-roadmap-stage__eyebrow">
                  <span>03</span>
                  <span>Career map / choose a path</span>
                </div>
              </div>
              <Link href={roadmapUrl} target="_blank" rel="noreferrer">
                完整路线
                <ArrowUpRight />
              </Link>
            </header>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selected.code}
                className="career-stack-panel__inner"
                initial={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, transform: "translateY(12px)" }
                }
                animate={{ opacity: 1, transform: "translateY(0)" }}
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, transform: "translateY(-8px)" }
                }
                transition={{
                  duration: reduceMotion ? 0.12 : 0.22,
                  ease: [0.23, 1, 0.32, 1],
                }}
              >
                <div className="career-stack-panel__intro">
                  <p>{selected.description}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

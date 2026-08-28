<p align="center">
  <img src="assets/readme/hero.svg" width="100%" alt="江财OFFER — 江财学生资源导航" />
</p>

# 江财OFFER

一个把实习、竞赛、学习资源与校内开源项目集中起来的江财学生资源导航。

<p>
  <a href="https://jufe.woodfish.site"><strong>访问线上站点</strong></a>
  · <a href="https://jufe.woodfish.site/resources">浏览资源目录</a>
  · <a href="https://github.com/woodfishhhh/jufe-offer/issues/new?template=open-source-project.yml">提交校内开源项目</a>
</p>

> 江财OFFER 由学生自发维护，是非官方社区，不代表江西财经大学官方立场。

## 先看成品

<p align="center">
  <img src="assets/readme/resources.webp" width="100%" alt="江财OFFER 校内开源项目资源页" />
</p>

- 首页使用 `01—06` 六页叙事，把资源、校内项目、社群和项目本身串起来。
- 资源页提供搜索、分类、排序、精选筛选和管理员 CRUD。
- 校内开源项目展示真实仓库名、Description、Star、主语言与 owner / 投稿贡献者头像。
- 首页第 4 页和资源页复用同一份数据库记录与同一张黑色仓库卡片。

## 校内项目如何进入页面

<p align="center">
  <picture>
    <source media="(max-width: 640px)" srcset="assets/readme/project-flow-mobile.svg" />
    <img src="assets/readme/project-flow.svg" width="100%" alt="校内开源项目投稿、同步、存储和展示流程" />
  </picture>
</p>

`Resource` 决定项目是否出现在公开资源中，`RepositoryProfile` 保存 GitHub 展示资料。首页按请求读取数据库，因此删除资源后不会继续被旧静态名单展示。头像在同步阶段压缩并站内化，页面运行时不会再请求 GitHub 头像。

## 技术构成

| 层     | 选择                                              |
| ------ | ------------------------------------------------- |
| Web    | Next.js 16 App Router、React 19、TypeScript       |
| UI     | Tailwind CSS、Motion、GSAP、Three.js              |
| 数据   | Prisma ORM、SQLite、Zod                           |
| 自动化 | GitHub Actions、Issue Bot、仓库资料与头像同步工具 |
| 部署   | Next.js standalone、systemd blue/green、Nginx     |

## 快速开始

需要 Node.js 24 和 pnpm。Windows PowerShell：

```powershell
pnpm install
Copy-Item .env.example .env
pnpm db:generate
pnpm prisma migrate deploy
pnpm db:seed
pnpm dev
```

打开 <http://localhost:3000>。`pnpm db:seed` 只用于初始化演示数据；已有真实数据时不要重复覆盖。

### 环境变量

最小本地配置：

```env
DATABASE_URL="file:./dev.db"
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=
SESSION_SECRET=
OPENCLAW_INGEST_TOKEN=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

生成随机密钥：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

生成管理员密码哈希：

```bash
pnpm hash-password -- 你的密码
```

推荐把命令输出的 hex 值写入 `ADMIN_PASSWORD_HASH`。如果直接使用 bcrypt 字符串，需要把每个 `$` 写成 `$$`，避免被 Next.js 当成环境变量展开。

SQLite 默认位于 `prisma/dev.db`，因为 `DATABASE_URL="file:./dev.db"` 相对 `prisma/` 目录解析。完整字段及说明见 [.env.example](.env.example)。

## 日常开发

```bash
pnpm lint
pnpm typecheck
pnpm test:friend-links
pnpm build
```

数据库结构变化后：

```bash
pnpm db:migrate
```

生产环境只执行已有 migration：

```bash
pnpm prisma migrate deploy
```

## 管理资源

普通方式是在资源页登录管理员账号。登录后可以新增、编辑和删除资源；所有写操作都会在服务端再次验证管理员会话，退出后权限立即失效。

### 让本机管理线上资源

本项目支持“本机后台 → 本机 Next.js 服务端 → 线上资源 API”的受控代理。它不会开放 SQLite 文件、SSH 或任意系统权限，也不会把管理 Token 发送到浏览器。

本机 `.env.local`：

```env
USE_REMOTE_RESOURCES=true
REMOTE_RESOURCE_API_BASE_URL=https://jufe.woodfish.site
RESOURCE_ADMIN_API_TOKEN=至少32字符的独立随机Token
```

线上服务器 `/opt/jufe-offer/.env` 必须配置同一份 `RESOURCE_ADMIN_API_TOKEN` 并重启当前应用 slot。完成后，在本机站点使用管理员账号登录，资源页的增删改会由本机服务端代理到线上；列表读取也来自线上。

安全边界：

- `RESOURCE_ADMIN_API_TOKEN` 只能存在于服务端环境，绝不能使用 `NEXT_PUBLIC_` 前缀。
- 它只授权 `/api/resources` 的增删改查，不授权其他集成接口。
- 本机浏览器的 Cookie 或 Authorization 不会原样转发；代理会替换为服务端 Token。
- `SESSION_SECRET`、管理员密码、`OPENCLAW_INGEST_TOKEN` 与该 Token 必须分别生成，不能复用。
- 未配置 Token 时，远程写请求返回 HTTP 503；Token 错误时线上返回 HTTP 401。

## 提交校内开源项目

资源页“校内开源项目”分类顶部的“提交自己的项目”会打开 GitHub Issue。机器人会：

1. 校验仓库地址、项目信息和本校同学创立或参与的声明。
2. 读取 GitHub 仓库名、Description、Star 和主语言。
3. 优先使用参与开发的 Issue 投稿者头像，否则使用仓库 owner 头像。
4. 将头像裁剪压缩为 `320×320 WebP`，保存到 `public/campus-project-avatars/`。
5. 生成带重复 URL 防护的 Prisma migration，由 CI/CD 迁移并部署。

手动刷新全部仓库资料与头像：

```bash
pnpm sync:campus-projects
```

也可以只同步指定仓库：

```bash
pnpm sync:campus-projects -- https://github.com/owner/repository
```

旧命令 `pnpm sync:campus-project-avatars` 仍作为兼容别名保留。

## 内容维护

- 资源分类：修改 [`src/data/categories.ts`](src/data/categories.ts) 的 `CATEGORY_VALUES`。
- 友链：修改 [`src/data/friends.ts`](src/data/friends.ts)；友链申请由 Issue Bot 定时核验反向链接。
- 站点信息、QQ群号与二维码：修改 [`src/data/site.ts`](src/data/site.ts) 及对应 `public/` 资产。
- 仓库头像同步工具：[`scripts/campus-project-avatars.ts`](scripts/campus-project-avatars.ts)。
- 投稿与友链机器人：[`scripts/friend-link-bot.ts`](scripts/friend-link-bot.ts)。

首页 HTML-in-Canvas 只是 Chrome Origin Trial 增强层。Safari、Firefox、未命中 Trial、低性能设备或 WebGL 初始化失败时，普通 DOM 内容仍会保留。

<details>
<summary><strong>OpenClaw 自动入库接口</strong></summary>

OpenClaw 使用独立 Bearer Token：

```text
POST /api/integrations/openclaw/candidates
Authorization: Bearer <OPENCLAW_INGEST_TOKEN>
Content-Type: application/json
```

请求会先保存完整 `Candidate`，再在同一事务中建立 `Resource` 并标记为 `APPROVED`。相同 `dedupeKey` 或相同正式资源 URL 不会重复发布；已完成状态不能被覆盖。正式资源继续保留 `SEED`、`MANUAL` 或 `OPENCLAW` 来源字段，但公开页面不依赖来源标签区分资源。

接口使用 strict schema、64 KiB 请求体上限、HTTPS 链接限制和单实例每分钟 60 次速率限制。允许分类与请求结构以 [`src/schemas/candidate.ts`](src/schemas/candidate.ts) 为准。

</details>

<details>
<summary><strong>生产部署与 SQLite 备份</strong></summary>

`.github/workflows/ci-deploy.yml` 在 Pull Request 上执行 lint、类型检查和生产构建；`main` 更新后部署到京东云。生产采用 standalone blue/green release：候选 slot 通过 revision health 后才切换 Nginx，上一个 release 保留用于恢复。

Migration 变化默认进入 maintenance：停止活动应用、checkpoint WAL、使用 SQLite `.backup` 建立一致快照、执行 migration，再启动候选版本。人工确认新旧 schema 兼容后，才可在 workflow dispatch 选择 `compatible`。

服务器 `/opt/jufe-offer/.env` 和 SQLite 数据库不进入构建产物。完整拓扑、权限、切流与失败恢复流程见 [`deploy/README.md`](deploy/README.md)。

手动备份示例：

```bash
mkdir -p backups
cp prisma/dev.db "backups/dev-$(date +%Y%m%d).db"
```

Windows PowerShell：

```powershell
New-Item -ItemType Directory -Force backups | Out-Null
Copy-Item prisma/dev.db "backups/dev-$(Get-Date -Format yyyyMMdd).db"
```

</details>

## 项目结构

```text
src/app/                 页面与 API Route Handlers
src/components/          首页、资源页与共享仓库卡片
src/lib/                 Prisma、鉴权、远程资源代理与数据映射
prisma/                  schema、seed 与可追踪 migrations
scripts/                 投稿机器人、头像同步与维护工具
public/                  站内图片、模型与压缩头像
deploy/                  blue/green 部署脚本和运维说明
assets/readme/           README 的 SVG 与压缩实机截图
```

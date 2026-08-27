# 江财OFFER

江财OFFER 是由江西财经大学学生自发维护的资源导航网站，用来汇总实习校招、编程学习、竞赛活动、校内开源项目、面经、优秀简历和校内常用入口。

网站保持轻量，只有三个页面：

- `/` 欢迎页
- `/resources` 资源页
- `/friends` 友链页

江财OFFER是学生自发维护的非官方社区，不代表江西财经大学官方立场。

## 技术栈

- pnpm
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite
- Zod
- ESLint
- Prettier

## 本地安装

在项目目录 `jufe-offer/` 中执行：

```bash
pnpm install
```

## 配置环境变量

复制示例文件：

```bash
cp .env.example .env
```

Windows PowerShell：

```powershell
Copy-Item .env.example .env
```

至少填写：

```env
DATABASE_URL="file:./dev.db"
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=
SESSION_SECRET=
OPENCLAW_INGEST_TOKEN=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
HTML_IN_CANVAS_OT_TOKEN=
```

`SESSION_SECRET` 请换成足够长的随机字符串，例如：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

OpenClaw 入库 Token 也可以用同一条命令单独生成。它必须至少 32 个字符，
且不能与管理员密码或 `SESSION_SECRET` 复用：

```env
OPENCLAW_INGEST_TOKEN=生成的随机十六进制字符串
```

## 生成管理员密码哈希

不要把明文密码写进源码。先准备一个密码，然后生成哈希：

```bash
pnpm hash-password -- 你的密码
```

`pnpm hash-password` 会同时输出 bcrypt 哈希和 hex 值。推荐把 hex 值粘贴到 `.env`：

```env
ADMIN_PASSWORD_HASH=24326224...
```

如果坚持使用原始 bcrypt 字符串，请把每个 `$` 写成 `$$`，否则 Next.js 会把它当成环境变量展开，导致无法登录。

本地演示可以用：

```bash
pnpm hash-password -- jufe-offer-dev
```

对应账号：

- 用户名：`.env` 中的 `ADMIN_USERNAME`，示例为 `admin`
- 密码：你刚才用来生成哈希的明文密码

## 初始化 SQLite 数据库

Prisma 会把 SQLite 文件写到：

```text
jufe-offer/prisma/dev.db
```

这是因为 `.env` 中的 `DATABASE_URL="file:./dev.db"` 相对 `prisma/` 目录解析。

生成 Prisma Client：

```bash
pnpm db:generate
```

## 运行 Prisma migration

首次初始化：

```bash
pnpm prisma migrate dev --name init
```

之后如果改了 `prisma/schema.prisma`，再执行：

```bash
pnpm db:migrate
```

生产环境使用：

```bash
pnpm prisma migrate deploy
```

## 导入演示数据

```bash
pnpm db:seed
```

这会写入 50 条公开资源。演示数据使用真实官网链接，不包含伪造招聘或虚假截止日期。

## 启动开发环境

```bash
pnpm dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

## 静态检查和生产构建

```bash
pnpm lint
pnpm typecheck
pnpm build
```

构建完成后可用：

```bash
pnpm start
```

## 修改资源分类

分类集中写在：

```text
src/data/categories.ts
```

修改 `CATEGORY_VALUES` 后，资源表单、筛选和接口校验会一起更新。不需要单独的分类管理后台。

## 修改友链

友链不走数据库，直接编辑：

```text
src/data/friends.ts
```

按现有对象补充 `name`、`description`、`url`、`category` 即可。可选 `icon` 字段；没有图标或图标加载失败时，页面会显示名称首字母。

友链页的“提交友链”会打开预填好的 GitHub Issue。`.github/workflows/friend-link-bot.yml` 会在新 Issue 下回复申请说明，并在每天北京时间 00:00 检查待处理申请：确认对方友链页存在江财OFFER的反向链接后，机器人会把站点写入 `src/data/friends.ts` 的 `personal` 分组、提交到 `main`，再触发现有 CI/CD 部署。客户端渲染、懒加载或临时访问保护导致无法判断时，Issue 会保持打开并在下一轮重试。

## 提交校内开源项目

资源页“校内开源项目”分类顶部的“提交自己的项目”会打开预填好的 GitHub Issue。它和友链申请共用 `.github/workflows/friend-link-bot.yml`：机器人每天北京时间 00:00 检查已等待至少 1 小时的申请，校验项目资料、公开地址和本校同学创立或参与的声明；通过后会生成一条带重复 URL 防护的 Prisma migration，提交到 `main`，再由现有 CI/CD 执行数据库迁移并部署到资源页。信息不完整或地址不可公开访问的 Issue 会自动说明原因并关闭。

## 替换 QQ 群号

编辑：

```text
src/data/site.ts
```

把 `qqGroupNumber` 从空字符串改成真实群号，例如：

```ts
qqGroupNumber: "123456789",
```

欢迎页的“复制群号”按钮会复制这个值。

## 替换 QQ 群二维码

默认占位图是：

```text
public/qq-group-placeholder.svg
```

替换方式：

1. 把真实二维码图片放到 `public/`，例如 `public/qq-group.png`
2. 修改 `src/data/site.ts` 中的 `qqGroupQrSrc`：

```ts
qqGroupQrSrc: "/qq-group.png",
```

## 部署到普通 Linux 服务器

适合一台普通 Node.js 服务器，不依赖 Docker 或云数据库。

1. 安装 Node.js 20+ 和 pnpm。
2. 把项目上传到服务器，例如 `/var/www/jufe-offer`。
3. 复制环境变量：

```bash
cp .env.example .env
```

4. 填写生产环境变量：

```env
DATABASE_URL="file:./dev.db"
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=生产环境哈希
SESSION_SECRET=生产环境随机密钥
OPENCLAW_INGEST_TOKEN=生产环境独立随机密钥
NEXT_PUBLIC_SITE_URL=https://your-domain.example
HTML_IN_CANVAS_OT_TOKEN=Chrome Origin Trial token（可选）
```

5. 安装依赖、迁移数据库并构建：

```bash
pnpm install --frozen-lockfile
pnpm prisma migrate deploy
pnpm db:seed
pnpm build
```

`pnpm db:seed` 只在需要演示数据时执行。已有真实数据时不要重复覆盖。

6. 启动：

```bash
pnpm start
```

默认监听 `3000` 端口。可用 systemd 托管，再用 Nginx 反代到该端口。生产环境请使用 HTTPS，这样登录 Cookie 会启用 `Secure`。

## 备份 SQLite 数据库

数据库文件默认在：

```text
prisma/dev.db
```

备份时直接复制该文件即可，例如：

```bash
cp prisma/dev.db backups/dev-$(date +%Y%m%d).db
```

Windows PowerShell：

```powershell
New-Item -ItemType Directory -Force backups | Out-Null
Copy-Item prisma/dev.db "backups/dev-$(Get-Date -Format yyyyMMdd).db"
```

## CI/CD

`.github/workflows/ci-deploy.yml` 会在 Pull Request 上执行 lint、类型检查和生产构建；`main` 更新后还会自动部署到京东云。

生产部署使用 blue/green standalone release：GitHub 缓存 pnpm、`.next/cache`、ESLint 和 TypeScript 增量信息；产物通过 `rsync --checksum --link-dest` 同步到固定 staging 目录，内容未变化的文件不重复传输，并在 release 之间使用 hardlink。候选版本先在备用端口启动并通过 revision health，随后才让容器 Nginx graceful 切流。

只有生产 release 和候选 release 的 Prisma migrations 不同时才进入 SQLite 流程。自动发布默认使用可恢复的 maintenance 模式；人工确认 schema 向后兼容后，才可在 workflow dispatch 中显式选择 compatible。完整架构、失败处理和一次性服务器迁移命令见 [deploy/README.md](deploy/README.md)。

仓库需要配置以下 GitHub Actions Secrets：

- `DEPLOY_HOST`
- `DEPLOY_PORT`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY`
- `DEPLOY_KNOWN_HOSTS`
- `HTML_IN_CANVAS_OT_TOKEN`（可选；生产构建时注入，不能只在服务器运行时环境中填写）

服务器端部署账号可以写入 `/opt/jufe-offer`，并且只被授权管理 `jufe-offer@blue.service`、`jufe-offer@green.service` 和调用固定 Nginx slot helper。应用仍由非 root 用户运行，生产环境变量和数据库不会进入构建产物。

### HTML-in-Canvas 渐进增强

首页的 HTML-in-Canvas 只作为 Chrome Origin Trial 增强层。配置
`HTML_IN_CANVAS_OT_TOKEN` 后，CI 构建会在所有响应上返回 `Origin-Trial` Header；
Safari、Firefox、未命中 Trial、低性能设备和 WebGL 初始化失败时，会保留普通 DOM 内容，
不会因为实验 API 不可用而出现空白首页。Origin Trial token 会按设计出现在响应 Header 中，
它不是应用登录密钥；仍需注意 token 的 origin 和有效期。

## 管理员使用方式

1. 打开资源页。
2. 点击导航栏右侧的“管理员登录”。
3. 登录成功后，资源页会出现“新增资源”，每条资源会出现“编辑”和“删除”。
4. OpenClaw 核验合格的候选会直接成为正式资源，不再进入管理员审核队列。
5. 删除正式资源前会二次确认，并显示资源名称。
6. 退出登录后立即失去新增、修改和删除权限。
7. 登录 Cookie 是当前浏览器会话，关闭浏览器后需要重新登录。

未登录用户仍可浏览、搜索和筛选资源。所有写操作都会在服务端校验管理员身份。

## OpenClaw 候选入库接口

OpenClaw 使用独立的 Bearer Token 调用：

```text
POST /api/integrations/openclaw/candidates
Authorization: Bearer <OPENCLAW_INGEST_TOKEN>
Content-Type: application/json
```

OpenClaw 不使用管理员用户名或密码，也不能直接访问 SQLite。请求继续保留
`disposition` 字段以兼容旧提交器，但服务端统一按 `AUTO_PUBLISH` 处理：先保存完整
Candidate，再在同一事务中创建 Resource 并把 Candidate 标为 `APPROVED`。

接口不会删除或修改已有正式资源。相同 `dedupeKey` 不会建立第二条候选；自动发布时如发现正式资源中已有相同 URL，会把候选标记为 `DUPLICATE`。已进入
`APPROVED`、`REJECTED` 或 `DUPLICATE` 的候选不能被 OpenClaw 覆盖或重新发布。

请求体最多 64 KiB，使用 strict schema，所有链接必须是 HTTPS。允许的分类只有：

- `INTERNSHIP`
- `CAMPUS_RECRUITMENT`
- `REFERRAL`
- `COMPETITION`
- `HACKATHON`
- `OPEN_SOURCE_RESOURCE`
- `TRAINING`
- `PROGRAMMING_LEARNING`
- `LEARNING_PATH`
- `PROGRAMMING_TOOL`
- `CAREER_EXPERIENCE`
- `RESUME_INTERVIEW`
- `CAMPUS_RESOURCE`
- `OTHER_RESOURCE`

公开开源活动与资源可以使用 `OPEN_SOURCE_RESOURCE` 自动发现并直接发布，但不得推断
江财成员关系。`REFERRAL` 和 `OTHER_RESOURCE` 当前没有自动发现来源；如果提交为合格
候选，服务端同样直接发布。

允许的 `sourceType`：`RSSHUB`、`OFFICIAL_API`、`OFFICIAL_PAGE`、
`WEB_MONITOR`、`MANUAL_RESEARCH`。

请求示例：

```json
{
  "externalId": "nowcoder:123456",
  "dedupeKey": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "disposition": "AUTO_PUBLISH",
  "category": "INTERNSHIP",
  "title": "某公司 2027 届暑期实习",
  "summary": "面向 2027 届学生，包含研发和算法岗位。",
  "sourceType": "RSSHUB",
  "sourceName": "牛客",
  "sourceUrl": "https://example.com/source",
  "officialUrl": "https://example.com/official",
  "deadline": "2026-09-15T23:59:59+08:00",
  "tags": ["27届", "研发", "实习"],
  "rawExcerpt": "保留的原始证据文本",
  "discoveredAt": "2026-08-26T06:00:00Z"
}
```

成功响应：

- 命中其他候选的 `dedupeKey` 或已有相同 URL：HTTP 200，`action` 为 `duplicate`
- 直接发布：新候选 HTTP 201，`action` 为 `published`

Token 未正确配置时返回 503；Token 缺失或错误时返回 401；非法字段返回 400；
已完成入库的候选重投或并发状态冲突返回 409；触发每分钟 60 次的单实例速率限制时返回 429。
候选原始来源与证据会继续保留，管理员只需要维护正式资源，可以编辑或删除。

正式资源的 `origin` 会返回 `SEED`、`MANUAL` 或 `OPENCLAW`。资源卡片和分类
目录据此显示“初始整理”“人工整理”或“自动采集”，分类总数不再被误解为自动抓取数量。

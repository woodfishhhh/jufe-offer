# 江财 OFFER 生产部署

生产环境是一台京东云 Linux 主机：Next.js standalone 由 systemd 运行，SQLite 数据库位于宿主机，`blog-nginx` 容器负责 TLS 和反向代理。部署不引入应用容器或 Kubernetes。

## 运行结构

```text
GitHub Actions
  ├─ pnpm store cache
  ├─ .next/cache + ESLint cache + tsbuildinfo
  ├─ lint / typecheck / build
  └─ release artifact（只在 GitHub 的 build job 与 deploy job 之间传递）
                         │
                         └─ rsync --checksum --link-dest
                              /opt/jufe-offer/releases/.staging-<sha>
                                              │
                                              ├─ manifest / revision / symlink 校验
                                              ├─ rename releases/<sha>
                                              └─ 启动非活动 slot

blog-nginx ── jufe-offer-upstream.inc ── blue  :3020 ── slots/blue  -> releases/<sha>
                                      └─ green :3021 ── slots/green -> releases/<sha>
```

`/opt/jufe-offer/shared/active-slot` 和 Nginx include 由 root-owned helper 同步更新。`current` 是当前生产 release 的便捷链接，`previous` 是上一个生产 release；真正的运行身份还会由 active slot 和对应 slot symlink 交叉校验。

## 普通发布

当活动 release 和候选 release 的 `prisma/migrations` 完全一致时：

1. 不停止活动服务。
2. 不备份 SQLite。
3. 不运行 `prisma migrate deploy`。
4. 在备用端口启动 candidate，并校验 `/api/health` 的 `ok` 和 `revision`。
5. 启用 candidate 的开机自启。
6. root helper 写入固定端口的 Nginx include，执行容器内 `nginx -t`，通过后向容器发送 `HUP` graceful reload。
7. 使用 `curl --resolve` 检查本机 TLS、SNI、Nginx、反代和应用完整链路。
8. 更新 `current` / `previous`，再停止并禁用旧 slot。

任何切流前失败只清理 candidate。旧应用、旧 upstream 和数据库都不会变化，因此不需要业务 rollback。GitHub Actions 最后的公网检查只负责外部可观测性；公网或 DNS 短暂抖动不会触发数据库恢复或服务器切流回退。

## SQLite migration 策略

比较基准是服务器实际活动 slot 的 release 与候选 release，不是 `HEAD^`。

- `maintenance`：自动 push 和手工触发的默认值。发现 migration 变化后，先停止并禁用旧 slot，checkpoint WAL，使用 SQLite `.backup` 创建一致快照并做 integrity check，再执行 migration。candidate 或切流失败时停止两个 slot、删除精确的 `prod.db-wal` / `prod.db-shm`、原子恢复备份并重启旧 slot。这个模式允许短暂停机，但适用于未知或不兼容 migration。
- `compatible`：只能在 GitHub Actions 手工触发时显式选择。它先在线 `.backup`，旧应用继续运行，再执行 migration。这个选项表示操作者已经确认旧、新代码都能使用迁移后的 schema。candidate 失败时保留 migration，不自动恢复旧快照，避免丢失备份后产生的新写入。

不要通过搜索 SQL 中的 `DROP`、`RENAME` 等字符串自动判断兼容性。新增 nullable column、独立 table 或 index 也仍需人工确认应用级兼容；drop/rename/改变旧代码依赖结构必须使用 `maintenance`。

SQLite `.backup` 会生成包含 WAL 已提交内容的一致快照。maintenance 模式会先停止应用并执行 `PRAGMA wal_checkpoint(FULL)`；恢复时必须在两个 slot 均停止的前提下删除 WAL/SHM，再替换主数据库。备份保留最近 10 份。

## 一次性服务器迁移

下面的命令只用于人工执行。它会把当前单 service 切换为 blue template service，期间 `:3020` 会有一次短暂 restart；不会运行 Prisma migration，也不会修改 SQLite 数据。

先在本地把固定资产传到服务器临时目录：

```bash
ssh root@YOUR_HOST 'install -d -m 0700 /tmp/jufe-offer-blue-green'
scp \
  deploy/bootstrap-server.sh \
  deploy/jufe-offer@.service \
  deploy/jufe-offer-switch-upstream \
  deploy/jufe-offer-upstream.inc \
  deploy/jufe.woodfish.site.conf \
  root@YOUR_HOST:/tmp/jufe-offer-blue-green/
```

登录服务器，先做只读检查：

```bash
current_release="$(readlink -f /opt/jufe-offer/current)"
revision="$(basename "$current_release")"
printf 'current=%s\nrevision=%s\n' "$current_release" "$revision"
command -v node npm sqlite3 rsync docker curl flock systemctl visudo
test "$(readlink -f "$current_release/.next/standalone/.next/cache")" = \
  /opt/jufe-offer/shared/cache
systemctl status jufe-offer.service --no-pager
docker exec blog-nginx nginx -t
curl -fsS http://127.0.0.1:3020/ >/dev/null
```

确认 revision 是 40 位小写 Git SHA、当前站点正常后，再人工执行：

```bash
bash /tmp/jufe-offer-blue-green/bootstrap-server.sh \
  "$revision" \
  /tmp/jufe-offer-blue-green
```

迁移后验证：

```bash
cat /opt/jufe-offer/shared/active-slot
readlink -f /opt/jufe-offer/slots/blue
systemctl is-enabled jufe-offer@blue.service
systemctl status jufe-offer@blue.service --no-pager
docker exec blog-nginx nginx -t
curl -fsS http://127.0.0.1:3020/ >/dev/null
curl --fail --silent --show-error \
  --resolve jufe.woodfish.site:443:127.0.0.1 \
  https://jufe.woodfish.site/ >/dev/null
```

bootstrap 会保存带 UTC 时间戳的旧 systemd unit 和 Nginx site 文件；如果模板服务启动检查失败，脚本会恢复旧 unit、旧 Nginx 文件并重新启动 legacy service。

## 权限与固定路径

- GitHub Actions 只有 `contents: read` 和 `actions: read`。
- SSH 使用独立私钥和固定 `known_hosts`。
- release id 必须是 40 位小写 hex。
- rsync 目标固定为 `/opt/jufe-offer/releases/.staging-<sha>`，不接收任意远程路径。
- deploy user 只能管理四个固定 template-service 命令和调用只接受 `blue|green` 的 root helper。
- Nginx helper 只会生成 `172.18.0.1:3020` 或 `:3021`，不会接受任意配置文本。
- `.env` 不进入 artifact 或 rsync payload；应用仍通过 systemd 读取 `/opt/jufe-offer/.env`。
- formal release 不再原地修改；rsync 禁止 `--inplace`。

release 默认保留最近 5 个，同时无条件保护 `current`、`previous`、blue slot 和 green slot 的目标。hardlink 的目录项删除不会破坏仍被其他 release 引用的 inode。

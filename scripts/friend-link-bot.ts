#!/usr/bin/env node
import { execFile } from "node:child_process";
import { appendFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { isIP } from "node:net";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { chromium } from "playwright";

import {
  syncCampusProjectSubmission,
  type RepositorySnapshot,
} from "./campus-project-avatars";

const execFileAsync = promisify(execFile);

export interface FriendLinkIssueData {
  siteName: string;
  siteUrl: string;
  friendPageUrl: string;
  avatarUrl: string;
  description: string;
  contact: string;
}

export interface OpenSourceProjectIssueData {
  projectName: string;
  projectUrl: string;
  description: string;
  relation: string;
  tags: string[];
  contact: string;
}

export interface OwnFriendLink {
  name: string;
  link: string;
  avatar: string;
  description: string;
}

export interface GitHubIssue {
  body?: string | null;
  created_at: string;
  labels?: Array<string | { name?: string | null }> | null;
  number: number;
  pull_request?: unknown;
  state?: string;
  title: string;
  user?: { login?: string | null } | null;
}

export interface OpenSourceProjectMigration {
  directoryName: string;
  relativePath: string;
  content: string;
}

export interface ReciprocalLinkCheckResult {
  checkedUrls: string[];
  found: boolean;
  matchedUrl?: string;
  indeterminate?: boolean;
}

export const JUFE_OFFER_FRIEND_LINK: OwnFriendLink = {
  name: "江财OFFER",
  link: "https://jufe.woodfish.site/",
  avatar: "https://jufe.woodfish.site/0b9e02d4fcddecc48d4b61e79cb26f16_compressed.png",
  description: "实习、竞赛、学习资源。",
};

const FRIEND_LINK_TITLE_PREFIXES = ["[友链申请]", "[Friend Link]"] as const;
const OPEN_SOURCE_PROJECT_TITLE_PREFIXES = [
  "[开源项目提交]",
  "[Open Source Project]",
] as const;
export const FRIEND_LINK_SUBMISSION_LABEL = "submission:friend-link";
export const CAMPUS_PROJECT_SUBMISSION_LABEL = "submission:campus-project";
const INITIAL_COMMENT_MARKER = "<!-- jufe-offer-friend-bot:initial -->";
const SUCCESS_COMMENT_MARKER = "<!-- jufe-offer-friend-bot:accepted -->";
const REJECT_COMMENT_MARKER = "<!-- jufe-offer-friend-bot:rejected -->";
const RETRY_COMMENT_MARKER = "<!-- jufe-offer-friend-bot:retry -->";
const PROJECT_INITIAL_COMMENT_MARKER = "<!-- jufe-offer-open-source-bot:initial -->";
const PROJECT_SUCCESS_COMMENT_MARKER = "<!-- jufe-offer-open-source-bot:accepted -->";
const PROJECT_REJECT_COMMENT_MARKER = "<!-- jufe-offer-open-source-bot:rejected -->";
const DEFAULT_WAIT_MS = 30 * 60 * 1000;
const USER_AGENT = "JufeOfferFriendLinkBot/1.0";
const FRIENDS_SOURCE_PATH = path.join("src", "data", "friends.ts");
const RESOURCE_MIGRATIONS_PATH = path.join("prisma", "migrations");

type FriendLinkSourceRecord = {
  name: string;
  url: string;
};

type IssueField = keyof FriendLinkIssueData;
type ProjectIssueField = keyof OpenSourceProjectIssueData;

const FIELD_LABELS: Record<IssueField, string[]> = {
  siteName: ["站点名称", "站点名", "site name", "name"],
  siteUrl: ["站点地址", "站点链接", "site url", "site link", "url"],
  friendPageUrl: [
    "友链页地址",
    "友链页链接",
    "友链页面",
    "友链页",
    "friend page url",
    "friend link page",
    "friend page",
  ],
  avatarUrl: ["头像或站点图标", "头像链接", "头像", "avatar url", "avatar", "site icon"],
  description: ["站点简介", "简介", "short description", "description", "descr"],
  contact: ["联系方式", "称呼或联系方式", "your name / contact", "contact"],
};

const PROJECT_FIELD_LABELS: Record<ProjectIssueField, string[]> = {
  projectName: ["项目名称", "项目名", "project name", "name"],
  projectUrl: [
    "项目地址",
    "项目链接",
    "仓库地址",
    "仓库链接",
    "project url",
    "project link",
    "repository",
    "repo",
    "url",
  ],
  description: ["项目简介", "简介", "project description", "description", "descr"],
  relation: [
    "你与项目的关系",
    "与项目的关系",
    "项目关系",
    "参与方式",
    "project relation",
    "relation",
  ],
  tags: ["项目标签", "标签", "project tags", "tags", "tag"],
  contact: ["联系方式", "联系信息", "contact"],
};

function normalizeFieldLabel(value: string) {
  return value
    .replace(/[：:]$/, "")
    .replace(/[*_`]/g, "")
    .replace(/（可选）|\(optional\)/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function fieldForLabel(label: string): IssueField | null {
  const normalized = normalizeFieldLabel(label);
  for (const [field, labels] of Object.entries(FIELD_LABELS) as Array<
    [IssueField, string[]]
  >) {
    if (labels.some((candidate) => normalizeFieldLabel(candidate) === normalized)) {
      return field;
    }
  }
  return null;
}

function projectFieldForLabel(label: string): ProjectIssueField | null {
  const normalized = normalizeFieldLabel(label);
  for (const [field, labels] of Object.entries(PROJECT_FIELD_LABELS) as Array<
    [ProjectIssueField, string[]]
  >) {
    if (labels.some((candidate) => normalizeFieldLabel(candidate) === normalized)) {
      return field;
    }
  }
  return null;
}

function cleanIssueValue(value: string) {
  const withoutComments = value.replace(/<!--[\s\S]*?-->/g, "").trim();
  if (!withoutComments || /^[-*]\s*\[[ xX]\]/.test(withoutComments)) {
    return "";
  }
  return withoutComments.replace(/^>\s?/, "").trim();
}

function readHeadingValues<T extends string>(
  lines: string[],
  resolveField: (label: string) => T | null,
  isMultilineField: (field: T) => boolean,
) {
  const fields = new Map<T, string>();

  for (let index = 0; index < lines.length; index += 1) {
    const heading = lines[index]?.match(/^\s*#{2,6}\s+(.+?)\s*$/);
    if (!heading) {
      continue;
    }

    const field = resolveField(heading[1] ?? "");
    if (!field) {
      continue;
    }

    const values: string[] = [];
    for (let valueIndex = index + 1; valueIndex < lines.length; valueIndex += 1) {
      if (/^\s*#{2,6}\s+/.test(lines[valueIndex] ?? "")) {
        break;
      }
      const value = cleanIssueValue(lines[valueIndex] ?? "");
      if (value) {
        values.push(value);
      }
    }

    if (values.length > 0 && !fields.has(field)) {
      fields.set(field, isMultilineField(field) ? values.join(" ") : values[0]!);
    }
  }

  return fields;
}

function readIssueFields<T extends string>(
  body: string,
  resolveField: (label: string) => T | null,
  isMultilineField: (field: T) => boolean,
) {
  const fields = new Map<T, string>();
  const lines = body.split(/\r?\n/);

  for (const line of lines) {
    const match = line.match(
      /^\s*[-*]\s*(?:\*\*)?([^:：]+?)(?:\*\*)?\s*[:：]\s*(.*?)\s*$/,
    );
    if (!match) {
      continue;
    }
    const field = resolveField(match[1] ?? "");
    const value = cleanIssueValue(match[2] ?? "");
    if (field && value && !fields.has(field)) {
      fields.set(field, value);
    }
  }

  for (const [field, value] of readHeadingValues(lines, resolveField, isMultilineField)) {
    if (!fields.has(field)) {
      fields.set(field, value);
    }
  }

  return fields;
}

export function parseFriendLinkIssueBody(body: string): FriendLinkIssueData | null {
  const fields = readIssueFields(body, fieldForLabel, (field) => field === "description");

  const parsed: FriendLinkIssueData = {
    siteName: normalizeSingleLine(fields.get("siteName") ?? ""),
    siteUrl: normalizeSingleLine(fields.get("siteUrl") ?? ""),
    friendPageUrl: normalizeSingleLine(fields.get("friendPageUrl") ?? ""),
    avatarUrl: normalizeSingleLine(fields.get("avatarUrl") ?? ""),
    description: normalizeSingleLine(fields.get("description") ?? ""),
    contact: normalizeSingleLine(fields.get("contact") ?? "未提供") || "未提供",
  };

  if (
    !parsed.siteName ||
    !parsed.siteUrl ||
    !parsed.friendPageUrl ||
    !parsed.description
  ) {
    return null;
  }

  return parsed;
}

function normalizeProjectTags(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[,，、\s]+/)
        .map((tag) => tag.replace(/^#/, "").trim())
        .filter((tag) => Boolean(tag) && tag !== "未提供"),
    ),
  )
    .filter((tag) => tag.length <= 20)
    .slice(0, 8);
}

export function parseOpenSourceProjectIssueBody(
  body: string,
): OpenSourceProjectIssueData | null {
  const fields = readIssueFields(
    body,
    projectFieldForLabel,
    (field) => field === "description",
  );
  const parsed: OpenSourceProjectIssueData = {
    projectName: normalizeSingleLine(fields.get("projectName") ?? ""),
    projectUrl: normalizeSingleLine(fields.get("projectUrl") ?? ""),
    description: normalizeSingleLine(fields.get("description") ?? ""),
    relation: normalizeSingleLine(fields.get("relation") ?? ""),
    tags: normalizeProjectTags(fields.get("tags") ?? ""),
    contact: normalizeSingleLine(fields.get("contact") ?? "未提供") || "未提供",
  };

  if (
    !parsed.projectName ||
    !parsed.projectUrl ||
    !parsed.description ||
    !parsed.relation
  ) {
    return null;
  }

  return parsed;
}

function hasOpenSourceProjectConfirmation(body: string) {
  const checkedItems = body
    .split(/\r?\n/)
    .filter((line) => /^\s*[-*]\s*\[[xX]\]\s+/.test(line))
    .map((line) => line.replace(/^\s*[-*]\s*\[[xX]\]\s+/, "").trim());

  return (
    checkedItems.some((item) => item.includes("本校同学") && item.includes("公开访问")) &&
    checkedItems.some(
      (item) =>
        item.includes("同意") && item.includes("项目简介") && item.includes("标签"),
    )
  );
}

export function buildInitialFriendLinkComment(ownLink: OwnFriendLink) {
  return [
    INITIAL_COMMENT_MARKER,
    "收到友链申请啦！机器人会在回帖确认约 30 分钟后检验友链；确认没有反链会自动关闭，暂时无法访问则会在后续巡检中重试。",
    "",
    "请先在您的站点友链页中加入江财OFFER：",
    "",
    `- 名字：${ownLink.name}`,
    `- 链接：${ownLink.link}`,
    `- 头像：${ownLink.avatar}`,
    `- 描述：${ownLink.description}`,
    "",
    "请确认 Issue 里的友链页链接可以直接访问，并且该页面能看到江财OFFER的友链信息。检测会兼容客户端渲染和滚动懒加载。",
    "",
    "如果检测到反链，我会自动把你的站点加入江财OFFER友链并关闭 Issue。",
  ].join("\n");
}

export function buildInitialOpenSourceProjectComment() {
  return [
    PROJECT_INITIAL_COMMENT_MARKER,
    "收到校内开源项目提交啦！机器人会在回帖确认约 30 分钟后检查并处理。",
    "",
    "本页面只收录由本校同学创立或参与的开源项目。请确保项目地址可以公开访问，并在 Issue 中说明你与项目的关系，保留并勾选提交确认。",
    "",
    "到检验时间后，如果信息完整且符合收录范围，我会自动把项目加入资源页并关闭 Issue。",
  ].join("\n");
}

function sqlString(value: string) {
  return `'${value.replaceAll("'", "''")}'`;
}

function migrationTimestamp(date: Date) {
  const parts = [
    date.getUTCFullYear().toString().padStart(4, "0"),
    (date.getUTCMonth() + 1).toString().padStart(2, "0"),
    date.getUTCDate().toString().padStart(2, "0"),
    date.getUTCHours().toString().padStart(2, "0"),
    date.getUTCMinutes().toString().padStart(2, "0"),
    date.getUTCSeconds().toString().padStart(2, "0"),
  ];
  return parts.join("");
}

export function buildOpenSourceProjectMigration(
  project: OpenSourceProjectIssueData,
  issueNumber: number,
  createdAt = new Date(),
  repository?: RepositorySnapshot,
): OpenSourceProjectMigration {
  if (!Number.isSafeInteger(issueNumber) || issueNumber < 1) {
    throw new Error("A positive GitHub issue number is required.");
  }

  const projectUrl = normalizePublicHttpUrl(project.projectUrl);
  if (!projectUrl) {
    throw new Error("A safe public project URL is required.");
  }

  const directoryName = `${migrationTimestamp(createdAt)}_add_open_source_project_${issueNumber}`;
  const relativePath = path.join(
    RESOURCE_MIGRATIONS_PATH,
    directoryName,
    "migration.sql",
  );
  const resourceId = `open_source_issue_${issueNumber}`;
  const tags = JSON.stringify(project.tags);
  const resourceInsert = [
    `-- Added from GitHub issue #${issueNumber} by jufe-offer-open-source-bot.`,
    'INSERT INTO "Resource" (',
    '  "id", "title", "description", "url", "category", "tags",',
    '  "isFeatured", "origin", "startsAt", "deadlineAt", "createdAt", "updatedAt"',
    ")",
    "SELECT",
    `  ${sqlString(resourceId)},`,
    `  ${sqlString(normalizeSingleLine(project.projectName))},`,
    `  ${sqlString(normalizeSingleLine(project.description))},`,
    `  ${sqlString(projectUrl)},`,
    `  ${sqlString("校内开源项目")},`,
    `  ${sqlString(tags)},`,
    "  0,",
    "  'MANUAL',",
    "  NULL,",
    "  NULL,",
    "  CURRENT_TIMESTAMP,",
    "  CURRENT_TIMESTAMP",
    "WHERE NOT EXISTS (",
    '  SELECT 1 FROM "Resource"',
    `  WHERE lower(rtrim("url", '/')) = lower(rtrim(${sqlString(projectUrl)}, '/'))`,
    ");",
  ].join("\n");
  const repositoryInsert = repository
    ? [
        "",
        `-- Cache the GitHub repository profile used by every project-card surface.`,
        'INSERT INTO "RepositoryProfile" (',
        '  "id", "repositoryUrl", "owner", "name", "description", "stars",',
        '  "avatarPath", "avatarLogin", "primaryLanguage", "resourceId",',
        '  "syncedAt", "createdAt", "updatedAt"',
        ")",
        "SELECT",
        `  ${sqlString(`repository_issue_${issueNumber}`)},`,
        `  ${sqlString(repository.repositoryUrl)},`,
        `  ${sqlString(repository.owner)},`,
        `  ${sqlString(repository.name)},`,
        `  ${repository.description ? sqlString(repository.description) : "NULL"},`,
        `  ${repository.stars},`,
        `  ${sqlString(repository.avatarPath)},`,
        `  ${sqlString(repository.avatarLogin)},`,
        `  ${repository.primaryLanguage ? sqlString(repository.primaryLanguage) : "NULL"},`,
        `  (SELECT "id" FROM "Resource" WHERE lower(rtrim("url", '/')) = lower(rtrim(${sqlString(repository.repositoryUrl)}, '/')) LIMIT 1),`,
        "  CURRENT_TIMESTAMP,",
        "  CURRENT_TIMESTAMP,",
        "  CURRENT_TIMESTAMP",
        "WHERE NOT EXISTS (",
        '  SELECT 1 FROM "RepositoryProfile"',
        `  WHERE lower(rtrim("repositoryUrl", '/')) = lower(rtrim(${sqlString(repository.repositoryUrl)}, '/'))`,
        ");",
      ].join("\n")
    : "";
  const content = `${resourceInsert}${repositoryInsert}\n`;

  return { directoryName, relativePath, content };
}

export function preferredProjectAvatarLogin(
  issue: GitHubIssue,
  project: OpenSourceProjectIssueData,
) {
  const submitterLogin = issue.user?.login?.trim();
  if (!submitterLogin) return undefined;

  return /(贡献|参与|开发|协作|contributor|developer|collaborator)/i.test(
    project.relation,
  )
    ? submitterLogin
    : undefined;
}

export function shouldReviewIssue(
  createdAt: string,
  now = new Date(),
  waitMs = DEFAULT_WAIT_MS,
) {
  const createdTime = Date.parse(createdAt);
  return Number.isFinite(createdTime) && now.getTime() - createdTime >= waitMs;
}

export function normalizePublicHttpUrl(value: string) {
  let parsed: URL;
  try {
    parsed = new URL(value.trim());
  } catch {
    return null;
  }

  if (!isSafePublicHttpUrl(parsed)) {
    return null;
  }

  if (!parsed.pathname) {
    parsed.pathname = "/";
  }
  return parsed.toString();
}

function isSafePublicHttpUrl(parsed: URL) {
  if (!["http:", "https:"].includes(parsed.protocol)) {
    return false;
  }

  const hostname = parsed.hostname
    .toLowerCase()
    .replace(/^\[|\]$/g, "")
    .replace(/\.$/, "");
  if (!hostname || parsed.username || parsed.password) {
    return false;
  }

  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "metadata.google.internal" ||
    hostname.endsWith(".internal")
  ) {
    return false;
  }

  if (isUnsafeIpv4Host(hostname) || isUnsafeIpv6Host(hostname)) {
    return false;
  }

  return true;
}

function isUnsafeIpv4Host(hostname: string) {
  const parts = hostname.split(".");
  if (parts.length !== 4 || parts.some((part) => !/^\d+$/.test(part))) {
    return false;
  }

  const octets = parts.map(Number);
  if (octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return true;
  }

  const [first, second] = octets as [number, number, number, number];
  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && (second === 0 || second === 168)) ||
    (first === 198 && second >= 18 && second <= 19)
  );
}

function isUnsafeIpv6Host(hostname: string) {
  if (isIP(hostname) !== 6) {
    return false;
  }

  const normalized = hostname.toLowerCase();
  if (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("::ffff:") ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    /^fe[89ab]/.test(normalized)
  ) {
    return true;
  }

  const mappedIpv4 = normalized.match(/:ffff:(\d+(?:\.\d+){3})$/);
  return mappedIpv4 ? isUnsafeIpv4Host(mappedIpv4[1]!) : false;
}

export async function verifyReciprocalLink(
  friendPageUrl: string,
  ownLink: OwnFriendLink,
  options: {
    fetchText?: (url: string) => Promise<string>;
    renderPageText?: (url: string) => Promise<string>;
  } = {},
): Promise<ReciprocalLinkCheckResult> {
  const fetchText = options.fetchText ?? fetchPageText;
  const renderPageText = options.renderPageText ?? renderPageWithBrowser;
  const targetUrl = normalizePublicHttpUrl(friendPageUrl);
  const checkedUrls = [targetUrl ?? friendPageUrl.trim()].filter(Boolean);

  if (!targetUrl) {
    return { checkedUrls, found: false };
  }

  let html = "";
  try {
    html = await fetchText(targetUrl);
  } catch {
    // Continue with a real browser: some sites need JavaScript or challenge cookies.
  }

  if (containsOwnFriendLink(html, ownLink)) {
    return { checkedUrls, found: true, matchedUrl: targetUrl };
  }

  let renderedHtml = "";
  try {
    renderedHtml = await renderPageText(targetUrl);
  } catch {
    return { checkedUrls, found: false, indeterminate: true };
  }

  if (containsOwnFriendLink(renderedHtml, ownLink)) {
    return { checkedUrls, found: true, matchedUrl: targetUrl };
  }

  return { checkedUrls, found: false };
}

function containsOwnFriendLink(html: string, ownLink: OwnFriendLink) {
  const normalizedHtml = normalizeHtmlForSearch(stripImageSources(html));
  const normalizedLink = normalizeComparableUrl(ownLink.link);
  const linkWithoutSlash = normalizedLink.replace(/\/+$/, "");

  if (
    [normalizedLink, linkWithoutSlash].some(
      (candidate) => candidate && normalizedHtml.includes(candidate),
    )
  ) {
    return true;
  }

  return (
    normalizedHtml.includes(normalizeSingleLine(ownLink.name).toLowerCase()) &&
    normalizedHtml.includes(normalizeSingleLine(ownLink.description).toLowerCase())
  );
}

function stripImageSources(html: string) {
  return html.replace(
    /\s(?:src|srcset|data-src|data-srcset|data-lazy-src|data-original|poster)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
    " ",
  );
}

function normalizeHtmlForSearch(html: string) {
  return decodeHtmlEntities(html)
    .replaceAll("\\/", "/")
    .replace(/\/+(["'\s><])/g, "$1")
    .toLowerCase();
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function normalizeComparableUrl(value: string) {
  try {
    const parsed = new URL(value.trim());
    parsed.hash = "";
    return parsed.toString().replace(/\/+$/, "").toLowerCase();
  } catch {
    return value.trim().replace(/\/+$/, "").toLowerCase();
  }
}

async function fetchPageText(url: string) {
  const response = await fetch(url, {
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "user-agent": USER_AGENT,
    },
    redirect: "follow",
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${url}`);
  }

  return response.text();
}

async function renderPageWithBrowser(url: string) {
  const executablePath = process.env.PLAYWRIGHT_BOT_EXECUTABLE_PATH?.trim();
  const browser = await chromium.launch({
    ...(executablePath ? { executablePath } : {}),
    headless: true,
  });

  try {
    const context = await browser.newContext({
      serviceWorkers: "block",
      userAgent: USER_AGENT,
      viewport: { height: 900, width: 1280 },
    });
    const page = await context.newPage();
    const response = await page.goto(url, {
      timeout: 15_000,
      waitUntil: "domcontentloaded",
    });

    if (!response || response.status() >= 400) {
      throw new Error(`Rendered page returned an unusable response for ${url}`);
    }

    await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => undefined);
    await page.waitForTimeout(750);

    for (let pass = 0; pass < 6; pass += 1) {
      await page.evaluate(() => {
        window.scrollTo(0, document.documentElement.scrollHeight);

        for (const element of document.querySelectorAll<HTMLElement>("*")) {
          const style = window.getComputedStyle(element);
          if (
            element.scrollHeight > element.clientHeight &&
            (style.overflowY === "auto" || style.overflowY === "scroll")
          ) {
            element.scrollTop = element.scrollHeight;
          }
        }
      });
      await page.waitForTimeout(500);
    }

    const renderedHtml = await page.content();
    if (isLikelyBotChallenge(renderedHtml)) {
      throw new Error(`Rendered page appears to be a bot challenge for ${url}`);
    }

    return renderedHtml;
  } finally {
    await browser.close();
  }
}

function isLikelyBotChallenge(html: string) {
  const normalizedHtml = normalizeHtmlForSearch(html);
  return (
    normalizedHtml.includes("just a moment...") ||
    normalizedHtml.includes("enable javascript and cookies to continue") ||
    normalizedHtml.includes("cf-chl-")
  );
}

function normalizeSingleLine(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function readStringField(source: string, field: "name" | "url") {
  const pattern = new RegExp(`\\b${field}:\\s*"((?:\\\\.|[^"\\\\])*)"`);
  const match = source.match(pattern);
  if (!match) {
    return "";
  }

  try {
    return JSON.parse(`"${match[1]}"`) as string;
  } catch {
    return match[1] ?? "";
  }
}

function readFriendLinksFromSource(source: string): FriendLinkSourceRecord[] {
  const records: FriendLinkSourceRecord[] = [];
  const objectPattern = /^[ \t]{2}\{\r?\n([\s\S]*?)^[ \t]{2}\},?/gm;

  for (const match of source.matchAll(objectPattern)) {
    const objectSource = match[1] ?? "";
    const name = readStringField(objectSource, "name");
    const url = readStringField(objectSource, "url");
    if (name && url) {
      records.push({ name, url });
    }
  }

  return records;
}

export function mergeFriendLinkIntoSource(
  source: string,
  friend: FriendLinkIssueData,
  group = "personal",
) {
  const normalizedUrl =
    normalizePublicHttpUrl(friend.siteUrl) ?? normalizeSingleLine(friend.siteUrl);
  const existing = readFriendLinksFromSource(source);
  const duplicate = existing.some(
    (item) =>
      normalizeComparableUrl(item.url) === normalizeComparableUrl(normalizedUrl) ||
      item.name.trim().toLowerCase() === friend.siteName.trim().toLowerCase(),
  );

  if (duplicate) {
    return { changed: false, content: source };
  }

  const lineEnding = source.includes("\r\n") ? "\r\n" : "\n";
  const closingToken = `${lineEnding}];`;
  const closingIndex = source.lastIndexOf(closingToken);
  const friendsExportIndex = source.lastIndexOf("export const friends");
  if (closingIndex < friendsExportIndex) {
    throw new Error(`Could not locate the closing bracket of ${FRIENDS_SOURCE_PATH}.`);
  }

  const avatar = normalizeSingleLine(friend.avatarUrl);
  const lines = [
    "  {",
    `    name: ${JSON.stringify(normalizeSingleLine(friend.siteName))},`,
    `    description: ${JSON.stringify(normalizeSingleLine(friend.description))},`,
    `    url: ${JSON.stringify(normalizedUrl)},`,
    `    domain: ${JSON.stringify(new URL(normalizedUrl).host.toLowerCase())},`,
    `    group: ${JSON.stringify(group)},`,
    ...(avatar ? [`    icon: ${JSON.stringify(avatar)},`] : []),
    "  },",
  ];
  const entry = lines.join(lineEnding);
  const prefix = source.slice(0, closingIndex);
  const suffix = source.slice(closingIndex + closingToken.length - 2);
  const separator = prefix.endsWith(lineEnding) ? "" : lineEnding;

  return {
    changed: true,
    content: `${prefix}${separator}${entry}${lineEnding}${suffix}`,
  };
}

class GitHubClient {
  constructor(
    private readonly token: string,
    private readonly owner: string,
    private readonly repo: string,
  ) {}

  async listOpenSubmissionIssues() {
    const issues: GitHubIssue[] = [];
    for (let page = 1; ; page += 1) {
      const batch = await this.request<GitHubIssue[]>(
        `/repos/${this.owner}/${this.repo}/issues?state=open&per_page=100&page=${page}`,
      );
      issues.push(...batch);
      if (batch.length < 100) {
        break;
      }
    }

    return issues.filter(
      (issue) => !issue.pull_request && submissionKindForIssue(issue) !== null,
    );
  }

  async getIssue(issueNumber: number) {
    return this.request<GitHubIssue>(
      `/repos/${this.owner}/${this.repo}/issues/${issueNumber}`,
    );
  }

  async listOpenFriendIssues() {
    const issues = await this.listOpenSubmissionIssues();
    return issues.filter((issue) => submissionKindForIssue(issue) === "friend-link");
  }

  async listComments(issueNumber: number) {
    const comments: Array<{ body?: string | null }> = [];
    for (let page = 1; ; page += 1) {
      const batch = await this.request<Array<{ body?: string | null }>>(
        `/repos/${this.owner}/${this.repo}/issues/${issueNumber}/comments?per_page=100&page=${page}`,
      );
      comments.push(...batch);
      if (batch.length < 100) {
        break;
      }
    }
    return comments;
  }

  async addComment(issueNumber: number, body: string) {
    await this.request(
      `/repos/${this.owner}/${this.repo}/issues/${issueNumber}/comments`,
      {
        body: { body },
        method: "POST",
      },
    );
  }

  async closeIssue(issueNumber: number, stateReason: "completed" | "not_planned") {
    await this.request(`/repos/${this.owner}/${this.repo}/issues/${issueNumber}`, {
      body: { state: "closed", state_reason: stateReason },
      method: "PATCH",
    });
  }

  private async request<T = unknown>(
    apiPath: string,
    options: { body?: unknown; method?: string } = {},
  ): Promise<T> {
    const response = await fetch(`https://api.github.com${apiPath}`, {
      body: options.body ? JSON.stringify(options.body) : undefined,
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${this.token}`,
        "content-type": "application/json",
        "user-agent": USER_AGENT,
        "x-github-api-version": "2022-11-28",
      },
      method: options.method ?? "GET",
    });

    if (!response.ok) {
      throw new Error(`GitHub API ${response.status}: ${await response.text()}`);
    }
    if (response.status === 204) {
      return undefined as T;
    }
    return (await response.json()) as T;
  }
}

function isFriendLinkIssueTitle(title: string) {
  return FRIEND_LINK_TITLE_PREFIXES.some((prefix) => title.startsWith(prefix));
}

export function isOpenSourceProjectIssueTitle(title: string) {
  return OPEN_SOURCE_PROJECT_TITLE_PREFIXES.some((prefix) => title.startsWith(prefix));
}

function isSupportedSubmissionIssueTitle(title: string) {
  return isFriendLinkIssueTitle(title) || isOpenSourceProjectIssueTitle(title);
}

function issueLabelNames(issue: GitHubIssue) {
  return new Set(
    (issue.labels ?? [])
      .map((label) => (typeof label === "string" ? label : label.name))
      .filter((label): label is string => Boolean(label)),
  );
}

export type SubmissionKind = "friend-link" | "campus-project";

export function submissionKindForIssue(issue: GitHubIssue): SubmissionKind | null {
  const labels = issueLabelNames(issue);
  const isFriendLink = labels.has(FRIEND_LINK_SUBMISSION_LABEL);
  const isCampusProject = labels.has(CAMPUS_PROJECT_SUBMISSION_LABEL);

  if (isFriendLink !== isCampusProject) {
    return isFriendLink ? "friend-link" : "campus-project";
  }
  if (isFriendLink && isCampusProject) {
    return null;
  }

  if (!isSupportedSubmissionIssueTitle(issue.title)) {
    return null;
  }
  return isOpenSourceProjectIssueTitle(issue.title) ? "campus-project" : "friend-link";
}

async function runOpenedMode() {
  const issue = await readEventIssue();
  const submissionKind = issue ? submissionKindForIssue(issue) : null;
  if (!issue || !submissionKind) {
    console.log("No supported submission label or legacy title in event; skipping.");
    return false;
  }

  const github = createGitHubClient();
  const comments = await github.listComments(issue.number);
  if (submissionKind === "campus-project") {
    if (
      comments.some((comment) => comment.body?.includes(PROJECT_INITIAL_COMMENT_MARKER))
    ) {
      console.log(
        `Initial open-source project comment already exists for #${issue.number}.`,
      );
      return false;
    }

    await github.addComment(issue.number, buildInitialOpenSourceProjectComment());
    console.log(`Posted initial open-source project comment to #${issue.number}.`);
    return true;
  }

  if (comments.some((comment) => comment.body?.includes(INITIAL_COMMENT_MARKER))) {
    console.log(`Initial friend-link comment already exists for #${issue.number}.`);
    return false;
  }

  await github.addComment(
    issue.number,
    buildInitialFriendLinkComment(JUFE_OFFER_FRIEND_LINK),
  );
  console.log(`Posted initial friend-link comment to #${issue.number}.`);
  return true;
}

async function runReviewMode(issueNumber?: number) {
  const github = createGitHubClient();
  const issues = issueNumber
    ? [await github.getIssue(issueNumber)]
    : await github.listOpenSubmissionIssues();
  const now = new Date();

  for (const issue of issues) {
    if (
      issue.pull_request ||
      issue.state === "closed" ||
      submissionKindForIssue(issue) === null
    ) {
      console.log(`Skipping #${issue.number}: not an open supported submission.`);
      continue;
    }
    if (!shouldReviewIssue(issue.created_at, now)) {
      console.log(`Skipping #${issue.number}: still waiting for 30-minute window.`);
      continue;
    }
    if (submissionKindForIssue(issue) === "campus-project") {
      await reviewOpenSourceProjectIssue(issue, github);
    } else {
      await reviewFriendLinkIssue(issue, github);
    }
  }
}

async function reviewFriendLinkIssue(issue: GitHubIssue, github: GitHubClient) {
  const comments = await github.listComments(issue.number);
  if (comments.some((comment) => comment.body?.includes(SUCCESS_COMMENT_MARKER))) {
    await github.closeIssue(issue.number, "completed");
    console.log(`Closed already-accepted friend-link issue #${issue.number}.`);
    return;
  }
  if (comments.some((comment) => comment.body?.includes(REJECT_COMMENT_MARKER))) {
    await github.closeIssue(issue.number, "not_planned");
    console.log(`Closed already-rejected friend-link issue #${issue.number}.`);
    return;
  }

  const parsed = parseFriendLinkIssueBody(issue.body ?? "");
  if (!parsed) {
    await rejectIssue(
      github,
      issue.number,
      "到检验时间啦，但这个 Issue 里的友链信息不完整，暂时无法自动处理。本 Issue 先关闭，可以补齐信息后重新提交。",
    );
    return;
  }

  const siteUrl = normalizePublicHttpUrl(parsed.siteUrl);
  const friendPageUrl = normalizePublicHttpUrl(parsed.friendPageUrl);
  const avatarUrl = parsed.avatarUrl
    ? (normalizePublicHttpUrl(parsed.avatarUrl) ?? "")
    : "";
  if (!siteUrl || !friendPageUrl || (parsed.avatarUrl && !avatarUrl)) {
    await rejectIssue(
      github,
      issue.number,
      "站点地址、友链页地址和头像地址必须是可公开访问的 HTTP(S) 地址，且不能使用本地或内网地址。本 Issue 先关闭，修正后欢迎重新提交。",
    );
    return;
  }

  const friend = { ...parsed, siteUrl, friendPageUrl, avatarUrl };
  const reciprocal = await verifyReciprocalLink(
    friend.friendPageUrl,
    JUFE_OFFER_FRIEND_LINK,
  );
  if (reciprocal.indeterminate) {
    await deferIssue(github, issue.number, reciprocal.checkedUrls, comments);
    return;
  }
  if (!reciprocal.found) {
    await rejectIssue(
      github,
      issue.number,
      [
        "到检验时间啦，但暂时没有在你的站点检测到江财OFFER的友链。",
        "",
        `我检查过你填写的友链页链接：${reciprocal.checkedUrls.join(", ") || friend.friendPageUrl}`,
        "",
        "如果你的友链依赖客户端渲染或滚动懒加载，本机器人会先抓取 HTML，再尝试用浏览器加载并滚动页面；仍检测不到时才会视为没有反链。",
        "",
        "本 Issue 先关闭；加好反链后欢迎重新提交。",
      ].join("\n"),
    );
    return;
  }

  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const sourcePath = path.join(repoRoot, FRIENDS_SOURCE_PATH);
  const source = await readFile(sourcePath, "utf8");
  const merged = mergeFriendLinkIntoSource(source, friend);
  if (merged.changed) {
    await writeFile(sourcePath, merged.content, "utf8");
  }

  const commitSha = await commitAndPushFriendLink(
    repoRoot,
    friend,
    issue.number,
    merged.changed,
  );
  await github.addComment(
    issue.number,
    [
      SUCCESS_COMMENT_MARKER,
      "检测到你已经加入江财OFFER友链，申请已自动通过。",
      commitSha
        ? `已提交到 main：${commitSha}，GitHub Actions 会继续构建并部署。`
        : "友链数据之前已经存在，这次没有产生新的提交。",
    ].join("\n\n"),
  );
  await github.closeIssue(issue.number, "completed");
  console.log(`Accepted friend link issue #${issue.number}.`);
}

async function reviewOpenSourceProjectIssue(issue: GitHubIssue, github: GitHubClient) {
  const comments = await github.listComments(issue.number);
  if (
    comments.some((comment) => comment.body?.includes(PROJECT_SUCCESS_COMMENT_MARKER))
  ) {
    await github.closeIssue(issue.number, "completed");
    console.log(`Closed already-accepted open-source project issue #${issue.number}.`);
    return;
  }
  if (comments.some((comment) => comment.body?.includes(PROJECT_REJECT_COMMENT_MARKER))) {
    await github.closeIssue(issue.number, "not_planned");
    console.log(`Closed already-rejected open-source project issue #${issue.number}.`);
    return;
  }

  const parsed = parseOpenSourceProjectIssueBody(issue.body ?? "");
  if (!parsed) {
    await rejectOpenSourceProjectIssue(
      github,
      issue.number,
      "到检验时间啦，但这个 Issue 里的项目信息不完整，暂时无法自动处理。本 Issue 先关闭，可以补齐信息后重新提交。",
    );
    return;
  }

  if (!hasOpenSourceProjectConfirmation(issue.body ?? "")) {
    await rejectOpenSourceProjectIssue(
      github,
      issue.number,
      "请保留并勾选 Issue 底部的两项提交确认，确认项目与本校同学有关且地址可以公开访问。本 Issue 先关闭，确认后欢迎重新提交。",
    );
    return;
  }

  const projectUrl = normalizePublicHttpUrl(parsed.projectUrl);
  if (!projectUrl) {
    await rejectOpenSourceProjectIssue(
      github,
      issue.number,
      "项目地址必须是可公开访问的 HTTP(S) 地址，且不能使用本地或内网地址。本 Issue 先关闭，修正后欢迎重新提交。",
    );
    return;
  }

  const project = { ...parsed, projectUrl };
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const existingRelativePath = await findExistingOpenSourceProjectMigration(
    repoRoot,
    issue.number,
  );
  const campusProjectSync = await syncCampusProjectSubmission(repoRoot, project, {
    avatarLogin: preferredProjectAvatarLogin(issue, project),
    githubToken: process.env.GITHUB_TOKEN?.trim(),
  });
  if (!campusProjectSync) {
    console.log(
      `Project #${issue.number} is not hosted on GitHub; skipping repository metadata and avatar sync.`,
    );
  }
  const migration = existingRelativePath
    ? null
    : buildOpenSourceProjectMigration(
        project,
        issue.number,
        new Date(),
        campusProjectSync?.repository,
      );
  const relativePath = existingRelativePath ?? migration!.relativePath;

  if (migration) {
    const migrationPath = path.join(repoRoot, relativePath);
    await mkdir(path.dirname(migrationPath), { recursive: true });
    await writeFile(migrationPath, migration.content, "utf8");
  }

  const commitSha = await commitAndPushOpenSourceProject(
    repoRoot,
    project,
    issue.number,
    relativePath,
    campusProjectSync?.relativePaths ?? [],
  );
  await github.addComment(
    issue.number,
    [
      PROJECT_SUCCESS_COMMENT_MARKER,
      "项目提交已通过自动校验，已加入校内开源项目资源页。",
      campusProjectSync
        ? "仓库描述、Star、主语言和头像已同步；头像已压缩为站内 WebP，首页项目墙与资源页会共用同一份数据库档案。"
        : "该项目不是 GitHub 仓库，因此没有可同步的 GitHub 仓库档案。",
      commitSha
        ? `已提交到 main：${commitSha}，GitHub Actions 会继续构建、执行数据库迁移并部署。`
        : "该 Issue 对应的项目提交已经存在，这次没有产生新的提交。",
    ].join("\n\n"),
  );
  await github.closeIssue(issue.number, "completed");
  console.log(`Accepted open-source project issue #${issue.number}.`);
}

async function rejectIssue(github: GitHubClient, issueNumber: number, message: string) {
  await github.addComment(issueNumber, `${REJECT_COMMENT_MARKER}\n${message}`);
  await github.closeIssue(issueNumber, "not_planned");
  console.log(`Rejected friend link issue #${issueNumber}.`);
}

async function rejectOpenSourceProjectIssue(
  github: GitHubClient,
  issueNumber: number,
  message: string,
) {
  await github.addComment(issueNumber, `${PROJECT_REJECT_COMMENT_MARKER}\n${message}`);
  await github.closeIssue(issueNumber, "not_planned");
  console.log(`Rejected open-source project issue #${issueNumber}.`);
}

async function deferIssue(
  github: GitHubClient,
  issueNumber: number,
  checkedUrls: string[],
  existingComments: Array<{ body?: string | null }>,
) {
  if (existingComments.some((comment) => comment.body?.includes(RETRY_COMMENT_MARKER))) {
    console.log(`Keeping #${issueNumber} open: reciprocal-link check will be retried.`);
    return;
  }

  await github.addComment(
    issueNumber,
    [
      RETRY_COMMENT_MARKER,
      "本轮友链检测暂时无法完成，站点可能暂时不可访问或触发了访问保护。",
      "这个 Issue 不会因为这次异常被关闭，机器人会在下一轮自动重试。",
      "",
      `检查地址：${checkedUrls.join(", ") || "未解析出有效地址"}`,
    ].join("\n\n"),
  );
  console.log(`Deferred friend-link check for #${issueNumber}.`);
}

async function commitAndPushFriendLink(
  repoRoot: string,
  friend: FriendLinkIssueData,
  issueNumber: number,
  changed: boolean,
) {
  if (!changed) {
    return "";
  }

  await git(repoRoot, ["add", "--", FRIENDS_SOURCE_PATH]);
  const staged = await git(repoRoot, ["diff", "--cached", "--name-only"]);
  if (!staged.trim()) {
    return "";
  }

  await git(repoRoot, [
    "commit",
    "-m",
    `feat(friends): add ${friend.siteName} (#${issueNumber})`,
  ]);
  const sha = (await git(repoRoot, ["rev-parse", "--short", "HEAD"])).trim();
  await git(repoRoot, ["push", "origin", "HEAD:main"]);
  return sha;
}

async function findExistingOpenSourceProjectMigration(
  repoRoot: string,
  issueNumber: number,
) {
  const migrationsRoot = path.join(repoRoot, RESOURCE_MIGRATIONS_PATH);
  let entries;
  try {
    entries = await readdir(migrationsRoot, { withFileTypes: true });
  } catch {
    return null;
  }

  const suffix = `_add_open_source_project_${issueNumber}`;
  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.endsWith(suffix)) {
      continue;
    }

    const relativePath = path.join(RESOURCE_MIGRATIONS_PATH, entry.name, "migration.sql");
    try {
      await readFile(path.join(repoRoot, relativePath), "utf8");
      return relativePath;
    } catch {
      // Ignore incomplete directories and create a fresh migration below.
    }
  }

  return null;
}

async function commitAndPushOpenSourceProject(
  repoRoot: string,
  project: OpenSourceProjectIssueData,
  issueNumber: number,
  relativePath: string,
  companionPaths: string[] = [],
) {
  const gitPaths = [relativePath, ...companionPaths].map((filePath) =>
    filePath.split(path.sep).join("/"),
  );
  await git(repoRoot, ["add", "--", ...gitPaths]);
  const staged = await git(repoRoot, [
    "diff",
    "--cached",
    "--name-only",
    "--",
    ...gitPaths,
  ]);
  if (!staged.trim()) {
    return "";
  }

  await git(repoRoot, [
    "commit",
    "-m",
    `feat(resources): add ${project.projectName} (#${issueNumber})`,
  ]);
  const sha = (await git(repoRoot, ["rev-parse", "--short", "HEAD"])).trim();
  await git(repoRoot, ["push", "origin", "HEAD:main"]);
  return sha;
}

async function git(cwd: string, args: string[]) {
  const { stdout } = await execFileAsync("git", args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
  return stdout;
}

async function readEventIssue() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    return null;
  }
  const event = JSON.parse(await readFile(eventPath, "utf8")) as { issue?: GitHubIssue };
  return event.issue ?? null;
}

function createGitHubClient() {
  const token = process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY;
  if (!token) {
    throw new Error("GITHUB_TOKEN is required.");
  }
  if (!repository || !repository.includes("/")) {
    throw new Error("GITHUB_REPOSITORY must be owner/repo.");
  }
  const [owner, repo] = repository.split("/", 2) as [string, string];
  return new GitHubClient(token, owner, repo);
}

export async function runFriendLinkBotCli(argv: string[]) {
  const [mode, issueNumberArgument] = argv;
  if (mode === "opened") {
    const shouldReview = await runOpenedMode();
    const outputPath = process.env.GITHUB_OUTPUT;
    if (outputPath) {
      await appendFile(outputPath, `should_review=${shouldReview}\n`, "utf8");
    }
    return 0;
  }
  if (mode === "review") {
    let issueNumber: number | undefined;
    if (issueNumberArgument !== undefined) {
      issueNumber = Number(issueNumberArgument);
      if (
        !Number.isSafeInteger(issueNumber) ||
        issueNumber < 1 ||
        String(issueNumber) !== issueNumberArgument
      ) {
        console.error("review issue number must be a positive integer");
        return 2;
      }
    }
    await runReviewMode(issueNumber);
    return 0;
  }

  console.error("usage: friend-link-bot <opened|review [issue-number]>");
  return 2;
}

const currentFile = fileURLToPath(import.meta.url);
const invokedFile = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedFile && path.resolve(currentFile) === invokedFile) {
  runFriendLinkBotCli(process.argv.slice(2))
    .then((code) => process.exit(code))
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    });
}

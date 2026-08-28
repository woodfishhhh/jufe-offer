import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import {
  buildInitialFriendLinkComment,
  buildInitialOpenSourceProjectComment,
  buildOpenSourceProjectMigration,
  CAMPUS_PROJECT_SUBMISSION_LABEL,
  FRIEND_LINK_SUBMISSION_LABEL,
  JUFE_OFFER_FRIEND_LINK,
  mergeFriendLinkIntoSource,
  normalizePublicHttpUrl,
  parseOpenSourceProjectIssueBody,
  preferredProjectAvatarLogin,
  parseFriendLinkIssueBody,
  shouldReviewIssue,
  submissionKindForIssue,
  verifyReciprocalLink,
} from "./friend-link-bot";

test("routes submissions by form label while keeping legacy title compatibility", () => {
  const baseIssue = {
    created_at: "2026-08-28T05:24:51.000Z",
    number: 2,
  };

  assert.equal(
    submissionKindForIssue({
      ...baseIssue,
      title: "TheNook",
      labels: [{ name: CAMPUS_PROJECT_SUBMISSION_LABEL }],
    }),
    "campus-project",
  );
  assert.equal(
    submissionKindForIssue({
      ...baseIssue,
      title: "[开源项目提交] 仍以标签为准",
      labels: [FRIEND_LINK_SUBMISSION_LABEL],
    }),
    "friend-link",
  );
  assert.equal(
    submissionKindForIssue({
      ...baseIssue,
      title: "[友链申请] 历史提交",
    }),
    "friend-link",
  );
  assert.equal(
    submissionKindForIssue({
      ...baseIssue,
      title: "[开源项目提交] 历史提交",
    }),
    "campus-project",
  );
  assert.equal(
    submissionKindForIssue({
      ...baseIssue,
      title: "冲突标签",
      labels: [FRIEND_LINK_SUBMISSION_LABEL, CAMPUS_PROJECT_SUBMISSION_LABEL],
    }),
    null,
  );
  assert.equal(
    submissionKindForIssue({
      ...baseIssue,
      title: "普通 Issue",
      labels: [{ name: "enhancement" }],
    }),
    null,
  );
});

test("submission forms attach source labels and issue events use per-issue delayed review", async () => {
  const [friendLinkForm, campusProjectForm, workflow] = await Promise.all([
    readFile(".github/ISSUE_TEMPLATE/friend-link.yml", "utf8"),
    readFile(".github/ISSUE_TEMPLATE/open-source-project.yml", "utf8"),
    readFile(".github/workflows/friend-link-bot.yml", "utf8"),
  ]);

  assert.match(friendLinkForm, /submission:friend-link/);
  assert.match(campusProjectForm, /submission:campus-project/);
  assert.match(workflow, /- labeled/);
  assert.match(workflow, /submission:friend-link/);
  assert.match(workflow, /submission:campus-project/);
  assert.match(workflow, /sleep 1800/);
  assert.match(
    workflow,
    /friend-link-bot review "\$\{\{ github\.event\.issue\.number \}\}"/,
  );
  assert.match(workflow, /jufe-offer-community-submission-bot-\$\{\{/);
  assert.match(workflow, /cron: "17 \* \* \* \*"/);
  assert.doesNotMatch(friendLinkForm, /00:00|1 小时/);
});

test("parses the prefilled markdown body used by the application form", () => {
  const parsed = parseFriendLinkIssueBody(
    [
      "## 友链申请",
      "",
      "### 站点名称",
      "示例博客",
      "",
      "### 站点地址",
      "https://example.com/",
      "",
      "### 友链页地址",
      "https://example.com/links/",
      "",
      "### 头像或站点图标",
      "https://example.com/avatar.png",
      "",
      "### 站点简介",
      "记录技术与生活",
      "",
      "### 联系方式",
      "example",
      "",
      "### 提交确认",
      "- [x] 我确认项目由本校同学创立或参与，且项目地址可以公开访问。",
      "- [x] 我同意江财OFFER根据页面展示需要调整项目简介或标签。",
    ].join("\n"),
  );

  assert.deepEqual(parsed, {
    siteName: "示例博客",
    siteUrl: "https://example.com/",
    friendPageUrl: "https://example.com/links/",
    avatarUrl: "https://example.com/avatar.png",
    description: "记录技术与生活",
    contact: "example",
  });
});

test("also parses the blog-style key-value body and defaults optional contact", () => {
  const parsed = parseFriendLinkIssueBody(
    [
      "## Friend Link Application",
      "- Site Name: Example",
      "- Site URL: https://example.com/",
      "- Friend Page URL: https://example.com/links/",
      "- Avatar URL: https://example.com/avatar.png",
      "- Short Description: A small blog",
    ].join("\n"),
  );

  assert.equal(parsed?.contact, "未提供");
  assert.equal(parsed?.friendPageUrl, "https://example.com/links/");
});

test("requires an explicit friend page URL", () => {
  const parsed = parseFriendLinkIssueBody(
    [
      "### 站点名称",
      "Example",
      "### 站点地址",
      "https://example.com/",
      "### 站点简介",
      "A blog",
    ].join("\n"),
  );

  assert.equal(parsed, null);
});

test("parses the open-source project submission body", () => {
  const parsed = parseOpenSourceProjectIssueBody(
    [
      "## 校内开源项目提交",
      "",
      "### 项目名称",
      "江财校园助手",
      "",
      "### 项目地址",
      "https://github.com/example/jufe-helper",
      "",
      "### 项目简介",
      "为江财同学提供校园信息查询与学习工具。",
      "",
      "### 与项目的关系",
      "发起人、核心贡献者",
      "",
      "### 项目标签",
      "校园, 开源, #工具",
      "",
      "### 联系方式",
      "example",
    ].join("\n"),
  );

  assert.deepEqual(parsed, {
    projectName: "江财校园助手",
    projectUrl: "https://github.com/example/jufe-helper",
    description: "为江财同学提供校园信息查询与学习工具。",
    relation: "发起人、核心贡献者",
    tags: ["校园", "开源", "工具"],
    contact: "example",
  });
});

test("builds a stable, guarded migration for an open-source project", () => {
  const migration = buildOpenSourceProjectMigration(
    {
      projectName: "O'Reilly 江财工具",
      projectUrl: "https://github.com/example/jufe-helper",
      description: "帮助同学整理开源项目。",
      relation: "参与开发者",
      tags: ["开源", "工具"],
      contact: "example",
    },
    42,
    new Date("2026-08-27T10:11:12.000Z"),
    {
      repositoryUrl: "https://github.com/example/jufe-helper",
      owner: "example",
      name: "jufe-helper",
      description: "GitHub description",
      stars: 42,
      avatarPath: "/campus-project-avatars/contributor.webp",
      avatarLogin: "contributor",
      primaryLanguage: "TypeScript",
    },
  );

  assert.equal(migration.directoryName, "20260827101112_add_open_source_project_42");
  assert.equal(
    migration.relativePath.replaceAll("\\", "/"),
    "prisma/migrations/20260827101112_add_open_source_project_42/migration.sql",
  );
  assert.match(migration.content, /open_source_issue_42/);
  assert.match(migration.content, /O''Reilly/);
  assert.match(migration.content, /'校内开源项目'/);
  assert.match(migration.content, /lower\(rtrim\("url", '\/'\)\)/);
  assert.match(migration.content, /INSERT INTO "RepositoryProfile"/);
  assert.match(migration.content, /\/campus-project-avatars\/contributor\.webp/);
  assert.match(migration.content, /\s42,/);
});

test("uses the submitting contributor avatar but keeps owner avatars for recommendations", () => {
  const issue = {
    created_at: "2026-08-27T10:11:12.000Z",
    number: 42,
    title: "[开源项目提交] helper",
    user: { login: "student-contributor" },
  };
  const project = {
    projectName: "helper",
    projectUrl: "https://github.com/example/helper",
    description: "helper",
    relation: "参与开发者",
    tags: [],
    contact: "student",
  };

  assert.equal(preferredProjectAvatarLogin(issue, project), "student-contributor");
  assert.equal(
    preferredProjectAvatarLogin(issue, { ...project, relation: "协作者" }),
    "student-contributor",
  );
  assert.equal(
    preferredProjectAvatarLogin(issue, { ...project, relation: "推荐人" }),
    undefined,
  );
});

test("builds the open-source project review reminder", () => {
  const comment = buildInitialOpenSourceProjectComment();

  assert.match(comment, /约 30 分钟后/);
  assert.doesNotMatch(comment, /00:00|1 小时/);
  assert.match(comment, /本校同学创立或参与/);
  assert.match(comment, /加入资源页/);
});

test("builds the reciprocal-link reminder comment", () => {
  const comment = buildInitialFriendLinkComment(JUFE_OFFER_FRIEND_LINK);

  assert.match(comment, /约 30 分钟后/);
  assert.doesNotMatch(comment, /00:00|1 小时/);
  assert.match(comment, /自动关闭/);
  assert.match(comment, /江财OFFER/);
  assert.match(
    comment,
    new RegExp(JUFE_OFFER_FRIEND_LINK.link.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
  );
});

test("waits thirty minutes after issue creation", () => {
  const createdAt = "2026-08-27T08:00:00.000Z";

  assert.equal(shouldReviewIssue(createdAt, new Date("2026-08-27T08:29:59.000Z")), false);
  assert.equal(shouldReviewIssue(createdAt, new Date("2026-08-27T08:30:00.000Z")), true);
});

test("rejects local and private URLs before fetching", () => {
  assert.equal(normalizePublicHttpUrl("http://127.0.0.1/links"), null);
  assert.equal(normalizePublicHttpUrl("http://192.168.1.10/links"), null);
  assert.equal(normalizePublicHttpUrl("http://[::1]/links"), null);
  assert.equal(normalizePublicHttpUrl("http://[::ffff:127.0.0.1]/links"), null);
  assert.equal(
    normalizePublicHttpUrl("https://example.com/links"),
    "https://example.com/links",
  );
});

test("accepts a reciprocal link found in raw HTML", async () => {
  const result = await verifyReciprocalLink(
    "https://example.com/links",
    JUFE_OFFER_FRIEND_LINK,
    {
      fetchText: async () => `<a href="${JUFE_OFFER_FRIEND_LINK.link}">江财OFFER</a>`,
      renderPageText: async () => {
        throw new Error("should not render after raw match");
      },
    },
  );

  assert.equal(result.found, true);
  assert.equal(result.matchedUrl, "https://example.com/links");
});

test("falls back to rendered HTML for client-rendered or lazy links", async () => {
  let rendered = false;
  const result = await verifyReciprocalLink(
    "https://example.com/links",
    JUFE_OFFER_FRIEND_LINK,
    {
      fetchText: async () => "<div id=friend-links></div>",
      renderPageText: async () => {
        rendered = true;
        return `<a href="${JUFE_OFFER_FRIEND_LINK.link}">江财OFFER</a>`;
      },
    },
  );

  assert.equal(result.found, true);
  assert.equal(rendered, true);
});

test("keeps browser failures indeterminate and never accepts an avatar alone", async () => {
  const indeterminate = await verifyReciprocalLink(
    "https://example.com/links",
    JUFE_OFFER_FRIEND_LINK,
    {
      fetchText: async () => "",
      renderPageText: async () => {
        throw new Error("browser unavailable");
      },
    },
  );
  assert.deepEqual(indeterminate, {
    checkedUrls: ["https://example.com/links"],
    found: false,
    indeterminate: true,
  });

  const avatarOnly = await verifyReciprocalLink(
    "https://example.com/links",
    JUFE_OFFER_FRIEND_LINK,
    {
      fetchText: async () => `<img src="${JUFE_OFFER_FRIEND_LINK.avatar}">`,
      renderPageText: async () => "",
    },
  );
  assert.equal(avatarOnly.found, false);
});

test("appends an escaped personal friend entry and stays idempotent", () => {
  const source = [
    "export const FRIEND_GROUPS = [",
    "  {",
    '    id: "official",',
    "  },",
    "] as const;",
    "",
    "export const friends: FriendLink[] = [",
    "  {",
    '    name: "Existing",',
    '    description: "Existing site",',
    '    url: "https://existing.example/",',
    '    domain: "existing.example",',
    '    group: "personal",',
    "  },",
    "];\n",
  ].join("\n");
  const friend = {
    siteName: 'A "quoted" site',
    siteUrl: "https://example.com/",
    friendPageUrl: "https://example.com/links/",
    avatarUrl: "https://example.com/avatar.png",
    description: "Hello # world",
    contact: "example",
  };

  const first = mergeFriendLinkIntoSource(source, friend);
  assert.equal(first.changed, true);
  assert.match(first.content, /name: "A \\\"quoted\\\" site"/);
  assert.match(first.content, /group: "personal"/);
  assert.match(first.content, /domain: "example\.com"/);

  const second = mergeFriendLinkIntoSource(first.content, friend);
  assert.equal(second.changed, false);
  assert.equal(second.content, first.content);
});

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildInitialFriendLinkComment,
  JUFE_OFFER_FRIEND_LINK,
  mergeFriendLinkIntoSource,
  normalizePublicHttpUrl,
  parseFriendLinkIssueBody,
  shouldReviewIssue,
  verifyReciprocalLink,
} from "./friend-link-bot";

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

test("builds the reciprocal-link reminder comment", () => {
  const comment = buildInitialFriendLinkComment(JUFE_OFFER_FRIEND_LINK);

  assert.match(comment, /北京时间 00:00/);
  assert.match(comment, /至少等待 1 小时/);
  assert.match(comment, /自动关闭/);
  assert.match(comment, /江财OFFER/);
  assert.match(
    comment,
    new RegExp(JUFE_OFFER_FRIEND_LINK.link.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
  );
});

test("waits one hour after issue creation", () => {
  const createdAt = "2026-08-27T08:00:00.000Z";

  assert.equal(shouldReviewIssue(createdAt, new Date("2026-08-27T08:59:59.000Z")), false);
  assert.equal(shouldReviewIssue(createdAt, new Date("2026-08-27T09:00:00.000Z")), true);
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

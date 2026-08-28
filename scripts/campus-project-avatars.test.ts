import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import sharp from "sharp";

import {
  compressCampusProjectAvatar,
  mergeCampusProjectRecord,
  parseGitHubRepositoryUrl,
  syncGitHubAvatar,
} from "./campus-project-avatars";

const avatarSvg = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="900" height="600">
    <defs><linearGradient id="g"><stop stop-color="#1270ff"/><stop offset="1" stop-color="#ff6b9d"/></linearGradient></defs>
    <rect width="900" height="600" fill="url(#g)"/>
    <circle cx="450" cy="260" r="150" fill="white"/>
  </svg>
`);

test("parses canonical GitHub repository URLs and rejects unsafe lookalikes", () => {
  assert.deepEqual(parseGitHubRepositoryUrl("https://github.com/Example/Repo.git/"), {
    owner: "Example",
    repository: "Repo",
    canonicalUrl: "https://github.com/Example/Repo",
  });
  assert.equal(parseGitHubRepositoryUrl("http://github.com/example/repo"), null);
  assert.equal(
    parseGitHubRepositoryUrl("https://github.com/example/repo/tree/main"),
    null,
  );
  assert.equal(parseGitHubRepositoryUrl("https://github.example.com/example/repo"), null);
  assert.equal(parseGitHubRepositoryUrl("https://gitlab.com/example/repo"), null);
});

test("compresses avatars to a metadata-free 320px WebP", async () => {
  const compressed = await compressCampusProjectAvatar(avatarSvg);
  const metadata = await sharp(compressed).metadata();

  assert.equal(metadata.format, "webp");
  assert.equal(metadata.width, 320);
  assert.equal(metadata.height, 320);
  assert.equal(metadata.exif, undefined);
  assert.ok(compressed.byteLength < 50_000);
});

test("downloads an allowed GitHub avatar once and writes an idempotent local file", async () => {
  const repoRoot = await mkdtemp(path.join(tmpdir(), "jufe-avatar-test-"));
  let fetchCount = 0;
  const fetchImpl: typeof fetch = async () => {
    fetchCount += 1;
    const response = new Response(avatarSvg, {
      headers: { "content-type": "image/svg+xml" },
      status: 200,
    });
    Object.defineProperty(response, "url", {
      value: "https://avatars.githubusercontent.com/u/123?v=4",
    });
    return response;
  };

  try {
    const first = await syncGitHubAvatar(repoRoot, "https://github.com/Example/Repo", {
      fetchImpl,
    });
    const second = await syncGitHubAvatar(
      repoRoot,
      "https://github.com/example/another-repo",
      { fetchImpl },
    );

    assert.equal(first.changed, true);
    assert.equal(second.changed, false);
    assert.equal(first.publicPath, "/campus-project-avatars/example.webp");
    assert.deepEqual(
      await readFile(first.absolutePath),
      await readFile(second.absolutePath),
    );
    assert.equal(fetchCount, 2);
  } finally {
    await rm(repoRoot, { force: true, recursive: true });
  }
});

test("upserts a submitted project without creating duplicate repositories", () => {
  const first = mergeCampusProjectRecord(
    [],
    {
      projectName: "江财校园助手",
      projectUrl: "https://github.com/example/jufe-helper",
      tags: ["校园", "工具", "小程序"],
    },
    "/campus-project-avatars/example.webp",
  );
  const second = mergeCampusProjectRecord(
    first.records,
    {
      projectName: "江财校园助手",
      projectUrl: "https://github.com/EXAMPLE/jufe-helper/",
      tags: ["校园", "工具", "小程序"],
    },
    "/campus-project-avatars/example.webp",
  );

  assert.equal(first.changed, true);
  assert.equal(first.records.length, 1);
  assert.equal(first.records[0]?.subtitle, "工具 · 小程序");
  assert.equal(second.changed, false);
  assert.equal(second.records.length, 1);
});

import assert from "node:assert/strict";
import { createServer } from "node:http";
import { afterEach, test } from "node:test";

import { NextRequest } from "next/server";

import {
  proxyRemoteResourceRequest,
  readRemoteResourceList,
} from "../src/lib/remote-resources";
import { hasResourceAdminBearer } from "../src/lib/resource-admin";

const ADMIN_TOKEN = "0123456789abcdef0123456789abcdef0123456789abcdef";
const originalAdminToken = process.env.RESOURCE_ADMIN_API_TOKEN;
const originalRemoteBaseUrl = process.env.REMOTE_RESOURCE_API_BASE_URL;

afterEach(() => {
  if (originalAdminToken === undefined) {
    delete process.env.RESOURCE_ADMIN_API_TOKEN;
  } else {
    process.env.RESOURCE_ADMIN_API_TOKEN = originalAdminToken;
  }

  if (originalRemoteBaseUrl === undefined) {
    delete process.env.REMOTE_RESOURCE_API_BASE_URL;
  } else {
    process.env.REMOTE_RESOURCE_API_BASE_URL = originalRemoteBaseUrl;
  }
});

test("accepts only the exact configured resource admin bearer", () => {
  process.env.RESOURCE_ADMIN_API_TOKEN = ADMIN_TOKEN;

  const accepted = new NextRequest("http://localhost:3000/api/resources", {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  });
  const rejected = new NextRequest("http://localhost:3000/api/resources", {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN.slice(0, -1)}x` },
  });

  assert.equal(hasResourceAdminBearer(accepted), true);
  assert.equal(hasResourceAdminBearer(rejected), false);
});

test("proxies a local admin write with the server-side token", async () => {
  let resolveUpstreamRequest: ((value: Record<string, string>) => void) | undefined;
  const upstreamRequest = new Promise<Record<string, string>>((resolve) => {
    resolveUpstreamRequest = resolve;
  });
  const server = createServer((request, response) => {
    const chunks: Buffer[] = [];
    request.on("data", (chunk: Buffer) => chunks.push(chunk));
    request.on("end", () => {
      resolveUpstreamRequest?.({
        authorization: request.headers.authorization ?? "",
        body: Buffer.concat(chunks).toString("utf8"),
        contentType: request.headers["content-type"] ?? "",
        method: request.method ?? "",
        url: request.url ?? "",
      });
      response.statusCode = 200;
      response.setHeader("content-type", "application/json; charset=utf-8");
      response.end('{"ok":true}');
    });
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  try {
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    process.env.RESOURCE_ADMIN_API_TOKEN = ADMIN_TOKEN;
    process.env.REMOTE_RESOURCE_API_BASE_URL = `http://127.0.0.1:${address.port}`;

    const request = new NextRequest(
      "http://localhost:3000/api/resources/local-id?dry=1",
      {
        method: "PATCH",
        headers: {
          Authorization: "Bearer browser-session-must-not-be-forwarded",
          "Content-Type": "application/json",
        },
        body: '{"title":"updated"}',
      },
    );
    const response = await proxyRemoteResourceRequest(
      request,
      "/api/resources/remote-id",
    );
    const captured = await upstreamRequest;

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-jufe-resource-source"), "remote");
    assert.deepEqual(await response.json(), { ok: true });
    assert.deepEqual(captured, {
      authorization: `Bearer ${ADMIN_TOKEN}`,
      body: '{"title":"updated"}',
      contentType: "application/json",
      method: "PATCH",
      url: "/api/resources/remote-id?dry=1",
    });
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test("refuses remote writes when the local admin token is absent", async () => {
  delete process.env.RESOURCE_ADMIN_API_TOKEN;
  process.env.REMOTE_RESOURCE_API_BASE_URL = "https://jufe.woodfish.site";

  const request = new NextRequest("http://localhost:3000/api/resources", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: '{"title":"blocked"}',
  });
  const response = await proxyRemoteResourceRequest(request, "/api/resources");

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    error: { message: "本机尚未配置远程资源管理权限。" },
  });
});

test("reads the homepage project list from the configured remote API", async () => {
  const server = createServer((request, response) => {
    assert.equal(
      request.url,
      "/api/resources?category=%E6%A0%A1%E5%86%85%E5%BC%80%E6%BA%90%E9%A1%B9%E7%9B%AE",
    );
    response.statusCode = 200;
    response.setHeader("content-type", "application/json; charset=utf-8");
    response.end(
      JSON.stringify({
        data: [
          {
            id: "remote-project",
            title: "Remote Project",
            description: "Remote database record",
            url: "https://github.com/example/remote-project",
            category: "校内开源项目",
            tags: [],
            isFeatured: true,
            origin: "MANUAL",
            startsAt: null,
            deadlineAt: null,
            createdAt: "2026-08-28T00:00:00.000Z",
            updatedAt: "2026-08-28T00:00:00.000Z",
            repository: null,
          },
        ],
      }),
    );
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  try {
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    process.env.REMOTE_RESOURCE_API_BASE_URL = `http://127.0.0.1:${address.port}`;

    const resources = await readRemoteResourceList("校内开源项目");
    assert.equal(resources.length, 1);
    assert.equal(resources[0]?.id, "remote-project");
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

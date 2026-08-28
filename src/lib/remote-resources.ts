import type { NextRequest } from "next/server";

import { jsonError } from "@/lib/http";
import type { ResourceDto } from "@/lib/resources";

export function shouldUseRemoteResources() {
  return process.env.USE_REMOTE_RESOURCES?.trim().toLowerCase() === "true";
}

function readRemoteBaseUrl() {
  const value = process.env.REMOTE_RESOURCE_API_BASE_URL?.trim();
  if (!value) return null;

  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed : null;
  } catch {
    return null;
  }
}

export async function readRemoteResourceList(category: string) {
  const remoteBaseUrl = readRemoteBaseUrl();
  if (!remoteBaseUrl) {
    throw new Error("Remote resource API base URL is not configured.");
  }

  const remoteUrl = new URL("/api/resources", remoteBaseUrl);
  remoteUrl.searchParams.set("category", category);
  const response = await fetch(remoteUrl, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new Error(`Remote resource API returned HTTP ${response.status}.`);
  }

  const payload = (await response.json()) as { data?: unknown };
  if (!Array.isArray(payload.data)) {
    throw new Error("Remote resource API returned an invalid resource list.");
  }

  return payload.data as ResourceDto[];
}

export async function proxyRemoteResourceRequest(request: NextRequest, pathname: string) {
  const remoteBaseUrl = readRemoteBaseUrl();
  if (!remoteBaseUrl) {
    return jsonError("已开启线上资源读取，但远程资源地址未正确配置。", 500);
  }

  const remoteUrl = new URL(pathname, remoteBaseUrl);
  remoteUrl.search = request.nextUrl.search;
  if (remoteUrl.origin === request.nextUrl.origin) {
    return jsonError("线上资源地址不能指向当前站点，避免代理循环。", 500);
  }

  const method = request.method.toUpperCase();
  const writeRequest = method !== "GET" && method !== "HEAD";
  const headers = new Headers({ Accept: "application/json" });
  let body: string | undefined;

  if (writeRequest) {
    const adminToken = process.env.RESOURCE_ADMIN_API_TOKEN?.trim();
    if (!adminToken || adminToken.length < 32) {
      return jsonError("本机尚未配置远程资源管理权限。", 503);
    }
    headers.set("Authorization", `Bearer ${adminToken}`);
    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);
    if (method !== "DELETE") body = await request.text();
  }

  try {
    const upstream = await fetch(remoteUrl, {
      method,
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    const contentType = upstream.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return jsonError("线上资源接口返回了无法识别的数据。", 502);
    }

    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "x-jufe-resource-source": "remote",
      },
    });
  } catch {
    return jsonError("线上资源暂时无法访问，请检查网络或远程地址。", 502);
  }
}

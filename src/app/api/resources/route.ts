import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { readAdminSession } from "@/lib/auth";
import { jsonError, jsonOk, zodErrorResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { toResourceDto } from "@/lib/resources";
import { stringifyTags } from "@/lib/tags";
import { resourceInputSchema, resourceQuerySchema } from "@/schemas/resource";

export const dynamic = "force-dynamic";

function shouldReadRemoteResources() {
  return process.env.USE_REMOTE_RESOURCES?.trim().toLowerCase() === "true";
}

async function readRemoteResources(request: NextRequest) {
  const remoteBaseUrl = process.env.REMOTE_RESOURCE_API_BASE_URL?.trim();
  if (!remoteBaseUrl) {
    return jsonError(
      "已开启线上资源读取，但未配置 REMOTE_RESOURCE_API_BASE_URL。",
      500,
    );
  }

  try {
    const remoteUrl = new URL("/api/resources", remoteBaseUrl);
    if (!["http:", "https:"].includes(remoteUrl.protocol)) {
      return jsonError("线上资源地址必须使用 HTTP 或 HTTPS。", 500);
    }

    remoteUrl.search = request.nextUrl.search;
    if (remoteUrl.origin === request.nextUrl.origin) {
      return jsonError("线上资源地址不能指向当前站点，避免代理循环。", 500);
    }

    const upstream = await fetch(remoteUrl, {
      cache: "no-store",
      headers: { Accept: "application/json" },
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
    return jsonError("线上资源暂时无法读取，请检查网络或远程地址。", 502);
  }
}

export async function GET(request: NextRequest) {
  try {
    const parsed = resourceQuerySchema.safeParse({
      q: request.nextUrl.searchParams.get("q") ?? undefined,
      category: request.nextUrl.searchParams.get("category") ?? undefined,
      featured: request.nextUrl.searchParams.get("featured") ?? undefined,
      sort: request.nextUrl.searchParams.get("sort") ?? undefined,
    });

    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    if (shouldReadRemoteResources()) {
      return readRemoteResources(request);
    }

    const { q, category, featured, sort } = parsed.data;
    const where: Prisma.ResourceWhereInput = {};

    if (category) {
      where.category = category;
    }

    if (featured === "1" || featured === "true") {
      where.isFeatured = true;
    }

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { category: { contains: q } },
        { tags: { contains: q } },
      ];
    }

    const resources = await prisma.resource.findMany({
      where,
      orderBy:
        sort === "title"
          ? [{ title: "asc" }, { updatedAt: "desc" }]
          : [{ createdAt: "desc" }],
    });

    return jsonOk(resources.map(toResourceDto));
  } catch {
    return jsonError("资源列表暂时无法加载，请稍后重试。", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await readAdminSession();
    if (!isAdmin) {
      return jsonError("请先登录管理员账号。", 401);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("请求格式不正确。", 400);
    }

    const parsed = resourceInputSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const created = await prisma.resource.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        url: parsed.data.url,
        category: parsed.data.category,
        tags: stringifyTags(parsed.data.tags),
        isFeatured: parsed.data.isFeatured,
        startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
        deadlineAt: parsed.data.deadlineAt ? new Date(parsed.data.deadlineAt) : null,
      },
    });

    return jsonOk(toResourceDto(created), 201);
  } catch {
    return jsonError("新增资源失败，请稍后重试。", 500);
  }
}

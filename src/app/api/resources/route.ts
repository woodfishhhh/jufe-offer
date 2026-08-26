import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { readAdminSession } from "@/lib/auth";
import { jsonError, jsonOk, zodErrorResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { toResourceDto } from "@/lib/resources";
import { stringifyTags } from "@/lib/tags";
import { resourceInputSchema, resourceQuerySchema } from "@/schemas/resource";

export const dynamic = "force-dynamic";

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

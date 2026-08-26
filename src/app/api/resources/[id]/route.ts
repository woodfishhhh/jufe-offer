import { NextRequest } from "next/server";
import { readAdminSession } from "@/lib/auth";
import { jsonError, jsonOk, zodErrorResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { toResourceDto } from "@/lib/resources";
import { stringifyTags } from "@/lib/tags";
import { resourcePatchSchema } from "@/schemas/resource";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const isAdmin = await readAdminSession();
    if (!isAdmin) {
      return jsonError("请先登录管理员账号。", 401);
    }

    const { id } = await context.params;
    const existing = await prisma.resource.findUnique({ where: { id } });
    if (!existing) {
      return jsonError("资源不存在或已被删除。", 404);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("请求格式不正确。", 400);
    }

    const parsed = resourcePatchSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const updated = await prisma.resource.update({
      where: { id },
      data: {
        ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
        ...(parsed.data.description !== undefined
          ? { description: parsed.data.description }
          : {}),
        ...(parsed.data.url !== undefined ? { url: parsed.data.url } : {}),
        ...(parsed.data.category !== undefined ? { category: parsed.data.category } : {}),
        ...(parsed.data.tags !== undefined
          ? { tags: stringifyTags(parsed.data.tags) }
          : {}),
        ...(parsed.data.isFeatured !== undefined
          ? { isFeatured: parsed.data.isFeatured }
          : {}),
      },
    });

    return jsonOk(toResourceDto(updated));
  } catch {
    return jsonError("更新资源失败，请稍后重试。", 500);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const isAdmin = await readAdminSession();
    if (!isAdmin) {
      return jsonError("请先登录管理员账号。", 401);
    }

    const { id } = await context.params;
    const existing = await prisma.resource.findUnique({ where: { id } });
    if (!existing) {
      return jsonError("资源不存在或已被删除。", 404);
    }

    await prisma.resource.delete({ where: { id } });
    return jsonOk({ id });
  } catch {
    return jsonError("删除资源失败，请稍后重试。", 500);
  }
}

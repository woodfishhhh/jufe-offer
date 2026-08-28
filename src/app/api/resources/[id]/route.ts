import { NextRequest } from "next/server";
import { jsonError, jsonOk, zodErrorResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { hasResourceAdminAccess } from "@/lib/resource-admin";
import {
  proxyRemoteResourceRequest,
  shouldUseRemoteResources,
} from "@/lib/remote-resources";
import { toResourceDto } from "@/lib/resources";
import { stringifyTags } from "@/lib/tags";
import { resourcePatchSchema } from "@/schemas/resource";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const isAdmin = await hasResourceAdminAccess(request);
    if (!isAdmin) {
      return jsonError("请先登录管理员账号。", 401);
    }

    const { id } = await context.params;
    if (shouldUseRemoteResources()) {
      return proxyRemoteResourceRequest(
        request,
        `/api/resources/${encodeURIComponent(id)}`,
      );
    }

    const existing = await prisma.resource.findUnique({
      where: { id },
      include: { repositoryProfile: true },
    });
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

    const startsAt =
      parsed.data.startsAt !== undefined
        ? parsed.data.startsAt
          ? new Date(parsed.data.startsAt)
          : null
        : existing.startsAt;
    const deadlineAt =
      parsed.data.deadlineAt !== undefined
        ? parsed.data.deadlineAt
          ? new Date(parsed.data.deadlineAt)
          : null
        : existing.deadlineAt;

    if (startsAt && deadlineAt && deadlineAt.getTime() < startsAt.getTime()) {
      return jsonError("提交内容未通过校验。", 400, {
        deadlineAt: "截止时间不能早于开始时间",
      });
    }

    const normalizedExistingUrl = existing.url.replace(/\/+$/, "").toLowerCase();
    const normalizedNextUrl = parsed.data.url?.replace(/\/+$/, "").toLowerCase();
    const repositoryChanged =
      normalizedNextUrl !== undefined && normalizedNextUrl !== normalizedExistingUrl;

    const updated = await prisma.$transaction(async (transaction) => {
      if (repositoryChanged && existing.repositoryProfile) {
        await transaction.repositoryProfile.update({
          where: { id: existing.repositoryProfile.id },
          data: { resourceId: null },
        });
      }

      return transaction.resource.update({
        where: { id },
        data: {
          ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
          ...(parsed.data.description !== undefined
            ? { description: parsed.data.description }
            : {}),
          ...(parsed.data.url !== undefined ? { url: parsed.data.url } : {}),
          ...(parsed.data.category !== undefined
            ? { category: parsed.data.category }
            : {}),
          ...(parsed.data.tags !== undefined
            ? { tags: stringifyTags(parsed.data.tags) }
            : {}),
          ...(parsed.data.isFeatured !== undefined
            ? { isFeatured: parsed.data.isFeatured }
            : {}),
          ...(parsed.data.startsAt !== undefined ? { startsAt } : {}),
          ...(parsed.data.deadlineAt !== undefined ? { deadlineAt } : {}),
        },
        include: { repositoryProfile: true },
      });
    });

    return jsonOk(toResourceDto(updated));
  } catch {
    return jsonError("更新资源失败，请稍后重试。", 500);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const isAdmin = await hasResourceAdminAccess(request);
    if (!isAdmin) {
      return jsonError("请先登录管理员账号。", 401);
    }

    const { id } = await context.params;
    if (shouldUseRemoteResources()) {
      return proxyRemoteResourceRequest(
        request,
        `/api/resources/${encodeURIComponent(id)}`,
      );
    }

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

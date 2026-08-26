import { NextRequest } from "next/server";
import { readAdminSession } from "@/lib/auth";
import { toCandidateDto } from "@/lib/candidates";
import { jsonError, jsonOk, zodErrorResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { candidateAdminQuerySchema } from "@/schemas/candidate";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export async function GET(request: NextRequest) {
  const isAdmin = await readAdminSession();
  if (!isAdmin) {
    return jsonError("请先登录管理员账号。", 401);
  }

  const parsed = candidateAdminQuerySchema.safeParse({
    status: request.nextUrl.searchParams.get("status") ?? undefined,
  });
  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  try {
    const [items, total] = await prisma.$transaction([
      prisma.candidate.findMany({
        where: { status: parsed.data.status },
        orderBy: [{ discoveredAt: "asc" }, { createdAt: "asc" }],
        take: PAGE_SIZE,
      }),
      prisma.candidate.count({ where: { status: parsed.data.status } }),
    ]);

    return jsonOk({
      items: items.map(toCandidateDto),
      total,
      limit: PAGE_SIZE,
    });
  } catch {
    return jsonError("候选列表暂时无法加载，请稍后重试。", 500);
  }
}

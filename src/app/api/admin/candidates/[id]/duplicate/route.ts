import { NextRequest } from "next/server";
import { readAdminSession } from "@/lib/auth";
import { candidateMutationErrorResponse } from "@/lib/candidate-http";
import { closeCandidate, toCandidateDto } from "@/lib/candidates";
import { jsonError, jsonOk, zodErrorResponse } from "@/lib/http";
import { readJsonBody } from "@/lib/request-body";
import { candidateIdSchema, candidateReviewSchema } from "@/schemas/candidate";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  context: RouteContext<"/api/admin/candidates/[id]/duplicate">,
) {
  const isAdmin = await readAdminSession();
  if (!isAdmin) {
    return jsonError("请先登录管理员账号。", 401);
  }

  const { id } = await context.params;
  const parsedId = candidateIdSchema.safeParse(id);
  if (!parsedId.success) {
    return zodErrorResponse(parsedId.error);
  }

  const body = await readJsonBody(request, 2048);
  if (!body.ok) {
    return body.response;
  }
  const parsed = candidateReviewSchema.safeParse(body.data);
  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  try {
    const candidate = await closeCandidate(
      parsedId.data,
      "DUPLICATE",
      parsed.data.reviewNote,
    );
    return jsonOk(toCandidateDto(candidate));
  } catch (error) {
    return candidateMutationErrorResponse(error, "标记重复失败，请稍后重试。");
  }
}

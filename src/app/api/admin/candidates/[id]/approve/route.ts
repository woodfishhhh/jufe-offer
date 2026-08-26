import { NextRequest } from "next/server";
import { readAdminSession } from "@/lib/auth";
import { candidateMutationErrorResponse } from "@/lib/candidate-http";
import {
  approveCandidate,
  toCandidateDto,
  toPublishedResourceDto,
} from "@/lib/candidates";
import { jsonError, jsonOk, zodErrorResponse } from "@/lib/http";
import { readJsonBody } from "@/lib/request-body";
import { candidateApproveSchema, candidateIdSchema } from "@/schemas/candidate";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  context: RouteContext<"/api/admin/candidates/[id]/approve">,
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
  const parsed = candidateApproveSchema.safeParse(body.data);
  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  try {
    const result = await approveCandidate(parsedId.data);
    return jsonOk({
      candidate: toCandidateDto(result.candidate),
      resource: toPublishedResourceDto(result.resource),
    });
  } catch (error) {
    return candidateMutationErrorResponse(error, "通过候选失败，请稍后重试。");
  }
}

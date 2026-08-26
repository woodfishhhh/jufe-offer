import "server-only";

import { Prisma } from "@prisma/client";
import {
  CandidateNotFoundError,
  CandidateResourceConflictError,
  CandidateStateConflictError,
} from "@/lib/candidates";
import { jsonError } from "@/lib/http";

export function candidateMutationErrorResponse(error: unknown, fallbackMessage: string) {
  if (error instanceof CandidateNotFoundError) {
    return jsonError("候选不存在。", 404);
  }
  if (error instanceof CandidateStateConflictError) {
    return jsonError("候选状态已经变化，请刷新后重试。", 409);
  }
  if (error instanceof CandidateResourceConflictError) {
    return jsonError("正式资源中已存在相同 URL，请改为标记重复。", 409);
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return jsonError("候选或资源与现有记录冲突，请刷新后重试。", 409);
  }
  return jsonError(fallbackMessage, 500);
}

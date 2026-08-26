import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { CandidateStateConflictError, ingestCandidate } from "@/lib/candidates";
import { getClientIp, jsonError, zodErrorResponse } from "@/lib/http";
import { authenticateOpenClaw } from "@/lib/openclaw-auth";
import { consumeRateLimit } from "@/lib/rate-limit";
import { readJsonBody } from "@/lib/request-body";
import { candidateIngestSchema } from "@/schemas/candidate";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 64 * 1024;
const INGEST_RATE_LIMIT = { windowMs: 60 * 1000, maxAttempts: 60 };

export async function POST(request: NextRequest) {
  const auth = authenticateOpenClaw(request.headers.get("authorization"));
  if (!auth.ok && auth.status === 503) {
    return jsonError(auth.message, auth.status);
  }

  const limit = consumeRateLimit(`openclaw:${getClientIp(request)}`, INGEST_RATE_LIMIT);
  if (!limit.ok) {
    const response = jsonError("请求过于频繁，请稍后重试。", 429);
    response.headers.set(
      "Retry-After",
      String(Math.max(1, Math.ceil(limit.retryAfterMs / 1000))),
    );
    return response;
  }

  if (!auth.ok) {
    return jsonError(auth.message, auth.status);
  }

  const body = await readJsonBody(request, MAX_BODY_BYTES);
  if (!body.ok) {
    return body.response;
  }

  const parsed = candidateIngestSchema.safeParse(body.data);
  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  try {
    const result = await ingestCandidate(parsed.data);
    return NextResponse.json(
      {
        ok: true,
        candidateId: result.candidateId,
        action: result.action,
      },
      { status: result.action === "duplicate" ? 200 : result.created ? 201 : 200 },
    );
  } catch (error) {
    if (error instanceof CandidateStateConflictError) {
      return jsonError("候选已经完成审核，不能由 OpenClaw 覆盖或重新发布。", 409);
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("externalId 或 dedupeKey 与现有候选冲突。", 409);
    }
    return jsonError("候选入库失败，请稍后重试。", 500);
  }
}

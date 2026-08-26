import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiErrorBody = {
  error: {
    message: string;
    fields?: Record<string, string>;
  };
};

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function jsonError(
  message: string,
  status = 400,
  fields?: Record<string, string>,
) {
  const body: ApiErrorBody = { error: { message, ...(fields ? { fields } : {}) } };
  return NextResponse.json(body, { status });
}

export function zodErrorResponse(error: ZodError) {
  const fields: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "form";
    if (!fields[key]) {
      fields[key] = issue.message;
    }
  }

  return jsonError("提交内容未通过校验。", 400, fields);
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}

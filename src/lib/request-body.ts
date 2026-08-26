import { jsonError } from "@/lib/http";

type JsonBodyResult =
  { ok: true; data: unknown } | { ok: false; response: ReturnType<typeof jsonError> };

export async function readJsonBody(
  request: Request,
  maxBytes: number,
): Promise<JsonBodyResult> {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const declaredBytes = Number(contentLength);
    if (
      !Number.isSafeInteger(declaredBytes) ||
      declaredBytes < 0 ||
      declaredBytes > maxBytes
    ) {
      return {
        ok: false,
        response: jsonError("请求体过大。", 413),
      };
    }
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return {
      ok: false,
      response: jsonError("请求体无法读取。", 400),
    };
  }

  if (Buffer.byteLength(raw, "utf8") > maxBytes) {
    return {
      ok: false,
      response: jsonError("请求体过大。", 413),
    };
  }

  try {
    return { ok: true, data: JSON.parse(raw) as unknown };
  } catch {
    return {
      ok: false,
      response: jsonError("请求格式不正确。", 400),
    };
  }
}

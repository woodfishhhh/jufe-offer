import { readVisitorCount } from "@/lib/visitor-count";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const responseHeaders = {
  "Cache-Control": "no-store, max-age=0",
};

export async function GET() {
  try {
    return Response.json(
      { total: await readVisitorCount() },
      { headers: responseHeaders },
    );
  } catch {
    return Response.json(
      { error: "Visitor count is temporarily unavailable." },
      { headers: responseHeaders, status: 503 },
    );
  }
}

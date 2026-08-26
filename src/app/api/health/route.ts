import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const headers = {
  "Cache-Control": "no-store, max-age=0",
};

export async function GET() {
  const checkedAt = new Date().toISOString();
  const revision = process.env.APP_REVISION ?? "unknown";

  try {
    await prisma.$queryRaw`SELECT 1`;

    return Response.json(
      { ok: true, database: "ready", revision, checkedAt },
      { headers },
    );
  } catch {
    return Response.json(
      { ok: false, database: "unavailable", revision, checkedAt },
      { headers, status: 503 },
    );
  }
}

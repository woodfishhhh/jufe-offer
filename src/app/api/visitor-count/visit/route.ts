import { type NextRequest, NextResponse } from "next/server";
import { countVisitor, isAutomatedVisitor, readVisitorCount } from "@/lib/visitor-count";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const COUNTED_COOKIE = "jufe_offer_visitor_counted";
const COUNTED_VALUE = "v1";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 400;
const responseHeaders = {
  "Cache-Control": "no-store, max-age=0",
};

export async function POST(request: NextRequest) {
  try {
    const alreadyCounted = request.cookies.get(COUNTED_COOKIE)?.value === COUNTED_VALUE;
    const automated = isAutomatedVisitor(request.headers.get("user-agent"));
    const shouldCount = !alreadyCounted && !automated;
    const total = shouldCount ? await countVisitor() : await readVisitorCount();
    const response = NextResponse.json({ total }, { headers: responseHeaders });

    if (shouldCount) {
      response.cookies.set({
        name: COUNTED_COOKIE,
        value: COUNTED_VALUE,
        httpOnly: true,
        maxAge: COOKIE_MAX_AGE_SECONDS,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return response;
  } catch {
    return NextResponse.json(
      { error: "Visitor count is temporarily unavailable." },
      { headers: responseHeaders, status: 503 },
    );
  }
}

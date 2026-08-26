import { jsonOk } from "@/lib/http";
import { getSessionCookieOptions, SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = jsonOk({ authenticated: false });
  response.cookies.set(SESSION_COOKIE, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}

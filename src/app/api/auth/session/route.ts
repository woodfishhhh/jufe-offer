import { readAdminSession } from "@/lib/auth";
import { jsonOk } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  const authenticated = await readAdminSession();
  return jsonOk({ authenticated });
}

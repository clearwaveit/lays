import { clearAdminSessionCookie } from "@/app/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = Response.json({ ok: true });
  response.headers.append("Set-Cookie", clearAdminSessionCookie());
  return response;
}

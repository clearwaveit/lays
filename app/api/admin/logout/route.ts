import { ADMIN_SESSION_COOKIE } from "@/app/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = Response.json({ ok: true });
  response.headers.append(
    "Set-Cookie",
    `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  );
  return response;
}

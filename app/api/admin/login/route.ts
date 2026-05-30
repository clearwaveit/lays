import {
  ADMIN_SESSION_COOKIE,
  adminSessionToken,
  isValidAdminLogin,
} from "@/app/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { username?: string; password?: string }
    | null;

  if (!body || !isValidAdminLogin(body.username ?? "", body.password ?? "")) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const response = Response.json({ ok: true });
  response.headers.append(
    "Set-Cookie",
    `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(
      adminSessionToken(),
    )}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`,
  );
  return response;
}

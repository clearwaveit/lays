import {
  buildAdminSessionCookie,
  getAdminAuthMisconfiguration,
  isValidAdminLogin,
} from "@/app/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const misconfiguration = getAdminAuthMisconfiguration();
  if (misconfiguration) {
    console.error("Admin auth misconfigured:", misconfiguration);
    return Response.json({ error: "Admin login is not configured" }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as
    | { username?: string; password?: string }
    | null;

  if (!body || !isValidAdminLogin(body.username ?? "", body.password ?? "")) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const response = Response.json({ ok: true });
  response.headers.append(
    "Set-Cookie",
    buildAdminSessionCookie(60 * 60 * 24 * 7),
  );
  return response;
}

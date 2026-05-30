import { createHmac } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "lays_admin_session";

const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_PASSWORD = "admin123";

export function adminUsername() {
  return process.env.ADMIN_USERNAME || DEFAULT_ADMIN_USERNAME;
}

export function adminPassword() {
  return process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
}

export function getAdminAuthMisconfiguration(): string | null {
  if (process.env.NODE_ENV !== "production") return null;
  if (!process.env.ADMIN_USERNAME?.trim()) {
    return "ADMIN_USERNAME is not set";
  }
  if (!process.env.ADMIN_PASSWORD?.trim()) {
    return "ADMIN_PASSWORD is not set";
  }
  if (!process.env.ADMIN_SESSION_SECRET?.trim()) {
    return "ADMIN_SESSION_SECRET is not set";
  }
  if (process.env.ADMIN_PASSWORD.length < 12) {
    return "ADMIN_PASSWORD must be at least 12 characters in production";
  }
  return null;
}

export function adminSessionToken() {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (secret) {
    return createHmac("sha256", secret).update("lays-admin-session").digest("hex");
  }
  if (process.env.NODE_ENV === "production") {
    return "";
  }
  return `${adminUsername()}:${adminPassword()}:lays-admin-session`;
}

export function isValidAdminSession(token: string | undefined) {
  if (getAdminAuthMisconfiguration()) return false;
  const expected = adminSessionToken();
  return Boolean(expected) && token === expected;
}

export function isValidAdminLogin(username: string, password: string) {
  if (getAdminAuthMisconfiguration()) return false;
  return username === adminUsername() && password === adminPassword();
}

function secureCookieSuffix() {
  return process.env.NODE_ENV === "production" ? "; Secure" : "";
}

export function buildAdminSessionCookie(maxAgeSeconds: number) {
  return `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(
    adminSessionToken(),
  )}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secureCookieSuffix()}`;
}

export function clearAdminSessionCookie() {
  return `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureCookieSuffix()}`;
}

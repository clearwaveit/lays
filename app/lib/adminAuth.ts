export const ADMIN_SESSION_COOKIE = "lays_admin_session";

const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_PASSWORD = "admin123";

export function adminUsername() {
  return process.env.ADMIN_USERNAME || DEFAULT_ADMIN_USERNAME;
}

export function adminPassword() {
  return process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
}

export function adminSessionToken() {
  return (
    process.env.ADMIN_SESSION_TOKEN ||
    `${adminUsername()}:${adminPassword()}:lays-admin-session`
  );
}

export function isValidAdminSession(token: string | undefined) {
  return token === adminSessionToken();
}

export function isValidAdminLogin(username: string, password: string) {
  return username === adminUsername() && password === adminPassword();
}

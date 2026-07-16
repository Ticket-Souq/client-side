import { fetchWithTimeout } from "./fetchWithTimeout";
import { getRoles, hasRole, parseJwt } from "./jwt";

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
const HEADER_ACCESS = "Authentication";
const HEADER_REFRESH = "Refresh";

export function setTokens(access: string, refresh?: string) {
  localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem("user");
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

export function getUserRoles(): string[] {
  const token = getAccessToken();
  if (!token) return [];
  return getRoles(token);
}

export function hasUserRole(role: string): boolean {
  const token = getAccessToken();
  if (!token) return false;
  return hasRole(token, role);
}

export function getUserEmail(): string | undefined {
  const token = getAccessToken();
  if (!token) return undefined;
  return parseJwt(token)?.email;
}

export async function authFetch(
  url: string,
  options: RequestInit & { timeout?: number } = {},
): Promise<Response> {
  const access = getAccessToken();
  const refresh = getRefreshToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (access) headers[HEADER_ACCESS] = access;
  if (refresh) headers[HEADER_REFRESH] = refresh;

  const res = await fetchWithTimeout(url, { ...options, headers });

  if (res.status === 401) {
    clearTokens();
    return res;
  }

  const newAccess = res.headers.get(HEADER_ACCESS);
  const newRefresh = res.headers.get(HEADER_REFRESH);
  if (newAccess) setTokens(newAccess, newRefresh ?? undefined);

  return res;
}

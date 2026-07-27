import { API } from "./api";
import { fetchWithTimeout } from "./fetchWithTimeout";
import { getRoles, hasRole, isTokenExpired, isExpiringSoon, parseJwt } from "./jwt";
import { showLoading, hideLoading } from "./loading";

const ACCESS_COOKIE = "sq_access";
const REFRESH_COOKIE = "sq_refresh";
const ACCESS_MAX_AGE = 300;       // 5 minutes
const REFRESH_MAX_AGE = 604800;   // 7 days

// ── Cookie helpers ────────────────────────────────────────────────────────────

function setCookie(name: string, value: string, maxAge: number) {
  const expires = new Date(Date.now() + maxAge * 1000).toUTCString();
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `max-age=${maxAge}`,
    `expires=${expires}`,
    "path=/",
    "SameSite=Strict",
  ];
  if (location.protocol === "https:") parts.push("Secure");
  document.cookie = parts.join("; ");
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; max-age=0; path=/`;
}

// ── Token storage ─────────────────────────────────────────────────────────────

export function setTokens(access: string, refresh?: string) {
  setCookie(ACCESS_COOKIE, access, ACCESS_MAX_AGE);
  if (refresh) setCookie(REFRESH_COOKIE, refresh, REFRESH_MAX_AGE);
}

export function getAccessToken(): string | null {
  return getCookie(ACCESS_COOKIE);
}

export function getRefreshToken(): string | null {
  return getCookie(REFRESH_COOKIE);
}

export function clearTokens() {
  deleteCookie(ACCESS_COOKIE);
  deleteCookie(REFRESH_COOKIE);
}

export function isAuthenticated(): boolean {
  const access = getAccessToken();
  return !!access && !isTokenExpired(access);
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

// ── Refresh logic ─────────────────────────────────────────────────────────────

let refreshPromise: Promise<{ access: string; refresh: string }> | null = null;

async function doRefresh(): Promise<{ access: string; refresh: string }> {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error("No refresh token");

  const res = await fetchWithTimeout(API.auth.refresh, {
    method: "POST",
    headers: { "X-Refresh-Token": `Bearer ${refresh}` },
  });

  if (!res.ok) throw new Error("Refresh failed");

  const data: { access: string; refresh: string } = await res.json();
  setTokens(data.access, data.refresh);
  return data;
}

async function tryRefresh(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  await refreshPromise;
}

// ── Authenticated fetch ───────────────────────────────────────────────────────

function saveTokensFromHeaders(res: Response) {
  const newAccess = res.headers.get("Authorization");
  const newRefresh = res.headers.get("X-Refresh-Token");
  if (newAccess) setTokens(newAccess.replace(/^Bearer\s+/i, ""), newRefresh?.replace(/^Bearer\s+/i, ""));
}

export async function authFetch(
  url: string,
  options: RequestInit & { timeout?: number } = {},
): Promise<Response> {
  showLoading();
  try {
    // If access token is missing or about to expire, refresh proactively
    const access = getAccessToken();
    if (!access || isTokenExpired(access) || isExpiringSoon(access, 10)) {
      if (getRefreshToken()) {
        try {
          await tryRefresh();
        } catch {
          clearTokens();
          window.location.href = "/auth/login";
          throw new Error("Session expired");
        }
      }
    }

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    const currentAccess = getAccessToken();
    if (currentAccess) headers["Authorization"] = `Bearer ${currentAccess}`;

    const res = await fetchWithTimeout(url, { ...options, headers });

    // Save any new tokens the backend sent back
    saveTokensFromHeaders(res);

    // If server says 401, try refresh once and retry
    if (res.status === 401 && getRefreshToken()) {
      try {
        await tryRefresh();
      } catch {
        clearTokens();
        window.location.href = "/auth/login";
        throw new Error("Session expired");
      }

      const retryAccess = getAccessToken();
      if (retryAccess) headers["Authorization"] = `Bearer ${retryAccess}`;
      const retryRes = await fetchWithTimeout(url, { ...options, headers });
      saveTokensFromHeaders(retryRes);
      return retryRes;
    }

    return res;
  } finally {
    hideLoading();
  }
}

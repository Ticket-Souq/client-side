export interface JwtPayload {
  sub: string;
  jti?: string;
  email?: string;
  roles?: string[];
  type?: string;
  sid?: string;
  iat?: number;
  exp?: number;
  iss?: string;
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  try {
    return atob(base64);
  } catch {
    return "";
  }
}

export function parseJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const decoded = base64UrlDecode(parts[1]);
    if (!decoded) return null;
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

export function getRoles(token: string): string[] {
  const payload = parseJwt(token);
  return payload?.roles ?? [];
}

export function hasRole(token: string, role: string): boolean {
  const roles = getRoles(token);
  const target = role.toUpperCase();
  return roles.some((r) => r === target || r === `ROLE_${target}` || r.toUpperCase() === target);
}

export function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 < Date.now();
}

export function isExpiringSoon(token: string, seconds: number): boolean {
  const payload = parseJwt(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 < Date.now() + seconds * 1000;
}

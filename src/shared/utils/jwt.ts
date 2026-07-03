/**
 * [REFRESH TOKENS] Minimal JWT utilities for clients.
 *
 * We avoid heavy libraries. These are safe for reading public claims (exp, iat, etc.).
 * Never trust claims for authorization — that must be done server-side.
 *
 * Use cases:
 * - Proactive refresh: if (exp - now < 2 * 60) refresh before making requests.
 * - Display "session expires in..."
 */

export interface JwtPayload {
  exp?: number; // seconds since epoch
  iat?: number;
  sub?: string;
  jti?: string;
  [key: string]: unknown;
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // base64url -> base64
    let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    // Pad
    while (payload.length % 4) payload += '=';

    const decoded = atob(payload);
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

export function getAccessTokenExpirySeconds(token: string | null | undefined): number | null {
  if (!token) return null;
  const payload = decodeJwt(token);
  return payload?.exp ?? null;
}

/**
 * Returns seconds until expiry (can be negative if already expired).
 */
export function getSecondsUntilExpiry(token: string | null | undefined): number | null {
  const exp = getAccessTokenExpirySeconds(token);
  if (!exp) return null;
  return exp - Math.floor(Date.now() / 1000);
}

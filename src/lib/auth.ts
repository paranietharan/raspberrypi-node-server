import { timingSafeEqual } from "node:crypto";

// Unconfigured authentication is permitted only for the documented local-only setup.
export function isAuthorized(header: string | null, username?: string, password?: string): boolean {
  if (!username && !password) return true;
  if (!username || !password || !header) return false;
  const match = /^Basic ([A-Za-z0-9+/]+={0,2})$/i.exec(header);
  if (!match) return false;
  const actual = Buffer.from(match[1], "base64");
  const expected = Buffer.from(`${username}:${password}`);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

import { createHmac, timingSafeEqual } from "node:crypto";

function secret() {
  const value = process.env.RSVP_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("RSVP_SESSION_SECRET must be at least 32 characters.");
  return value;
}
function signature(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}
export function createToken(payload: Record<string, unknown>, ttlSeconds = 1800) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now()/1000) + ttlSeconds })).toString("base64url");
  return `${body}.${signature(body)}`;
}
export function verifyToken(token: string, expectedType: string) {
  try {
    const [body, sig] = token.split(".");
    if (!body || !sig) return null;
    const expected = signature(body);
    const a = Buffer.from(sig), b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a,b)) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (payload.type !== expectedType || typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now()/1000)) return null;
    return payload as Record<string, unknown>;
  } catch { return null; }
}
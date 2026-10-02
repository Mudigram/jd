import crypto from "crypto";
import { cookies } from "next/headers";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@julianportfolio.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "julian2026!";
const SESSION_SECRET = process.env.SESSION_SECRET || "julian-secret-portfolio-admin-token-2026";
export const COOKIE_NAME = "admin_session";

export function checkCredentials(email: string, pass: string): boolean {
  return email.trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase() && pass === ADMIN_PASSWORD;
}

export function createSessionToken(email: string): string {
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
  const payload = JSON.stringify({ email, expiresAt });
  const base64Payload = Buffer.from(payload).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(base64Payload)
    .digest("base64url");
  return `${base64Payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [base64Payload, signature] = parts;
  const expectedSig = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(base64Payload)
    .digest("base64url");

  if (signature !== expectedSig) return false;

  try {
    const payload = JSON.parse(Buffer.from(base64Payload, "base64url").toString("utf-8"));
    if (Date.now() > payload.expiresAt) return false;
    return true;
  } catch {
    return false;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

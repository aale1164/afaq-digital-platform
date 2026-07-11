import "server-only";
import { createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

const fallbackSecret = process.env.NODE_ENV === "production"
  ? randomBytes(48).toString("base64url")
  : "afaq-development-secret-change-before-production-2026";

function secret() {
  return env.VISITOR_HMAC_SECRET && env.VISITOR_HMAC_SECRET.length >= 32 ? env.VISITOR_HMAC_SECRET : fallbackSecret;
}

export function hmac(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createSignedVisitorId() {
  const id = randomUUID();
  return `${id}.${hmac(`visitor:${id}`)}`;
}

export function readSignedVisitorId(cookie: string | undefined) {
  if (!cookie) return null;
  const [id, signature, extra] = cookie.split(".");
  if (!id || !signature || extra || !safeEqual(signature, hmac(`visitor:${id}`))) return null;
  return id;
}

export function signPayload(payload: object) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${hmac(`payload:${body}`)}`;
}

export function verifyPayload<T>(token: string): T | null {
  const [body, signature, extra] = token.split(".");
  if (!body || !signature || extra || !safeEqual(signature, hmac(`payload:${body}`))) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

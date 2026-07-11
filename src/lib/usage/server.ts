import "server-only";
import { randomUUID } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSignedVisitorId, hmac, readSignedVisitorId, signPayload, verifyPayload } from "@/lib/security/hmac";
import { getTool, type ToolDefinition } from "@/lib/tool-registry";
import { consumeQuota } from "@/lib/usage/quota";

const VISITOR_COOKIE = "afaq_guest";
const demoCounts = new Map<string, number>();
const demoOperations = new Set<string>();

export type UsageIdentity = {
  subjectType: "user" | "visitor";
  subject: string;
  ipHash: string;
  visitorCookie?: string;
  emailConfirmed: boolean;
};

export type PermitPayload = {
  version: 1;
  operationId: string;
  subjectType: "user" | "visitor";
  subject: string;
  toolSlug: string;
  issuedAt: number;
  expiresAt: number;
};

function clientIp(request: NextRequest) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export async function getUsageIdentity(request: NextRequest): Promise<UsageIdentity> {
  const ipHash = hmac(`ip:${clientIp(request)}`);
  const user = await getCurrentUser();
  if (user) {
    return { subjectType: "user", subject: user.id, ipHash, emailConfirmed: user.emailConfirmed };
  }
  const signedCookie = request.cookies.get(VISITOR_COOKIE)?.value;
  let visitorId = readSignedVisitorId(signedCookie);
  let visitorCookie: string | undefined;
  if (!visitorId) {
    visitorCookie = createSignedVisitorId();
    visitorId = readSignedVisitorId(visitorCookie)!;
  }
  return {
    subjectType: "visitor",
    subject: hmac(`fingerprint:${visitorId}:${ipHash}`),
    ipHash,
    visitorCookie,
    emailConfirmed: false,
  };
}

export function applyVisitorCookie(response: NextResponse, identity: UsageIdentity) {
  if (!identity.visitorCookie) return;
  response.cookies.set(VISITOR_COOKIE, identity.visitorCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

async function runtimeTool(toolSlug: string): Promise<ToolDefinition | null> {
  const base = getTool(toolSlug);
  if (!base) return null;
  const admin = createSupabaseAdminClient();
  if (!admin) return base;
  const { data } = await admin.from("tool_registry").select("status,access_level,anonymous_limit,member_limit,credit_cost,maintenance_mode").eq("slug", toolSlug).maybeSingle();
  if (!data) return base;
  return {
    ...base,
    status: data.status as ToolDefinition["status"],
    accessLevel: data.access_level as ToolDefinition["accessLevel"],
    anonymousLimit: Number(data.anonymous_limit),
    memberLimit: data.member_limit === null ? null : Number(data.member_limit),
    creditCost: Number(data.credit_cost),
    maintenanceMode: Boolean(data.maintenance_mode),
  };
}

async function anonymousFreeRuns() {
  const admin = createSupabaseAdminClient();
  if (!admin) return env.ANONYMOUS_FREE_RUNS;
  const { data } = await admin.from("site_settings").select("value").eq("key", "anonymous_free_runs").maybeSingle();
  const value = Number(data?.value);
  return Number.isInteger(value) && value >= 0 && value <= 100 ? value : env.ANONYMOUS_FREE_RUNS;
}

async function limitFor(identity: UsageIdentity, tool: ToolDefinition) {
  if (identity.subjectType === "visitor") return Math.min(await anonymousFreeRuns(), tool.anonymousLimit);
  return tool.memberLimit ?? 2_147_483_647;
}

async function readCount(identity: UsageIdentity, toolSlug: string) {
  const admin = createSupabaseAdminClient();
  if (!admin) return demoCounts.get(identity.subjectType === "visitor" ? `visitor:${identity.subject}` : `user:${identity.subject}:${toolSlug}`) ?? 0;
  if (identity.subjectType === "visitor") {
    const { data } = await admin
      .from("anonymous_usage")
      .select("total_runs")
      .eq("visitor_hash", identity.subject)
      .maybeSingle();
    return Number(data?.total_runs ?? 0);
  }
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const { data: profile } = await admin.from("profiles").select("usage_reset_at").eq("id", identity.subject).maybeSingle();
  const resetAt = profile?.usage_reset_at ? new Date(String(profile.usage_reset_at)) : null;
  const start = resetAt && resetAt > monthStart ? resetAt : monthStart;
  const { count } = await admin
    .from("tool_usage")
    .select("id", { head: true, count: "exact" })
    .eq("user_id", identity.subject)
    .eq("tool_slug", toolSlug)
    .eq("status", "succeeded")
    .gte("created_at", start.toISOString());
  return count ?? 0;
}

export async function issuePermit(identity: UsageIdentity, toolSlug: string) {
  const tool = await runtimeTool(toolSlug);
  if (!tool || !["active", "external"].includes(tool.status) || tool.maintenanceMode) {
    return { allowed: false as const, reason: "unavailable", remaining: 0 };
  }
  if (tool.accessLevel !== "public" && identity.subjectType === "visitor") {
    return { allowed: false as const, reason: "registration_required", remaining: 0 };
  }
  if (identity.subjectType === "user" && !identity.emailConfirmed) {
    return { allowed: false as const, reason: "email_confirmation_required", remaining: 0 };
  }
  const limit = await limitFor(identity, tool);
  const count = await readCount(identity, toolSlug);
  if (count >= limit) return { allowed: false as const, reason: "limit_reached", remaining: 0 };
  const now = Date.now();
  const payload: PermitPayload = {
    version: 1,
    operationId: randomUUID(),
    subjectType: identity.subjectType,
    subject: identity.subject,
    toolSlug,
    issuedAt: now,
    expiresAt: now + 10 * 60 * 1000,
  };
  return { allowed: true as const, token: signPayload(payload), operationId: payload.operationId, remaining: Math.max(0, limit - count) };
}

export function readPermit(token: string, identity: UsageIdentity, expectedTool?: string) {
  const payload = verifyPayload<PermitPayload>(token);
  if (!payload || payload.version !== 1 || payload.expiresAt < Date.now() || payload.issuedAt > Date.now() + 30_000) return null;
  if (payload.subjectType !== identity.subjectType || payload.subject !== identity.subject) return null;
  if (expectedTool && payload.toolSlug !== expectedTool) return null;
  return payload;
}

export async function consumePermit(payload: PermitPayload, identity: UsageIdentity) {
  const tool = await runtimeTool(payload.toolSlug);
  if (!tool) return { success: false, remaining: 0, reason: "unavailable" };
  const limit = await limitFor(identity, tool);
  const admin = createSupabaseAdminClient();
  if (!admin) {
    const key = identity.subjectType === "visitor" ? `visitor:${identity.subject}` : `user:${identity.subject}:${payload.toolSlug}`;
    const count = demoCounts.get(key) ?? 0;
    const quota = consumeQuota(count, limit, demoOperations.has(payload.operationId));
    if (!quota.success) return { success: false, remaining: 0, reason: "limit_reached" };
    demoCounts.set(key, quota.nextCount);
    if (!quota.idempotent) demoOperations.add(payload.operationId);
    return { success: true, remaining: quota.remaining, idempotent: quota.idempotent };
  }

  const rpcName = identity.subjectType === "visitor" ? "consume_anonymous_tool_usage" : "consume_user_tool_usage";
  const args = identity.subjectType === "visitor"
    ? { p_visitor_hash: identity.subject, p_ip_hash: identity.ipHash, p_tool_slug: payload.toolSlug, p_operation_id: payload.operationId, p_limit: limit }
    : { p_user_id: identity.subject, p_tool_slug: payload.toolSlug, p_operation_id: payload.operationId, p_limit: limit };
  const { data, error } = await admin.rpc(rpcName, args);
  if (error) return { success: false, remaining: 0, reason: "database_error" };
  const result = (Array.isArray(data) ? data[0] : data) as { success?: boolean; remaining?: number; idempotent?: boolean } | null;
  return {
    success: result?.success === true,
    remaining: Number(result?.remaining ?? 0),
    idempotent: result?.idempotent === true,
    reason: result?.success ? undefined : "limit_reached",
  };
}

export function clearDemoUsage() {
  demoCounts.clear();
  demoOperations.clear();
}

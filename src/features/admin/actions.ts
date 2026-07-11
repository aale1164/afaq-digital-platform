"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { canManageRole, requireRole, type AppRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

async function targetRole(admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>, userId: string): Promise<AppRole> {
  const { data } = await admin.from("user_roles").select("roles(name)").eq("user_id", userId);
  const roles = (data ?? []).flatMap((row) => {
    const role = row.roles as unknown as { name?: string } | { name?: string }[] | null;
    return Array.isArray(role) ? role.map((item) => item.name) : [role?.name];
  });
  return (roles.find((role) => role === "OWNER" || role === "ADMIN" || role === "SUPPORT" || role === "DEVELOPER") as AppRole | undefined) ?? "USER";
}

async function audit(admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>, actorId: string, action: string, targetType: string, targetId: string, metadata: object = {}) {
  await admin.from("admin_audit_logs").insert({ actor_id: actorId, action, target_type: targetType, target_id: targetId, metadata });
}

export async function setMemberBlockedAction(formData: FormData) {
  const actor = await requireRole(["OWNER", "ADMIN"]);
  const parsed = z.object({ userId: z.string().uuid(), blocked: z.enum(["true", "false"]) }).safeParse({ userId: formData.get("userId"), blocked: formData.get("blocked") });
  if (!parsed.success) return;
  const admin = createSupabaseAdminClient(); if (!admin) return;
  const role = await targetRole(admin, parsed.data.userId);
  if (!canManageRole(actor.role, role)) return;
  const blocked = parsed.data.blocked === "true";
  await admin.from("profiles").update({ blocked }).eq("id", parsed.data.userId);
  await admin.auth.admin.updateUserById(parsed.data.userId, { ban_duration: blocked ? "876000h" : "none" });
  await audit(admin, actor.id, blocked ? "member.block" : "member.unblock", "user", parsed.data.userId);
  revalidatePath("/admin");
}

export async function changeMemberRoleAction(formData: FormData) {
  const actor = await requireRole(["OWNER", "ADMIN"]);
  const parsed = z.object({ userId: z.string().uuid(), role: z.enum(["ADMIN", "SUPPORT", "USER", "DEVELOPER"]) }).safeParse({ userId: formData.get("userId"), role: formData.get("role") });
  if (!parsed.success) return;
  const admin = createSupabaseAdminClient(); if (!admin) return;
  const currentRole = await targetRole(admin, parsed.data.userId);
  if (!canManageRole(actor.role, currentRole) || !canManageRole(actor.role, parsed.data.role)) return;
  const { data: roleRow } = await admin.from("roles").select("id").eq("name", parsed.data.role).single();
  if (!roleRow) return;
  await admin.from("user_roles").delete().eq("user_id", parsed.data.userId);
  await admin.from("user_roles").insert({ user_id: parsed.data.userId, role_id: roleRow.id, assigned_by: actor.id });
  await audit(admin, actor.id, "member.role.change", "user", parsed.data.userId, { from: currentRole, to: parsed.data.role });
  revalidatePath("/admin");
}

export async function resetMemberUsageAction(formData: FormData) {
  const actor = await requireRole(["OWNER", "ADMIN"]);
  const userId = z.string().uuid().safeParse(formData.get("userId"));
  if (!userId.success) return;
  const admin = createSupabaseAdminClient(); if (!admin) return;
  const role = await targetRole(admin, userId.data);
  if (!canManageRole(actor.role, role)) return;
  await admin.from("profiles").update({ usage_reset_at: new Date().toISOString() }).eq("id", userId.data);
  await audit(admin, actor.id, "member.usage.reset", "user", userId.data);
  revalidatePath("/admin");
}

export async function grantCreditsAction(formData: FormData) {
  const actor = await requireRole(["OWNER", "ADMIN"]);
  const parsed = z.object({ userId: z.string().uuid(), amount: z.coerce.number().int().min(1).max(100000), reason: z.string().trim().min(3).max(200) }).safeParse({ userId: formData.get("userId"), amount: formData.get("amount"), reason: formData.get("reason") });
  if (!parsed.success) return;
  const admin = createSupabaseAdminClient(); if (!admin) return;
  const role = await targetRole(admin, parsed.data.userId);
  if (!canManageRole(actor.role, role)) return;
  await admin.rpc("grant_user_credits", { p_user_id: parsed.data.userId, p_amount: parsed.data.amount, p_reason: parsed.data.reason, p_actor_id: actor.id });
  await audit(admin, actor.id, "member.credits.grant", "user", parsed.data.userId, { amount: parsed.data.amount, reason: parsed.data.reason });
  revalidatePath("/admin");
}

export async function updateSiteSettingsAction(formData: FormData) {
  const actor = await requireRole(["OWNER"]);
  const parsed = z.object({
    xUrl: z.string().url().refine((value) => /^https:\/\/(www\.)?(x\.com|twitter\.com)\//i.test(value), "رابط X غير صالح"),
    anonymousRuns: z.coerce.number().int().min(0).max(100),
  }).safeParse({ xUrl: formData.get("xUrl"), anonymousRuns: formData.get("anonymousRuns") });
  if (!parsed.success) return;
  const admin = createSupabaseAdminClient(); if (!admin) return;
  await admin.from("site_settings").upsert([
    { key: "x_url", value: parsed.data.xUrl, is_public: true, updated_by: actor.id },
    { key: "anonymous_free_runs", value: parsed.data.anonymousRuns, is_public: false, updated_by: actor.id },
  ], { onConflict: "key" });
  await audit(admin, actor.id, "site.settings.update", "site", "global", { anonymousRuns: parsed.data.anonymousRuns });
  revalidatePath("/", "layout");
}

export async function updateToolRegistryAction(formData: FormData) {
  const actor = await requireRole(["OWNER", "ADMIN"]);
  const parsed = z.object({
    slug: z.string().regex(/^[a-z0-9-]{2,60}$/),
    status: z.enum(["active", "external", "coming-soon", "maintenance"]),
    accessLevel: z.enum(["public", "member", "premium"]),
    anonymousLimit: z.coerce.number().int().min(0).max(1000),
    memberLimit: z.coerce.number().int().min(0).max(1000000),
    creditCost: z.coerce.number().int().min(0).max(10000),
    maintenanceMode: z.enum(["true", "false"]),
  }).safeParse({
    slug: formData.get("slug"), status: formData.get("status"), accessLevel: formData.get("accessLevel"),
    anonymousLimit: formData.get("anonymousLimit"), memberLimit: formData.get("memberLimit"), creditCost: formData.get("creditCost"), maintenanceMode: formData.get("maintenanceMode"),
  });
  if (!parsed.success) return;
  const admin = createSupabaseAdminClient(); if (!admin) return;
  await admin.from("tool_registry").update({
    status: parsed.data.status,
    access_level: parsed.data.accessLevel,
    anonymous_limit: parsed.data.anonymousLimit,
    member_limit: parsed.data.memberLimit || null,
    credit_cost: parsed.data.creditCost,
    maintenance_mode: parsed.data.maintenanceMode === "true",
    updated_at: new Date().toISOString(),
  }).eq("slug", parsed.data.slug);
  await audit(admin, actor.id, "tool.update", "tool", parsed.data.slug, parsed.data);
  revalidatePath("/admin/tools");
  revalidatePath(`/tools/${parsed.data.slug}`);
}

import "server-only";
import type { AdminMember } from "@/lib/demo-data";
import { demoAudit, demoMembers, demoUsage } from "@/lib/demo-data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function getAdminOverview() {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return {
      demo: true,
      stats: { totalMembers: 1284, newMembers: 47, confirmed: 1196, unconfirmed: 88, todayRuns: 697, monthRuns: 14382, activeNow: 26 },
      members: demoMembers,
      usage: demoUsage,
      audit: demoAudit,
    };
  }

  const startToday = new Date(); startToday.setHours(0, 0, 0, 0);
  const startMonth = new Date(); startMonth.setDate(1); startMonth.setHours(0, 0, 0, 0);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [profiles, todayRuns, monthRuns, newMembers, recentUsage, auditLogs] = await Promise.all([
    admin.from("profiles").select("id,full_name,email,email_confirmed,blocked,last_seen_at,created_at,plan_id,plans(name),user_roles(roles(name))", { count: "exact" }).order("created_at", { ascending: false }).limit(100),
    admin.from("tool_usage").select("id", { count: "exact", head: true }).eq("status", "succeeded").gte("created_at", startToday.toISOString()),
    admin.from("tool_usage").select("id", { count: "exact", head: true }).eq("status", "succeeded").gte("created_at", startMonth.toISOString()),
    admin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", weekAgo.toISOString()),
    admin.from("tool_usage").select("tool_slug").eq("status", "succeeded").gte("created_at", startMonth.toISOString()).limit(5000),
    admin.from("admin_audit_logs").select("action,created_at,actor_id,profiles!admin_audit_logs_actor_id_fkey(full_name)").order("created_at", { ascending: false }).limit(10),
  ]);

  const members: AdminMember[] = (profiles.data ?? []).map((row) => {
    const plans = row.plans as unknown as { name?: string } | null;
    const userRoles = row.user_roles as unknown as { roles?: { name?: string } | { name?: string }[] }[] | null;
    const rawRole = userRoles?.[0]?.roles;
    const roleName = (Array.isArray(rawRole) ? rawRole[0]?.name : rawRole?.name) ?? "USER";
    return {
      id: String(row.id), name: String(row.full_name || "مستخدم"), email: String(row.email || ""), role: roleName as AdminMember["role"], plan: plans?.name || "المجانية",
      confirmed: Boolean(row.email_confirmed), blocked: Boolean(row.blocked), usage: 0,
      lastSeen: row.last_seen_at ? new Intl.RelativeTimeFormat("ar", { numeric: "auto" }).format(-Math.max(1, Math.round((Date.now() - new Date(String(row.last_seen_at)).getTime()) / 3_600_000)), "hour") : "غير معروف",
      joinedAt: String(row.created_at),
    };
  });

  const counts = new Map<string, number>();
  (recentUsage.data ?? []).forEach((row) => counts.set(String(row.tool_slug), (counts.get(String(row.tool_slug)) ?? 0) + 1));
  const total = [...counts.values()].reduce((sum, value) => sum + value, 0) || 1;
  const usage = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tool, count]) => ({ tool, count, share: Math.round((count / total) * 100) }));
  const audit = (auditLogs.data ?? []).map((row) => {
    const profile = row.profiles as unknown as { full_name?: string } | null;
    return { action: String(row.action), actor: profile?.full_name || "مدير", time: new Date(String(row.created_at)).toLocaleString("ar-SA") };
  });
  const confirmed = members.filter((member) => member.confirmed).length;
  const activeNow = members.filter((member) => /دقيقة|الآن/.test(member.lastSeen)).length;
  return {
    demo: false,
    stats: { totalMembers: profiles.count ?? members.length, newMembers: newMembers.count ?? 0, confirmed, unconfirmed: Math.max(0, (profiles.count ?? members.length) - confirmed), todayRuns: todayRuns.count ?? 0, monthRuns: monthRuns.count ?? 0, activeNow },
    members, usage, audit,
  };
}

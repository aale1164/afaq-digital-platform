import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ToolDefinition } from "@/lib/tool-registry";

export async function getRuntimeToolDefinition(base: ToolDefinition): Promise<ToolDefinition> {
  const admin = createSupabaseAdminClient();
  if (!admin) return base;
  const { data } = await admin.from("tool_registry").select("status,access_level,anonymous_limit,member_limit,credit_cost,featured,maintenance_mode,sort_order").eq("slug", base.slug).maybeSingle();
  if (!data) return base;
  return { ...base, status: data.status as ToolDefinition["status"], accessLevel: data.access_level as ToolDefinition["accessLevel"], anonymousLimit: Number(data.anonymous_limit), memberLimit: data.member_limit === null ? null : Number(data.member_limit), creditCost: Number(data.credit_cost), featured: Boolean(data.featured), maintenanceMode: Boolean(data.maintenance_mode), sortOrder: Number(data.sort_order) };
}

export async function getRuntimeTools(tools: ToolDefinition[]) {
  return Promise.all(tools.map(getRuntimeToolDefinition));
}

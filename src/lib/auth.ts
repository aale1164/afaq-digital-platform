import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { appRoles, type AppRole } from "@/lib/permissions";

export { appRoles, canManageRole } from "@/lib/permissions";
export type { AppRole } from "@/lib/permissions";


export type UserContext = {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  emailConfirmed: boolean;
  avatarUrl?: string | null;
};

export async function getCurrentUser(): Promise<UserContext | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const [{ data: profile }, { data: roleRows }] = await Promise.all([
    supabase.from("profiles").select("full_name, avatar_url").eq("id", data.user.id).maybeSingle(),
    supabase.from("user_roles").select("roles(name)").eq("user_id", data.user.id),
  ]);

  const roleNames = (roleRows ?? [])
    .map((row) => {
      const roles = row.roles as unknown as { name?: string } | { name?: string }[] | null;
      return Array.isArray(roles) ? roles[0]?.name : roles?.name;
    })
    .filter((role): role is AppRole => appRoles.includes(role as AppRole));
  const role = appRoles.find((candidate) => roleNames.includes(candidate)) ?? "USER";

  return {
    id: data.user.id,
    email: data.user.email ?? "",
    name: (profile?.full_name as string | undefined) || (data.user.user_metadata?.full_name as string | undefined) || "مستخدم آفاق",
    role,
    emailConfirmed: Boolean(data.user.email_confirmed_at),
    avatarUrl: profile?.avatar_url as string | null | undefined,
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  return user;
}

export async function requireRole(allowed: readonly AppRole[]) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!allowed.includes(user.role)) redirect("/forbidden");
  return user;
}

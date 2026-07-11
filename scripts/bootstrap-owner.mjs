import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();

if (!url || !serviceKey || !ownerEmail) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or OWNER_EMAIL.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: usersPage, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (listError) throw listError;
const user = usersPage.users.find((item) => item.email?.toLowerCase() === ownerEmail);
if (!user) {
  console.error("Register and confirm OWNER_EMAIL first, then run this command again.");
  process.exit(1);
}

const { data: ownerRole, error: roleError } = await supabase.from("roles").select("id").eq("name", "OWNER").single();
if (roleError || !ownerRole) throw roleError || new Error("OWNER role is missing");
const { error: insertError } = await supabase.from("user_roles").upsert({ user_id: user.id, role_id: ownerRole.id, assigned_by: user.id }, { onConflict: "user_id,role_id" });
if (insertError) throw insertError;
console.log(`OWNER role assigned to ${ownerEmail}. Enable MFA from /admin/settings.`);

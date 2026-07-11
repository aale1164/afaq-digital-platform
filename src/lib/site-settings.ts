import "server-only";
import { brand } from "@/lib/brand";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type PublicSiteSettings = { xUrl: string };

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  const admin = createSupabaseAdminClient();
  if (!admin) return { xUrl: brand.xUrl };
  const { data } = await admin.from("site_settings").select("key,value").in("key", ["x_url"]);
  const values = new Map((data ?? []).map((row) => [String(row.key), row.value]));
  const xUrl = String(values.get("x_url") || brand.xUrl);
  return { xUrl: /^https:\/\/(www\.)?(x\.com|twitter\.com)\//i.test(xUrl) ? xUrl : brand.xUrl };
}

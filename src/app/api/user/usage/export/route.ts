import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { featureFlags } from "@/lib/brand";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function cell(value: unknown) { return `"${String(value ?? "").replace(/"/g, '""')}"`; }

export async function GET() {
  const user = await getCurrentUser();
  if (!user && !featureFlags.demoMode) return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
  let rows: unknown[][] = [["الأداة", "الحالة", "التاريخ"]];
  const admin = createSupabaseAdminClient();
  if (user && admin) {
    const { data } = await admin.from("tool_usage").select("tool_slug,status,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5000);
    rows = [...rows, ...(data ?? []).map((item) => [item.tool_slug, item.status, item.created_at])];
  } else {
    rows.push(["photo-editor", "succeeded", "2026-07-11T02:18:00+03:00"], ["qr-studio", "succeeded", "2026-07-10T23:42:00+03:00"]);
  }
  const csv = `\uFEFF${rows.map((row) => row.map(cell).join(",")).join("\r\n")}`;
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="afaq-my-usage.csv"', "Cache-Control": "private, no-store" } });
}

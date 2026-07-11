import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { featureFlags } from "@/lib/brand";
import { getAdminOverview } from "@/lib/admin-data";

function csvCell(value: unknown) { return `"${String(value ?? "").replace(/"/g, '""')}"`; }

export async function GET() {
  const user = await getCurrentUser();
  if (!user && !featureFlags.demoMode) return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
  if (user && user.role !== "OWNER" && user.role !== "ADMIN") return NextResponse.json({ message: "غير مصرح" }, { status: 403 });
  const { members } = await getAdminOverview();
  const rows = [["الاسم", "البريد", "الدور", "الباقة", "مؤكد", "محظور", "الاستخدام", "تاريخ التسجيل"], ...members.map((member) => [member.name, member.email, member.role, member.plan, member.confirmed ? "نعم" : "لا", member.blocked ? "نعم" : "لا", member.usage, member.joinedAt])];
  const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="afaq-members.csv"', "Cache-Control": "private, no-store" } });
}

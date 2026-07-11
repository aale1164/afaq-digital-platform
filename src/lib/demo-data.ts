import type { AppRole, UserContext } from "@/lib/auth";

export const demoOwner: UserContext = {
  id: "demo-owner",
  email: "owner@afaq.demo",
  name: "عدناني",
  role: "OWNER",
  emailConfirmed: true,
  avatarUrl: null,
};

export type AdminMember = {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  plan: string;
  confirmed: boolean;
  blocked: boolean;
  usage: number;
  lastSeen: string;
  joinedAt: string;
};

export const demoMembers: AdminMember[] = [
  { id: "u-1", name: "سارة محمد", email: "sara@example.com", role: "USER", plan: "المجانية", confirmed: true, blocked: false, usage: 18, lastSeen: "منذ 4 دقائق", joinedAt: "2026-07-10" },
  { id: "u-2", name: "خالد عبدالله", email: "khaled@example.com", role: "DEVELOPER", plan: "المطور", confirmed: true, blocked: false, usage: 42, lastSeen: "منذ 18 دقيقة", joinedAt: "2026-07-09" },
  { id: "u-3", name: "نورة علي", email: "noura@example.com", role: "USER", plan: "المجانية", confirmed: false, blocked: false, usage: 2, lastSeen: "منذ يوم", joinedAt: "2026-07-08" },
  { id: "u-4", name: "فهد سالم", email: "fahad@example.com", role: "USER", plan: "التجريبية", confirmed: true, blocked: true, usage: 67, lastSeen: "منذ 3 أيام", joinedAt: "2026-07-02" },
  { id: "u-5", name: "ريم أحمد", email: "reem@example.com", role: "SUPPORT", plan: "الفريق", confirmed: true, blocked: false, usage: 25, lastSeen: "الآن", joinedAt: "2026-06-28" },
];

export const demoUsage = [
  { tool: "محرر الصور الاحترافي", count: 248, share: 36 },
  { tool: "استوديو QR", count: 181, share: 26 },
  { tool: "مختبر المطور", count: 134, share: 19 },
  { tool: "معمل الصور الدُفعي", count: 86, share: 12 },
  { tool: "العلامة المائية", count: 48, share: 7 },
];

export const demoAudit = [
  { action: "تحديث إعدادات الاستخدام المجاني", actor: "عدناني", time: "منذ 12 دقيقة" },
  { action: "تفعيل أداة استوديو QR", actor: "عدناني", time: "منذ ساعة" },
  { action: "منح رصيد تجريبي لعضو", actor: "عدناني", time: "أمس" },
];

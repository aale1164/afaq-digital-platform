import Link from "next/link";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, Coins, ImageIcon, QrCode, Sparkles, WandSparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { demoOwner } from "@/lib/demo-data";

export default async function DashboardPage() {
  const user = (await getCurrentUser()) ?? demoOwner;
  const stats = [["عمليات هذا الشهر", "34", CalendarDays, "+12%"], ["الرصيد المتاح", "120", Coins, "Credits"], ["آخر نشاط", "اليوم", Clock3, "منذ 8 دقائق"]] as const;
  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm text-[var(--muted)]">مرحبًا، {user.name}</p><h1 className="font-display mt-2 text-3xl font-bold">لوحة استخدامك</h1></div><Link href="/tools" className="btn-primary">فتح الأدوات <ArrowLeft className="h-4 w-4" /></Link></div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">{stats.map(([label, value, Icon, note]) => <div key={label} className="glass-panel rounded-[22px] p-5"><div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--brand)_9%,transparent)] text-[var(--brand)]"><Icon className="h-5 w-5" /></span><span className="text-[10px] text-[var(--faint)]">{note}</span></div><strong className="font-display mt-5 block text-3xl">{value}</strong><p className="mt-2 text-xs text-[var(--muted)]">{label}</p></div>)}</div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <section className="glass-panel rounded-[26px] p-6"><div className="flex items-center justify-between"><h2 className="font-display font-bold">آخر العمليات</h2><Link href="/dashboard/usage" className="text-xs font-bold text-[var(--brand)]">عرض الكل</Link></div><div className="mt-5 space-y-3">{[[ImageIcon, "محرر الصور", "اكتملت", "منذ 8 دقائق"], [QrCode, "استوديو QR", "اكتملت", "أمس"], [WandSparkles, "إزالة الخلفية", "اكتملت", "قبل 3 أيام"]].map(([Icon, name, status, time]) => <div key={String(name)} className="flex items-center gap-3 rounded-2xl border border-[var(--line)] p-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-3)] text-[var(--brand)]"><Icon className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="text-sm font-bold">{String(name)}</p><p className="mt-1 text-[11px] text-[var(--faint)]">{String(time)}</p></div><span className="inline-flex items-center gap-1 text-[11px] text-[var(--success)]"><CheckCircle2 className="h-3 w-3" />{String(status)}</span></div>)}</div></section>
        <section className="glass-panel rounded-[26px] p-6"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--gold)_9%,transparent)] text-[var(--gold)]"><Sparkles className="h-5 w-5" /></span><h2 className="font-display mt-5 text-xl font-bold">الباقة المجانية</h2><p className="mt-3 text-sm leading-7 text-[var(--muted)]">الأسعار غير مفروضة بعد. نظام الباقات والحدود جاهز للإدارة عند الإطلاق التجاري.</p><div className="mt-6"><div className="flex justify-between text-xs"><span className="text-[var(--muted)]">استخدام الشهر</span><span className="font-bold">34 / 100</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--surface-3)]"><div className="h-full w-[34%] rounded-full bg-gradient-to-l from-[var(--brand)] to-[var(--brand-2)]" /></div></div><Link href="/pricing" className="btn-secondary mt-6 w-full">تفاصيل الباقات</Link></section>
      </div>
    </div>
  );
}

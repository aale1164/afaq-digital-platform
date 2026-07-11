import type { Metadata } from "next";
import { AlertTriangle, CheckCircle2, Database, KeyRound, ServerCog, ShieldCheck, Sparkles } from "lucide-react";
import { configurationIssues, serviceStatus } from "@/lib/env";

export const metadata: Metadata = { title: "الإعداد الأولي", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default function SetupPage() {
  const items = [
    ["المصادقة وقاعدة البيانات", serviceStatus.supabase, "NEXT_PUBLIC_SUPABASE_URL + المفاتيح", Database],
    ["توقيع بصمة الزائر", serviceStatus.visitorSecurity, "VISITOR_HMAC_SECRET (32 حرفًا فأكثر)", ShieldCheck],
    ["حساب المالك", serviceStatus.owner, "OWNER_EMAIL", KeyRound],
    ["Cloudflare Turnstile", serviceStatus.turnstile, "مستحسن للإنتاج", Sparkles],
    ["إزالة الخلفية", serviceStatus.backgroundRemoval, "REMOVE_BG_API_KEY", ServerCog],
  ] as const;
  const issues = configurationIssues();
  return <div className="container-shell py-14 sm:py-20"><div className="max-w-3xl"><p className="text-xs font-bold tracking-[.18em] text-[var(--brand)]">SYSTEM SETUP</p><h1 className="font-display mt-4 text-3xl font-bold">فحص الإعداد الأولي</h1><p className="mt-4 leading-8 text-[var(--muted)]">هذه الصفحة لا تعرض قيمة أي سر؛ تعرض فقط ما إذا كان المتغير المطلوب موجودًا. احذف وصولها العام أو احمها بعد الإطلاق.</p></div><div className="mt-9 grid gap-4 lg:grid-cols-2">{items.map(([name, ready, note, Icon]) => <div key={name} className="glass-panel flex items-center gap-4 rounded-[22px] p-5"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${ready ? "bg-[color-mix(in_srgb,var(--success)_9%,transparent)] text-[var(--success)]" : "bg-[color-mix(in_srgb,var(--warning)_9%,transparent)] text-[var(--warning)]"}`}><Icon className="h-5 w-5" /></span><div className="min-w-0 flex-1"><h2 className="text-sm font-bold">{name}</h2><p className="mt-1 truncate text-[11px] text-[var(--faint)]" dir="auto">{note}</p></div>{ready ? <CheckCircle2 className="h-5 w-5 text-[var(--success)]" /> : <AlertTriangle className="h-5 w-5 text-[var(--warning)]" />}</div>)}</div><div className={`mt-8 rounded-[24px] border p-6 ${issues.some((issue) => issue.required) ? "border-[color-mix(in_srgb,var(--warning)_30%,transparent)] bg-[color-mix(in_srgb,var(--warning)_6%,transparent)]" : "border-[color-mix(in_srgb,var(--success)_30%,transparent)] bg-[color-mix(in_srgb,var(--success)_6%,transparent)]"}`}><h2 className="font-display font-bold">{issues.length ? `${issues.length} إعدادات متبقية` : "الإعدادات الأساسية مكتملة"}</h2>{issues.length > 0 && <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">{issues.map((issue) => <li key={issue.key}>• {issue.label} — {issue.required ? "مطلوب للإنتاج" : "اختياري"}</li>)}</ul>}</div></div>;
}

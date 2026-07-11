import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Save, Settings, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { demoOwner } from "@/lib/demo-data";
import { featureFlags } from "@/lib/brand";
import { getPublicSiteSettings } from "@/lib/site-settings";
import { env } from "@/lib/env";
import { updateSiteSettingsAction } from "@/features/admin/actions";
import { MfaSetup } from "@/components/admin/mfa-setup";

export default async function AdminSettingsPage() {
  const realUser = await getCurrentUser();
  const user = realUser ?? (featureFlags.demoMode ? demoOwner : null);
  if (!user) redirect("/login?next=/admin/settings");
  if (user.role !== "OWNER") redirect("/forbidden");
  const settings = await getPublicSiteSettings();
  return <div className="container-shell py-10"><Link href="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--muted)] hover:text-[var(--brand)]"><ArrowRight className="h-4 w-4" /> العودة إلى الإدارة</Link><div className="mt-7 flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--brand)_9%,transparent)] text-[var(--brand)]"><Settings className="h-5 w-5" /></span><div><p className="text-xs text-[var(--muted)]">OWNER فقط</p><h1 className="font-display mt-1 text-2xl font-bold">إعدادات المنصة</h1></div></div><div className="mt-8 grid gap-6 xl:grid-cols-[1fr_.9fr]"><form action={updateSiteSettingsAction} className="glass-panel rounded-[26px] p-6 sm:p-8"><h2 className="font-display font-bold">الإعدادات العامة</h2><div className="mt-6 space-y-5"><div><label className="label" htmlFor="xUrl">رابط حساب X</label><input id="xUrl" name="xUrl" type="url" defaultValue={settings.xUrl} className="field" dir="ltr" required /><p className="mt-2 text-[11px] text-[var(--faint)]">يُحفظ في مكان واحد ويظهر في الهيدر والتذييل والأدوات.</p></div><div><label className="label" htmlFor="anonymousRuns">العمليات المجانية للزائر</label><input id="anonymousRuns" name="anonymousRuns" type="number" defaultValue={env.ANONYMOUS_FREE_RUNS} min={0} max={100} className="field" required /><p className="mt-2 text-[11px] text-[var(--faint)]">تغيير القيمة في قاعدة البيانات يجهزها للإدارة؛ متغير البيئة هو الاحتياطي وقت الأعطال.</p></div><div className="grid gap-3 rounded-2xl border border-[var(--line)] p-4 sm:grid-cols-2"><div><span className="text-xs text-[var(--faint)]">المتجر</span><p className="mt-1 font-bold">{featureFlags.marketplace ? "مفعّل" : "مخفي"}</p></div><div><span className="text-xs text-[var(--faint)]">Developer API</span><p className="mt-1 font-bold">{featureFlags.developerApi ? "مفعّل" : "مخفي"}</p></div></div><button type="submit" disabled={!realUser} className="btn-primary disabled:opacity-45"><Save className="h-4 w-4" /> حفظ الإعدادات</button>{!realUser && <p className="text-xs text-[var(--gold)]">الحفظ معطل في الوضع الاستعراضي.</p>}</div></form><MfaSetup demo={!realUser} /></div><div className="mt-6 rounded-2xl border border-[var(--line)] p-5 text-sm leading-7 text-[var(--muted)]"><ShieldCheck className="ml-2 inline h-4 w-4 text-[var(--brand)]" /> لا يستطيع ADMIN فتح هذه الصفحة أو تخفيض صلاحية OWNER؛ الحماية مطبقة من الخادم وقاعدة البيانات.</div></div>;
}

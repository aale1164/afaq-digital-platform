import type { Metadata } from "next";
import Link from "next/link";
import { Braces, Code2, KeyRound, LockKeyhole, TerminalSquare } from "lucide-react";
import { featureFlags } from "@/lib/brand";

export const metadata: Metadata = { title: "مركز المطورين" };
export default function DeveloperPage() {
  if (!featureFlags.developerApi) return <div className="container-shell flex min-h-[60vh] items-center justify-center py-16"><div className="glass-panel max-w-xl rounded-[28px] p-8 text-center sm:p-12"><LockKeyhole className="mx-auto h-11 w-11 text-[var(--gold)]" /><h1 className="font-display mt-6 text-2xl font-bold">مركز المطورين غير مفعّل للعامة</h1><p className="mt-4 leading-8 text-[var(--muted)]">البنية والجداول ومسارات المفاتيح جاهزة، لكن Feature Flag مغلق حتى اكتمال توثيق API واختبارات الحدود. لا توجد مفاتيح وهمية قابلة للإنشاء.</p><Link href="/tools/developer-lab" className="btn-primary mt-7">استخدم مختبر المطور</Link></div></div>;
  return <div className="container-shell py-14 sm:py-20"><span className="badge text-[var(--brand)]"><Code2 className="h-3.5 w-3.5" /> Developer Center</span><h1 className="font-display mt-6 text-4xl font-bold">ابنِ فوق أدوات آفاق</h1><p className="mt-4 max-w-2xl text-lg leading-9 text-[var(--muted)]">مفاتيح API آمنة، حدود طلبات، وسجل استخدام واضح. المفتاح الكامل يظهر مرة واحدة فقط.</p><div className="mt-10 grid gap-4 md:grid-cols-3">{[[KeyRound, "API Keys", "تُخزن البصمة Hash ولا يعاد عرض السر."], [TerminalSquare, "أمثلة متعددة", "JavaScript وPython وcURL."], [Braces, "سجل وحدود", "آخر استخدام وحد أقصى مستقل لكل مفتاح."]].map(([Icon, title, text]) => <div key={String(title)} className="glass-panel rounded-[22px] p-6"><Icon className="h-5 w-5 text-[var(--brand)]" /><h2 className="mt-4 font-bold">{String(title)}</h2><p className="mt-2 text-sm leading-7 text-[var(--muted)]">{String(text)}</p></div>)}</div></div>;
}

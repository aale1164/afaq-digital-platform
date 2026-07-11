import type { Metadata } from "next";
import { Clock3, MessageCircle, ShieldCheck } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { Signature } from "@/components/brand/signature";
import { serviceStatus } from "@/lib/env";

export const metadata: Metadata = { title: "تواصل معنا" };

export default function ContactPage() {
  return <div className="container-shell py-14 sm:py-20"><div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr]"><div><span className="badge text-[var(--brand)]"><MessageCircle className="h-3.5 w-3.5" /> تواصل مباشر</span><h1 className="font-display mt-6 text-3xl font-bold leading-[1.6] sm:text-4xl">فكرة، ملاحظة، أو فرصة تعاون؟</h1><p className="mt-5 text-lg leading-9 text-[var(--muted)]">اكتب التفاصيل بوضوح، أو تواصل مباشرة مع عدناني عبر حساب X المرتبط بالمنصة.</p><div className="mt-8 space-y-3"><div className="flex gap-3 rounded-2xl border border-[var(--line)] p-4"><Clock3 className="mt-1 h-4 w-4 text-[var(--brand)]" /><div><p className="text-sm font-bold">وقت الرد</p><p className="mt-1 text-xs text-[var(--muted)]">بحسب ضغط الرسائل، دون وعد زمني غير واقعي.</p></div></div><div className="flex gap-3 rounded-2xl border border-[var(--line)] p-4"><ShieldCheck className="mt-1 h-4 w-4 text-[var(--brand)]" /><div><p className="text-sm font-bold">لا ترسل أسرارًا</p><p className="mt-1 text-xs text-[var(--muted)]">لا تضع كلمات مرور أو مفاتيح API داخل الرسالة.</p></div></div></div><Signature className="mt-8" /></div><div className="glass-panel rounded-[28px] p-6 sm:p-9"><ContactForm configured={serviceStatus.supabase} /></div></div></div>;
}

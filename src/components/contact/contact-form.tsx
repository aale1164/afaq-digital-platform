"use client";

import { useState } from "react";
import { CheckCircle2, LoaderCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { TurnstileWidget } from "@/components/auth/turnstile-widget";

export function ContactForm({ configured }: { configured: boolean }) {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured) return toast.error("نموذج الرسائل يحتاج ربط قاعدة البيانات. استخدم حساب X حاليًا.");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/contact", { method: "POST", body: form });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(result.message);
      setSent(true); event.currentTarget.reset();
    } catch (error) {
      toast.error(error instanceof Error && error.message ? error.message : "تعذر إرسال الرسالة.");
    } finally { setBusy(false); }
  }
  if (sent) return <div className="py-14 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-[var(--success)]" /><h2 className="font-display mt-5 text-xl font-bold">وصلت رسالتك</h2><p className="mt-3 text-sm text-[var(--muted)]">سنراجعها ونرد عبر البريد الذي كتبته.</p><button type="button" onClick={() => setSent(false)} className="btn-secondary mt-6">إرسال رسالة أخرى</button></div>;
  return <form onSubmit={submit} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><div><label className="label" htmlFor="contact-name">الاسم</label><input id="contact-name" name="name" className="field" minLength={2} maxLength={80} required /></div><div><label className="label" htmlFor="contact-email">البريد</label><input id="contact-email" name="email" type="email" className="field" maxLength={254} required dir="ltr" /></div></div><div><label className="label" htmlFor="contact-subject">الموضوع</label><input id="contact-subject" name="subject" className="field" minLength={3} maxLength={120} required /></div><div><label className="label" htmlFor="contact-message">الرسالة</label><textarea id="contact-message" name="message" className="field min-h-36 resize-y" minLength={10} maxLength={3000} required /></div><input name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" /><TurnstileWidget /><button type="submit" disabled={busy || !configured} className="btn-primary w-full disabled:opacity-45">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{busy ? "جارٍ الإرسال..." : "إرسال الرسالة"}</button>{!configured && <p className="text-center text-xs leading-6 text-[var(--gold)]">النموذج متوقف حتى ربط Supabase؛ زر X يعمل الآن.</p>}</form>;
}

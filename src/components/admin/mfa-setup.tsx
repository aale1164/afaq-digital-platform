"use client";

import { useState } from "react";
import { CheckCircle2, KeyRound, LoaderCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function MfaSetup({ demo }: { demo: boolean }) {
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [verified, setVerified] = useState(false);

  async function enroll() {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return toast.error("اربط Supabase أولًا.");
    setBusy(true);
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "لوحة OWNER - آفاق" });
    setBusy(false);
    if (error) return toast.error("تعذر بدء إعداد MFA.");
    setFactorId(data.id); setQrCode(data.totp.qr_code); setSecret(data.totp.secret);
  }

  async function verify() {
    const supabase = createSupabaseBrowserClient();
    if (!supabase || !factorId || !/^\d{6}$/.test(code)) return toast.error("أدخل الرمز المكون من 6 أرقام.");
    setBusy(true);
    const challenge = await supabase.auth.mfa.challenge({ factorId });
    if (challenge.error) { setBusy(false); return toast.error("تعذر إنشاء تحدي التحقق."); }
    const result = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.data.id, code });
    setBusy(false);
    if (result.error) return toast.error("الرمز غير صحيح.");
    setVerified(true); setQrCode(null); setSecret(null); toast.success("تم تفعيل المصادقة الثنائية.");
  }

  return <div className="rounded-[24px] border border-[var(--line)] bg-[var(--card)] p-6"><div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--gold)_9%,transparent)] text-[var(--gold)]"><ShieldCheck className="h-5 w-5" /></span><div><h2 className="font-display font-bold">المصادقة الثنائية لحساب OWNER</h2><p className="mt-2 text-sm leading-7 text-[var(--muted)]">استخدم تطبيق مصادقة مثل Google Authenticator أو 1Password. لا تشارك المفتاح السري.</p></div></div>{verified ? <div className="mt-5 flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--success)_30%,transparent)] bg-[color-mix(in_srgb,var(--success)_7%,transparent)] p-4 text-sm text-[var(--success)]"><CheckCircle2 className="h-4 w-4" /> تم تفعيل عامل TOTP في هذه الجلسة.</div> : qrCode ? <div className="mt-6 grid gap-5 sm:grid-cols-[180px_1fr]"><div className="rounded-2xl bg-white p-3"><img src={qrCode} alt="رمز إعداد المصادقة الثنائية" className="h-auto w-full" /></div><div><label className="label">المفتاح اليدوي</label><code className="block break-all rounded-xl border border-[var(--line)] bg-[var(--surface-3)] p-3 text-xs" dir="ltr">{secret}</code><label className="label mt-4" htmlFor="mfa-code">رمز التطبيق</label><input id="mfa-code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} className="field tracking-[.35em]" inputMode="numeric" dir="ltr" placeholder="000000" /><button type="button" onClick={verify} disabled={busy} className="btn-primary mt-3 w-full">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} تأكيد وتفعيل</button></div></div> : <button type="button" onClick={enroll} disabled={demo || busy} className="btn-secondary mt-6 disabled:opacity-45">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} بدء إعداد MFA</button>}{demo && <p className="mt-3 text-xs text-[var(--gold)]">يظهر الإعداد الفعلي بعد ربط Supabase وتسجيل دخول OWNER.</p>}</div>;
}

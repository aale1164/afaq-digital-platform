"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, ArrowLeft, CheckCircle2, LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react";
import {
  requestPasswordResetAction,
  signInAction,
  signUpAction,
  updatePasswordAction,
} from "@/features/auth/actions";
import { initialAuthState } from "@/features/auth/state";
import { TurnstileWidget } from "./turnstile-widget";

type Mode = "login" | "register" | "forgot" | "reset";

const config = {
  login: { action: signInAction, submit: "دخول آمن", pending: "جارٍ التحقق..." },
  register: { action: signUpAction, submit: "إنشاء حسابي", pending: "جارٍ إنشاء الحساب..." },
  forgot: { action: requestPasswordResetAction, submit: "إرسال رابط الاستعادة", pending: "جارٍ الإرسال..." },
  reset: { action: updatePasswordAction, submit: "حفظ كلمة المرور", pending: "جارٍ الحفظ..." },
} as const;

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary mt-2 w-full disabled:cursor-wait disabled:opacity-65">
      {pending ? <><LoaderCircle className="h-4 w-4 animate-spin" />{pendingLabel}</> : <>{label}<ArrowLeft className="h-4 w-4" /></>}
    </button>
  );
}

export function AuthForm({ mode }: { mode: Mode }) {
  const selected = config[mode];
  const [state, action] = useActionState(selected.action, initialAuthState);
  return (
    <form action={action} className="space-y-4">
      {mode === "register" && (
        <div>
          <label className="label" htmlFor="fullName">الاسم</label>
          <div className="relative"><UserRound className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--faint)]" /><input id="fullName" name="fullName" className="field pr-11" autoComplete="name" minLength={2} maxLength={80} required placeholder="اسمك كما تحب أن يظهر" /></div>
        </div>
      )}
      {mode !== "reset" && (
        <div>
          <label className="label" htmlFor="email">البريد الإلكتروني</label>
          <div className="relative"><Mail className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--faint)]" /><input id="email" name="email" type="email" className="field pr-11" autoComplete="email" required placeholder="name@example.com" dir="ltr" /></div>
        </div>
      )}
      {(mode === "login" || mode === "register" || mode === "reset") && (
        <div>
          <label className="label" htmlFor="password">{mode === "reset" ? "كلمة المرور الجديدة" : "كلمة المرور"}</label>
          <div className="relative"><LockKeyhole className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--faint)]" /><input id="password" name="password" type="password" className="field pr-11" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={mode === "login" ? 1 : 8} maxLength={128} required placeholder="••••••••" dir="ltr" /></div>
        </div>
      )}
      {mode === "reset" && (
        <div>
          <label className="label" htmlFor="confirmPassword">تأكيد كلمة المرور</label>
          <input id="confirmPassword" name="confirmPassword" type="password" className="field" autoComplete="new-password" minLength={8} maxLength={128} required placeholder="••••••••" dir="ltr" />
        </div>
      )}
      {mode === "login" && <div className="text-left"><Link href="/forgot-password" className="text-xs font-bold text-[var(--brand)] hover:underline">نسيت كلمة المرور؟</Link></div>}
      {mode === "register" && (
        <label className="flex items-start gap-2.5 text-xs leading-6 text-[var(--muted)]">
          <input name="acceptTerms" type="checkbox" className="mt-1.5 accent-[var(--brand)]" required />
          <span>أوافق على <Link href="/terms" className="font-bold text-[var(--brand)]">شروط الاستخدام</Link> و<Link href="/privacy" className="font-bold text-[var(--brand)]">سياسة الخصوصية</Link>.</span>
        </label>
      )}
      {(mode === "register" || mode === "login") && <TurnstileWidget />}
      {state.message && (
        <div role="status" className={`flex items-start gap-2 rounded-xl border p-3 text-sm leading-6 ${state.status === "success" ? "border-[color-mix(in_srgb,var(--success)_35%,transparent)] bg-[color-mix(in_srgb,var(--success)_8%,transparent)] text-[var(--success)]" : "border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] text-[var(--danger)]"}`}>
          {state.status === "success" ? <CheckCircle2 className="mt-1 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-1 h-4 w-4 shrink-0" />}{state.message}
        </div>
      )}
      <SubmitButton label={selected.submit} pendingLabel={selected.pending} />
    </form>
  );
}

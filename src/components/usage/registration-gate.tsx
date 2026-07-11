"use client";

import Link from "next/link";
import { LockKeyhole, X, Zap } from "lucide-react";

export function RegistrationGate({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="gate-title" onMouseDown={onClose}>
      <div className="glass-panel relative w-full max-w-md rounded-[28px] p-7 text-center sm:p-9" onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} className="btn-ghost absolute left-4 top-4 h-9 min-h-9 w-9 p-0" aria-label="إغلاق"><X className="h-4 w-4" /></button>
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--brand)_10%,var(--surface-3))] text-[var(--brand)]"><LockKeyhole className="h-7 w-7" /></span>
        <h2 id="gate-title" className="font-display mt-6 text-2xl font-bold">أكملت تجاربك المجانية</h2>
        <p className="mt-4 leading-8 text-[var(--muted)]">استخدمت العمليات الثلاث المتاحة للزائر. أنشئ حسابًا مجانيًا لتكمل وتحصل على سجل استخدامك.</p>
        <Link href="/register" className="btn-primary mt-7 w-full"><Zap className="h-4 w-4" /> إنشاء حساب مجاني</Link>
        <Link href="/login" className="btn-secondary mt-3 w-full">لدي حساب بالفعل</Link>
        <p className="mt-5 text-[11px] text-[var(--faint)]">لا تُخصم العملية إذا فشلت الأداة.</p>
      </div>
    </div>
  );
}

import Link from "next/link";
import { MailCheck } from "lucide-react";

export default function ConfirmEmailPage() {
  return (
    <div className="container-shell flex min-h-[65vh] items-center justify-center py-16">
      <div className="glass-panel max-w-lg rounded-[28px] p-8 text-center sm:p-12">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--brand)_10%,var(--surface-3))] text-[var(--brand)]"><MailCheck className="h-8 w-8" /></span>
        <h1 className="font-display mt-6 text-2xl font-bold">أكد بريدك الإلكتروني</h1>
        <p className="mt-4 leading-8 text-[var(--muted)]">أرسلنا رابط التأكيد إلى بريدك. افتحه لإكمال تفعيل الحساب، وتحقق من مجلد الرسائل غير المرغوبة إن تأخر.</p>
        <Link href="/login" className="btn-primary mt-7">العودة إلى الدخول</Link>
      </div>
    </div>
  );
}

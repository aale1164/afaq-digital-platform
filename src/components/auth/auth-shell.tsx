import { ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Signature } from "@/components/brand/signature";

export function AuthShell({ title, description, children, footer }: { title: string; description: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="container-shell grid min-h-[calc(100vh-74px)] items-center gap-10 py-12 lg:grid-cols-[.85fr_1.15fr]">
      <div className="mx-auto w-full max-w-md">
        <BrandLogo />
        <h1 className="font-display mt-8 text-3xl font-bold leading-[1.6]">{title}</h1>
        <p className="mt-3 leading-8 text-[var(--muted)]">{description}</p>
        <div className="glass-panel mt-7 rounded-[26px] p-6 sm:p-8">{children}</div>
        {footer && <div className="mt-5 text-center text-sm text-[var(--muted)]">{footer}</div>}
      </div>
      <aside className="relative hidden min-h-[620px] overflow-hidden rounded-[36px] border border-[var(--line)] bg-[var(--card)] p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="grid-surface absolute inset-0 opacity-50" />
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[var(--brand-2)] opacity-[.1] blur-3xl" />
        <div className="relative">
          <span className="badge text-[var(--brand)]"><ShieldCheck className="h-3.5 w-3.5" /> حساب آفاق</span>
          <h2 className="font-display mt-7 max-w-lg text-4xl font-bold leading-[1.7]">أدواتك وسجل استخدامك في مكان واحد.</h2>
          <p className="mt-5 max-w-lg text-lg leading-9 text-[var(--muted)]">يمنحك الحساب وصولًا منظمًا للأدوات، وسجل العمليات، والرصيد، والمزايا التي ستُضاف مستقبلًا.</p>
        </div>
        <div className="relative rounded-3xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface-3)_70%,transparent)] p-6">
          <p className="text-sm leading-7 text-[var(--muted)]">لا نطلب بيانات أكثر مما نحتاجه، ولا تحفظ أدوات الصور المحلية ملفاتك على خادم المنصة.</p>
          <Signature className="mt-5" />
        </div>
      </aside>
    </div>
  );
}

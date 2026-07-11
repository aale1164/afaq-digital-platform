import Link from "next/link";
import { ArrowRight, Cloud, Cpu, ExternalLink, ShieldCheck } from "lucide-react";
import { Signature } from "@/components/brand/signature";
import { ToolIcon } from "./tool-icon";
import type { ToolDefinition } from "@/lib/tool-registry";

const processInfo = {
  browser: { label: "المعالجة داخل جهازك", icon: Cpu, note: "لا تُرفع ملفاتك إلى خادم المنصة." },
  server: { label: "معالجة آمنة في الخادم", icon: Cloud, note: "تُحذف الملفات المؤقتة بعد المعالجة." },
  external: { label: "معالجة عبر مزود خارجي", icon: ExternalLink, note: "يُرسل الملف للمزود المحدد عند تشغيل الأداة." },
};

export function ToolShell({ tool, children }: { tool: ToolDefinition; children: React.ReactNode }) {
  const processing = processInfo[tool.processing];
  const ProcessingIcon = processing.icon;
  return (
    <div className="container-shell py-8 sm:py-12">
      <Link href="/tools" className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-[var(--muted)] transition hover:text-[var(--brand)]">
        <ArrowRight className="h-4 w-4" /> العودة إلى الأدوات
      </Link>
      <header className="mb-8 grid gap-6 rounded-[28px] border border-[var(--line)] bg-[var(--card)] p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--line-strong)] bg-[color-mix(in_srgb,var(--brand)_9%,var(--surface-3))] text-[var(--brand)]">
            <ToolIcon name={tool.icon} className="h-7 w-7" />
          </div>
          <p className="text-[10px] font-bold tracking-[0.2em] text-[var(--brand)]" dir="ltr">{tool.nameEn.toUpperCase()}</p>
          <h1 className="font-display mt-2 text-2xl font-bold leading-[1.65] sm:text-4xl">{tool.nameAr}</h1>
          <p className="mt-3 max-w-3xl leading-8 text-[var(--muted)]">{tool.description}</p>
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface-3)_72%,transparent)] p-4 lg:max-w-[270px]">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--ink)]"><ProcessingIcon className="h-4 w-4 text-[var(--brand)]" />{processing.label}</div>
          <p className="mt-2 text-xs leading-6 text-[var(--faint)]">{processing.note}</p>
        </div>
      </header>
      {children}
      <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface-2)_66%,transparent)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-xs leading-6 text-[var(--muted)]">
          <ShieldCheck className="h-5 w-5 shrink-0 text-[var(--brand)]" />
          <span>نوضح طريقة المعالجة ولا ندّعي دقة غير واقعية. راجع النتيجة قبل استخدامها.</span>
        </div>
        <Signature className="shrink-0" />
      </div>
    </div>
  );
}

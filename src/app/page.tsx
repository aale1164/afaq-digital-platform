import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  Code2,
  Fingerprint,
  ImageIcon,
  Layers3,
  LockKeyhole,
  QrCode,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  Zap,
} from "lucide-react";
import { featuredTools, liveTools } from "@/lib/tool-registry";
import { ToolCard } from "@/components/tools/tool-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Signature } from "@/components/brand/signature";

function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[510px]" aria-hidden="true">
      <div className="absolute inset-[8%] rounded-full border border-[var(--line)] animate-pulse-ring" />
      <div className="absolute inset-[20%] rounded-full border border-dashed border-[var(--line-strong)]" />
      <div className="absolute inset-[32%] rounded-full bg-[var(--brand)] opacity-[0.08] blur-3xl" />
      <div className="glass-panel absolute left-1/2 top-1/2 flex h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-[42px] border-[var(--line-strong)] sm:h-[174px] sm:w-[174px]">
        <span className="font-display gradient-text text-5xl font-bold sm:text-6xl">آ</span>
        <span className="mt-2 text-[9px] font-bold tracking-[.24em] text-[var(--muted)]" dir="ltr">AFAQ DIGITAL</span>
      </div>
      <div className="glass-panel animate-float-soft absolute right-[1%] top-[11%] flex items-center gap-3 rounded-2xl px-4 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(66,232,198,.1)] text-[var(--brand)]"><ImageIcon className="h-4 w-4" /></span>
        <div><p className="text-xs font-bold">تحرير الصور</p><p className="mt-1 text-[9px] text-[var(--faint)]">داخل جهازك</p></div>
      </div>
      <div className="glass-panel absolute bottom-[14%] right-[2%] flex items-center gap-3 rounded-2xl px-4 py-3" style={{ animation: "float-soft 6s ease-in-out .8s infinite" }}>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(92,174,255,.1)] text-[var(--brand-2)]"><QrCode className="h-4 w-4" /></span>
        <div><p className="text-xs font-bold">QR احترافي</p><p className="mt-1 text-[9px] text-[var(--faint)]">جاهز للتصدير</p></div>
      </div>
      <div className="glass-panel absolute left-[1%] top-[27%] flex items-center gap-3 rounded-2xl px-4 py-3" style={{ animation: "float-soft 5.5s ease-in-out 1.6s infinite" }}>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(239,199,124,.09)] text-[var(--gold)]"><Code2 className="h-4 w-4" /></span>
        <div><p className="text-xs font-bold">مختبر المطور</p><p className="mt-1 text-[9px] text-[var(--faint)]">8 أدوات في مكان واحد</p></div>
      </div>
      <div className="absolute bottom-[6%] left-[18%] flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2 text-[10px] font-bold text-[var(--muted)] shadow-xl">
        <span className="status-dot" /> النظام جاهز
      </div>
      <span className="absolute left-[18%] top-[10%] h-2 w-2 rounded-full bg-[var(--gold)] shadow-[0_0_18px_var(--gold)]" />
      <span className="absolute bottom-[20%] left-[8%] h-1.5 w-1.5 rounded-full bg-[var(--brand-2)] shadow-[0_0_18px_var(--brand-2)]" />
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden pb-20 pt-14 sm:pt-20 lg:pb-28 lg:pt-24">
        <div className="grid-surface absolute inset-x-0 top-0 -z-10 h-[780px] opacity-45" aria-hidden="true" />
        <div className="container-shell grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="badge mb-7 border-[color-mix(in_srgb,var(--brand)_28%,transparent)] bg-[color-mix(in_srgb,var(--brand)_7%,transparent)] text-[var(--brand)]">
              <Sparkles className="h-3.5 w-3.5" /> منصة أدوات عربية تُبنى للمستقبل
            </div>
            <h1 className="font-display max-w-3xl text-[clamp(2.35rem,6vw,4.9rem)] font-bold leading-[1.35] tracking-[-.04em]">
              وسّع إمكاناتك إلى <span className="gradient-text">آفاق جديدة</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-[var(--muted)] sm:text-xl">
              أدوات صور ومطورين وأعمال في مساحة عربية واحدة؛ سريعة، واضحة، وتخبرك أين تتم معالجة ملفاتك قبل أن تبدأ.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/tools" className="btn-primary min-h-13 px-6">استكشف الأدوات <ArrowLeft className="h-5 w-5" /></Link>
              <Link href="/tools/photo-editor" className="btn-secondary min-h-13 px-6"><WandSparkles className="h-5 w-5 text-[var(--brand)]" /> جرّب محرر الصور</Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold text-[var(--muted)]">
              <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-[var(--brand)]" /> 3 استخدامات للزائر</span>
              <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-[var(--brand)]" /> لا تحتاج بطاقة دفع</span>
              <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-[var(--brand)]" /> أدوات تعمل محليًا</span>
            </div>
            <Signature className="mt-8" />
          </div>
          <HeroVisual />
        </div>
      </section>

      <section className="container-shell pb-20">
        <div className="grid overflow-hidden rounded-[26px] border border-[var(--line)] bg-[var(--card)] sm:grid-cols-3">
          {([
            [String(liveTools.length), "أدوات عاملة في الإصدار الأول", Layers3],
            ["100%", "واجهة عربية متجاوبة", Zap],
            ["0", "ملفات محفوظة افتراضيًا", LockKeyhole],
          ] as const).map(([value, label, Icon], index) => (
            <div key={String(label)} className={`flex items-center gap-4 p-6 sm:p-7 ${index ? "border-t border-[var(--line)] sm:border-r sm:border-t-0" : ""}`}>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--brand)_8%,var(--surface-3))] text-[var(--brand)]"><Icon className="h-5 w-5" /></span>
              <div><strong className="font-display text-2xl text-[var(--ink)]">{value}</strong><p className="mt-1 text-xs text-[var(--muted)]">{String(label)}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-shell py-16 sm:py-20">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading eyebrow="أدوات الإصدار الأول" title="أدوات حقيقية، لا واجهات صامتة" description="كل بطاقة جاهزة تفتح أداة قابلة للاستخدام. وما يحتاج مزودًا خارجيًا نوضحه قبل رفع ملفك." />
          <Link href="/tools" className="mb-2 inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[var(--brand)]">عرض جميع الأدوات <ChevronLeft className="h-4 w-4" /></Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featuredTools.map((tool, index) => <ToolCard key={tool.slug} tool={tool} priority={index < 3} />)}
        </div>
      </section>

      <section className="container-shell py-16 sm:py-24">
        <div className="glass-panel relative overflow-hidden rounded-[32px] p-7 sm:p-10 lg:p-14">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[var(--brand-2)] opacity-[.08] blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <div>
              <span className="badge text-[var(--gold)]"><ShieldCheck className="h-3.5 w-3.5" /> الخصوصية جزء من التصميم</span>
              <h2 className="font-display mt-5 text-2xl font-bold leading-[1.7] sm:text-3xl">ملفك ليس ثمن الأداة</h2>
              <p className="mt-4 leading-8 text-[var(--muted)]">نعالج الصور في المتصفح متى كان ذلك ممكنًا، ونبيّن بوضوح عندما تحتاج الأداة إلى خادم أو مزود خارجي.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                [Fingerprint, "بصمة مجهولة", "لا نخزن عنوان IP الخام في نظام استخدام الزوار."],
                [ImageIcon, "معالجة محلية", "أدوات الصور الأساسية تعمل داخل جهازك."],
                [ShieldCheck, "صلاحيات من الخادم", "حماية الإدارة لا تعتمد على إخفاء الأزرار."],
                [Layers3, "بنية قابلة للنمو", "إضافة أدوات جديدة عبر سجل موحد."],
              ].map(([Icon, title, text]) => (
                <div key={String(title)} className="rounded-2xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface-3)_65%,transparent)] p-5">
                  <Icon className="h-5 w-5 text-[var(--brand)]" />
                  <h3 className="mt-4 font-bold">{String(title)}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{String(text)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-16 text-center sm:py-24">
        <div className="mx-auto max-w-3xl">
          <span className="badge"><Zap className="h-3.5 w-3.5 text-[var(--gold)]" /> البداية من هنا</span>
          <h2 className="font-display mt-6 text-3xl font-bold leading-[1.6] sm:text-4xl">أداة اليوم، ومنصة أعمال الغد</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-9 text-[var(--muted)]">ابدأ بثلاث عمليات مجانية، وأنشئ حسابك عندما تحتاج سجل استخدامك ومزايا العضوية.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/tools" className="btn-primary min-h-13 px-7">اختر أداتك الآن <ArrowLeft className="h-5 w-5" /></Link>
            <Link href="/about" className="btn-secondary min-h-13 px-7">قصة منصة آفاق</Link>
          </div>
        </div>
      </section>
    </>
  );
}

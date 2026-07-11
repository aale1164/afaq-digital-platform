import Link from "next/link";
import { ArrowUpLeft, Heart } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Signature } from "@/components/brand/signature";
import { featureFlags } from "@/lib/brand";

const groups = [
  {
    title: "المنصة",
    links: [["جميع الأدوات", "/tools"], ["الباقات", "/pricing"], ["لوحة المستخدم", "/dashboard"]],
  },
  {
    title: "المعلومات",
    links: [["من نحن", "/about"], ["تواصل معنا", "/contact"], ["حالة النظام", "/setup"]],
  },
  {
    title: "قانوني",
    links: [["سياسة الخصوصية", "/privacy"], ["شروط الاستخدام", "/terms"]],
  },
] as const;

export function SiteFooter({ xUrl }: { xUrl: string }) {
  return (
    <footer className="mt-24 border-t border-[var(--line)] bg-[color-mix(in_srgb,var(--surface-2)_68%,transparent)]">
      <div className="container-shell py-14">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_2fr]">
          <div>
            <BrandLogo />
            <p className="mt-5 max-w-md text-sm leading-7 text-[var(--muted)]">
              مساحة عربية موحّدة لأدوات رقمية عملية؛ مصممة للخصوصية والسرعة، وقابلة للنمو دون إعادة بناء المنصة من الصفر.
            </p>
            <a href={xUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary mt-5 min-h-10 text-sm">
              تواصل عبر X <ArrowUpLeft className="h-4 w-4" />
            </a>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {groups.map((group) => (
              <div key={group.title}>
                <h2 className="mb-4 text-sm font-bold text-[var(--ink)]">{group.title}</h2>
                <ul className="space-y-3 text-sm text-[var(--muted)]">
                  {group.links.map(([label, href]) => (
                    <li key={href}><Link className="transition hover:text-[var(--brand)]" href={href}>{label}</Link></li>
                  ))}
                  {group.title === "المنصة" && featureFlags.developerApi && <li><Link className="transition hover:text-[var(--brand)]" href="/developer">مركز المطورين</Link></li>}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="hairline my-9" />
        <div className="flex flex-col gap-4 text-xs text-[var(--faint)] md:flex-row md:items-center md:justify-between">
          <p className="inline-flex flex-wrap items-center gap-1.5">
            تم تصميم وتطوير هذه المنصة بواسطة عدناني بالتعاون مع تقنيات الذكاء الاصطناعي
            <Heart className="h-3.5 w-3.5 text-[var(--brand)]" fill="currentColor" />
          </p>
          <Signature compact />
        </div>
      </div>
    </footer>
  );
}

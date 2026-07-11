import Link from "next/link";
import { cn } from "@/lib/utils";
import { brand } from "@/lib/brand";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg className={cn("h-11 w-11", className)} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="afaq-mark" x1="11" y1="7" x2="54" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#61F3D2" />
          <stop offset="1" stopColor="#61AFFF" />
        </linearGradient>
        <radialGradient id="afaq-glow" cx="0" cy="0" r="1" gradientTransform="translate(32 34) rotate(90) scale(28)">
          <stop stopColor="#43E8C6" stopOpacity=".2" />
          <stop offset="1" stopColor="#43E8C6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="1" y="1" width="62" height="62" rx="20" fill="#0A1C29" stroke="rgba(122,221,216,.26)" />
      <circle cx="32" cy="32" r="27" fill="url(#afaq-glow)" />
      <path d="M14 41.4C21 34.1 27.6 31 35.1 31c5.4 0 10.2 1.7 14.9 5.1" stroke="url(#afaq-mark)" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M18 47c7.5-5.2 14.8-6.9 22.1-4.9 2.3.6 4.4 1.6 6.5 2.9" stroke="url(#afaq-mark)" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round" />
      <path d="M36.8 15.8c-6.7 5.3-10.3 11.8-10.8 19.5M32 16.1c2.8-.6 5.7-.2 8.2 1" stroke="url(#afaq-mark)" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="48.8" cy="18" r="2.2" fill="#EFC77C" />
    </svg>
  );
}

export function BrandLogo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-3", className)} aria-label={`${brand.nameAr} - الرئيسية`}>
      <BrandMark className="transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105" />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[15px] font-bold tracking-tight text-[var(--ink)]">{brand.nameAr}</span>
          <span className="mt-1.5 text-[9px] font-bold tracking-[0.22em] text-[var(--brand)]" dir="ltr">{brand.nameEn}</span>
        </span>
      )}
    </Link>
  );
}

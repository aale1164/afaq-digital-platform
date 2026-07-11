import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { XIcon } from "@/components/brand/x-icon";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { MobileMenu } from "./mobile-menu";
import { featureFlags } from "@/lib/brand";

export function SiteHeader({ xUrl }: { xUrl: string }) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_82%,transparent)] backdrop-blur-xl">
      <div className="container-shell flex h-[74px] items-center justify-between gap-4">
        <BrandLogo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="التنقل الرئيسي">
          <Link href="/tools" className="btn-ghost min-h-10 px-3.5 text-sm">الأدوات <ChevronDown className="h-3.5 w-3.5" /></Link>
          <Link href="/pricing" className="btn-ghost min-h-10 px-3.5 text-sm">الباقات</Link>
          {featureFlags.developerApi && <Link href="/developer" className="btn-ghost min-h-10 px-3.5 text-sm">مركز المطورين</Link>}
          <Link href="/about" className="btn-ghost min-h-10 px-3.5 text-sm">من نحن</Link>
        </nav>
        <div className="flex items-center gap-1.5">
          <a href={xUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost hidden h-10 min-h-10 w-10 p-0 sm:inline-flex" aria-label="حساب عدناني على X">
            <XIcon />
          </a>
          <ThemeToggle />
          <Link href="/login" className="btn-ghost hidden min-h-10 px-3 text-sm lg:inline-flex">دخول</Link>
          <Link href="/register" className="btn-primary hidden min-h-10 px-4 text-sm sm:inline-flex">ابدأ مجانًا <ArrowLeft className="h-4 w-4" /></Link>
          <MobileMenu xUrl={xUrl} />
        </div>
      </div>
    </header>
  );
}

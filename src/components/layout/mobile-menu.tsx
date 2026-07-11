"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { brand } from "@/lib/brand";
import { XIcon } from "@/components/brand/x-icon";

const links = [
  ["الأدوات", "/tools"],
  ["الباقات", "/pricing"],
  ["من نحن", "/about"],
  ["تواصل", "/contact"],
] as const;

export function MobileMenu({ xUrl }: { xUrl: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);

  return (
    <div className="md:hidden">
      <button type="button" onClick={() => setOpen(true)} className="btn-ghost h-10 min-h-10 w-10 p-0" aria-label="فتح القائمة" aria-expanded={open}>
        <Menu className="h-5 w-5" />
      </button>
      {open && (
        <div className="fixed inset-0 z-[80] bg-black/55 backdrop-blur-sm" onMouseDown={() => setOpen(false)}>
          <div className="absolute inset-y-0 right-0 w-[min(88vw,340px)] border-l border-[var(--line)] bg-[var(--surface-2)] p-5 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="mb-8 flex items-center justify-between">
              <strong className="font-display text-sm">{brand.shortName}</strong>
              <button type="button" onClick={() => setOpen(false)} className="btn-ghost h-10 min-h-10 w-10 p-0" aria-label="إغلاق القائمة">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-2" aria-label="التنقل على الجوال">
              {links.map(([label, href]) => (
                <Link key={href} href={href} onClick={() => setOpen(false)} className="block rounded-xl border border-transparent px-4 py-3 font-bold text-[var(--muted)] hover:border-[var(--line)] hover:bg-[var(--surface-3)] hover:text-[var(--ink)]">
                  {label}
                </Link>
              ))}
            </nav>
            <div className="hairline my-6" />
            <Link href="/login" onClick={() => setOpen(false)} className="btn-secondary w-full">تسجيل الدخول</Link>
            <Link href="/register" onClick={() => setOpen(false)} className="btn-primary mt-3 w-full">ابدأ مجانًا</Link>
            <a href={xUrl} target="_blank" rel="noopener noreferrer" className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-[var(--brand)]">
              <XIcon /> حساب عدناني على X
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { BarChart3, ChevronLeft, CircleUserRound, Gauge, LogOut, ShieldCheck, Sparkles } from "lucide-react";
import type { UserContext } from "@/lib/auth";
import { signOutAction } from "@/features/auth/actions";
import { BrandMark } from "@/components/brand/brand-logo";

export function DashboardShell({ user, demo, children }: { user: UserContext; demo: boolean; children: React.ReactNode }) {
  const links = [
    ["نظرة عامة", "/dashboard", Gauge],
    ["سجل الاستخدام", "/dashboard/usage", BarChart3],
    ["الملف الشخصي", "/dashboard/profile", CircleUserRound],
  ] as const;
  return (
    <div className="container-shell py-8 sm:py-12">
      {demo && <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[color-mix(in_srgb,var(--gold)_30%,transparent)] bg-[color-mix(in_srgb,var(--gold)_7%,transparent)] p-4 text-sm text-[var(--gold)]"><Sparkles className="h-4 w-4" /> وضع استعراضي: اربط Supabase لتتحول البيانات إلى حسابات حقيقية.</div>}
      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        <aside className="glass-panel h-fit rounded-[26px] p-4 lg:sticky lg:top-24">
          <div className="flex items-center gap-3 border-b border-[var(--line)] p-2 pb-5"><BrandMark className="h-10 w-10" /><div className="min-w-0"><p className="truncate text-sm font-bold">{user.name}</p><p className="mt-1 text-[10px] font-bold text-[var(--brand)]">{user.role}</p></div></div>
          <nav className="mt-4 space-y-1">{links.map(([label, href, Icon]) => <Link key={href} href={href} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold text-[var(--muted)] transition hover:bg-[var(--surface-3)] hover:text-[var(--ink)]"><Icon className="h-4 w-4" />{label}<ChevronLeft className="mr-auto h-3 w-3 opacity-45" /></Link>)}{(user.role === "OWNER" || user.role === "ADMIN") && <Link href="/admin" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold text-[var(--gold)] transition hover:bg-[var(--surface-3)]"><ShieldCheck className="h-4 w-4" />لوحة الإدارة<ChevronLeft className="mr-auto h-3 w-3 opacity-45" /></Link>}</nav>
          <div className="hairline my-4" />
          <form action={signOutAction}><button type="submit" className="btn-ghost w-full justify-start text-sm"><LogOut className="h-4 w-4" /> تسجيل الخروج</button></form>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

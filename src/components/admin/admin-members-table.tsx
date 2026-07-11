"use client";

import Link from "next/link";
import { Ban, ChevronLeft, Search, Shield, UserRoundCheck } from "lucide-react";
import { useMemo, useState } from "react";
import type { AdminMember } from "@/lib/demo-data";

export function AdminMembersTable({ members }: { members: AdminMember[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const filtered = useMemo(() => members.filter((member) => {
    const matches = `${member.name} ${member.email}`.toLowerCase().includes(query.toLowerCase());
    return matches && (filter === "all" || (filter === "confirmed" && member.confirmed) || (filter === "unconfirmed" && !member.confirmed) || (filter === "blocked" && member.blocked));
  }), [members, query, filter]);
  return <div><div className="grid gap-3 border-b border-[var(--line)] p-4 sm:grid-cols-[1fr_auto]"><label className="relative"><Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--faint)]" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="field min-h-10 pr-11 text-sm" placeholder="بحث بالاسم أو البريد..." /></label><select value={filter} onChange={(event) => setFilter(event.target.value)} className="field min-h-10 w-full py-1.5 text-xs sm:w-40"><option value="all">جميع الأعضاء</option><option value="confirmed">مؤكدون</option><option value="unconfirmed">غير مؤكدين</option><option value="blocked">محظورون</option></select></div><div className="overflow-x-auto"><div className="min-w-[760px]"><div className="grid grid-cols-[1.4fr_.7fr_.7fr_.5fr_44px] gap-4 border-b border-[var(--line)] px-5 py-3 text-[10px] font-bold text-[var(--faint)]"><span>العضو</span><span>الدور</span><span>الباقة</span><span>الاستخدام</span><span /></div>{filtered.map((member) => <Link key={member.id} href={`/admin/members/${member.id}`} className="grid grid-cols-[1.4fr_.7fr_.7fr_.5fr_44px] items-center gap-4 border-b border-[var(--line)] px-5 py-4 text-sm transition last:border-b-0 hover:bg-[color-mix(in_srgb,var(--surface-3)_55%,transparent)]"><div className="flex min-w-0 items-center gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${member.blocked ? "bg-[color-mix(in_srgb,var(--danger)_9%,transparent)] text-[var(--danger)]" : "bg-[color-mix(in_srgb,var(--brand)_9%,transparent)] text-[var(--brand)]"}`}>{member.blocked ? <Ban className="h-4 w-4" /> : <UserRoundCheck className="h-4 w-4" />}</span><div className="min-w-0"><p className="truncate font-bold">{member.name}</p><p className="mt-1 truncate text-[10px] text-[var(--faint)]" dir="ltr">{member.email}</p></div></div><span className="inline-flex items-center gap-1.5 text-xs"><Shield className="h-3 w-3 text-[var(--gold)]" />{member.role}</span><span className="text-xs text-[var(--muted)]">{member.plan}</span><span className="text-xs font-bold">{member.usage}</span><ChevronLeft className="h-4 w-4 text-[var(--faint)]" /></Link>)}{!filtered.length && <div className="py-14 text-center text-sm text-[var(--faint)]">لا توجد نتائج مطابقة.</div>}</div></div></div>;
}

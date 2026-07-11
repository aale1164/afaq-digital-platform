import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, Ban, Coins, KeyRound, RotateCcw, Save, Shield, UserRoundCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { featureFlags } from "@/lib/brand";
import { demoOwner } from "@/lib/demo-data";
import { getAdminOverview } from "@/lib/admin-data";
import { changeMemberRoleAction, grantCreditsAction, resetMemberUsageAction, setMemberBlockedAction } from "@/features/admin/actions";

export default async function AdminMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const realUser = await getCurrentUser();
  const actor = realUser ?? (featureFlags.demoMode ? demoOwner : null);
  if (!actor) redirect(`/login?next=/admin/members/${id}`);
  if (actor.role !== "OWNER" && actor.role !== "ADMIN") redirect("/forbidden");
  const data = await getAdminOverview();
  const member = data.members.find((item) => item.id === id);
  if (!member) notFound();
  const protectedOwner = member.role === "OWNER";
  const canEdit = Boolean(realUser) && !protectedOwner;

  return (
    <div className="container-shell py-10">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--muted)] hover:text-[var(--brand)]"><ArrowRight className="h-4 w-4" /> العودة إلى الأعضاء</Link>
      <div className="glass-panel mt-7 rounded-[28px] p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4"><span className={`flex h-16 w-16 items-center justify-center rounded-2xl ${member.blocked ? "bg-[color-mix(in_srgb,var(--danger)_9%,transparent)] text-[var(--danger)]" : "bg-[color-mix(in_srgb,var(--brand)_9%,transparent)] text-[var(--brand)]"}`}>{member.blocked ? <Ban className="h-7 w-7" /> : <UserRoundCheck className="h-7 w-7" />}</span><div><h1 className="font-display text-2xl font-bold">{member.name}</h1><p className="mt-2 text-sm text-[var(--muted)]" dir="ltr">{member.email}</p></div></div>
          <span className="badge"><Shield className="h-3 w-3 text-[var(--gold)]" />{member.role}</span>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-4">{[["الباقة", member.plan], ["الاستخدام", member.usage], ["آخر ظهور", member.lastSeen], ["تاريخ الانضمام", member.joinedAt]].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-[var(--line)] p-4"><p className="text-[10px] text-[var(--faint)]">{label}</p><p className="mt-2 text-sm font-bold">{value}</p></div>)}</div>
        {protectedOwner && <div className="mt-6 rounded-xl border border-[color-mix(in_srgb,var(--gold)_30%,transparent)] bg-[color-mix(in_srgb,var(--gold)_7%,transparent)] p-4 text-sm text-[var(--gold)]"><KeyRound className="ml-2 inline h-4 w-4" /> حساب OWNER محمي: لا يمكن حذفه أو حظره أو تخفيض صلاحيته.</div>}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="glass-panel rounded-[26px] p-6"><h2 className="font-display font-bold">الصلاحية والحالة</h2><form action={changeMemberRoleAction} className="mt-5"><input type="hidden" name="userId" value={member.id} /><label className="label">الدور</label><div className="flex gap-2"><select name="role" defaultValue={member.role === "OWNER" ? "USER" : member.role} className="field"><option value="USER">USER</option><option value="DEVELOPER">DEVELOPER</option><option value="SUPPORT">SUPPORT</option>{actor.role === "OWNER" && <option value="ADMIN">ADMIN</option>}</select><button type="submit" disabled={!canEdit} className="btn-primary shrink-0 disabled:opacity-45"><Save className="h-4 w-4" /> حفظ</button></div></form><form action={setMemberBlockedAction} className="mt-4"><input type="hidden" name="userId" value={member.id} /><input type="hidden" name="blocked" value={String(!member.blocked)} /><button type="submit" disabled={!canEdit} className={member.blocked ? "btn-secondary w-full disabled:opacity-45" : "btn-danger w-full disabled:opacity-45"}>{member.blocked ? <UserRoundCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}{member.blocked ? "فك الحظر" : "حظر العضو"}</button></form></section>
        <section className="glass-panel rounded-[26px] p-6"><h2 className="font-display font-bold">الاستخدام والرصيد</h2><form action={grantCreditsAction} className="mt-5 space-y-3"><input type="hidden" name="userId" value={member.id} /><div className="grid grid-cols-[110px_1fr] gap-2"><input name="amount" type="number" min={1} max={100000} className="field" placeholder="العدد" required /><input name="reason" className="field" placeholder="سبب المنح" minLength={3} maxLength={200} required /></div><button type="submit" disabled={!canEdit} className="btn-primary w-full disabled:opacity-45"><Coins className="h-4 w-4" /> منح Credits</button></form><form action={resetMemberUsageAction} className="mt-3"><input type="hidden" name="userId" value={member.id} /><button type="submit" disabled={!canEdit} className="btn-secondary w-full disabled:opacity-45"><RotateCcw className="h-4 w-4" /> تصفير حد الاستخدام</button></form><p className="mt-4 text-[11px] leading-6 text-[var(--faint)]">التصفير يحفظ السجل التاريخي ويغيّر نقطة بداية حساب الحد، بدل حذف آثار الاستخدام.</p></section>
      </div>
      {!realUser && <p className="mt-5 text-sm text-[var(--gold)]">إجراءات التعديل معطلة في الوضع الاستعراضي.</p>}
    </div>
  );
}

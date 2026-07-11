import type { LucideIcon } from "lucide-react";

export function AdminStatCard({ label, value, note, icon: Icon, tone = "brand" }: { label: string; value: string; note: string; icon: LucideIcon; tone?: "brand" | "gold" | "blue" | "danger" }) {
  const colors = { brand: "var(--brand)", gold: "var(--gold)", blue: "var(--brand-2)", danger: "var(--danger)" };
  const color = colors[tone];
  return <div className="glass-panel rounded-[22px] p-5"><div className="flex items-start justify-between gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ color, background: `color-mix(in srgb, ${color} 9%, transparent)` }}><Icon className="h-5 w-5" /></span><span className="text-[10px] text-[var(--faint)]">{note}</span></div><strong className="font-display mt-5 block text-3xl">{value}</strong><p className="mt-2 text-xs text-[var(--muted)]">{label}</p></div>;
}

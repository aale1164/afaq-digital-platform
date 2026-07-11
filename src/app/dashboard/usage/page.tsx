import Link from "next/link";
import { CheckCircle2, Download, ImageIcon, QrCode, WandSparkles } from "lucide-react";

const rows = [
  ["محرر الصور الاحترافي", "photo-editor", "11 يوليو 2026، 02:18", "ناجحة", ImageIcon],
  ["استوديو QR", "qr-studio", "10 يوليو 2026، 23:42", "ناجحة", QrCode],
  ["إزالة خلفية الصور", "background-remover", "8 يوليو 2026، 18:07", "ناجحة", WandSparkles],
] as const;

export default function UsagePage() {
  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm text-[var(--muted)]">حسابك</p><h1 className="font-display mt-2 text-3xl font-bold">سجل الاستخدام</h1></div>
        <Link href="/api/user/usage/export" className="btn-secondary"><Download className="h-4 w-4" /> تصدير CSV</Link>
      </div>
      <div className="glass-panel mt-8 overflow-hidden rounded-[26px]">
        <div className="hidden grid-cols-[1fr_170px_100px] gap-4 border-b border-[var(--line)] px-6 py-4 text-xs font-bold text-[var(--faint)] md:grid"><span>الأداة</span><span>الوقت</span><span>الحالة</span></div>
        {rows.map(([name, slug, time, status, Icon]) => (
          <div key={slug} className="grid gap-3 border-b border-[var(--line)] px-5 py-5 last:border-b-0 md:grid-cols-[1fr_170px_100px] md:items-center">
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-3)] text-[var(--brand)]"><Icon className="h-4 w-4" /></span><div><p className="text-sm font-bold">{name}</p><p className="mt-1 text-[10px] text-[var(--faint)]" dir="ltr">{slug}</p></div></div>
            <span className="text-xs text-[var(--muted)]">{time}</span>
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--success)]"><CheckCircle2 className="h-3.5 w-3.5" />{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import { featureFlags } from "@/lib/brand";

export default function MarketplacePage() {
  if (!featureFlags.marketplace) notFound();
  return <div className="container-shell py-20"><h1 className="font-display text-3xl font-bold">المتجر</h1><p className="mt-4 text-[var(--muted)]">المتجر مفعّل إداريًا، لكن البيع يجب ألا يبدأ قبل ربط بوابة الدفع والسياسات النظامية.</p></div>;
}

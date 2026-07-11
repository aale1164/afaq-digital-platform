import type { Metadata } from "next";
import { ToolsExplorer } from "@/components/tools/tools-explorer";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "جميع الأدوات",
  description: "استكشف أدوات منصة آفاق الرقمية العاملة والقادمة.",
};

export default function ToolsPage() {
  return (
    <div className="container-shell py-14 sm:py-20">
      <SectionHeading eyebrow="مكتبة آفاق" title="كل أداة في مكانها" description="الأدوات الجاهزة قابلة للاستخدام الآن، والأدوات القادمة موضحة بلا أزرار وهمية أو وعود مبهمة." />
      <div className="mt-10"><ToolsExplorer /></div>
    </div>
  );
}

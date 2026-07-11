import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Construction } from "lucide-react";
import { ToolShell } from "@/components/tools/tool-shell";
import { PhotoEditor } from "@/features/tools/photo-editor/photo-editor";
import { BackgroundRemover } from "@/features/tools/background-remover/background-remover";
import { BatchImages } from "@/features/tools/batch-images/batch-images";
import { WatermarkStudio } from "@/features/tools/watermark/watermark-studio";
import { QrStudio } from "@/features/tools/qr/qr-studio";
import { DeveloperLab } from "@/features/tools/developer-lab/developer-lab";
import { getTool, toolRegistry } from "@/lib/tool-registry";
import { serviceStatus } from "@/lib/env";
import { getRuntimeToolDefinition } from "@/lib/tools/runtime";

export function generateStaticParams() {
  return toolRegistry.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  return tool ? { title: tool.nameAr, description: tool.description } : { title: "أداة غير موجودة" };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const baseTool = getTool(slug);
  if (!baseTool) notFound();
  const tool = await getRuntimeToolDefinition(baseTool);

  let content: React.ReactNode;
  if (tool.maintenanceMode || tool.status === "maintenance") {
    content = <div className="rounded-[28px] border border-[color-mix(in_srgb,var(--warning)_30%,transparent)] bg-[color-mix(in_srgb,var(--warning)_6%,transparent)] px-6 py-20 text-center"><Construction className="mx-auto h-10 w-10 text-[var(--warning)]" /><h2 className="font-display mt-5 text-2xl font-bold">الأداة تحت الصيانة</h2><p className="mx-auto mt-3 max-w-xl leading-8 text-[var(--muted)]">أوقفها مدير المنصة مؤقتًا. نظام الاستخدام يمنع بدء عمليات جديدة حتى إعادة تفعيلها.</p></div>;
  } else switch (slug) {
    case "photo-editor": content = <PhotoEditor />; break;
    case "background-remover": content = <BackgroundRemover configured={serviceStatus.backgroundRemoval} />; break;
    case "batch-images": content = <BatchImages />; break;
    case "watermark": content = <WatermarkStudio />; break;
    case "qr-studio": content = <QrStudio />; break;
    case "developer-lab": content = <DeveloperLab />; break;
    default:
      content = (
        <div className="rounded-[28px] border border-dashed border-[var(--line-strong)] bg-[var(--card)] px-6 py-20 text-center">
          <Construction className="mx-auto h-10 w-10 text-[var(--gold)]" />
          <h2 className="font-display mt-5 text-2xl font-bold">هذه الأداة مخطط لها وليست زرًا وهميًا</h2>
          <p className="mx-auto mt-3 max-w-xl leading-8 text-[var(--muted)]">البنية والمسار مسجلان في Tool Registry، لكن المعالجة الفعلية لم تُطلق بعد. لن نعرض زر تشغيل حتى تكتمل الوظيفة والاختبارات.</p>
        </div>
      );
  }

  return <ToolShell tool={tool}>{content}</ToolShell>;
}

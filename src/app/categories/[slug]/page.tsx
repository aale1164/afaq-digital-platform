import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolCard } from "@/components/tools/tool-card";
import { toolRegistry } from "@/lib/tool-registry";

const categoryMap = {
  images: "الصور",
  developers: "المطورون",
  documents: "المستندات",
  business: "الأعمال",
  students: "الطلاب",
} as const;

export function generateStaticParams() {
  return Object.keys(categoryMap).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = categoryMap[slug as keyof typeof categoryMap];
  return category ? { title: `أدوات ${category}` } : { title: "قسم غير موجود" };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = categoryMap[slug as keyof typeof categoryMap];
  if (!category) notFound();
  const tools = toolRegistry.filter((tool) => tool.category === category);
  return (
    <div className="container-shell py-14 sm:py-20">
      <p className="text-xs font-bold tracking-[.18em] text-[var(--brand)]">أقسام المنصة</p>
      <h1 className="font-display mt-3 text-3xl font-bold">أدوات {category}</h1>
      <p className="mt-4 text-[var(--muted)]">مجموعة الأدوات الحالية والمخطط لها في هذا القسم.</p>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{tools.map((tool) => <ToolCard key={tool.slug} tool={tool} />)}</div>
    </div>
  );
}

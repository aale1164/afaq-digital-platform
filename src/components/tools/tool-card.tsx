import Link from "next/link";
import { ArrowLeft, CircleDot, LockKeyhole, Sparkles } from "lucide-react";
import { ToolIcon } from "./tool-icon";
import type { ToolDefinition } from "@/lib/tool-registry";
import { cn } from "@/lib/utils";

const statusLabel = {
  active: "جاهزة",
  external: "تحتاج مزودًا",
  "coming-soon": "قريبًا",
  maintenance: "صيانة",
} as const;

export function ToolCard({ tool, priority = false }: { tool: ToolDefinition; priority?: boolean }) {
  const available = tool.status === "active" || tool.status === "external";
  const content = (
    <article className={cn(
      "group relative flex h-full min-h-[280px] flex-col overflow-hidden rounded-[24px] border p-6 transition duration-300",
      available
        ? "border-[var(--line)] bg-[var(--card)] hover:-translate-y-1.5 hover:border-[var(--line-strong)] hover:shadow-[0_22px_70px_rgba(0,0,0,.20)]"
        : "border-[var(--line)] bg-[color-mix(in_srgb,var(--surface-2)_56%,transparent)] opacity-75",
    )}>
      {priority && <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-[var(--brand)] opacity-[0.06] blur-2xl transition group-hover:opacity-[0.12]" />}
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--line-strong)] bg-[color-mix(in_srgb,var(--brand)_9%,var(--surface-3))] text-[var(--brand)] shadow-inner">
          <ToolIcon name={tool.icon} className="h-6 w-6" />
        </span>
        <span className="badge">
          {tool.status === "active" ? <CircleDot className="h-3 w-3 text-[var(--success)]" /> : tool.status === "external" ? <Sparkles className="h-3 w-3 text-[var(--gold)]" /> : <LockKeyhole className="h-3 w-3" />}
          {statusLabel[tool.status]}
        </span>
      </div>
      <div className="mt-6">
        <p className="mb-2 text-[10px] font-bold tracking-[0.18em] text-[var(--brand)]" dir="ltr">{tool.nameEn.toUpperCase()}</p>
        <h3 className="font-display text-lg font-bold leading-8 text-[var(--ink)]">{tool.nameAr}</h3>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{tool.description}</p>
      </div>
      <div className="mt-auto flex items-end justify-between gap-4 pt-6">
        <div className="flex flex-wrap gap-1.5">
          {tool.highlights.slice(0, 2).map((highlight) => <span key={highlight} className="text-[11px] text-[var(--faint)]">• {highlight}</span>)}
        </div>
        {available && <ArrowLeft className="h-5 w-5 shrink-0 text-[var(--brand)] transition-transform group-hover:-translate-x-1.5" />}
      </div>
    </article>
  );

  return available ? <Link href={`/tools/${tool.slug}`} className="block h-full">{content}</Link> : <div className="h-full" aria-label={`${tool.nameAr} - ${statusLabel[tool.status]}`}>{content}</div>;
}

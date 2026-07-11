"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { ToolCard } from "./tool-card";
import { categories, toolRegistry } from "@/lib/tool-registry";
import { cn } from "@/lib/utils";

export function ToolsExplorer() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("الكل");

  const tools = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return toolRegistry.filter((tool) => {
      const matchesCategory = category === "الكل" || tool.category === category;
      const matchesQuery = !normalized || `${tool.nameAr} ${tool.nameEn} ${tool.description}`.toLowerCase().includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <>
      <div className="glass-panel mb-8 rounded-[24px] p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <label className="relative block">
            <span className="sr-only">ابحث في الأدوات</span>
            <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--faint)]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="field pr-11" placeholder="ابحث باسم الأداة أو وظيفتها..." />
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            <SlidersHorizontal className="ml-1 h-4 w-4 shrink-0 text-[var(--faint)]" />
            {["الكل", ...categories].map((item) => (
              <button key={item} type="button" onClick={() => setCategory(item)} className={cn("min-h-10 shrink-0 rounded-xl border px-3.5 text-xs font-bold transition", category === item ? "border-[var(--brand)] bg-[color-mix(in_srgb,var(--brand)_12%,transparent)] text-[var(--brand)]" : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--line-strong)]")}>{item}</button>
            ))}
          </div>
        </div>
      </div>
      {tools.length ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => <ToolCard key={tool.slug} tool={tool} />)}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-[var(--line-strong)] py-20 text-center">
          <Search className="mx-auto h-8 w-8 text-[var(--faint)]" />
          <h2 className="mt-4 font-bold">لا توجد أداة مطابقة</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">جرّب كلمة أخرى أو اختر قسمًا مختلفًا.</p>
        </div>
      )}
    </>
  );
}

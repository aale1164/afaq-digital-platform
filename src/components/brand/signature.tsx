"use client";

import { ExternalLink } from "lucide-react";
import { brand } from "@/lib/brand";
import { XIcon } from "./x-icon";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/components/providers/site-settings-provider";

export function Signature({ compact = false, className }: { compact?: boolean; className?: string }) {
  const { xUrl } = useSiteSettings();
  return (
    <div className={cn("flex flex-wrap items-center gap-2 text-sm", className)}>
      <span className="font-semibold text-[var(--muted)]">{brand.signature}</span>
      <span className="h-1 w-1 rounded-full bg-[var(--brand)]" aria-hidden="true" />
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 font-bold text-[var(--brand)] transition hover:text-[var(--ink)]"
        aria-label={`تواصل مع عدناني على X ${brand.xHandle}`}
      >
        <XIcon />
        {!compact && <span>{brand.xHandle}</span>}
        <ExternalLink className="h-3 w-3 opacity-60" />
      </a>
    </div>
  );
}

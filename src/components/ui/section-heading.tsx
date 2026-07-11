import { cn } from "@/lib/utils";

export function SectionHeading({ eyebrow, title, description, centered = false, className }: { eyebrow?: string; title: string; description?: string; centered?: boolean; className?: string }) {
  return (
    <div className={cn("max-w-2xl", centered && "mx-auto text-center", className)}>
      {eyebrow && <p className="mb-3 text-xs font-bold tracking-[0.18em] text-[var(--brand)]">{eyebrow}</p>}
      <h2 className="font-display text-2xl font-bold leading-[1.65] text-[var(--ink)] sm:text-3xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-8 text-[var(--muted)]">{description}</p>}
    </div>
  );
}

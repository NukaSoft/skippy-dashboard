import type { ReactNode } from "react";

interface PageHeaderProps {
  /** Yellow eyebrow, e.g. "STATION 01 — STAT" */
  eyebrow: string;
  /** Abril display title, e.g. "The Bridge" */
  title: string;
  /** Mono sub-line under the title */
  sub?: string;
  /** Right-aligned actions */
  actions?: ReactNode;
}

/** Every page: eyebrow → Abril title → mono sub-line → right actions. */
export function PageHeader({ eyebrow, title, sub, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <div className="font-heading font-bold uppercase tracking-[0.18em] text-[0.6875rem] text-rad mb-1">
          {eyebrow}
        </div>
        <h1 className="text-[1.875rem] text-pip-cream">{title}</h1>
        {sub && <p className="font-mono text-xs text-pip-dark mt-1">{sub}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}

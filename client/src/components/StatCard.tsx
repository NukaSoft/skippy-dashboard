import type { LucideIcon } from "lucide-react";
import { Tip } from "./Tip";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  accentColor?: string;
  /** Raw value shown as custom tooltip on hover */
  raw?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  accentColor = "text-pip-dim",
  raw,
}: StatCardProps) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="font-heading font-bold text-[0.6875rem] text-rad uppercase tracking-[0.16em] truncate">
          {label}
        </span>
        <Icon className={`w-4 h-4 flex-shrink-0 ${accentColor}`} strokeWidth={1.75} />
      </div>
      <div className="flex items-end gap-2 min-w-0">
        <Tip raw={raw}>
          <span className="font-mono font-semibold text-[1.75rem] leading-none text-pip-cream truncate [font-variant-numeric:tabular-nums]">
            {value}
          </span>
        </Tip>
        {trend && (
          <span className="font-mono text-xs text-pip-dark mb-0.5 flex-shrink-0">{trend}</span>
        )}
      </div>
    </div>
  );
}

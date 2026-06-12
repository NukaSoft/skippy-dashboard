import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="w-14 h-14 rounded-lg bg-surface-3 flex items-center justify-center mb-5"
        style={{ border: "1px dashed var(--pip-border)" }}
      >
        <Icon className="w-6 h-6 text-pip-dark" strokeWidth={1.75} />
      </div>
      <h3 className="text-sm text-pip-cream mb-2">{title}</h3>
      <p className="text-sm text-pip-dim max-w-md mb-6" style={{ fontFamily: "var(--pip-font-heading)", textTransform: "none", letterSpacing: 0 }}>
        {description}
      </p>
      {action}
    </div>
  );
}

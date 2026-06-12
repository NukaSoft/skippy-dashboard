import { useState } from "react";
import { BookOpen } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";

type BinderKind = "ops" | "network" | "trading" | "content";

interface Binder {
  title: string;
  kind: BinderKind;
  date: string;
  pages: number;
  href?: string;
}

/* Spine colors rotate red/yellow/sky/green per the handoff. */
const KIND_META: Record<BinderKind, { label: string; spine: string }> = {
  ops: { label: "Ops", spine: "#C41E24" },
  network: { label: "Network", spine: "#F1C40F" },
  trading: { label: "Trading", spine: "#87CEEB" },
  content: { label: "Content", spine: "#54C47A" },
};

/* Placeholder shelf — wire to the reports directory when the server
   exposes one (handoff: "prototype uses placeholders"). */
const BINDERS: Binder[] = [
  { title: "Hot Rod migration close-out", kind: "ops", date: "2026-06-12", pages: 14 },
  { title: "Bishop network baseline", kind: "network", date: "2026-06-11", pages: 9 },
  { title: "House portfolio review", kind: "trading", date: "2026-06-08", pages: 21 },
  { title: "Captain's Log weekly digest", kind: "content", date: "2026-06-08", pages: 6 },
];

const FILTERS = ["All", "Ops", "Network", "Trading", "Content"] as const;

export function Library() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const shown = BINDERS.filter(
    (b) => filter === "All" || KIND_META[b.kind].label === filter
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Station 08 — LIBRARY"
        title="Report Binders"
        sub="Reports filed and alphabetized.  You're welcome."
      />

      {/* Filter segments */}
      <div className="flex rounded-md overflow-hidden self-start w-fit" style={{ border: "1px solid var(--pip-border)" }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 font-heading font-bold uppercase tracking-[0.1em] text-[0.625rem] transition-colors"
            style={
              filter === f
                ? { background: "var(--pip-primary)", color: "var(--pip-ink)" }
                : { background: "transparent", color: "var(--pip-dim)" }
            }
          >
            {f}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Shelf is empty"
          description="No binders in this section yet.  I file fast; give the crew something to report."
        />
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(208px, 1fr))" }}>
          {shown.map((b) => (
            <a
              key={b.title}
              href={b.href ?? "#"}
              onClick={(e) => !b.href && e.preventDefault()}
              className="card-hover flex overflow-hidden cursor-pointer no-underline"
              title={b.href ? "Open PDF" : "PDF not yet wired"}
            >
              <div className="w-2 flex-shrink-0" style={{ background: KIND_META[b.kind].spine }} />
              <div className="p-3.5 min-w-0 flex flex-col gap-2 flex-1">
                <span
                  className="self-start px-2 py-0.5 rounded-full font-heading font-bold uppercase tracking-[0.12em] text-[0.5625rem]"
                  style={{
                    border: "1px solid var(--pip-border)",
                    color: "var(--pip-dim)",
                  }}
                >
                  {KIND_META[b.kind].label}
                </span>
                <span className="text-[15px] font-bold text-pip-cream leading-snug" style={{ fontFamily: "var(--pip-font-heading)", textTransform: "none", letterSpacing: 0 }}>
                  {b.title}
                </span>
                <span className="mt-auto font-mono text-[0.6875rem] text-pip-dark">
                  {b.date} · {b.pages} pp · PDF
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

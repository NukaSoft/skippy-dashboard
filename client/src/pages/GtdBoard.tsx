import { useEffect, useState, useCallback } from "react";
import {
  RefreshCw,
  Plus,
  Inbox,
  Zap,
  Clock,
  CloudSun,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  X,
} from "lucide-react";
import { api } from "../lib/api";
import { eventBus } from "../lib/eventBus";
import { EmptyState } from "../components/EmptyState";
import type { GtdItem, GtdItemType, GtdStats } from "../lib/types";

// Board columns — the GTD processing flow
const COLUMNS: { type: GtdItemType; label: string; icon: typeof Inbox; color: string; dot: string }[] = [
  { type: "inbox", label: "Inbox", icon: Inbox, color: "text-amber-400", dot: "bg-amber-400" },
  { type: "next_action", label: "Next Actions", icon: Zap, color: "text-emerald-400", dot: "bg-emerald-400" },
  { type: "waiting_for", label: "Waiting For", icon: Clock, color: "text-blue-400", dot: "bg-blue-400" },
  { type: "someday_maybe", label: "Someday", icon: CloudSun, color: "text-violet-400", dot: "bg-violet-400" },
];

const COLUMN_PAGE_SIZE = 15;

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function ItemCard({
  item,
  onMove,
  onComplete,
}: {
  item: GtdItem;
  onMove: (id: number, type: GtdItemType) => void;
  onComplete: (id: number) => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const tagList = item.tags ? item.tags.split(",") : [];

  return (
    <div
      className="bg-surface-2 rounded-lg border border-border/50 p-3 hover:border-accent/30 transition-colors cursor-pointer group"
      onClick={() => setShowActions(!showActions)}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm text-gray-200 leading-tight flex-1">{item.title}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onComplete(item.id);
          }}
          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-emerald-400 transition-all flex-shrink-0"
          title="Complete"
        >
          <CheckCircle2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {item.context && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
            {item.context}
          </span>
        )}
        {item.delegated_to && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">
            → {item.delegated_to}
          </span>
        )}
        {item.area_name && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-500/10 text-gray-400">
            {item.area_name}
          </span>
        )}
        {item.energy_level && (
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded ${
              item.energy_level === "high"
                ? "bg-red-500/10 text-red-400"
                : item.energy_level === "medium"
                  ? "bg-amber-500/10 text-amber-400"
                  : "bg-green-500/10 text-green-400"
            }`}
          >
            {item.energy_level}
          </span>
        )}
        {item.due_date && (
          <span className="text-[10px] text-amber-400">
            📅 {item.due_date}
          </span>
        )}
        <span className="text-[10px] text-gray-600 ml-auto">{timeAgo(item.created_at)}</span>
      </div>

      {tagList.length > 0 && (
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {tagList.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[9px] px-1 py-0.5 rounded bg-accent/10 text-accent/70">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Quick move actions */}
      {showActions && (
        <div className="flex gap-1 mt-2 pt-2 border-t border-border/30">
          {COLUMNS.filter((c) => c.type !== item.item_type).map((col) => (
            <button
              key={col.type}
              onClick={(e) => {
                e.stopPropagation();
                onMove(item.id, col.type);
                setShowActions(false);
              }}
              className={`text-[10px] px-2 py-1 rounded bg-surface-3 hover:bg-surface-1 ${col.color} flex items-center gap-1 transition-colors`}
            >
              <ArrowRight className="w-3 h-3" /> {col.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function QuickCapture({ onCapture }: { onCapture: (text: string) => void }) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-2 border border-dashed border-border/50 rounded-lg text-xs text-gray-500 hover:text-accent hover:border-accent/30 flex items-center justify-center gap-1 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> Capture
      </button>
    );
  }

  return (
    <div className="flex gap-1.5">
      <input
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && text.trim()) {
            onCapture(text.trim());
            setText("");
            setOpen(false);
          }
          if (e.key === "Escape") {
            setText("");
            setOpen(false);
          }
        }}
        placeholder="What's on your mind?"
        className="flex-1 bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-accent/50"
      />
      <button
        onClick={() => { setOpen(false); setText(""); }}
        className="text-gray-500 hover:text-gray-300 p-2"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function StatsBar({ stats }: { stats: GtdStats | null }) {
  if (!stats) return null;
  const items = [
    { label: "Inbox", value: stats.inbox_count, color: "text-amber-400" },
    { label: "Next", value: stats.next_actions, color: "text-emerald-400" },
    { label: "Waiting", value: stats.waiting_count, color: "text-blue-400" },
    { label: "Projects", value: stats.active_projects, color: "text-violet-400" },
    { label: "Done (7d)", value: stats.completed_week, color: "text-gray-400" },
  ];

  return (
    <div className="flex gap-4 flex-wrap">
      {items.map((s) => (
        <div key={s.label} className="flex items-center gap-1.5">
          <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
          <span className="text-[11px] text-gray-500">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

export function GtdBoard() {
  const [items, setItems] = useState<GtdItem[]>([]);
  const [stats, setStats] = useState<GtdStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    try {
      const [itemsRes, statsRes] = await Promise.all([
        api.gtd.items({ status: "active", limit: 500 }),
        api.gtd.stats(),
      ]);
      setItems(itemsRes.items);
      setStats(statsRes);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    return eventBus.subscribe((msg) => {
      if (msg.type.startsWith("gtd_")) load();
    });
  }, [load]);

  const handleCapture = async (text: string) => {
    await api.gtd.createItem({ title: text, item_type: "inbox", source: "manual" });
    load();
  };

  const handleMove = async (id: number, type: GtdItemType) => {
    await api.gtd.moveItem(id, type);
    load();
  };

  const handleComplete = async (id: number) => {
    await api.gtd.completeItem(id);
    load();
  };

  const grouped = COLUMNS.reduce(
    (acc, col) => {
      acc[col.type] = items.filter((i) => i.item_type === col.type);
      return acc;
    },
    {} as Record<string, GtdItem[]>
  );

  if (!loading && items.length === 0) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
            <Inbox className="w-4.5 h-4.5 text-accent" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-100">Overseer's Dashboard</h1>
            <p className="text-xs text-gray-500">GTD + PARA — capture, clarify, execute</p>
          </div>
        </div>
        <EmptyState
          icon={Inbox}
          title="Empty mind, full potential"
          description="Capture your first item to get started. Everything flows through the Inbox."
          action={
            <div className="w-72">
              <QuickCapture onCapture={handleCapture} />
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
            <Inbox className="w-4.5 h-4.5 text-accent" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-100">Overseer's Dashboard</h1>
            <p className="text-xs text-gray-500">
              GTD + PARA — capture, clarify, execute
            </p>
          </div>
        </div>
        <button onClick={load} className="btn-ghost flex-shrink-0">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="mb-6">
        <StatsBar stats={stats} />
      </div>

      {/* Mobile: stack vertically. Desktop: horizontal scroll */}
      <div className="flex flex-col md:flex-row gap-4 min-h-[600px] md:overflow-x-auto pb-4 md:-mx-8 md:px-8">
        {COLUMNS.map((col) => {
          const colItems = grouped[col.type] || [];
          const Icon = col.icon;
          return (
            <div
              key={col.type}
              className="bg-surface-1 rounded-xl border border-border p-3 flex flex-col flex-shrink-0 md:w-72 w-full"
            >
              <div className="flex items-center gap-2 mb-3 px-1">
                <Icon className={`w-4 h-4 ${col.color}`} />
                <span className={`text-xs font-semibold uppercase tracking-wider ${col.color}`}>
                  {col.label}
                </span>
                <span className="ml-auto text-[11px] text-gray-600 bg-surface-3 px-2 py-0.5 rounded-full">
                  {colItems.length}
                </span>
              </div>

              {col.type === "inbox" && (
                <div className="mb-3">
                  <QuickCapture onCapture={handleCapture} />
                </div>
              )}

              <div className="flex-1 space-y-2 overflow-y-auto">
                {colItems.length > 0 ? (
                  <>
                    {colItems.slice(0, expanded[col.type] || COLUMN_PAGE_SIZE).map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        onMove={handleMove}
                        onComplete={handleComplete}
                      />
                    ))}
                    {colItems.length > (expanded[col.type] || COLUMN_PAGE_SIZE) && (
                      <button
                        onClick={() =>
                          setExpanded((prev) => ({
                            ...prev,
                            [col.type]: (prev[col.type] || COLUMN_PAGE_SIZE) + COLUMN_PAGE_SIZE,
                          }))
                        }
                        className="w-full py-2 text-[11px] text-gray-500 hover:text-gray-300 flex items-center justify-center gap-1 transition-colors"
                      >
                        <ChevronDown className="w-3 h-3" />
                        {colItems.length - (expanded[col.type] || COLUMN_PAGE_SIZE)} more
                      </button>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-20 text-xs text-gray-600">
                    {col.type === "inbox" ? "Inbox zero" : "Empty"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

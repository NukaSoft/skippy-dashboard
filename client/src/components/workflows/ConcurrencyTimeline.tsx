import type { ConcurrencyData, ConcurrencyLane } from "../../lib/types";
import { getThemeColors } from "../../lib/theme";

// ── Color palette ─────────────────────────────────────────────────────────────

const SUBAGENT_PALETTE = [
  "#10b981", // emerald
  "#60a5fa", // blue
  "#f59e0b", // amber
  "#f43f5e", // rose
  "#06b6d4", // cyan
  "#f97316", // orange
  "#a855f7", // purple
  "#84cc16", // lime
];

function laneColor(name: string, subagentIndex: number): string {
  if (name === "Main Agent") return getThemeColors().primary;
  return SUBAGENT_PALETTE[subagentIndex % SUBAGENT_PALETTE.length] ?? getThemeColors().primary;
}

// ── X-axis tick labels ─────────────────────────────────────────────────────────

const TICKS = [0, 25, 50, 75, 100];

// ── Lane row ──────────────────────────────────────────────────────────────────

interface LaneRowProps {
  lane: ConcurrencyLane;
  color: string;
}

function LaneRow({ lane, color }: LaneRowProps) {
  const startPct = Math.max(0, Math.min(100, lane.avgStart));
  const endPct = Math.max(0, Math.min(100, lane.avgEnd));
  const widthPct = Math.max(0, endPct - startPct);

  return (
    <div className="flex items-center gap-3 py-1.5 group">
      {/* Label column */}
      <div className="flex-shrink-0 w-[120px] text-right" title={lane.name}>
        <span className="text-xs font-medium text-gray-400 truncate block group-hover:text-gray-200 transition-colors">
          {lane.name}
        </span>
        <span className="text-[10px] text-gray-600">
          {lane.count} {lane.count === 1 ? "session" : "sessions"}
        </span>
      </div>

      {/* Track area */}
      <div className="relative flex-1 h-6 bg-surface-3 rounded overflow-hidden">
        {/* Segment */}
        {widthPct > 0 && (
          <div
            className="absolute top-0 bottom-0 rounded"
            style={{
              left: `${startPct}%`,
              width: `${widthPct}%`,
              backgroundColor: color,
              opacity: 0.85,
            }}
            title={`${startPct.toFixed(1)}% – ${endPct.toFixed(1)}% of session duration`}
          />
        )}
      </div>

      {/* Duration range label */}
      <div className="flex-shrink-0 w-[88px] text-xs text-gray-600 tabular-nums">
        {startPct.toFixed(0)}%&ndash;{endPct.toFixed(0)}%
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-10 h-10 rounded-xl bg-surface-4 flex items-center justify-center mb-3">
        <svg
          className="w-5 h-5 text-gray-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <rect x="3" y="4" width="18" height="4" rx="1" />
          <rect x="3" y="10" width="12" height="4" rx="1" />
          <rect x="3" y="16" width="15" height="4" rx="1" />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-400">No concurrency data</p>
      <p className="text-xs text-gray-600 mt-1">
        Concurrency data appears once sessions with subagents have been recorded.
      </p>
    </div>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

export interface ConcurrencyTimelineProps {
  data: ConcurrencyData;
}

export function ConcurrencyTimeline({ data }: ConcurrencyTimelineProps) {
  const lanes = data.aggregateLanes;

  if (lanes.length === 0) {
    return <EmptyState />;
  }

  // Assign color indices to non-main lanes
  let subagentIndex = 0;
  const coloredLanes = lanes.map((lane) => {
    const isMain = lane.name === "Main Agent";
    const color = isMain
      ? getThemeColors().primary
      : (SUBAGENT_PALETTE[subagentIndex % SUBAGENT_PALETTE.length] || getThemeColors().primary);
    if (!isMain) subagentIndex++;
    return { lane, color };
  });

  return (
    <div className="w-full">
      {/* Lane rows */}
      <div className="flex flex-col divide-y divide-surface-4">
        {coloredLanes.map(({ lane, color }) => (
          <LaneRow key={lane.name} lane={lane} color={color} />
        ))}
      </div>

      {/* X-axis ticks */}
      <div className="mt-2 flex items-center gap-3">
        {/* Spacer to align with track area */}
        <div className="flex-shrink-0 w-[120px]" />
        <div className="relative flex-1 flex justify-between">
          {TICKS.map((tick) => (
            <span
              key={tick}
              className="text-[10px] text-gray-600 tabular-nums"
              style={
                tick === 0
                  ? { position: "absolute", left: 0 }
                  : tick === 100
                    ? { position: "absolute", right: 0 }
                    : { position: "absolute", left: `${tick}%`, transform: "translateX(-50%)" }
              }
            >
              {tick}%
            </span>
          ))}
        </div>
        <div className="flex-shrink-0 w-[88px]" />
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3">
        {coloredLanes.map(({ lane, color }) => (
          <div key={lane.name} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-gray-500">{lane.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Re-export helper so callers can import the color fn if needed
export { laneColor };

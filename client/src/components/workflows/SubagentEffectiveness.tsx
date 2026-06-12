import type { SubagentEffectivenessItem } from "../../lib/types";
import { getThemeColors } from "../../lib/theme";

function getColors() {
  const t = getThemeColors();
  return ["#54C47A", t.primary, "#a855f7", "#F1C40F", "#f43f5e", "#06b6d4", "#f97316", t.primary];
}

const RING_RADIUS = 28;
const RING_STROKE = 5;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function formatDurationSec(seconds: number | null): string {
  if (seconds === null || seconds < 0) return "—";
  const totalSec = Math.floor(seconds);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

interface SuccessRingProps {
  rate: number;
  color: string;
}

function SuccessRing({ rate, color }: SuccessRingProps) {
  const clampedRate = Math.max(0, Math.min(100, rate));
  const filled = (clampedRate / 100) * RING_CIRCUMFERENCE;
  const gap = RING_CIRCUMFERENCE - filled;
  const viewSize = (RING_RADIUS + RING_STROKE) * 2 + 4;
  const center = viewSize / 2;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={viewSize}
        height={viewSize}
        viewBox={`0 0 ${viewSize} ${viewSize}`}
        aria-label={`Success rate: ${clampedRate.toFixed(1)}%`}
        role="img"
      >
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={RING_RADIUS}
          fill="none"
          stroke="#2a2a3d"
          strokeWidth={RING_STROKE}
        />
        {/* Arc */}
        <circle
          cx={center}
          cy={center}
          r={RING_RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={RING_STROKE}
          strokeDasharray={`${filled} ${gap}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
        {/* Percentage label */}
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#e4e4ed"
          fontSize="13"
          fontWeight="600"
          fontFamily="Inter, sans-serif"
        >
          {clampedRate.toFixed(0)}%
        </text>
      </svg>
      <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
        Success
      </span>
    </div>
  );
}

interface SparklineProps {
  data: number[];
  color: string;
}

function Sparkline({ data, color }: SparklineProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-end gap-px h-8">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex-1 rounded-sm bg-surface-4" style={{ height: "2px" }} />
        ))}
      </div>
    );
  }

  const max = Math.max(...data, 1);

  return (
    <div className="flex items-end gap-px h-8" aria-label="Weekly activity sparkline">
      {data.map((value, i) => {
        const heightPct = Math.max((value / max) * 100, value > 0 ? 8 : 4);
        return (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all duration-300"
            style={{
              height: `${heightPct}%`,
              backgroundColor: value > 0 ? color : "#2a2a3d",
              opacity: value > 0 ? 0.85 : 0.4,
            }}
            title={`${value}`}
          />
        );
      })}
    </div>
  );
}

interface MetricBoxProps {
  label: string;
  value: string;
}

function MetricBox({ label, value }: MetricBoxProps) {
  return (
    <div className="flex flex-col items-center gap-0.5 bg-surface-3 rounded-lg px-2 py-2 flex-1 min-w-0 overflow-hidden">
      <span className="text-xs font-semibold text-gray-200 tabular-nums truncate w-full text-center">
        {value}
      </span>
      <span className="text-[9px] text-gray-500 uppercase tracking-wider truncate w-full text-center">
        {label}
      </span>
    </div>
  );
}

interface ScoreCardProps {
  item: SubagentEffectivenessItem;
  colorIndex: number;
}

function ScoreCard({ item, colorIndex }: ScoreCardProps) {
  const colors = getColors();
  const color = colors[colorIndex % colors.length] || colors[0]!;

  return (
    <div
      className="
        bg-surface-2 border border-border rounded-xl p-4
        flex flex-col gap-4 min-w-0 overflow-hidden
        transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30 hover:border-border-light
      "
    >
      {/* Header */}
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
        <span className="text-sm font-medium text-gray-200 truncate" title={item.subagent_type}>
          {item.subagent_type}
        </span>
      </div>

      {/* Success ring */}
      <div className="flex justify-center">
        <SuccessRing rate={item.successRate} color={color} />
      </div>

      {/* Metric boxes */}
      <div className="flex gap-2">
        <MetricBox label="Sessions" value={String(item.sessions)} />
        <MetricBox label="Avg Duration" value={formatDurationSec(item.avgDuration)} />
      </div>

      {/* Sparkline */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Weekly activity</span>
        <Sparkline data={item.trend} color={color} />
      </div>
    </div>
  );
}

export interface SubagentEffectivenessProps {
  data: SubagentEffectivenessItem[];
}

export function SubagentEffectiveness({ data }: SubagentEffectivenessProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500 text-sm">
        No subagent data available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((item, i) => (
        <ScoreCard key={item.subagent_type} item={item} colorIndex={i} />
      ))}
    </div>
  );
}

import { useRef, useEffect } from "react";
import * as d3 from "d3";
import type { ErrorPropagationData } from "../../lib/types";

// ── Constants ─────────────────────────────────────────────────────────────────

const MARGIN = { top: 20, right: 16, bottom: 36, left: 40 };
const CHART_HEIGHT = 160;

const DEPTH_LABELS: Record<number, string> = {
  0: "Main",
  1: "Direct",
  2: "Nested",
  3: "Deep",
};

function depthLabel(depth: number): string {
  return DEPTH_LABELS[depth] ?? `Depth ${depth}`;
}

// ── D3 bar chart ──────────────────────────────────────────────────────────────

function renderBars(svg: SVGSVGElement, byDepth: ErrorPropagationData["byDepth"]): void {
  const container = svg.parentElement;
  const width = container ? container.clientWidth : 400;
  const innerW = width - MARGIN.left - MARGIN.right;
  const innerH = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;

  const root = d3.select(svg);
  root.selectAll("*").remove();
  root.attr("viewBox", `0 0 ${width} ${CHART_HEIGHT}`).attr("preserveAspectRatio", "xMidYMid meet");

  const defs = root.append("defs");
  const grad = defs
    .append("linearGradient")
    .attr("id", "err-bar-grad")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");
  grad.append("stop").attr("offset", "0%").attr("stop-color", "#f87171");
  grad
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#7f1d1d")
    .attr("stop-opacity", 0.6);

  const g = root.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

  const maxCount = d3.max(byDepth, (d) => d.count) ?? 1;

  const xScale = d3
    .scaleBand()
    .domain(byDepth.map((d) => String(d.depth)))
    .range([0, innerW])
    .padding(0.35);

  const yScale = d3.scaleLinear().domain([0, maxCount]).nice().range([innerH, 0]);

  // Grid lines
  const yTicks = yScale.ticks(4);
  g.selectAll<SVGLineElement, number>(".grid-line")
    .data(yTicks)
    .join("line")
    .attr("class", "grid-line")
    .attr("x1", 0)
    .attr("x2", innerW)
    .attr("y1", (d) => yScale(d))
    .attr("y2", (d) => yScale(d))
    .attr("stroke", "#2a2a3d")
    .attr("stroke-width", 1);

  // Y axis
  g.append("g")
    .call(
      d3
        .axisLeft(yScale)
        .ticks(4)
        .tickSize(0)
        .tickFormat((d) => (Number(d) % 1 === 0 ? String(d) : ""))
    )
    .call((ax) => ax.select(".domain").remove())
    .selectAll("text")
    .attr("fill", "#6b7280")
    .attr("font-size", 10)
    .attr("font-family", "Inter, sans-serif");

  // X axis
  g.append("g")
    .attr("transform", `translate(0,${innerH})`)
    .call(
      d3
        .axisBottom(xScale)
        .tickSize(0)
        .tickFormat((d) => depthLabel(Number(d)))
    )
    .call((ax) => ax.select(".domain").remove())
    .selectAll("text")
    .attr("fill", "#9ca3af")
    .attr("font-size", 10)
    .attr("font-family", "Inter, sans-serif")
    .attr("dy", "1.2em");

  // Bars
  byDepth.forEach((d) => {
    const bx = xScale(String(d.depth));
    if (bx === undefined) return;
    const bw = xScale.bandwidth();
    const barH = innerH - yScale(d.count);
    const by = yScale(d.count);

    const bg = g.append("g");

    bg.append("rect")
      .attr("x", bx)
      .attr("y", by)
      .attr("width", bw)
      .attr("height", barH)
      .attr("rx", 4)
      .attr("fill", "url(#err-bar-grad)");

    // Count label above bar
    if (d.count > 0) {
      bg.append("text")
        .attr("x", bx + bw / 2)
        .attr("y", by - 5)
        .attr("text-anchor", "middle")
        .attr("fill", "#fca5a5")
        .attr("font-size", 10)
        .attr("font-weight", "600")
        .attr("font-family", "Inter, sans-serif")
        .text(d.count);
    }
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export interface ErrorPropagationMapProps {
  data: ErrorPropagationData;
}

export function ErrorPropagationMap({ data }: ErrorPropagationMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const hasErrors = data.byDepth.some((d) => d.count > 0) || data.byType.some((t) => t.count > 0);

  const errorRatePct = Math.round(data.errorRate * 100);

  useEffect(() => {
    if (!svgRef.current || !hasErrors) return;
    renderBars(
      svgRef.current,
      data.byDepth.filter((d) => d.count > 0)
    );
  }, [data, hasErrors]);

  if (!hasErrors) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#54C47A"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9 12l2 2 4-4" />
        </svg>
        <span className="text-sm text-emerald-400 font-medium">No errors recorded</span>
      </div>
    );
  }

  const topTypes = [...data.byType].sort((a, b) => b.count - a.count).slice(0, 6);

  return (
    <div className="flex flex-col gap-5">
      {/* Error rate badge + bar chart row */}
      <div className="relative">
        {/* Floating badge */}
        <div
          className="absolute top-0 right-0 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-red-500/30 bg-red-500/10"
          aria-label={`${errorRatePct}% of sessions had errors`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" aria-hidden="true" />
          <span className="text-xs font-semibold text-red-300 tabular-nums">
            {errorRatePct}% of sessions
          </span>
        </div>

        {/* Bar chart */}
        <div className="w-full overflow-hidden">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Errors by hierarchy depth
          </p>
          <svg
            ref={svgRef}
            className="w-full"
            style={{ height: CHART_HEIGHT }}
            aria-label="Error count by agent hierarchy depth"
            role="img"
          />
        </div>
      </div>

      {/* Agent type breakdown */}
      {topTypes.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Error-prone agent types
          </p>
          <div className="flex flex-col gap-1.5">
            {topTypes.map((t) => (
              <div
                key={t.subagent_type}
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-surface-3 hover:bg-surface-4 transition-colors"
              >
                <span className="text-sm text-gray-300 truncate">{t.subagent_type}</span>
                <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-300 border border-red-500/25 tabular-nums">
                  {t.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session summary */}
      <p className="text-xs text-gray-500">
        <span className="text-gray-300 font-medium">{data.sessionsWithErrors}</span> of{" "}
        <span className="text-gray-300 font-medium">{data.totalSessions}</span> sessions had errors
      </p>
    </div>
  );
}

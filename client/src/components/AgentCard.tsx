import { Bot, GitBranch, Clock, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AgentStatusBadge } from "./StatusBadge";
import type { Agent } from "../lib/types";
import { formatDuration, timeAgo } from "../lib/format";

interface AgentCardProps {
  agent: Agent;
  onClick?: () => void;
}

export function AgentCard({ agent, onClick }: AgentCardProps) {
  const navigate = useNavigate();
  const isActive = agent.status === "working" || agent.status === "connected";

  function handleClick() {
    if (onClick) {
      onClick();
    } else {
      navigate(`/sessions/${agent.session_id}`);
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`card-hover p-4 cursor-pointer animate-fade-in overflow-hidden ${
        isActive ? "border-l-2 border-l-yellow-500/20" : ""
      }`}
      style={isActive ? { borderLeft: "2px solid var(--pip-amber)" } : undefined}
    >
      <div className="flex items-start justify-between gap-2 mb-3 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: agent.type === "main" ? "var(--pip-accent)" : "var(--pip-surface-3)",
              border: "1.5px solid var(--pip-primary)",
              color: "var(--pip-primary)",
            }}
          >
            {agent.type === "main" ? (
              <Bot className="w-3.5 h-3.5" strokeWidth={1.75} />
            ) : (
              <GitBranch className="w-3.5 h-3.5" strokeWidth={1.75} />
            )}
          </div>
          <div className="min-w-0 overflow-hidden">
            <p className="text-sm font-medium text-gray-200 truncate">{agent.name}</p>
            {agent.subagent_type && (
              <p className="text-[11px] text-gray-500 truncate font-mono">{agent.subagent_type}</p>
            )}
          </div>
        </div>
        <AgentStatusBadge status={agent.status} />
      </div>

      {agent.task && (
        <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed">{agent.task}</p>
      )}

      <div className="flex items-center gap-4 text-[11px] text-gray-500 min-w-0 overflow-hidden font-mono">
        {agent.current_tool && (
          <span className="flex items-center gap-1">
            <Wrench className="w-3 h-3" />
            {agent.current_tool}
          </span>
        )}
        {agent.ended_at ? (
          <>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              ran {formatDuration(agent.started_at, agent.ended_at)}
            </span>
            <span className="text-gray-600">{timeAgo(agent.ended_at)}</span>
          </>
        ) : (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo(agent.updated_at || agent.started_at)}
          </span>
        )}
        <span className="ml-auto font-mono opacity-50">{agent.session_id.slice(0, 8)}</span>
      </div>
    </div>
  );
}

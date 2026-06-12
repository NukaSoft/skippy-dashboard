export type SessionStatus = "active" | "completed" | "error" | "abandoned";
export type AgentStatus = "idle" | "connected" | "working" | "completed" | "error";
export type AgentType = "main" | "subagent";

export interface Session {
  id: string;
  name: string | null;
  status: SessionStatus;
  cwd: string | null;
  model: string | null;
  started_at: string;
  ended_at: string | null;
  metadata: string | null;
  agent_count?: number;
  last_activity?: string;
  cost?: number;
}

export interface Agent {
  id: string;
  session_id: string;
  name: string;
  type: AgentType;
  subagent_type: string | null;
  status: AgentStatus;
  task: string | null;
  current_tool: string | null;
  started_at: string;
  ended_at: string | null;
  updated_at: string;
  parent_agent_id: string | null;
  metadata: string | null;
}

export interface DashboardEvent {
  id: number;
  session_id: string;
  agent_id: string | null;
  event_type: string;
  tool_name: string | null;
  summary: string | null;
  data: string | null;
  created_at: string;
}

export interface Stats {
  total_sessions: number;
  active_sessions: number;
  active_agents: number;
  total_agents: number;
  total_events: number;
  events_today: number;
  ws_connections: number;
  agents_by_status: Record<string, number>;
  sessions_by_status: Record<string, number>;
}

export interface Analytics {
  tokens: {
    total_input: number;
    total_output: number;
    total_cache_read: number;
    total_cache_write: number;
  };
  tool_usage: Array<{ tool_name: string; count: number }>;
  daily_events: Array<{ date: string; count: number }>;
  daily_sessions: Array<{ date: string; count: number }>;
  agent_types: Array<{ subagent_type: string; count: number }>;
  event_types: Array<{ event_type: string; count: number }>;
  avg_events_per_session: number;
  total_subagents: number;
  overview: {
    total_sessions: number;
    active_sessions: number;
    active_agents: number;
    total_agents: number;
    total_events: number;
  };
  agents_by_status: Record<string, number>;
  sessions_by_status: Record<string, number>;
}

export interface ModelPricing {
  model_pattern: string;
  display_name: string;
  input_per_mtok: number;
  output_per_mtok: number;
  cache_read_per_mtok: number;
  cache_write_per_mtok: number;
  updated_at: string;
}

export interface CostBreakdown {
  model: string;
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
  cache_write_tokens: number;
  cost: number;
  matched_rule: string | null;
}

export interface CostResult {
  total_cost: number;
  breakdown: CostBreakdown[];
}

export interface WSMessage {
  type: "session_created" | "session_updated" | "agent_created" | "agent_updated" | "new_event";
  data: Session | Agent | DashboardEvent;
  timestamp: string;
}

// ── Workflow types ──

export interface WorkflowStats {
  totalSessions: number;
  totalAgents: number;
  totalSubagents: number;
  avgSubagents: number;
  successRate: number;
  avgDepth: number;
  avgDurationSec: number;
  totalCompactions: number;
  avgCompactions: number;
  topFlow: { source: string; target: string; count: number } | null;
}

export interface OrchestrationEdge {
  source: string;
  target: string;
  weight: number;
}

export interface OrchestrationData {
  sessionCount: number;
  mainCount: number;
  subagentTypes: Array<{ subagent_type: string; count: number; completed: number; errors: number }>;
  edges: OrchestrationEdge[];
  outcomes: Array<{ status: string; count: number }>;
  compactions: { total: number; sessions: number };
}

export interface ToolFlowTransition {
  source: string;
  target: string;
  value: number;
}

export interface ToolFlowData {
  transitions: ToolFlowTransition[];
  toolCounts: Array<{ tool_name: string; count: number }>;
}

export interface SubagentEffectivenessItem {
  subagent_type: string;
  total: number;
  completed: number;
  errors: number;
  sessions: number;
  successRate: number;
  avgDuration: number | null;
  trend: number[];
}

export interface WorkflowPattern {
  steps: string[];
  count: number;
  percentage: number;
}

export interface WorkflowPatternsData {
  patterns: WorkflowPattern[];
  soloSessionCount: number;
  soloPercentage: number;
}

export interface ModelDelegationData {
  mainModels: Array<{ model: string; agent_count: number; session_count: number }>;
  subagentModels: Array<{ model: string; agent_count: number }>;
  tokensByModel: Array<{
    model: string;
    input_tokens: number;
    output_tokens: number;
    cache_read_tokens: number;
    cache_write_tokens: number;
  }>;
}

export interface ErrorPropagationData {
  byDepth: Array<{ depth: number; count: number }>;
  byType: Array<{ subagent_type: string; count: number }>;
  sessionsWithErrors: number;
  totalSessions: number;
  errorRate: number;
}

export interface ConcurrencyLane {
  name: string;
  avgStart: number;
  avgEnd: number;
  count: number;
}

export interface ConcurrencyData {
  aggregateLanes: ConcurrencyLane[];
}

export interface SessionComplexityItem {
  id: string;
  name: string | null;
  status: string;
  duration: number;
  agentCount: number;
  subagentCount: number;
  totalTokens: number;
  model: string | null;
}

export interface CompactionImpactData {
  totalCompactions: number;
  tokensRecovered: number;
  perSession: Array<{ session_id: string; compactions: number }>;
  sessionsWithCompactions: number;
  totalSessions: number;
}

export interface WorkflowData {
  stats: WorkflowStats;
  orchestration: OrchestrationData;
  toolFlow: ToolFlowData;
  effectiveness: SubagentEffectivenessItem[];
  patterns: WorkflowPatternsData;
  modelDelegation: ModelDelegationData;
  errorPropagation: ErrorPropagationData;
  concurrency: ConcurrencyData;
  complexity: SessionComplexityItem[];
  compaction: CompactionImpactData;
  cooccurrence: Array<{ source: string; target: string; weight: number }>;
}

export interface SessionDrillIn {
  session: Session;
  tree: Array<{
    id: string;
    name: string;
    type: string;
    subagent_type: string | null;
    status: string;
    task: string | null;
    started_at: string;
    ended_at: string | null;
    children: SessionDrillIn["tree"];
  }>;
  toolTimeline: Array<{
    id: number;
    tool_name: string;
    event_type: string;
    agent_id: string | null;
    created_at: string;
    summary: string | null;
  }>;
  swimLanes: Array<{
    id: string;
    name: string;
    type: string;
    subagent_type: string | null;
    status: string;
    started_at: string;
    ended_at: string | null;
    parent_agent_id: string | null;
  }>;
  events: DashboardEvent[];
}

// ─── GTD / PARA Types (Overseer's Dashboard) ────────────────
export type GtdItemType = "inbox" | "next_action" | "project" | "waiting_for" | "someday_maybe" | "calendar" | "reference" | "archived";
export type GtdStatus = "active" | "completed" | "cancelled" | "archived" | "incubating";
export type GtdParaType = "project" | "area" | "resource" | "archive";

export interface GtdItem {
  id: number;
  title: string;
  body: string | null;
  item_type: GtdItemType;
  status: GtdStatus;
  para_type: GtdParaType | null;
  context: string | null;
  energy_level: "high" | "medium" | "low" | null;
  time_estimate: number | null;
  due_date: string | null;
  scheduled_date: string | null;
  completed_date: string | null;
  delegated_to: string | null;
  delegated_date: string | null;
  follow_up_date: string | null;
  source: string | null;
  source_ref: string | null;
  parent_id: number | null;
  area_id: number | null;
  area_name: string | null;
  sort_order: number;
  tags: string | null;
  created_at: string;
  updated_at: string;
}

export interface GtdArea {
  id: number;
  name: string;
  description: string | null;
  standard: string | null;
  status: string;
  parent_area_id: number | null;
  sort_order: number;
}

export interface GtdTag {
  id: number;
  name: string;
  tag_type: "context" | "topic" | "energy" | "person" | "custom";
  color: string | null;
}

export interface GtdPerson {
  id: number;
  name: string;
  email: string | null;
  role: string | null;
  company: string | null;
  is_agent: boolean;
}

export interface GtdProject {
  id: number;
  item_id: number;
  title: string;
  item_status: string;
  desired_outcome: string;
  area_id: number | null;
  area_name: string | null;
  deadline: string | null;
  progress_pct: number;
  action_count: number;
  next_due: string | null;
}

export interface GtdWaiting {
  id: number;
  item_id: number;
  title: string;
  person_name: string | null;
  is_agent: boolean;
  delegated_date: string;
  expected_date: string | null;
  follow_up_date: string | null;
  follow_up_count: number;
  days_waiting: number;
  notes: string | null;
}

export interface GtdCapture {
  id: number;
  raw_text: string;
  source: string;
  source_ref: string | null;
  processed: boolean;
  item_id: number | null;
  captured_at: string;
}

export interface GtdReview {
  id: number;
  review_type: string;
  started_at: string;
  completed_at: string | null;
  notes: string | null;
  inbox_cleared: boolean;
  projects_reviewed: boolean;
  waiting_reviewed: boolean;
  someday_reviewed: boolean;
  calendar_reviewed: boolean;
}

export interface GtdResource {
  id: number;
  item_id: number;
  title: string;
  body: string | null;
  category: string | null;
  author: string | null;
  source_url: string | null;
  canon: boolean;
}

export interface GtdActivity {
  id: number;
  item_id: number | null;
  action: string;
  old_value: string | null;
  new_value: string | null;
  actor: string;
  created_at: string;
}

export interface GtdStats {
  inbox_count: number;
  raw_captures: number;
  next_actions: number;
  active_projects: number;
  waiting_count: number;
  someday_count: number;
  completed_week: number;
  last_weekly_review: string | null;
}

export const GTD_COLUMN_CONFIG: Record<string, { label: string; color: string; dot: string; description: string }> = {
  inbox: { label: "Inbox", color: "text-amber-400", dot: "bg-amber-400", description: "Capture — unprocessed items" },
  next_action: { label: "Next Actions", color: "text-emerald-400", dot: "bg-emerald-400", description: "Do — your plate" },
  waiting_for: { label: "Waiting For", color: "text-blue-400", dot: "bg-blue-400", description: "Delegated — blocked on someone" },
  someday_maybe: { label: "Someday", color: "text-violet-400", dot: "bg-violet-400", description: "Incubating — not now" },
  reference: { label: "Reference", color: "text-gray-400", dot: "bg-gray-400", description: "Non-actionable — knowledge" },
};

export const STATUS_CONFIG: Record<
  AgentStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  idle: {
    label: "Idle",
    color: "text-gray-400",
    bg: "bg-gray-500/10 border-gray-500/20",
    dot: "bg-gray-400",
  },
  connected: {
    label: "Connected",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    dot: "bg-blue-400",
  },
  working: {
    label: "Working",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
    dot: "bg-yellow-400",
  },
  completed: {
    label: "Completed",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  error: {
    label: "Error",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    dot: "bg-red-400",
  },
};

export const SESSION_STATUS_CONFIG: Record<
  SessionStatus,
  { label: string; color: string; bg: string }
> = {
  active: {
    label: "Active",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
  },
  completed: {
    label: "Completed",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  error: { label: "Error", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  abandoned: {
    label: "Abandoned",
    color: "text-gray-400",
    bg: "bg-gray-500/10 border-gray-500/20",
  },
};

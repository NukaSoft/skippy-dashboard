import type {
  Agent,
  Analytics,
  CostResult,
  DashboardEvent,
  GtdActivity,
  GtdArea,
  GtdCapture,
  GtdItem,
  GtdPerson,
  GtdProject,
  GtdResource,
  GtdReview,
  GtdStats,
  GtdTag,
  GtdWaiting,
  ModelPricing,
  Session,
  SessionDrillIn,
  Stats,
  WorkflowData,
} from "./types";

// Adaptive: "/dashboard/api" behind the Nginx prefix, "/api" served direct from :4820.
const BASE = window.location.pathname.startsWith("/dashboard") ? "/dashboard/api" : "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  stats: {
    get: () => request<Stats>("/stats"),
  },

  sessions: {
    list: (params?: { status?: string; limit?: number; offset?: number }) => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set("status", params.status);
      if (params?.limit) qs.set("limit", String(params.limit));
      if (params?.offset) qs.set("offset", String(params.offset));
      const q = qs.toString();
      return request<{ sessions: Session[] }>(`/sessions${q ? `?${q}` : ""}`);
    },
    get: (id: string) =>
      request<{ session: Session; agents: Agent[]; events: DashboardEvent[] }>(
        `/sessions/${encodeURIComponent(id)}`
      ),
  },

  agents: {
    list: (params?: { status?: string; session_id?: string; limit?: number; offset?: number }) => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set("status", params.status);
      if (params?.session_id) qs.set("session_id", params.session_id);
      if (params?.limit) qs.set("limit", String(params.limit));
      if (params?.offset) qs.set("offset", String(params.offset));
      const q = qs.toString();
      return request<{ agents: Agent[] }>(`/agents${q ? `?${q}` : ""}`);
    },
  },

  events: {
    list: (params?: { session_id?: string; limit?: number; offset?: number }) => {
      const qs = new URLSearchParams();
      if (params?.session_id) qs.set("session_id", params.session_id);
      if (params?.limit) qs.set("limit", String(params.limit));
      if (params?.offset) qs.set("offset", String(params.offset));
      const q = qs.toString();
      return request<{ events: DashboardEvent[] }>(`/events${q ? `?${q}` : ""}`);
    },
  },

  analytics: {
    get: () => request<Analytics>("/analytics"),
  },

  settings: {
    info: () =>
      request<{
        db: { path: string; size: number; counts: Record<string, number> };
        hooks: { installed: boolean; path: string; hooks: Record<string, boolean> };
        server: { uptime: number; node_version: string; platform: string; ws_connections: number };
      }>("/settings/info"),
    clearData: () =>
      request<{ ok: boolean; cleared: Record<string, number> }>("/settings/clear-data", {
        method: "POST",
      }),
    reimport: () =>
      request<{ ok: boolean; imported: number; skipped: number; errors: number }>(
        "/settings/reimport",
        { method: "POST" }
      ),
    reinstallHooks: () =>
      request<{ ok: boolean; hooks: { installed: boolean; hooks: Record<string, boolean> } }>(
        "/settings/reinstall-hooks",
        { method: "POST" }
      ),
    resetPricing: () =>
      request<{ ok: boolean; pricing: ModelPricing[] }>("/settings/reset-pricing", {
        method: "POST",
      }),
    exportData: () => `${BASE}/settings/export`,
    cleanup: (params: { abandon_hours?: number; purge_days?: number }) =>
      request<{
        ok: boolean;
        abandoned: number;
        purged_sessions: number;
        purged_events: number;
        purged_agents: number;
      }>("/settings/cleanup", { method: "POST", body: JSON.stringify(params) }),
  },

  workflows: {
    get: () => request<WorkflowData>("/workflows"),
    session: (id: string) =>
      request<SessionDrillIn>(`/workflows/session/${encodeURIComponent(id)}`),
  },

  gtd: {
    stats: () => request<GtdStats>("/gtd/stats"),
    items: (params?: { type?: string; status?: string; area_id?: number; delegated_to?: string; context?: string; limit?: number }) => {
      const qs = new URLSearchParams();
      if (params?.type) qs.set("type", params.type);
      if (params?.status) qs.set("status", params.status);
      if (params?.area_id) qs.set("area_id", String(params.area_id));
      if (params?.delegated_to) qs.set("delegated_to", params.delegated_to);
      if (params?.context) qs.set("context", params.context);
      if (params?.limit) qs.set("limit", String(params.limit));
      const q = qs.toString();
      return request<{ items: GtdItem[] }>(`/gtd/items${q ? `?${q}` : ""}`);
    },
    getItem: (id: number) => request<GtdItem>(`/gtd/items/${id}`),
    createItem: (data: Partial<GtdItem> & { title: string; tags?: string[] }) =>
      request<GtdItem>("/gtd/items", { method: "POST", body: JSON.stringify(data) }),
    updateItem: (id: number, data: Partial<GtdItem> & { tags?: string[] }) =>
      request<GtdItem>(`/gtd/items/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    moveItem: (id: number, item_type: string) =>
      request<GtdItem>(`/gtd/items/${id}/move`, { method: "PATCH", body: JSON.stringify({ item_type }) }),
    completeItem: (id: number) =>
      request<GtdItem>(`/gtd/items/${id}/complete`, { method: "PATCH" }),
    archiveItem: (id: number) =>
      request<{ archived: boolean }>(`/gtd/items/${id}`, { method: "DELETE" }),
    captures: () => request<{ captures: GtdCapture[] }>("/gtd/captures"),
    capture: (raw_text: string, source?: string) =>
      request<GtdCapture>("/gtd/captures", { method: "POST", body: JSON.stringify({ raw_text, source }) }),
    processCapture: (captureId: number, data: { title: string; item_type?: string; [k: string]: unknown }) =>
      request<GtdItem>(`/gtd/captures/${captureId}/process`, { method: "POST", body: JSON.stringify(data) }),
    areas: () => request<{ areas: GtdArea[] }>("/gtd/areas"),
    tags: () => request<{ tags: GtdTag[] }>("/gtd/tags"),
    people: () => request<{ people: GtdPerson[] }>("/gtd/people"),
    projects: () => request<{ projects: GtdProject[] }>("/gtd/projects"),
    createProject: (data: { title: string; desired_outcome: string; area_id?: number; deadline?: string }) =>
      request<{ item: GtdItem }>("/gtd/projects", { method: "POST", body: JSON.stringify(data) }),
    waiting: () => request<{ waiting: GtdWaiting[] }>("/gtd/waiting"),
    delegate: (data: { title: string; delegated_to: string; expected_date?: string; notes?: string }) =>
      request<GtdItem>("/gtd/delegate", { method: "POST", body: JSON.stringify(data) }),
    latestReview: (type?: string) => request<{ review: GtdReview | null; stats: GtdStats }>(`/gtd/reviews/latest?type=${type || "weekly"}`),
    startReview: (type?: string) =>
      request<GtdReview>("/gtd/reviews", { method: "POST", body: JSON.stringify({ type }) }),
    completeReview: (id: number, data: Partial<GtdReview>) =>
      request<GtdReview>(`/gtd/reviews/${id}/complete`, { method: "PATCH", body: JSON.stringify(data) }),
    resources: () => request<{ resources: GtdResource[] }>("/gtd/resources"),
    canon: () => request<{ canon: GtdResource[] }>("/gtd/canon"),
    activity: (limit?: number) => request<{ activity: GtdActivity[] }>(`/gtd/activity?limit=${limit || 50}`),
  },

  pricing: {
    list: () => request<{ pricing: ModelPricing[] }>("/pricing"),
    upsert: (data: Omit<ModelPricing, "updated_at">) =>
      request<{ pricing: ModelPricing }>("/pricing", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (pattern: string) =>
      request<{ ok: boolean }>(`/pricing/${encodeURIComponent(pattern)}`, {
        method: "DELETE",
      }),
    totalCost: () => request<CostResult>("/pricing/cost"),
    sessionCost: (sessionId: string) =>
      request<CostResult>(`/pricing/cost/${encodeURIComponent(sessionId)}`),
  },
};

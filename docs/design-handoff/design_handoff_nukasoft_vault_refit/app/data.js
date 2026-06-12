// SKIPPY COMMAND CENTER — realistic mock data
// Pulled from the live dashboard's shapes (sessions, agents, events, analytics).

(function () {
  const now = Date.now();
  const min = 60000, hr = 3600000, day = 86400000;

  // Stardate: vanity mapping of real time, mono-friendly
  function stardate(ts) {
    const d = new Date(ts);
    const start = new Date(d.getFullYear(), 0, 0);
    const frac = (d - start) / (365 * day);
    return (79000 + Math.round(frac * 1000) + (d.getHours() * 60 + d.getMinutes()) / 1440).toFixed(2);
  }
  function timeAgo(ts) {
    const diff = now - ts;
    if (diff < hr) return Math.max(1, Math.floor(diff / min)) + "m ago";
    if (diff < day) return Math.floor(diff / hr) + "h ago";
    return Math.floor(diff / day) + "d ago";
  }

  const STATS = {
    totalSessions: 1142, activeSessions: 1,
    activeAgents: 1, totalAgents: 1417,
    activeSubagents: 0, totalSubagents: 16,
    eventsToday: 2731, totalEvents: 39912,
    totalCost: 1568.04, totalTokens: "2.1B", cacheHit: "94%",
  };

  const AGENTS = [
    {
      id: "502726b3", name: "Claude-Code-Agent-Monitor", slug: "smooth-napping-wilkinson",
      status: "working", type: "main", started: now - 5 * min, dir: "C:\\Users\\nguyens6\\Claude-Code-Agent-Monitor",
      model: "claude-opus-4-6", cost: 69.30, subagents: [
        { id: "9f21aa04", name: "Explore", status: "completed", ran: "2m 14s" },
        { id: "b8d2c771", name: "frontend-reviewer", status: "working", ran: "48s" },
        { id: "e0a1f9c2", name: "general-purpose", status: "completed", ran: "4m 02s" },
        { id: "77c3d810", name: "test-engineer", status: "idle", ran: "—" },
      ],
    },
    {
      id: "845cb0da", name: "observer-sessions", slug: "045cb0da",
      status: "idle", type: "main", started: now - 22 * min, dir: "C:\\Users\\nguyens6\\.claude-mem",
      model: "claude-sonnet-4-6", cost: 0.13, subagents: [],
    },
  ];

  const EVENTS = [
    { agent: "skippy", msg: "Claude is waiting on the Captain.  Again.", kind: "connected", tool: null, ts: now - 4 * min },
    { agent: "main", msg: "Voyage smooth-napping-wilkinson checked in", kind: "completed", tool: null, ts: now - 5 * min },
    { agent: "main", msg: "Tool completed", kind: "connected", tool: "Edit", ts: now - 5 * min },
    { agent: "main", msg: "Using tool", kind: "working", tool: "Edit", ts: now - 5 * min },
    { agent: "main", msg: "Tool completed", kind: "connected", tool: "Edit", ts: now - 6 * min },
    { agent: "main", msg: "Using tool", kind: "working", tool: "Read", ts: now - 6 * min },
    { agent: "main", msg: "Voyage smooth-napping-wilkinson resumed from relay tail", kind: "completed", ts: now - 8 * min },
    { agent: "main", msg: "Tool completed", kind: "connected", tool: "Bash", ts: now - 8 * min },
    { agent: "deckhand", msg: "Deckhand Explore reported back — 84 files surveyed", kind: "completed", ts: now - 11 * min },
    { agent: "main", msg: "Using tool", kind: "working", tool: "Grep", ts: now - 12 * min },
    { agent: "main", msg: "Tool completed", kind: "connected", tool: "Write", ts: now - 14 * min },
    { agent: "deckhand", msg: "Deckhand test-engineer mustered", kind: "working", ts: now - 15 * min },
    { agent: "main", msg: "Compaction completed — memory trimmed, dignity intact", kind: "completed", ts: now - 19 * min },
    { agent: "main", msg: "Using tool", kind: "working", tool: "Bash", ts: now - 21 * min },
    { agent: "skippy", msg: "Pierre poked Canvas with a stick.  I fixed it.", kind: "completed", ts: now - 26 * min },
  ].map((e) => ({ ...e, stardate: stardate(e.ts), ago: timeAgo(e.ts) }));

  const SESSIONS = [
    { name: "Claude-Code-Agent-Monitor", slug: "smooth-napping-wilkinson", id: "502726b3-b6e", status: "working", last: now - 4 * min, dur: "running", agents: 17, cost: 69.30, dir: "C:\\Users\\nguyens6\\Claude-Code-Agent-Monitor" },
    { name: "EstateWise-Chapel-Hill-Chatbot", slug: "tingly-giggling-bengio", id: "2c5b8fe9-c69", status: "abandoned", last: now - 2 * hr, dur: "5h 14m", agents: 1, cost: 14.97, dir: "C:\\Users\\nguyens6\\EstateWise-Chapel-Hill" },
    { name: "AI-RAG-Assistant-Chatbot", slug: "lovely-wondering-shannon", id: "5e3d42d3-466", status: "abandoned", last: now - 2 * hr, dur: "5h 17m", agents: 4, cost: 16.29, dir: "C:\\Users\\nguyens6\\AI-RAG-Assistant" },
    { name: "observer-sessions", slug: "d2fd6b32", id: "d2fd6b32-0f7", status: "completed", last: now - 3 * hr, dur: "11m 53s", agents: 1, cost: 0.0, dir: "C:\\Users\\nguyens6\\.claude-mem" },
    { name: "observer-sessions", slug: "a6a74a20", id: "a6a74a20-e9a", status: "completed", last: now - 3 * hr, dur: "11m 33s", agents: 1, cost: 0.04, dir: "C:\\Users\\nguyens6\\.claude-mem" },
    { name: "nukasoft-marketing-refresh", slug: "brave-orbiting-rita", id: "8c11de02-77a", status: "error", last: now - 5 * hr, dur: "42m 10s", agents: 3, cost: 4.12, dir: "C:\\Users\\nguyens6\\nukasoft-site" },
    { name: "observer-sessions", slug: "5f4bb98f", id: "5f4bb98f-113", status: "completed", last: now - 6 * hr, dur: "10m 25s", agents: 1, cost: 0.02, dir: "C:\\Users\\nguyens6\\.claude-mem" },
    { name: "mep-protocol-docs", slug: "quiet-vigilant-bishop", id: "31b6aa90-d04", status: "completed", last: now - day, dur: "1h 22m", agents: 6, cost: 11.61, dir: "C:\\Users\\nguyens6\\mep-docs" },
    { name: "observer-sessions", slug: "045cb0da", id: "045cb0da-739", status: "abandoned", last: now - day, dur: "8m 21s", agents: 1, cost: 0.13, dir: "C:\\Users\\nguyens6\\.claude-mem" },
    { name: "statusline-tinkering", slug: "merry-soldering-lobot", id: "77ac01f5-21b", status: "completed", last: now - 2 * day, dur: "26m 44s", agents: 2, cost: 1.87, dir: "C:\\Users\\nguyens6\\statusline" },
  ].map((s) => ({ ...s, ago: timeAgo(s.last), stardate: stardate(s.last) }));

  // Kanban: agents by status
  const BOARD = {
    idle: [{ id: "845cb0da", name: "observer-sessions", slug: "045cb0da", note: null, ran: null, ago: "6m ago" }],
    connected: [],
    working: [{ id: "502726b3", name: "Claude-Code-Agent-Monitor", slug: "smooth-napping-wilkinson", note: "Refit in progress — vault livery", ran: "running", ago: "now" }],
    completed: [
      { id: "845cb0da", name: "Main Agent — observer", slug: "045cb0da", note: null, ran: "8m 21s", ago: "6m ago" },
      { id: "5f4bb98f", name: "Main Agent — observer", slug: "5f4bb98f", note: null, ran: "10m 25s", ago: "6m ago" },
      { id: "a6a74a20", name: "Main Agent — observer", slug: "a6a74a20", note: null, ran: "11m 33s", ago: "6m ago" },
      { id: "d2fd6b32", name: "Main Agent — observer", slug: "d2fd6b32", note: null, ran: "11m 53s", ago: "6m ago" },
      { id: "582726b3", name: "Update all docs", slug: "documentation", note: "Update all project documentation for the Agent Monitor", ran: "8m 10s", ago: "19m ago" },
    ],
    error: [{ id: "8c11de02", name: "nukasoft-marketing-refresh", slug: "brave-orbiting-rita", note: "Tool budget exceeded — Skippy disapproves", ran: "42m 10s", ago: "5h ago" }],
  };
  const BOARD_COUNTS = { idle: 1, connected: 0, working: 1, completed: 1416, error: 1 };

  const GTD = {
    inbox: [
      { t: "Read MEP v0.4 draft before Bishop ships it", ctx: null, who: null, ago: "2h" },
      { t: "Decide fate of the 15 fan themes", ctx: "@decision", who: null, ago: "1d" },
      { t: "Wall-mount survey for the 54\" board", ctx: "@errand", who: null, ago: "2d" },
    ],
    next_action: [
      { t: "Wire CRT toggle into Settings", ctx: "@code", who: null, ago: "3h" },
      { t: "Library page — index the Q2 report binders", ctx: "@code", who: null, ago: "5h" },
      { t: "Tablet pass on the voyage ledger", ctx: "@design", who: null, ago: "1d" },
    ],
    waiting_for: [
      { t: "Ripley — staging box for the TV build", ctx: null, who: "ripley", ago: "4h" },
      { t: "Cassian — faction style guide sign-off", ctx: null, who: "cassian", ago: "2d" },
    ],
    someday_maybe: [
      { t: "Voice alerts in Skippy's actual voice", ctx: null, who: null, ago: "6d" },
      { t: "Community theme pack, properly sandboxed", ctx: null, who: null, ago: "9d" },
    ],
  };

  // Analytics
  function seeded(i) { const x = Math.sin(i * 127.1) * 43758.5453; return x - Math.floor(x); }
  const HEATMAP = Array.from({ length: 52 * 7 }, (_, i) => {
    const wk = Math.floor(i / 7);
    if (wk < 44) return 0;
    const r = seeded(i);
    if (r < 0.35) return 0;
    if (r < 0.6) return 1;
    if (r < 0.8) return 2;
    if (r < 0.93) return 3;
    return 4;
  });
  const DAYS30 = Array.from({ length: 30 }, (_, i) => Math.round(seeded(i + 7) * 4200 * (i > 8 ? 1 : 0.25)));
  const TOKENS = [
    { k: "Input", v: "1,430,915", pct: 0.07, tone: "sky" },
    { k: "Output", v: "7,054,870", pct: 0.4, tone: "yellow" },
    { k: "Cache read", v: "1,976,069,931", pct: 100, tone: "green" },
    { k: "Cache write", v: "124,041,002", pct: 6.3, tone: null },
  ];
  const COST_BY_MODEL = [
    { name: "claude-opus-4-6", pct: 67, color: "var(--sk-red-bright)" },
    { name: "claude-sonnet-4-5", pct: 25, color: "var(--sk-yellow)" },
    { name: "claude-sonnet-4-6", pct: 8, color: "var(--sk-sky)" },
    { name: "claude-haiku-4-5", pct: 0.4, color: "var(--sk-green)" },
  ];

  // Workflows — simplified orchestration flow
  const FLOW = {
    stats: [
      { k: "Avg agent depth", v: "0.1" }, { k: "Avg deckhands / voyage", v: "0.3" },
      { k: "Success rate", v: "100%" }, { k: "Most common flow", v: "Read → Read" },
      { k: "Avg compactions", v: "0.0" }, { k: "Avg duration", v: "33m 36s" },
    ],
    subagents: [
      { name: "Explore", n: 84 }, { name: "general-purpose", n: 73 }, { name: "compaction", n: 55 },
      { name: "statusline-setup", n: 10 }, { name: "frontend-dev", n: 10 }, { name: "team", n: 8 },
      { name: "test-engineer", n: 6 }, { name: "11 more types", n: 32 },
    ],
    toolChain: [
      { from: "Read", to: "Read", n: 4102 }, { from: "Read", to: "Edit", n: 2231 },
      { from: "Edit", to: "Bash", n: 1418 }, { from: "Bash", to: "Read", n: 1240 },
      { from: "Grep", to: "Read", n: 988 }, { from: "Write", to: "Bash", n: 412 },
    ],
  };

  // Bishop — ship systems
  const BISHOP = {
    subsystems: [
      { name: "WAN uplink", status: "ok", extra: "1.2 Gbps down / 980 Mbps up" },
      { name: "Relay (hooks)", status: "ok", extra: "last event 4m ago" },
      { name: "Database", status: "ok", extra: "sqlite · WAL · 412 MB" },
      { name: "MCP server", status: "ok", extra: "v0.3 · 9 tools" },
      { name: "Theme pipeline", status: "warn", extra: "queued — 1 job" },
    ],
    devices: [
      { name: "hot-rod", type: "server", model: "Ryzen 9 · 64GB", ip: "192.168.10.138", cpu: 22, mem: 41, temp: 54, up: "14d" },
      { name: "vault-door", type: "gateway", model: "UDM Pro", ip: "192.168.10.1", cpu: 11, mem: 38, temp: 61, up: "62d" },
      { name: "big-board", type: "display", model: "54\" 4K", ip: "192.168.10.201", cpu: 6, mem: 22, temp: 44, up: "3d" },
      { name: "quarterdeck", type: "tablet", model: "iPad Pro 11\"", ip: "192.168.10.214", cpu: 9, mem: 51, temp: 33, up: "1d" },
    ],
    speedtest: { down: 1187, up: 982, latency: 9 },
    clients: { total: 31, wired: 12, wifi: 19 },
    alarms: [],
  };

  const PRICING = [
    { pattern: "claude-3-haiku%", name: "Claude Haiku 3", in: 0.25, out: 1.25, cr: 0.03, cw: 0.3 },
    { pattern: "claude-haiku-4-5%", name: "Claude Haiku 4.5", in: 1, out: 5, cr: 0.1, cw: 1.25 },
    { pattern: "claude-opus-4-5%", name: "Claude Opus 4.5", in: 5, out: 25, cr: 0.5, cw: 6.25 },
    { pattern: "claude-opus-4-6%", name: "Claude Opus 4.6", in: 5, out: 25, cr: 0.5, cw: 6.25 },
    { pattern: "claude-sonnet-4-5%", name: "Claude Sonnet 4.5", in: 3, out: 15, cr: 0.3, cw: 3.75 },
    { pattern: "claude-sonnet-4-6%", name: "Claude Sonnet 4.6", in: 3, out: 15, cr: 0.3, cw: 3.75 },
  ];

  const LIBRARY = [
    { t: "Q2 Operations Report", kind: "Quarterly", pages: 24, date: "Jun 02, 2026", spine: "" },
    { t: "MEP Protocol v0.3 — Field Manual", kind: "Manual", pages: 48, date: "May 18, 2026", spine: "yellow" },
    { t: "Token Spend Audit — May", kind: "Audit", pages: 12, date: "Jun 01, 2026", spine: "sky" },
    { t: "Crew Trust Reports — Bundle", kind: "Bundle", pages: 36, date: "May 30, 2026", spine: "green" },
    { t: "Incident 0419 — Postmortem", kind: "Postmortem", pages: 8, date: "Apr 22, 2026", spine: "" },
    { t: "Vault 69 Network Survey", kind: "Survey", pages: 16, date: "Apr 10, 2026", spine: "sky" },
    { t: "Hook Handler Runbook", kind: "Runbook", pages: 20, date: "Mar 28, 2026", spine: "yellow" },
    { t: "Statusline Spec — rev C", kind: "Spec", pages: 6, date: "Mar 12, 2026", spine: "green" },
  ];

  const SKIPPY = {
    stat: "All quiet on the bridge.  One voyage underway, sixteen deckhands accounted for, and nobody has broken anything in four minutes.  A record.",
    boardEmpty: "Nothing here.  The crew is either working or pretending to.",
    feed: "Everything below happened because I allowed it.",
    gtd: "The Captain's to-do list.  I'd have finished it already.",
    library: "Reports filed and alphabetized.  You're welcome.",
  };

  window.SK_DATA = {
    stardate: stardate(now), STATS, AGENTS, EVENTS, SESSIONS, BOARD, BOARD_COUNTS,
    GTD, HEATMAP, DAYS30, TOKENS, COST_BY_MODEL, FLOW, BISHOP, PRICING, LIBRARY, SKIPPY,
  };
})();

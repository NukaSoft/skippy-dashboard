let Database;
try {
  Database = require("better-sqlite3");
} catch {
  try {
    Database = require("./compat-sqlite");
  } catch {
    console.error(
      "\n" +
        "╔══════════════════════════════════════════════════════════════╗\n" +
        "║  SQLite backend not available                               ║\n" +
        "║                                                             ║\n" +
        "║  better-sqlite3 could not be loaded (native module) and     ║\n" +
        "║  node:sqlite is not available (requires Node.js >= 22).     ║\n" +
        "║                                                             ║\n" +
        "║  Fix options (pick one):                                    ║\n" +
        "║    1. Upgrade to Node.js 22+ (recommended)                  ║\n" +
        "║    2. Install Python 3 + C++ build tools, then              ║\n" +
        "║       run: npm rebuild better-sqlite3                       ║\n" +
        "╚══════════════════════════════════════════════════════════════╝\n"
    );
    process.exit(1);
  }
}
const path = require("path");
const fs = require("fs");

const DB_PATH = process.env.DASHBOARD_DB_PATH || path.join(__dirname, "..", "data", "dashboard.db");
const DB_DIR = path.dirname(DB_PATH);

fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.pragma("busy_timeout = 5000");

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    name TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','completed','error','abandoned')),
    cwd TEXT,
    model TEXT,
    started_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ended_at TEXT,
    metadata TEXT
  );

  CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'main' CHECK(type IN ('main','subagent')),
    subagent_type TEXT,
    status TEXT NOT NULL DEFAULT 'idle' CHECK(status IN ('idle','connected','working','completed','error')),
    task TEXT,
    current_tool TEXT,
    started_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ended_at TEXT,
    parent_agent_id TEXT,
    metadata TEXT,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_agent_id) REFERENCES agents(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    agent_id TEXT,
    event_type TEXT NOT NULL,
    tool_name TEXT,
    summary TEXT,
    data TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS token_usage (
    session_id TEXT NOT NULL,
    model TEXT NOT NULL DEFAULT 'unknown',
    input_tokens INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,
    cache_read_tokens INTEGER NOT NULL DEFAULT 0,
    cache_write_tokens INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (session_id, model),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS model_pricing (
    model_pattern TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    input_per_mtok REAL NOT NULL DEFAULT 0,
    output_per_mtok REAL NOT NULL DEFAULT 0,
    cache_read_per_mtok REAL NOT NULL DEFAULT 0,
    cache_write_per_mtok REAL NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );

  CREATE INDEX IF NOT EXISTS idx_agents_session ON agents(session_id);
  CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
  CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
  CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
  CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
  CREATE INDEX IF NOT EXISTS idx_sessions_started ON sessions(started_at DESC);
`);

// Seed default model pricing if table is empty
const pricingCount = db.prepare("SELECT COUNT(*) as c FROM model_pricing").get();
if (pricingCount.c === 0) {
  const seedPricing = db.prepare(
    "INSERT OR IGNORE INTO model_pricing (model_pattern, display_name, input_per_mtok, output_per_mtok, cache_read_per_mtok, cache_write_per_mtok) VALUES (?, ?, ?, ?, ?, ?)"
  );
  // Columns: pattern, display_name, input, output, cache_read (hits & refreshes), cache_write (5m ephemeral)
  // Each model gets its own explicit row — no catch-all grouping
  const defaults = [
    // Opus family
    ["claude-opus-4-6%", "Claude Opus 4.6", 5, 25, 0.5, 6.25],
    ["claude-opus-4-5%", "Claude Opus 4.5", 5, 25, 0.5, 6.25],
    ["claude-opus-4-1%", "Claude Opus 4.1", 15, 75, 1.5, 18.75],
    ["claude-opus-4-2%", "Claude Opus 4", 15, 75, 1.5, 18.75],
    // Sonnet family
    ["claude-sonnet-4-6%", "Claude Sonnet 4.6", 3, 15, 0.3, 3.75],
    ["claude-sonnet-4-5%", "Claude Sonnet 4.5", 3, 15, 0.3, 3.75],
    ["claude-sonnet-4-2%", "Claude Sonnet 4", 3, 15, 0.3, 3.75],
    ["claude-3-7-sonnet%", "Claude Sonnet 3.7", 3, 15, 0.3, 3.75],
    ["claude-3-5-sonnet%", "Claude Sonnet 3.5", 3, 15, 0.3, 3.75],
    // Haiku family
    ["claude-haiku-4-5%", "Claude Haiku 4.5", 1, 5, 0.1, 1.25],
    ["claude-3-5-haiku%", "Claude Haiku 3.5", 0.8, 4, 0.08, 1],
    ["claude-3-haiku%", "Claude Haiku 3", 0.25, 1.25, 0.03, 0.3],
    // Legacy
    ["claude-3-opus%", "Claude Opus 3", 15, 75, 1.5, 18.75],
  ];
  for (const [pattern, name, inp, out, cr, cw] of defaults) {
    seedPricing.run(pattern, name, inp, out, cr, cw);
  }
}

// Migrate: if token_usage has rows without model column (old schema), add it
try {
  db.prepare("SELECT model FROM token_usage LIMIT 1").get();
} catch {
  // Old schema — recreate table with model column
  db.pragma("foreign_keys = OFF");
  db.prepare("ALTER TABLE token_usage RENAME TO token_usage_old").run();
  db.prepare(
    `
    CREATE TABLE token_usage (
      session_id TEXT NOT NULL,
      model TEXT NOT NULL DEFAULT 'unknown',
      input_tokens INTEGER NOT NULL DEFAULT 0,
      output_tokens INTEGER NOT NULL DEFAULT 0,
      cache_read_tokens INTEGER NOT NULL DEFAULT 0,
      cache_write_tokens INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (session_id, model),
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    )
  `
  ).run();
  db.prepare(
    `
    INSERT INTO token_usage (session_id, model, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens)
      SELECT tu.session_id, COALESCE(s.model, 'unknown'), tu.input_tokens, tu.output_tokens, tu.cache_read_tokens, tu.cache_write_tokens
      FROM token_usage_old tu LEFT JOIN sessions s ON s.id = tu.session_id
  `
  ).run();
  db.prepare("DROP TABLE token_usage_old").run();
  db.pragma("foreign_keys = ON");
}

// Migrate: add updated_at columns to sessions and agents
try {
  db.prepare("SELECT updated_at FROM sessions LIMIT 1").get();
} catch {
  db.prepare("ALTER TABLE sessions ADD COLUMN updated_at TEXT NOT NULL DEFAULT ''").run();
  db.prepare("UPDATE sessions SET updated_at = COALESCE(ended_at, started_at)").run();
}
try {
  db.prepare("SELECT updated_at FROM agents LIMIT 1").get();
} catch {
  db.prepare("ALTER TABLE agents ADD COLUMN updated_at TEXT NOT NULL DEFAULT ''").run();
  db.prepare("UPDATE agents SET updated_at = COALESCE(ended_at, started_at)").run();
}

// Migrate: add compaction baseline columns to token_usage.
// When conversation compaction rewrites the JSONL, pre-compaction token counts
// are lost from the transcript. Baselines preserve those counts so the effective
// total = current + baseline.
try {
  db.prepare("SELECT baseline_input FROM token_usage LIMIT 1").get();
} catch {
  db.prepare("ALTER TABLE token_usage ADD COLUMN baseline_input INTEGER NOT NULL DEFAULT 0").run();
  db.prepare("ALTER TABLE token_usage ADD COLUMN baseline_output INTEGER NOT NULL DEFAULT 0").run();
  db.prepare(
    "ALTER TABLE token_usage ADD COLUMN baseline_cache_read INTEGER NOT NULL DEFAULT 0"
  ).run();
  db.prepare(
    "ALTER TABLE token_usage ADD COLUMN baseline_cache_write INTEGER NOT NULL DEFAULT 0"
  ).run();
}

// Startup cleanup: mark stale active sessions as completed.
// Legacy sessions (created before SessionEnd hook) will never receive a SessionEnd event,
// so they stay "active" forever. Complete any active session whose last event is older than
// 1 hour — the CLI process is certainly gone by then.
db.prepare(
  `
  UPDATE sessions SET
    status = 'completed',
    ended_at = COALESCE(ended_at, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  WHERE status = 'active'
    AND started_at < strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 hour')
    AND NOT EXISTS (
      SELECT 1 FROM events e
      WHERE e.session_id = sessions.id
        AND e.created_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 hour')
    )
`
).run();

// Startup cleanup: complete orphaned agents on finished sessions
db.prepare(
  `
  UPDATE agents SET
    status = 'completed',
    ended_at = COALESCE(ended_at, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  WHERE status IN ('working', 'connected', 'idle')
    AND session_id IN (SELECT id FROM sessions WHERE status IN ('completed', 'error', 'abandoned'))
`
).run();

// ============================================================
// Overseer's Dashboard — GTD + PARA tables
// ============================================================
db.exec(`
  -- Universal GTD item (the spine of the system)
  CREATE TABLE IF NOT EXISTS gtd_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT,
    item_type TEXT NOT NULL DEFAULT 'inbox' CHECK(item_type IN (
      'inbox', 'next_action', 'project', 'waiting_for', 'someday_maybe',
      'calendar', 'reference', 'archived'
    )),
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN (
      'active', 'completed', 'cancelled', 'archived', 'incubating'
    )),
    para_type TEXT CHECK(para_type IN ('project', 'area', 'resource', 'archive')),
    context TEXT,
    energy_level TEXT CHECK(energy_level IN ('high', 'medium', 'low')),
    time_estimate INTEGER,
    due_date TEXT,
    scheduled_date TEXT,
    completed_date TEXT,
    delegated_to TEXT,
    delegated_date TEXT,
    follow_up_date TEXT,
    source TEXT,
    source_ref TEXT,
    parent_id INTEGER REFERENCES gtd_items(id) ON DELETE SET NULL,
    area_id INTEGER REFERENCES gtd_areas(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    archived_at TEXT
  );

  -- PARA Areas (ongoing responsibilities)
  CREATE TABLE IF NOT EXISTS gtd_areas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    standard TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'archived')),
    parent_area_id INTEGER REFERENCES gtd_areas(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    archived_at TEXT
  );

  -- Tags: GTD contexts + PARA topics unified
  CREATE TABLE IF NOT EXISTS gtd_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    tag_type TEXT NOT NULL DEFAULT 'custom' CHECK(tag_type IN (
      'context', 'topic', 'energy', 'person', 'custom'
    )),
    color TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );

  -- M2M: items <-> tags
  CREATE TABLE IF NOT EXISTS gtd_item_tags (
    item_id INTEGER NOT NULL REFERENCES gtd_items(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES gtd_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (item_id, tag_id)
  );

  -- Projects: extends items with GTD project metadata
  CREATE TABLE IF NOT EXISTS gtd_projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL REFERENCES gtd_items(id) ON DELETE CASCADE,
    desired_outcome TEXT NOT NULL,
    area_id INTEGER REFERENCES gtd_areas(id) ON DELETE SET NULL,
    deadline TEXT,
    review_date TEXT,
    progress_pct INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    completed_at TEXT
  );

  -- People: delegation targets
  CREATE TABLE IF NOT EXISTS gtd_people (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    role TEXT,
    company TEXT,
    is_agent BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );

  -- Waiting For: first-class delegation tracking
  CREATE TABLE IF NOT EXISTS gtd_waiting_for (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL REFERENCES gtd_items(id) ON DELETE CASCADE,
    person_id INTEGER REFERENCES gtd_people(id) ON DELETE SET NULL,
    delegated_date TEXT NOT NULL DEFAULT (date('now')),
    expected_date TEXT,
    follow_up_date TEXT,
    follow_up_count INTEGER DEFAULT 0,
    resolved_date TEXT,
    notes TEXT
  );

  -- Captures: raw inbox before clarification
  CREATE TABLE IF NOT EXISTS gtd_captures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    raw_text TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'manual',
    source_ref TEXT,
    processed BOOLEAN DEFAULT FALSE,
    item_id INTEGER REFERENCES gtd_items(id) ON DELETE SET NULL,
    captured_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    processed_at TEXT
  );

  -- Reviews: weekly review tracking (the GTD engine)
  CREATE TABLE IF NOT EXISTS gtd_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    review_type TEXT NOT NULL CHECK(review_type IN ('daily', 'weekly', 'monthly', 'quarterly')),
    started_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    completed_at TEXT,
    notes TEXT,
    inbox_cleared BOOLEAN DEFAULT FALSE,
    projects_reviewed BOOLEAN DEFAULT FALSE,
    waiting_reviewed BOOLEAN DEFAULT FALSE,
    someday_reviewed BOOLEAN DEFAULT FALSE,
    calendar_reviewed BOOLEAN DEFAULT FALSE
  );

  -- Resources: extends items with PARA resource metadata (books, frameworks, canon)
  CREATE TABLE IF NOT EXISTS gtd_resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL REFERENCES gtd_items(id) ON DELETE CASCADE,
    category TEXT CHECK(category IN ('framework', 'book', 'article', 'playbook', 'template')),
    author TEXT,
    source_url TEXT,
    canon BOOLEAN DEFAULT FALSE,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );

  -- Activity log: audit trail
  CREATE TABLE IF NOT EXISTS gtd_activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER REFERENCES gtd_items(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    actor TEXT DEFAULT 'skippy',
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );

  -- Indexes
  CREATE INDEX IF NOT EXISTS idx_gtd_items_type ON gtd_items(item_type);
  CREATE INDEX IF NOT EXISTS idx_gtd_items_status ON gtd_items(status);
  CREATE INDEX IF NOT EXISTS idx_gtd_items_para ON gtd_items(para_type);
  CREATE INDEX IF NOT EXISTS idx_gtd_items_parent ON gtd_items(parent_id);
  CREATE INDEX IF NOT EXISTS idx_gtd_items_area ON gtd_items(area_id);
  CREATE INDEX IF NOT EXISTS idx_gtd_items_due ON gtd_items(due_date);
  CREATE INDEX IF NOT EXISTS idx_gtd_items_context ON gtd_items(context);
  CREATE INDEX IF NOT EXISTS idx_gtd_items_delegated ON gtd_items(delegated_to);
  CREATE INDEX IF NOT EXISTS idx_gtd_captures_processed ON gtd_captures(processed);
  CREATE INDEX IF NOT EXISTS idx_gtd_waiting_followup ON gtd_waiting_for(follow_up_date);
  CREATE INDEX IF NOT EXISTS idx_gtd_activity_item ON gtd_activity_log(item_id);
`);

// Seed GTD areas from Pierre's PARA structure
const areaCount = db.prepare("SELECT COUNT(*) as c FROM gtd_areas").get();
if (areaCount.c === 0) {
  const seedArea = db.prepare(
    "INSERT OR IGNORE INTO gtd_areas (name, description, standard) VALUES (?, ?, ?)"
  );
  const areas = [
    ["Alithya", "FS Consulting Global Director — D365 Field Service practice, AI strategy", "Revenue growth, client satisfaction, team development"],
    ["NukaSoft", "AI venture — Skippy, crew agents, dashboard, voice, harvester", "Ship weekly, maintain uptime, grow the platform"],
    ["Powered Wild", "Turo EV rental operation — Tesla fleet, Michigan adventure tours", "Fleet utilization, guest satisfaction, operational efficiency"],
    ["ASU", "ENG 302: Business Writing (Spring B 2026)", "Submit on time, quality writing"],
    ["Tech Sales 110", "Personal brand — podcast, blog, 52 Hacks Book", "Consistent content, audience growth"],
    ["Do Nothing Company", "Commercial AI venture — donothingcompany.com/.ai", "Product launches, revenue"],
    ["Infrastructure", "Hot Rod, networking, local AI stack, Skippy systems", "Uptime, security, performance"],
    ["Personal", "Health, family, EBI philanthropy", "Balance and wellbeing"],
  ];
  for (const [name, desc, std] of areas) {
    seedArea.run(name, desc, std);
  }
}

// Seed GTD people (crew + key humans)
const peopleCount = db.prepare("SELECT COUNT(*) as c FROM gtd_people").get();
if (peopleCount.c === 0) {
  const seedPerson = db.prepare(
    "INSERT OR IGNORE INTO gtd_people (name, role, company, is_agent) VALUES (?, ?, ?, ?)"
  );
  const people = [
    // Crew (agents)
    ["Skippy", "AI Operations Hub", "NukaSoft", true],
    ["Rodimus", "Primary Automation Agent", "NukaSoft", true],
    ["Rita", "CMO / Content Creator", "NukaSoft", true],
    ["Bishop", "Network Operations Admin", "NukaSoft", true],
    ["Piper", "Bug Triage & Community", "NukaSoft", true],
    ["Cassian", "Knowledge Harvester", "NukaSoft", true],
    ["Codsworth", "NAS File Organizer", "NukaSoft", true],
    ["Jo", "Powered Wild COO", "NukaSoft", true],
    ["Garrus", "D365 Tactical Advisor", "NukaSoft", true],
    ["Ratchet", "Local AI Infrastructure", "NukaSoft", true],
    ["Radar", "Communications & Delivery", "NukaSoft", true],
    ["Lobot", "Operations Conductor", "NukaSoft", true],
    ["Hastings", "Counselor & Graphics", "NukaSoft", true],
    // Key humans
    ["Pierre", "Founder / Global Director", "Alithya / NukaSoft", false],
    ["Daniel", "Project Lead — Nutanix & AMD", "Alithya", false],
    ["César", "Nutanix Account", "Alithya", false],
    ["John", "Account Team — Data Factory", "Alithya", false],
    ["Jean-Yves", "MCP Service / AI Integration", "Alithya", false],
    ["Ismail", "Architect — AMD Montreal F&O", "Alithya", false],
  ];
  for (const [name, role, company, isAgent] of people) {
    seedPerson.run(name, role, company, isAgent ? 1 : 0);
  }
}

// Seed GTD tags (contexts + topics)
const tagCount = db.prepare("SELECT COUNT(*) as c FROM gtd_tags").get();
if (tagCount.c === 0) {
  const seedTag = db.prepare(
    "INSERT OR IGNORE INTO gtd_tags (name, tag_type, color) VALUES (?, ?, ?)"
  );
  const tags = [
    // GTD contexts
    ["@computer", "context", "#10b981"],
    ["@phone", "context", "#3b82f6"],
    ["@office", "context", "#8b5cf6"],
    ["@home", "context", "#f59e0b"],
    ["@errands", "context", "#ef4444"],
    ["@anywhere", "context", "#6b7280"],
    // Topics
    ["#field-service", "topic", "#06b6d4"],
    ["#d365", "topic", "#0ea5e9"],
    ["#ai", "topic", "#a855f7"],
    ["#infrastructure", "topic", "#64748b"],
    ["#content", "topic", "#ec4899"],
    ["#seo", "topic", "#14b8a6"],
    ["#sales", "topic", "#f97316"],
    ["#nuka-soft-brand", "topic", "#84cc16"],
    ["#crew", "topic", "#e879f9"],
    ["#eng302", "topic", "#fbbf24"],
    // Energy
    ["energy:high", "energy", "#ef4444"],
    ["energy:medium", "energy", "#f59e0b"],
    ["energy:low", "energy", "#10b981"],
  ];
  for (const [name, type, color] of tags) {
    seedTag.run(name, type, color);
  }
}

// ============================================================
// GTD Prepared Statements
// ============================================================
const gtdStmts = {
  // Items
  listItems: db.prepare(`
    SELECT i.*, a.name as area_name,
      GROUP_CONCAT(DISTINCT t.name) as tags
    FROM gtd_items i
    LEFT JOIN gtd_areas a ON i.area_id = a.id
    LEFT JOIN gtd_item_tags it ON i.id = it.item_id
    LEFT JOIN gtd_tags t ON it.tag_id = t.id
    WHERE (@type IS NULL OR i.item_type = @type)
      AND (@status IS NULL OR i.status = @status)
      AND (@area_id IS NULL OR i.area_id = @area_id)
      AND (@delegated_to IS NULL OR i.delegated_to = @delegated_to)
      AND (@context IS NULL OR i.context = @context)
    GROUP BY i.id
    ORDER BY i.sort_order ASC, i.created_at DESC
    LIMIT @limit OFFSET @offset
  `),
  getItem: db.prepare(`
    SELECT i.*, a.name as area_name
    FROM gtd_items i
    LEFT JOIN gtd_areas a ON i.area_id = a.id
    WHERE i.id = ?
  `),
  insertItem: db.prepare(`
    INSERT INTO gtd_items (title, body, item_type, status, para_type, context, energy_level,
      time_estimate, due_date, scheduled_date, delegated_to, delegated_date, follow_up_date,
      source, source_ref, parent_id, area_id, sort_order)
    VALUES (@title, @body, @item_type, @status, @para_type, @context, @energy_level,
      @time_estimate, @due_date, @scheduled_date, @delegated_to, @delegated_date, @follow_up_date,
      @source, @source_ref, @parent_id, @area_id, @sort_order)
  `),
  updateItem: db.prepare(`
    UPDATE gtd_items SET
      title = COALESCE(@title, title),
      body = COALESCE(@body, body),
      item_type = COALESCE(@item_type, item_type),
      status = COALESCE(@status, status),
      para_type = COALESCE(@para_type, para_type),
      context = COALESCE(@context, context),
      energy_level = COALESCE(@energy_level, energy_level),
      time_estimate = COALESCE(@time_estimate, time_estimate),
      due_date = COALESCE(@due_date, due_date),
      scheduled_date = COALESCE(@scheduled_date, scheduled_date),
      delegated_to = COALESCE(@delegated_to, delegated_to),
      follow_up_date = COALESCE(@follow_up_date, follow_up_date),
      parent_id = COALESCE(@parent_id, parent_id),
      area_id = COALESCE(@area_id, area_id),
      sort_order = COALESCE(@sort_order, sort_order),
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = @id
  `),
  completeItem: db.prepare(`
    UPDATE gtd_items SET
      status = 'completed',
      completed_date = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = ?
  `),
  archiveItem: db.prepare(`
    UPDATE gtd_items SET
      status = 'archived',
      item_type = 'archived',
      archived_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = ?
  `),
  deleteItem: db.prepare("DELETE FROM gtd_items WHERE id = ?"),

  // Item tags
  addItemTag: db.prepare("INSERT OR IGNORE INTO gtd_item_tags (item_id, tag_id) VALUES (?, ?)"),
  removeItemTag: db.prepare("DELETE FROM gtd_item_tags WHERE item_id = ? AND tag_id = ?"),
  clearItemTags: db.prepare("DELETE FROM gtd_item_tags WHERE item_id = ?"),
  getItemTags: db.prepare(`
    SELECT t.* FROM gtd_tags t
    JOIN gtd_item_tags it ON t.id = it.tag_id
    WHERE it.item_id = ?
  `),

  // Areas
  listAreas: db.prepare("SELECT * FROM gtd_areas WHERE status = 'active' ORDER BY sort_order ASC, name ASC"),
  getArea: db.prepare("SELECT * FROM gtd_areas WHERE id = ?"),
  insertArea: db.prepare("INSERT INTO gtd_areas (name, description, standard, parent_area_id) VALUES (?, ?, ?, ?)"),
  updateArea: db.prepare(`
    UPDATE gtd_areas SET
      name = COALESCE(?, name), description = COALESCE(?, description),
      standard = COALESCE(?, standard), status = COALESCE(?, status),
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = ?
  `),

  // Tags
  listTags: db.prepare("SELECT * FROM gtd_tags ORDER BY tag_type, name"),
  getTagByName: db.prepare("SELECT * FROM gtd_tags WHERE name = ?"),
  insertTag: db.prepare("INSERT INTO gtd_tags (name, tag_type, color) VALUES (?, ?, ?)"),

  // People
  listPeople: db.prepare("SELECT * FROM gtd_people ORDER BY is_agent DESC, name ASC"),
  getPersonByName: db.prepare("SELECT * FROM gtd_people WHERE LOWER(name) = LOWER(?)"),

  // Projects
  listProjects: db.prepare(`
    SELECT p.*, i.title, i.status as item_status, i.due_date, a.name as area_name,
      (SELECT COUNT(*) FROM gtd_items ci WHERE ci.parent_id = i.id AND ci.status = 'active') as action_count,
      (SELECT MIN(ci.due_date) FROM gtd_items ci WHERE ci.parent_id = i.id AND ci.status = 'active' AND ci.due_date IS NOT NULL) as next_due
    FROM gtd_projects p
    JOIN gtd_items i ON p.item_id = i.id
    LEFT JOIN gtd_areas a ON p.area_id = a.id
    WHERE i.status = 'active'
    ORDER BY p.deadline ASC NULLS LAST, i.created_at DESC
  `),
  insertProject: db.prepare("INSERT INTO gtd_projects (item_id, desired_outcome, area_id, deadline, review_date) VALUES (?, ?, ?, ?, ?)"),

  // Waiting For
  listWaiting: db.prepare(`
    SELECT w.*, i.title, p.name as person_name, p.is_agent,
      CAST(julianday('now') - julianday(w.delegated_date) AS INTEGER) as days_waiting
    FROM gtd_waiting_for w
    JOIN gtd_items i ON w.item_id = i.id
    LEFT JOIN gtd_people p ON w.person_id = p.id
    WHERE w.resolved_date IS NULL
    ORDER BY w.follow_up_date ASC NULLS LAST
  `),
  insertWaiting: db.prepare("INSERT INTO gtd_waiting_for (item_id, person_id, expected_date, follow_up_date, notes) VALUES (?, ?, ?, ?, ?)"),
  resolveWaiting: db.prepare("UPDATE gtd_waiting_for SET resolved_date = date('now') WHERE item_id = ?"),

  // Captures (raw inbox)
  listCaptures: db.prepare("SELECT * FROM gtd_captures WHERE processed = FALSE ORDER BY captured_at DESC"),
  insertCapture: db.prepare("INSERT INTO gtd_captures (raw_text, source, source_ref) VALUES (?, ?, ?)"),
  processCapture: db.prepare("UPDATE gtd_captures SET processed = TRUE, item_id = ?, processed_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?"),

  // Reviews
  getLastReview: db.prepare("SELECT * FROM gtd_reviews WHERE review_type = ? ORDER BY started_at DESC LIMIT 1"),
  insertReview: db.prepare("INSERT INTO gtd_reviews (review_type) VALUES (?)"),
  completeReview: db.prepare(`
    UPDATE gtd_reviews SET
      completed_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
      notes = ?, inbox_cleared = ?, projects_reviewed = ?,
      waiting_reviewed = ?, someday_reviewed = ?, calendar_reviewed = ?
    WHERE id = ?
  `),

  // Resources (business canon)
  listResources: db.prepare(`
    SELECT r.*, i.title, i.body FROM gtd_resources r
    JOIN gtd_items i ON r.item_id = i.id
    WHERE i.status = 'active'
    ORDER BY r.canon DESC, i.title ASC
  `),
  listCanon: db.prepare(`
    SELECT r.*, i.title, i.body FROM gtd_resources r
    JOIN gtd_items i ON r.item_id = i.id
    WHERE r.canon = TRUE AND i.status = 'active'
    ORDER BY i.title ASC
  `),
  insertResource: db.prepare("INSERT INTO gtd_resources (item_id, category, author, source_url, canon) VALUES (?, ?, ?, ?, ?)"),

  // Activity log
  logActivity: db.prepare("INSERT INTO gtd_activity_log (item_id, action, old_value, new_value, actor) VALUES (?, ?, ?, ?, ?)"),

  // Stats (Overseer dashboard)
  gtdStats: db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM gtd_items WHERE item_type = 'inbox' AND status = 'active') as inbox_count,
      (SELECT COUNT(*) FROM gtd_captures WHERE processed = FALSE) as raw_captures,
      (SELECT COUNT(*) FROM gtd_items WHERE item_type = 'next_action' AND status = 'active') as next_actions,
      (SELECT COUNT(*) FROM gtd_items WHERE item_type = 'project' AND status = 'active') as active_projects,
      (SELECT COUNT(*) FROM gtd_items WHERE item_type = 'waiting_for' AND status = 'active') as waiting_count,
      (SELECT COUNT(*) FROM gtd_items WHERE item_type = 'someday_maybe' AND status = 'incubating') as someday_count,
      (SELECT COUNT(*) FROM gtd_items WHERE status = 'completed' AND completed_date >= date('now', '-7 days')) as completed_week,
      (SELECT MAX(completed_at) FROM gtd_reviews WHERE review_type = 'weekly') as last_weekly_review
  `),
};

const stmts = {
  getSession: db.prepare("SELECT * FROM sessions WHERE id = ?"),
  listSessions: db.prepare(
    `SELECT s.*, COUNT(a.id) as agent_count, s.updated_at as last_activity
     FROM sessions s LEFT JOIN agents a ON a.session_id = s.id
     GROUP BY s.id ORDER BY s.updated_at DESC LIMIT ? OFFSET ?`
  ),
  listSessionsByStatus: db.prepare(
    `SELECT s.*, COUNT(a.id) as agent_count, s.updated_at as last_activity
     FROM sessions s LEFT JOIN agents a ON a.session_id = s.id
     WHERE s.status = ? GROUP BY s.id ORDER BY s.updated_at DESC LIMIT ? OFFSET ?`
  ),
  insertSession: db.prepare(
    "INSERT INTO sessions (id, name, status, cwd, model, started_at, updated_at, metadata) VALUES (?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), ?)"
  ),
  updateSession: db.prepare(
    "UPDATE sessions SET name = COALESCE(?, name), status = COALESCE(?, status), ended_at = COALESCE(?, ended_at), metadata = COALESCE(?, metadata), updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?"
  ),
  reactivateSession: db.prepare(
    "UPDATE sessions SET status = 'active', ended_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?"
  ),

  getAgent: db.prepare("SELECT * FROM agents WHERE id = ?"),
  listAgents: db.prepare("SELECT * FROM agents ORDER BY started_at DESC LIMIT ? OFFSET ?"),
  listAgentsBySession: db.prepare(
    "SELECT * FROM agents WHERE session_id = ? ORDER BY started_at ASC"
  ),
  listAgentsByStatus: db.prepare(
    "SELECT * FROM agents WHERE status = ? ORDER BY started_at DESC LIMIT ? OFFSET ?"
  ),
  insertAgent: db.prepare(
    "INSERT INTO agents (id, session_id, name, type, subagent_type, status, task, started_at, updated_at, parent_agent_id, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), ?, ?)"
  ),
  updateAgent: db.prepare(
    "UPDATE agents SET name = COALESCE(?, name), status = COALESCE(?, status), task = COALESCE(?, task), current_tool = ?, ended_at = COALESCE(?, ended_at), metadata = COALESCE(?, metadata), updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?"
  ),
  reactivateAgent: db.prepare(
    "UPDATE agents SET status = 'connected', ended_at = NULL, current_tool = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?"
  ),

  touchSession: db.prepare(
    "UPDATE sessions SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?"
  ),
  findStaleSessions: db.prepare(
    `SELECT id FROM sessions
     WHERE status = 'active' AND id != ?
       AND updated_at < strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-' || ? || ' minutes')`
  ),

  insertEvent: db.prepare(
    "INSERT INTO events (session_id, agent_id, event_type, tool_name, summary, data, created_at) VALUES (?, ?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))"
  ),
  listEvents: db.prepare("SELECT * FROM events ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?"),
  listEventsBySession: db.prepare(
    "SELECT * FROM events WHERE session_id = ? ORDER BY created_at DESC, id DESC"
  ),
  countEvents: db.prepare("SELECT COUNT(*) as count FROM events"),
  countEventsSince: db.prepare("SELECT COUNT(*) as count FROM events WHERE created_at >= ?"),
  countEventsToday: db.prepare(
    "SELECT COUNT(*) as count FROM events WHERE created_at >= strftime('%Y-%m-%dT00:00:00.000Z', 'now', 'start of day')"
  ),

  stats: db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM sessions) as total_sessions,
      (SELECT COUNT(*) FROM sessions WHERE status = 'active') as active_sessions,
      (SELECT COUNT(*) FROM agents WHERE status IN ('working', 'connected', 'idle')) as active_agents,
      (SELECT COUNT(*) FROM agents) as total_agents,
      (SELECT COUNT(*) FROM events) as total_events
  `),
  agentStatusCounts: db.prepare("SELECT status, COUNT(*) as count FROM agents GROUP BY status"),
  sessionStatusCounts: db.prepare("SELECT status, COUNT(*) as count FROM sessions GROUP BY status"),

  upsertTokenUsage: db.prepare(`
    INSERT INTO token_usage (session_id, model, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(session_id, model) DO UPDATE SET
      input_tokens = input_tokens + excluded.input_tokens,
      output_tokens = output_tokens + excluded.output_tokens,
      cache_read_tokens = cache_read_tokens + excluded.cache_read_tokens,
      cache_write_tokens = cache_write_tokens + excluded.cache_write_tokens
  `),
  replaceTokenUsage: db.prepare(`
    INSERT INTO token_usage (session_id, model, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens,
                             baseline_input, baseline_output, baseline_cache_read, baseline_cache_write)
    VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0, 0)
    ON CONFLICT(session_id, model) DO UPDATE SET
      baseline_input = CASE WHEN excluded.input_tokens < input_tokens
        THEN baseline_input + input_tokens ELSE baseline_input END,
      baseline_output = CASE WHEN excluded.output_tokens < output_tokens
        THEN baseline_output + output_tokens ELSE baseline_output END,
      baseline_cache_read = CASE WHEN excluded.cache_read_tokens < cache_read_tokens
        THEN baseline_cache_read + cache_read_tokens ELSE baseline_cache_read END,
      baseline_cache_write = CASE WHEN excluded.cache_write_tokens < cache_write_tokens
        THEN baseline_cache_write + cache_write_tokens ELSE baseline_cache_write END,
      input_tokens = excluded.input_tokens,
      output_tokens = excluded.output_tokens,
      cache_read_tokens = excluded.cache_read_tokens,
      cache_write_tokens = excluded.cache_write_tokens
  `),
  getTokenTotals: db.prepare(`
    SELECT
      COALESCE(SUM(input_tokens + baseline_input), 0) as total_input,
      COALESCE(SUM(output_tokens + baseline_output), 0) as total_output,
      COALESCE(SUM(cache_read_tokens + baseline_cache_read), 0) as total_cache_read,
      COALESCE(SUM(cache_write_tokens + baseline_cache_write), 0) as total_cache_write
    FROM token_usage
  `),
  getTokensBySession: db.prepare(
    `SELECT model,
      input_tokens + baseline_input as input_tokens,
      output_tokens + baseline_output as output_tokens,
      cache_read_tokens + baseline_cache_read as cache_read_tokens,
      cache_write_tokens + baseline_cache_write as cache_write_tokens
    FROM token_usage WHERE session_id = ?`
  ),

  // Model pricing
  listPricing: db.prepare("SELECT * FROM model_pricing ORDER BY display_name ASC"),
  getPricing: db.prepare("SELECT * FROM model_pricing WHERE model_pattern = ?"),
  upsertPricing: db.prepare(`
    INSERT INTO model_pricing (model_pattern, display_name, input_per_mtok, output_per_mtok, cache_read_per_mtok, cache_write_per_mtok, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    ON CONFLICT(model_pattern) DO UPDATE SET
      display_name = excluded.display_name,
      input_per_mtok = excluded.input_per_mtok,
      output_per_mtok = excluded.output_per_mtok,
      cache_read_per_mtok = excluded.cache_read_per_mtok,
      cache_write_per_mtok = excluded.cache_write_per_mtok,
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  `),
  deletePricing: db.prepare("DELETE FROM model_pricing WHERE model_pattern = ?"),
  matchPricing: db.prepare(
    "SELECT * FROM model_pricing WHERE ? LIKE REPLACE(model_pattern, '%', '%') LIMIT 1"
  ),
  toolUsageCounts: db.prepare(`
    SELECT tool_name, COUNT(*) as count
    FROM events
    WHERE tool_name IS NOT NULL
    GROUP BY tool_name
    ORDER BY count DESC
    LIMIT 20
  `),
  dailyEventCounts: db.prepare(`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM events
    WHERE created_at >= DATE('now', '-365 days')
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `),
  dailySessionCounts: db.prepare(`
    SELECT DATE(started_at) as date, COUNT(*) as count
    FROM sessions
    WHERE started_at >= DATE('now', '-365 days')
    GROUP BY DATE(started_at)
    ORDER BY date ASC
  `),
  agentTypeDistribution: db.prepare(`
    SELECT subagent_type, COUNT(*) as count
    FROM agents
    WHERE type = 'subagent' AND subagent_type IS NOT NULL
    GROUP BY subagent_type
    ORDER BY count DESC
  `),
  totalSubagentCount: db.prepare("SELECT COUNT(*) as count FROM agents WHERE type = 'subagent'"),
  eventTypeCounts: db.prepare(`
    SELECT event_type, COUNT(*) as count
    FROM events
    GROUP BY event_type
    ORDER BY count DESC
  `),
  avgEventsPerSession: db.prepare(`
    SELECT ROUND(CAST(COUNT(*) AS REAL) / MAX(1, (SELECT COUNT(*) FROM sessions)), 1) as avg
    FROM events
  `),
};

module.exports = { db, stmts, gtdStmts, DB_PATH };

// SKIPPY COMMAND CENTER — core pages: STAT, GTD, BOARD, DATA, FEED
/* global React, SK_DATA, Icon, Status, PageHead, Skippy, Stat */

const { useState: useStateC, useMemo: useMemoC } = React;

// ============ STAT — The Bridge ============
function StatPage({ onNav }) {
  const D = SK_DATA;
  const [expanded, setExpanded] = useStateC(true);
  return (
    <div data-screen-label="STAT — The Bridge">
      <PageHead eyebrow="Station 01 — Stat" title="The Bridge" sub={`Real-time crew telemetry · Stardate ${D.stardate}`}>
        <button className="sk-btn ghost"><Icon name="refresh" />Refresh</button>
      </PageHead>

      <section className="sk-hero" data-comment-anchor="bridge-hero">
        <span className="star" style={{ width: "1rem", height: "1rem", top: "1.125rem", right: "15.5rem", opacity: 0.9 }}></span>
        <span className="star" style={{ width: "0.625rem", height: "0.625rem", top: "2.625rem", right: "17.5rem", opacity: 0.6 }}></span>
        <span className="star" style={{ width: "0.75rem", height: "0.75rem", bottom: "1.25rem", right: "14.25rem", opacity: 0.7 }}></span>
        <div className="eyebrow">Vault 69 · Master Control reporting</div>
        <h2>All quiet on the bridge.</h2>
        <p>{SK_DATA.SKIPPY.stat}</p>
        <div className="sk-ribbon">OWN YOUR AI BEFORE IT OWNS YOU</div>
        <img className="rita" src="ns/assets/Rita_1.png" alt="Rita Rivera with the NukaSoft rocket bottle" />
      </section>

      <div className="sk-statgrid" style={{ marginBottom: "0.875rem" }}>
        <Stat k="Voyages" v="1.1K" d="1 underway" icon="folder" />
        <Stat k="Crew active" v="1" d="of 1.4K mustered" icon="bot" />
        <Stat k="Deckhands" v="0" d="16 on this voyage" icon="users" />
        <Stat k="Events today" v="2.7K" d="~35.8 per voyage" icon="zap" />
        <Stat k="Events total" v="39.9K" d="all time" icon="activity" />
        <Stat k="Spend" v="$1.57K" d="4 models" icon="dollar" />
      </div>

      <div className="sk-split" style={{ marginTop: "0.875rem" }}>
        <section className="sk-card">
          <div style={{ display: "flex", alignItems: "baseline", marginBottom: "0.25rem" }}>
            <h6 style={{ margin: 0 }}>Active crew</h6>
            <button className="sk-btn ghost" style={{ marginLeft: "auto", padding: "0.25rem 0.75rem", fontSize: "0.625rem" }} onClick={() => onNav("board")}>
              Crew board <Icon name="arrowR" />
            </button>
          </div>
          {D.AGENTS.map((a) => (
            <div key={a.id} style={{ borderTop: "1px dashed var(--sk-hairline)", paddingTop: "0.75rem", marginTop: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div className="sk-av">{a.name[0]}</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.9375rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                  <div className="sk-table-id" style={{ fontFamily: "var(--sk-font-mono)", fontSize: "0.6875rem", color: "var(--sk-fg-3)" }}>
                    {a.slug} · {a.id} · {a.model}
                  </div>
                </div>
                <span style={{ fontFamily: "var(--sk-font-mono)", fontSize: "0.75rem", color: "var(--sk-fg-2)" }}>${a.cost.toFixed(2)}</span>
                <Status s={a.status} />
              </div>
              {a.subagents.length > 0 && (
                <div style={{ marginLeft: "1rem", marginTop: "0.625rem" }}>
                  <button className="sk-btn ghost" style={{ padding: "0.1875rem 0.625rem", fontSize: "0.625rem" }} onClick={() => setExpanded(!expanded)}>
                    <Icon name={expanded ? "chevD" : "chevR"} />{a.subagents.length} deckhands
                  </button>
                  {expanded && a.subagents.map((s) => (
                    <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.4375rem 0 0.4375rem 0.875rem", borderLeft: "1px dashed var(--sk-hairline-strong)", marginLeft: "0.5rem", marginTop: "0.375rem" }}>
                      <span style={{ fontFamily: "var(--sk-font-mono)", fontSize: "0.75rem", flex: 1 }}>{s.name}</span>
                      <span style={{ fontFamily: "var(--sk-font-mono)", fontSize: "0.6875rem", color: "var(--sk-fg-3)" }}>{s.ran}</span>
                      <Status s={s.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>

        <div style={{ display: "grid", gap: "0.875rem", alignContent: "start" }}>
          <Periscope />
          <section className="sk-card">
          <div style={{ display: "flex", alignItems: "baseline", marginBottom: "0.25rem" }}>
            <h6 style={{ margin: 0 }}>Captain's log — latest</h6>
            <button className="sk-btn ghost" style={{ marginLeft: "auto", padding: "0.25rem 0.75rem", fontSize: "0.625rem" }} onClick={() => onNav("feed")}>
              Full log <Icon name="arrowR" />
            </button>
          </div>
          <div className="sk-log">
            {SK_DATA.EVENTS.slice(0, 8).map((e, i) => (
              <div className="sk-logitem" key={i} style={{ gridTemplateColumns: "1fr auto" }}>
                <div className="msg" style={{ display: "flex", gap: "0.5rem", alignItems: "baseline", minWidth: 0 }}>
                  <Status s={e.kind} label="" />
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {e.msg}{e.tool && <span className="mono"> · {e.tool}</span>}
                  </span>
                </div>
                <div className="tail">{e.ago}</div>
              </div>
            ))}
          </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ============ Periscope — front-page watch feed ============
function Periscope() {
  const [cfg, setCfg] = useStateC(() => {
    try { return JSON.parse(localStorage.getItem("sk-cam") || "null") || { kind: "ipcam", src: "" }; }
    catch { return { kind: "ipcam", src: "" }; }
  });
  const [draft, setDraft] = useStateC(cfg.src);
  const apply = (kind, src) => {
    const next = { kind, src: src.trim() };
    setCfg(next);
    try { localStorage.setItem("sk-cam", JSON.stringify(next)); } catch {}
  };
  const ytId = cfg.kind === "youtube" && cfg.src
    ? (cfg.src.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{6,})/) || [, cfg.src.match(/^[\w-]{11}$/) ? cfg.src : null])[1]
    : null;
  const live = cfg.kind === "youtube" ? !!ytId : !!cfg.src;
  return (
    <section className="sk-card" data-comment-anchor="periscope">
      <h6 style={{ marginBottom: "0.625rem" }}>Periscope — watch feed</h6>
      <div className="sk-cam">
        {live && cfg.kind === "youtube" && (
          <iframe src={"https://www.youtube-nocookie.com/embed/" + ytId + "?autoplay=1&mute=1&rel=0"}
            title="Periscope feed" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen></iframe>
        )}
        {live && cfg.kind === "ipcam" && (
          <img className="feed" src={cfg.src} alt="IP camera feed" />
        )}
        {!live && (
          <React.Fragment>
            <div className="static"></div>
            <div className="nosignal">
              <div className="big">AWAITING SIGNAL</div>
              <div className="small">Patch in an IP camera stream (MJPEG)<br />or a YouTube watch URL below.</div>
            </div>
          </React.Fragment>
        )}
        <div className="overlay">
          <span className="rec" style={{ background: live ? "var(--sk-red-bright)" : "var(--sk-fg-3)", animation: live ? undefined : "none" }}></span>
          <span>CAM 01 · VAULT DOOR</span>
          <span className="right">{live ? "LIVE" : "NO SIGNAL"}</span>
        </div>
      </div>
      <div className="sk-camrow">
        <div className="sk-seg" style={{ flex: "none" }}>
          {["ipcam", "youtube"].map((k) => (
            <button key={k} className={cfg.kind === k ? "active" : ""} onClick={() => apply(k, draft)}>
              {k === "ipcam" ? "IP CAM" : "YOUTUBE"}
            </button>
          ))}
        </div>
        <div className="sk-search">
          <Icon name="search" />
          <input value={draft} placeholder={cfg.kind === "ipcam" ? "http://192.168.10.x/stream.mjpg" : "https://youtube.com/watch?v=\u2026"}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && apply(cfg.kind, draft)} />
        </div>
        <button className="sk-btn ghost" style={{ padding: "0.375rem 0.75rem", fontSize: "0.625rem" }} onClick={() => apply(cfg.kind, draft)}>Patch in</button>
      </div>
    </section>
  );
}

// ============ GTD — The Planner ============
const GTD_COLS = [
  { id: "inbox", label: "Inbox", icon: "inbox", tone: "yellow" },
  { id: "next_action", label: "Next actions", icon: "zap", tone: "green" },
  { id: "waiting_for", label: "Waiting for", icon: "clock", tone: "sky" },
  { id: "someday_maybe", label: "Someday", icon: "cloud", tone: "" },
];

function GtdPage() {
  const [items, setItems] = useStateC(() => JSON.parse(JSON.stringify(SK_DATA.GTD)));
  const [draft, setDraft] = useStateC("");
  const [doneCount, setDoneCount] = useStateC(34);

  const complete = (col, idx) => {
    setItems((prev) => {
      const next = { ...prev, [col]: prev[col].filter((_, i) => i !== idx) };
      return next;
    });
    setDoneCount((c) => c + 1);
  };
  const move = (col, idx, target) => {
    setItems((prev) => {
      const item = prev[col][idx];
      return {
        ...prev,
        [col]: prev[col].filter((_, i) => i !== idx),
        [target]: [item, ...prev[target]],
      };
    });
  };
  const add = () => {
    if (!draft.trim()) return;
    setItems((prev) => ({ ...prev, inbox: [{ t: draft.trim(), ctx: null, who: null, ago: "now" }, ...prev.inbox] }));
    setDraft("");
  };

  return (
    <div data-screen-label="GTD — The Planner">
      <PageHead eyebrow="Station 02 — GTD" title="The Planner" sub={`${Object.values(items).reduce((a, c) => a + c.length, 0)} open · ${doneCount} done this week`} />
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.875rem", maxWidth: "34rem" }}>
        <div className="sk-search" style={{ flex: 1 }}>
          <Icon name="plus" />
          <input value={draft} placeholder="Capture to inbox… (Enter)" onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
        </div>
        <button className="sk-btn" onClick={add}><Icon name="plus" />Capture</button>
      </div>
      <Skippy>{SK_DATA.SKIPPY.gtd}</Skippy>
      <div className="sk-board" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginTop: "0.875rem" }}>
        {GTD_COLS.map((col) => (
          <div className="sk-col" key={col.id}>
            <div className="sk-colhead">
              <Status s={col.tone === "yellow" ? "working" : col.tone === "green" ? "completed" : col.tone === "sky" ? "connected" : "idle"} label={col.label} />
              <span className="count">{items[col.id].length}</span>
            </div>
            <div className="sk-colbody">
              {items[col.id].length === 0 && <div className="sk-colempty">Empty.  Suspiciously empty.</div>}
              {items[col.id].map((it, idx) => (
                <div className="sk-tcard" key={it.t}>
                  <div className="t">
                    <span>{it.t}</span>
                    <button title="Mark done" onClick={() => complete(col.id, idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sk-fg-3)", padding: 0 }}>
                      <Icon name="check" style={{ width: "0.9375rem", height: "0.9375rem" }} />
                    </button>
                  </div>
                  <div className="meta">
                    {it.ctx && <span className="sk-chip green">{it.ctx}</span>}
                    {it.who && <span className="sk-chip sky">→ {it.who}</span>}
                    <span>{it.ago}</span>
                    <span style={{ marginLeft: "auto", display: "flex", gap: "0.25rem" }}>
                      {GTD_COLS.filter((c) => c.id !== col.id).map((c) => (
                        <button key={c.id} title={"Move to " + c.label} onClick={() => move(col.id, idx, c.id)}
                          style={{ background: "none", border: "1px solid var(--sk-hairline)", borderRadius: "999px", cursor: "pointer", color: "var(--sk-fg-3)", padding: "0.0625rem 0.4375rem", fontFamily: "var(--sk-font-mono)", fontSize: "0.5625rem" }}>
                          {c.label.split(" ")[0]}
                        </button>
                      ))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ BOARD — Crew Board ============
const BOARD_COLS = [
  { id: "idle", label: "Idle" }, { id: "connected", label: "Connected" },
  { id: "working", label: "Working" }, { id: "completed", label: "Completed" },
  { id: "error", label: "Error" },
];

function BoardPage() {
  const D = SK_DATA;
  return (
    <div data-screen-label="BOARD — Crew Board">
      <PageHead eyebrow="Station 03 — Board" title="Crew Board" sub="1,417 crew tracked across all voyages">
        <button className="sk-btn ghost"><Icon name="refresh" />Refresh</button>
      </PageHead>
      <div className="sk-board" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
        {BOARD_COLS.map((col) => (
          <div className="sk-col" key={col.id}>
            <div className="sk-colhead">
              <Status s={col.id} label={col.label} />
              <span className="count">{D.BOARD_COUNTS[col.id]}</span>
            </div>
            <div className="sk-colbody">
              {D.BOARD[col.id].length === 0 && <div className="sk-colempty">{SK_DATA.SKIPPY.boardEmpty}</div>}
              {D.BOARD[col.id].map((a, i) => (
                <div className="sk-tcard" key={col.id + i}>
                  <div className="t"><span>{a.name}</span></div>
                  {a.note && <div style={{ fontSize: "0.75rem", color: "var(--sk-fg-2)", marginTop: "0.375rem", lineHeight: 1.45 }}>{a.note}</div>}
                  <div className="meta">
                    {a.ran && <span><Icon name="clock" style={{ width: "0.625rem", height: "0.625rem", display: "inline-block", verticalAlign: "-1px" }} /> {a.ran}</span>}
                    <span>{a.ago}</span>
                    <span style={{ marginLeft: "auto" }}>{a.id}</span>
                  </div>
                </div>
              ))}
              {col.id === "completed" && (
                <button className="sk-btn ghost" style={{ justifyContent: "center", fontSize: "0.625rem" }}>
                  Show more <Icon name="chevD" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ DATA — Voyage Ledger ============
const DATA_FILTERS = ["All", "Working", "Completed", "Error", "Abandoned"];

function DataPage() {
  const [q, setQ] = useStateC("");
  const [filter, setFilter] = useStateC("All");
  const [sel, setSel] = useStateC(null);

  const rows = useMemoC(() => SK_DATA.SESSIONS.filter((s) => {
    const okF = filter === "All" || s.status === filter.toLowerCase();
    const okQ = !q || (s.name + s.slug + s.dir).toLowerCase().includes(q.toLowerCase());
    return okF && okQ;
  }), [q, filter]);

  return (
    <div data-screen-label="DATA — Voyage Ledger">
      <PageHead eyebrow="Station 04 — Data" title="Voyage Ledger" sub="500 voyages on record">
        <button className="sk-btn ghost"><Icon name="download" />Export</button>
      </PageHead>
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.875rem", flexWrap: "wrap", alignItems: "center" }}>
        <div className="sk-search" style={{ flex: "1 1 16rem", maxWidth: "26rem" }}>
          <Icon name="search" />
          <input placeholder="Search voyages, slugs, directories…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="sk-seg">
          {DATA_FILTERS.map((f) => (
            <button key={f} className={filter === f ? "active" : ""} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
      </div>
      <div className="sk-tablewrap">
        <table className="sk-table">
          <thead>
            <tr>
              <th>Voyage</th><th>Status</th><th>Last active</th>
              <th className="num">Duration</th><th className="num">Crew</th>
              <th className="num">Cost</th><th>Directory</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <React.Fragment key={s.id}>
                <tr onClick={() => setSel(sel === s.id ? null : s.id)}>
                  <td>
                    <div className="title">{s.name}</div>
                    <div className="id">{s.slug} · {s.id}</div>
                  </td>
                  <td><Status s={s.status} /></td>
                  <td className="mono">{s.ago}</td>
                  <td className="mono num">{s.dur}</td>
                  <td className="mono num">{s.agents}</td>
                  <td className="mono num">{s.cost ? "$" + s.cost.toFixed(2) : "—"}</td>
                  <td className="mono" style={{ maxWidth: "14rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.dir}</td>
                </tr>
                {sel === s.id && (
                  <tr>
                    <td colSpan="7" style={{ background: "var(--sk-surface-2)" }}>
                      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", fontFamily: "var(--sk-font-mono)", fontSize: "0.75rem", color: "var(--sk-fg-2)", padding: "0.25rem 0" }}>
                        <span>stardate {s.stardate}</span>
                        <span>model claude-opus-4-6</span>
                        <span>events {Math.round(s.cost * 23) + 12}</span>
                        <span style={{ marginLeft: "auto" }}>
                          <button className="sk-btn" style={{ padding: "0.3125rem 0.875rem", fontSize: "0.625rem" }}>Open voyage <Icon name="arrowR" /></button>
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: "center", padding: "2rem", color: "var(--sk-fg-3)", fontFamily: "var(--sk-font-mono)", fontSize: "0.75rem" }}>
                No voyages match.  Either refine the search or accept that it never happened.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============ FEED — Captain's Log ============
function FeedPage() {
  const [kind, setKind] = useStateC("All");
  const kinds = ["All", "Working", "Connected", "Completed"];
  const rows = SK_DATA.EVENTS.filter((e) => kind === "All" || e.kind === kind.toLowerCase());
  return (
    <div data-screen-label="FEED — Captain's Log">
      <PageHead eyebrow="Station 05 — Feed" title="Captain's Log" sub={`39.9K entries · live relay`}>
        <div className="sk-seg">
          {kinds.map((k) => <button key={k} className={kind === k ? "active" : ""} onClick={() => setKind(k)}>{k}</button>)}
        </div>
      </PageHead>
      <Skippy>{SK_DATA.SKIPPY.feed}</Skippy>
      <div className="sk-card" style={{ marginTop: "0.875rem" }}>
        <div className="sk-log">
          {rows.map((e, i) => (
            <div className="sk-logitem" key={i}>
              <div className="stardate">{e.stardate}</div>
              <div className="msg">
                <strong>{e.agent}</strong> → {e.msg}
                {e.tool && <span className="mono"> · {e.tool}</span>}
              </div>
              <div className="tail" style={{ display: "flex", gap: "0.75rem", alignItems: "baseline" }}>
                <Status s={e.kind} />
                <span>{e.ago}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { StatPage, GtdPage, BoardPage, DataPage, FeedPage, Periscope });

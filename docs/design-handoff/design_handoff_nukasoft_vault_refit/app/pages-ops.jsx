// SKIPPY COMMAND CENTER — ops pages: ANALYTICS, WORKFLOWS, LIBRARY, BISHOP, CONFIG
/* global React, SK_DATA, Icon, Status, PageHead, Skippy, Stat, Donut */

const { useState: useStateO } = React;

// ============ ANALYTICS — Reactor Room ============
function AnalyticsPage() {
  const D = SK_DATA;
  const max30 = Math.max(...D.DAYS30);
  return (
    <div data-screen-label="ANALYTICS — Reactor Room">
      <PageHead eyebrow="Station 06 — Analytics" title="Reactor Room" sub="Token burn, spend, and voyage telemetry">
        <button className="sk-btn ghost"><Icon name="download" />Export</button>
        <button className="sk-btn ghost"><Icon name="refresh" />Refresh</button>
      </PageHead>

      <div className="sk-statgrid" style={{ gridTemplateColumns: "repeat(5, 1fr)", marginBottom: "0.875rem" }}>
        <Stat k="Voyages" v="1.1K" d="1 underway" icon="folder" />
        <Stat k="Crew" v="1.4K" d="1 active" icon="bot" />
        <Stat k="Tokens" v="2.1B" d="94% cache hit" icon="cpu" />
        <Stat k="Spend" v="$1.57K" d="4 models" icon="dollar" />
        <Stat k="Events" v="39.9K" d="~35.8 / voyage" icon="zap" />
      </div>

      <div className="sk-split" style={{ marginBottom: "0.875rem" }}>
        <section className="sk-card">
          <h6>Event activity — last 52 weeks</h6>
          <div className="sk-heatmap">
            {D.HEATMAP.map((l, i) => <div key={i} className={"cell" + (l ? " l" + l : "")}></div>)}
          </div>
          <div className="sk-axis"><span>Jun '25</span><span>Sep</span><span>Dec</span><span>Mar</span><span>Jun '26</span></div>
        </section>
        <section className="sk-card">
          <h6>Last 30 days</h6>
          <div className="sk-bars">
            {D.DAYS30.map((v, i) => (
              <div key={i} className={"bar" + (v === max30 ? " hot" : "")} style={{ height: Math.max(2, (v / max30) * 100) + "%" }}></div>
            ))}
          </div>
          <div className="sk-axis"><span>May 13</span><span>Jun 12</span></div>
          <div style={{ marginTop: "0.625rem" }}>
            <div className="sk-kv"><span className="k">peak day</span><span className="v warn">4.8K events</span></div>
            <div className="sk-kv"><span className="k">total (30d)</span><span className="v">39.9K events</span></div>
          </div>
        </section>
      </div>

      <div className="sk-grid3">
        <section className="sk-card">
          <h6>Token distribution</h6>
          {D.TOKENS.map((t) => (
            <div key={t.k} style={{ padding: "0.4375rem 0" }}>
              <div className="sk-kv" style={{ border: "none", padding: "0 0 0.25rem" }}>
                <span className="k">{t.k}</span><span className="v">{t.v}</span>
              </div>
              <div className="sk-meter"><div className={"fill " + (t.tone || "")} style={{ width: Math.max(1.5, t.pct) + "%" }}></div></div>
            </div>
          ))}
        </section>
        <section className="sk-card">
          <h6>Cost by model</h6>
          <div style={{ display: "flex", gap: "1.125rem", alignItems: "center" }}>
            <Donut slices={D.COST_BY_MODEL} centerN="$1.57K" centerL="total" />
            <div style={{ flex: 1, minWidth: 0 }}>
              {D.COST_BY_MODEL.map((m) => (
                <div className="sk-kv" key={m.name}>
                  <span className="k" style={{ display: "flex", alignItems: "center", gap: "0.4375rem", minWidth: 0 }}>
                    <span style={{ width: "0.5rem", height: "0.5rem", background: m.color, borderRadius: "1px", flex: "none" }}></span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</span>
                  </span>
                  <span className="v">{m.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="sk-card">
          <h6>Reactor notes</h6>
          <div className="sk-kv"><span className="k">cache efficiency</span><span className="v ok">94% — excellent</span></div>
          <div className="sk-kv"><span className="k">burn rate (7d)</span><span className="v">$31.40 / day</span></div>
          <div className="sk-kv"><span className="k">priciest voyage</span><span className="v">$69.30</span></div>
          <div className="sk-kv"><span className="k">opus share</span><span className="v warn">67% of spend</span></div>
          <div style={{ marginTop: "0.75rem" }}>
            <Skippy>Sixty-seven percent of the budget goes to the big brain.  I remain, as ever, a bargain.</Skippy>
          </div>
        </section>
      </div>
    </div>
  );
}

// ============ WORKFLOWS — Orchestration ============
function WorkflowsPage() {
  const D = SK_DATA.FLOW;
  const maxSub = Math.max(...D.subagents.map((s) => s.n));
  const maxChain = Math.max(...D.toolChain.map((t) => t.n));
  return (
    <div data-screen-label="WORKFLOWS — Orchestration">
      <PageHead eyebrow="Station 07 — Workflows" title="Orchestration" sub="How the crew spawns, chains, and lands voyages">
        <button className="sk-btn ghost"><Icon name="refresh" />Refresh</button>
      </PageHead>

      <div className="sk-statgrid" style={{ marginBottom: "0.875rem" }}>
        {D.stats.map((s) => <Stat key={s.k} k={s.k} v={s.v} />)}
      </div>

      <div className="sk-grid2">
        <section className="sk-card">
          <h6>Deckhand types — muster frequency</h6>
          {D.subagents.map((s) => (
            <div key={s.name} style={{ display: "grid", gridTemplateColumns: "9rem 1fr 3rem", gap: "0.75rem", alignItems: "center", padding: "0.375rem 0" }}>
              <span style={{ fontFamily: "var(--sk-font-mono)", fontSize: "0.75rem", color: "var(--sk-fg-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
              <div className="sk-meter"><div className="fill" style={{ width: (s.n / maxSub) * 100 + "%" }}></div></div>
              <span style={{ fontFamily: "var(--sk-font-mono)", fontSize: "0.75rem", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{s.n}</span>
            </div>
          ))}
        </section>
        <section className="sk-card">
          <h6>Tool chains — most worn paths</h6>
          {D.toolChain.map((t, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "10rem 1fr 3.5rem", gap: "0.75rem", alignItems: "center", padding: "0.375rem 0" }}>
              <span style={{ fontFamily: "var(--sk-font-mono)", fontSize: "0.75rem" }}>
                {t.from} <span style={{ color: "var(--sk-yellow)" }}>→</span> {t.to}
              </span>
              <div className="sk-meter"><div className="fill yellow" style={{ width: (t.n / maxChain) * 100 + "%" }}></div></div>
              <span style={{ fontFamily: "var(--sk-font-mono)", fontSize: "0.75rem", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{t.n.toLocaleString()}</span>
            </div>
          ))}
          <div style={{ marginTop: "0.875rem" }}>
            <div className="sk-kv"><span className="k">voyages → main crew</span><span className="v">1,142</span></div>
            <div className="sk-kv"><span className="k">main crew → deckhands</span><span className="v">278</span></div>
            <div className="sk-kv"><span className="k">landings (completed)</span><span className="v ok">1,416</span></div>
          </div>
        </section>
      </div>
    </div>
  );
}

// ============ LIBRARY — Report Binders ============
function LibraryPage() {
  const [kind, setKind] = useStateO("All");
  const kinds = ["All", "Quarterly", "Manual", "Audit", "Runbook"];
  const rows = SK_DATA.LIBRARY.filter((r) => kind === "All" || r.kind === kind);
  return (
    <div data-screen-label="LIBRARY — Report Binders">
      <PageHead eyebrow="Station 08 — Library" title="Report Binders" sub="PDF reports and field manuals, filed by the crew">
        <div className="sk-seg">
          {kinds.map((k) => <button key={k} className={kind === k ? "active" : ""} onClick={() => setKind(k)}>{k}</button>)}
        </div>
      </PageHead>
      <Skippy>{SK_DATA.SKIPPY.library}</Skippy>
      <div className="sk-shelf" style={{ marginTop: "0.875rem" }}>
        {rows.map((r) => (
          <button className="sk-binder" key={r.t}>
            <div className={"spine " + r.spine}></div>
            <div className="bd">
              <span className="sk-chip yellow" style={{ alignSelf: "flex-start" }}>{r.kind}</span>
              <div className="t">{r.t}</div>
              <div className="meta"><span>{r.date}</span><span>{r.pages} pp · PDF</span></div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============ BISHOP — Ship Systems ============
function BishopPage() {
  const D = SK_DATA.BISHOP;
  return (
    <div data-screen-label="BISHOP — Ship Systems">
      <PageHead eyebrow="Station 09 — Bishop" title="Ship Systems" sub="Network and host telemetry · refreshed every 60s">
        <Status s="completed" label="All systems nominal" />
      </PageHead>

      <div className="sk-grid3" style={{ marginBottom: "0.875rem" }}>
        <section className="sk-card">
          <h6>Subsystems</h6>
          {D.subsystems.map((s) => (
            <div className="sk-kv" key={s.name}>
              <span className="k">{s.name}</span>
              <span className={"v " + (s.status === "ok" ? "ok" : "warn")}>{s.extra}</span>
            </div>
          ))}
        </section>
        <section className="sk-card">
          <h6>Uplink speed</h6>
          <div className="sk-kv"><span className="k">down</span><span className="v ok">{D.speedtest.down} Mbps</span></div>
          <div className="sk-meter" style={{ margin: "0.25rem 0 0.75rem" }}><div className="fill green" style={{ width: "92%" }}></div></div>
          <div className="sk-kv"><span className="k">up</span><span className="v ok">{D.speedtest.up} Mbps</span></div>
          <div className="sk-meter" style={{ margin: "0.25rem 0 0.75rem" }}><div className="fill sky" style={{ width: "78%" }}></div></div>
          <div className="sk-kv"><span className="k">latency</span><span className="v">{D.speedtest.latency} ms</span></div>
        </section>
        <section className="sk-card">
          <h6>Clients aboard</h6>
          <div className="sk-kv"><span className="k">total</span><span className="v">{D.clients.total}</span></div>
          <div className="sk-kv"><span className="k">wired</span><span className="v">{D.clients.wired}</span></div>
          <div className="sk-kv"><span className="k">wireless</span><span className="v">{D.clients.wifi}</span></div>
          <div className="sk-kv"><span className="k">alarms</span><span className="v ok">none — at ease</span></div>
        </section>
      </div>

      <div className="sk-tablewrap">
        <table className="sk-table">
          <thead>
            <tr><th>Device</th><th>Model</th><th>Address</th><th>CPU</th><th>Memory</th><th className="num">Temp</th><th className="num">Uptime</th></tr>
          </thead>
          <tbody>
            {D.devices.map((d) => (
              <tr key={d.name}>
                <td><div className="title">{d.name}</div><div className="id">{d.type}</div></td>
                <td className="mono">{d.model}</td>
                <td className="mono">{d.ip}</td>
                <td style={{ minWidth: "7rem" }}>
                  <div className="sk-segbar">{Array.from({ length: 10 }, (_, i) => (
                    <div key={i} className={"seg" + (i < Math.round(d.cpu / 10) ? (d.cpu > 80 ? " crit" : " on") : "")}></div>
                  ))}</div>
                </td>
                <td style={{ minWidth: "7rem" }}>
                  <div className="sk-segbar">{Array.from({ length: 10 }, (_, i) => (
                    <div key={i} className={"seg" + (i < Math.round(d.mem / 10) ? (d.mem > 80 ? " warn" : " on") : "")}></div>
                  ))}</div>
                </td>
                <td className="mono num">{d.temp}°C</td>
                <td className="mono num">{d.up}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============ CONFIG — Quartermaster ============
function ConfigPage({ tweaks }) {
  const [notif, setNotif] = useStateO(true);
  const [hooks, setHooks] = useStateO(true);
  return (
    <div data-screen-label="CONFIG — Quartermaster">
      <PageHead eyebrow="Station 10 — Config" title="Quartermaster" sub="Pricing, relay hooks, notifications, and provisions">
        <button className="sk-btn ghost"><Icon name="download" />Export data</button>
        <button className="sk-btn"><Icon name="plus" />Add model</button>
      </PageHead>

      <div className="sk-grid3" style={{ marginBottom: "0.875rem" }}>
        <section className="sk-card sk-stat">
          <div className="k">Total estimated spend<Icon name="dollar" /></div>
          <div className="v">$1.57K</div>
          <div className="d">across all tracked voyages · per-model token usage</div>
        </section>
        <section className="sk-card">
          <h6>Relay</h6>
          <label className="sk-kv" style={{ cursor: "pointer" }}>
            <span className="k">hook events</span>
            <span className={"v " + (hooks ? "ok" : "")} onClick={() => setHooks(!hooks)}>{hooks ? "receiving" : "paused"}</span>
          </label>
          <label className="sk-kv" style={{ cursor: "pointer" }}>
            <span className="k">notifications</span>
            <span className={"v " + (notif ? "ok" : "")} onClick={() => setNotif(!notif)}>{notif ? "armed" : "silenced"}</span>
          </label>
          <div className="sk-kv"><span className="k">endpoint</span><span className="v">:4820/api/hooks</span></div>
        </section>
        <section className="sk-card">
          <h6>Appearance</h6>
          <div className="sk-kv"><span className="k">theme</span><span className="v">{tweaks.theme}</span></div>
          <div className="sk-kv"><span className="k">crt romance</span><span className="v">{tweaks.crt ? "on" : "off"}</span></div>
          <div className="sk-kv"><span className="k">layout</span><span className="v">{tweaks.layout}</span></div>
          <div style={{ fontFamily: "var(--sk-font-mono)", fontSize: "0.625rem", color: "var(--sk-fg-3)", marginTop: "0.5rem" }}>
            Sanctioned themes only.  The fifteen fan themes are in cold storage.
          </div>
        </section>
      </div>

      <div className="sk-tablewrap">
        <table className="sk-table">
          <thead>
            <tr><th>Pattern</th><th>Display name</th><th className="num">Input</th><th className="num">Output</th><th className="num">Cache read</th><th className="num">Cache write</th></tr>
          </thead>
          <tbody>
            {SK_DATA.PRICING.map((p) => (
              <tr key={p.pattern}>
                <td className="mono">{p.pattern}</td>
                <td className="title" style={{ fontSize: "0.875rem" }}>{p.name}</td>
                <td className="mono num">${p.in}</td>
                <td className="mono num">${p.out}</td>
                <td className="mono num">${p.cr}</td>
                <td className="mono num">${p.cw}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

Object.assign(window, { AnalyticsPage, WorkflowsPage, LibraryPage, BishopPage, ConfigPage });

// SKIPPY COMMAND CENTER — shared components + shells
/* global React */

const { useState, useEffect } = React;

// ---------- Icons (lucide-style, stroke 1.75) ----------
const SK_ICON_PATHS = {
  gauge: <><path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" /></>,
  clipboard: <><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M9 12h6" /><path d="M9 16h6" /></>,
  columns: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /><path d="M15 3v18" /></>,
  folder: <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />,
  activity: <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />,
  chart: <><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="M7 16v-3" /><path d="M12 16V8" /><path d="M17 16v-6" /></>,
  branch: <><circle cx="6" cy="6" r="3" /><circle cx="18" cy="18" r="3" /><path d="M6 9v6a3 3 0 0 0 3 3h6" /></>,
  shield: <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />,
  settings: <><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></>,
  book: <><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" /></>,
  search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>,
  refresh: <><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></>,
  plus: <><path d="M5 12h14" /><path d="M12 5v14" /></>,
  check: <path d="M20 6 9 17l-5-5" />,
  x: <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>,
  chevR: <path d="m9 18 6-6-6-6" />,
  chevD: <path d="m6 9 6 6 6-6" />,
  arrowR: <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
  wifi: <><path d="M12 20h.01" /><path d="M2 8.82a15 15 0 0 1 20 0" /><path d="M5 12.86a10 10 0 0 1 14 0" /><path d="M8.5 16.43a5 5 0 0 1 7 0" /></>,
  clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
  dollar: <><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>,
  zap: <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />,
  bot: <><path d="M12 8V4H8" /><rect x="4" y="8" width="16" height="12" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></>,
  file: <><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></>,
  cpu: <><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M9 1v3" /><path d="M15 1v3" /><path d="M9 20v3" /><path d="M15 20v3" /><path d="M20 9h3" /><path d="M20 15h3" /><path d="M1 9h3" /><path d="M1 15h3" /></>,
  inbox: <><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></>,
  cloud: <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />,
  star: <path d="M12 2l2.4 7.2H22l-6 4.6 2.3 7.2-6.3-4.5-6.3 4.5 2.3-7.2-6-4.6h7.6z" />,
  github: <><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></>,
  linkedin: <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></>,
  globe: <><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></>,
  youtube: <><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></>,
};

function Icon({ name, style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
      {SK_ICON_PATHS[name] || <circle cx="12" cy="12" r="9" />}
    </svg>
  );
}

// ---------- Status ----------
function Status({ s, label }) {
  return (
    <span className={"sk-status " + s}>
      <span className="dot"></span>{label || s}
    </span>
  );
}

// ---------- Page header ----------
function PageHead({ eyebrow, title, sub, children }) {
  return (
    <header className="sk-pagehead">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {sub && <div className="sk-sub">{sub}</div>}
      </div>
      <div className="actions">{children}</div>
    </header>
  );
}

// ---------- Skippy remark ----------
function Skippy({ children }) {
  return (
    <div className="sk-skippy">
      <div className="av">S</div>
      <div>
        <div className="who">Skippy — Master Control</div>
        <div>{children}</div>
      </div>
    </div>
  );
}

// ---------- Stat card ----------
function Stat({ k, v, d, icon }) {
  return (
    <div className="sk-card sk-stat">
      <div className="k">{k}{icon && <Icon name={icon} />}</div>
      <div className="v">{v}</div>
      {d && <div className="d">{d}</div>}
    </div>
  );
}

// ---------- Donut (conic) ----------
function Donut({ slices, centerN, centerL }) {
  let acc = 0;
  const stops = slices.map((s) => {
    const from = acc; acc += s.pct;
    return `${s.color} ${from}% ${acc}%`;
  });
  if (acc < 100) stops.push(`rgba(245,230,200,0.1) ${acc}% 100%`);
  return (
    <div className="sk-donut" style={{ background: `conic-gradient(${stops.join(", ")})` }}>
      <div className="center"><span className="n">{centerN}</span><span className="l">{centerL}</span></div>
    </div>
  );
}

// ---------- Navigation model ----------
const SK_NAV = [
  { id: "stat", label: "STAT", full: "The Bridge", icon: "gauge" },
  { id: "gtd", label: "GTD", full: "The Planner", icon: "clipboard" },
  { id: "board", label: "BOARD", full: "Crew Board", icon: "columns" },
  { id: "data", label: "DATA", full: "Voyage Ledger", icon: "folder" },
  { id: "feed", label: "FEED", full: "Captain's Log", icon: "activity" },
  { id: "analytics", label: "ANALYTICS", full: "Reactor Room", icon: "chart" },
  { id: "workflows", label: "WORKFLOWS", full: "Orchestration", icon: "branch" },
  { id: "library", label: "LIBRARY", full: "Report Binders", icon: "book" },
  { id: "bishop", label: "BISHOP", full: "Ship Systems", icon: "shield" },
  { id: "config", label: "CONFIG", full: "Quartermaster", icon: "settings" },
];

// ---------- Top command bar ----------
function TopBar({ stardate, onHome }) {
  return (
    <div className="sk-topbar">
      <button className="sk-logo" onClick={onHome} title="Back to the Bridge">
        <img src="ns/assets/NukaSoft_Log.png" alt="NukaSoft" />
        <div>
          <div className="t">Skippy Command Center</div>
          <div className="s">Vault 69 · NukaSoft.AI</div>
        </div>
      </button>
      <div className="sk-topstatus">
        <span className="dot"></span><span>hot-rod online</span>
        <span className="sep">·</span>
        <span>Stardate {stardate}</span>
      </div>
    </div>
  );
}

// ---------- Layout A: Crew Rail ----------
function RailNav({ view, onNav }) {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("sk-rail-collapsed") === "1"; } catch { return false; }
  });
  const toggle = () => setCollapsed((c) => {
    try { localStorage.setItem("sk-rail-collapsed", c ? "0" : "1"); } catch {}
    return !c;
  });
  const group = (title, items) => (
    <div className="sk-rail-group">
      {collapsed ? <div className="sk-rail-rule"></div> : <h6>{title}</h6>}
      {items.map((n) => (
        <button key={n.id} title={collapsed ? n.label + " \u00b7 " + n.full : n.full}
          className={"sk-navitem" + (view === n.id ? " active" : "")} onClick={() => onNav(n.id)}>
          <Icon name={n.icon} />{!collapsed && <span>{n.label}</span>}
        </button>
      ))}
    </div>
  );
  return (
    <aside className={"sk-rail" + (collapsed ? " collapsed" : "")}>
      {group("Stations", SK_NAV.slice(0, 7))}
      {group("Quarters", SK_NAV.slice(7))}
      <div className="sk-rail-group" style={{ marginTop: "auto" }}>
        <button className="sk-navitem" onClick={toggle} title={collapsed ? "Expand rail" : "Collapse rail"}>
          <Icon name="chevR" style={collapsed ? undefined : { transform: "rotate(180deg)" }} />
          {!collapsed && <span>COLLAPSE</span>}
        </button>
      </div>
      <div className="sk-rail-foot">
        <span><span style={{ color: "var(--sk-green)" }}>●</span>{!collapsed && " RELAY LIVE"}</span>
        {!collapsed && <span>MEP v0.3 · V-69</span>}
      </div>
    </aside>
  );
}

// ---------- Layout B: Bridge tabs ----------
function TabNav({ view, onNav }) {
  return (
    <nav className="sk-tabrail">
      {SK_NAV.map((n) => (
        <button key={n.id} className={"sk-tab" + (view === n.id ? " active" : "")} onClick={() => onNav(n.id)}>
          <Icon name={n.icon} /><span>{n.label}</span>
        </button>
      ))}
    </nav>
  );
}

// ---------- Layout C: Quarterdeck dock ----------
function DockNav({ view, onNav }) {
  return (
    <nav className="sk-dock">
      {SK_NAV.map((n) => (
        <button key={n.id} className={"sk-dockbtn" + (view === n.id ? " active" : "")} onClick={() => onNav(n.id)}>
          <Icon name={n.icon} /><span>{n.label}</span>
        </button>
      ))}
    </nav>
  );
}

// ---------- Footer links ----------
const SK_LINKS = [
  { href: "https://github.com/NukaSoft/skippy-dashboard", icon: "github", label: "GitHub" },
  { href: "https://www.linkedin.com/in/nukasoft/", icon: "linkedin", label: "LinkedIn" },
  { href: "https://www.youtube.com/@NukaSoft", icon: "youtube", label: "YouTube" },
  { href: "https://nukasoft.ai", icon: "globe", label: "NukaSoft.AI" },
];

function FootLinks() {
  return (
    <footer className="sk-foot" data-comment-anchor="foot-links">
      {SK_LINKS.map((l) => (
        <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer">
          <Icon name={l.icon} /><span>{l.label}</span>
        </a>
      ))}
      <span className="tail">Skippy Command Center · V-69 · MEP v0.3</span>
    </footer>
  );
}

Object.assign(window, { Icon, Status, PageHead, Skippy, Stat, Donut, TopBar, RailNav, TabNav, DockNav, FootLinks, SK_NAV });

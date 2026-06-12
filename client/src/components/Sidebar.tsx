import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Columns3,
  FolderOpen,
  Activity,
  BarChart3,
  Workflow,
  Settings,
  Shield,
  Wifi,
  WifiOff,
  PanelLeftClose,
  PanelLeftOpen,
  ClipboardList,
} from "lucide-react";
import ThemePicker from "./ThemePicker";

/* Crew Rail (Layout A) — grouped stations per the Vault Refit handoff. */
const STATIONS = [
  { to: "/", icon: LayoutDashboard, label: "STAT" },
  { to: "/gtd", icon: ClipboardList, label: "GTD" },
  { to: "/kanban", icon: Columns3, label: "BOARD" },
  { to: "/sessions", icon: FolderOpen, label: "DATA" },
  { to: "/activity", icon: Activity, label: "FEED" },
] as const;

const QUARTERS = [
  { to: "/analytics", icon: BarChart3, label: "ANALYTICS" },
  { to: "/workflows", icon: Workflow, label: "WORKFLOWS" },
  { to: "/bishop", icon: Shield, label: "BISHOP" },
  { to: "/settings", icon: Settings, label: "CONFIG" },
] as const;

const STORAGE_KEY = "sidebar-collapsed";

function loadCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

interface SidebarProps {
  wsConnected: boolean;
  collapsed: boolean;
  onToggle: () => void;
}

function NavGroup({
  items,
  eyebrow,
  collapsed,
}: {
  items: readonly { to: string; icon: typeof LayoutDashboard; label: string }[];
  eyebrow: string;
  collapsed: boolean;
}) {
  return (
    <div>
      {!collapsed && (
        <div className="px-3 pt-3 pb-1 font-heading font-bold uppercase tracking-[0.18em] text-[0.625rem] text-rad">
          {eyebrow}
        </div>
      )}
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          title={collapsed ? label : undefined}
          className={({ isActive }) =>
            `flex items-center gap-3 text-[0.8125rem] font-heading font-semibold uppercase tracking-[0.1em] transition-colors duration-150 ${
              collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
            } ${
              isActive
                ? "text-pip-cream bg-accent-muted"
                : "text-pip-dim hover:text-pip-cream hover:bg-[rgba(245,230,200,0.06)]"
            }`
          }
          style={({ isActive }) => ({
            borderLeft: `3px solid ${isActive ? "var(--pip-accent)" : "transparent"}`,
          })}
        >
          <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
          {!collapsed && <span>{label}</span>}
        </NavLink>
      ))}
    </div>
  );
}

export function Sidebar({ wsConnected, collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`fixed left-0 top-[3.375rem] bottom-0 bg-surface-1 flex flex-col z-30 overflow-y-auto overflow-x-hidden transition-[width] duration-200 ${
        collapsed ? "w-[4.125rem]" : "w-[13.5rem]"
      }`}
      style={{ borderRight: "1px solid var(--pip-border)" }}
    >
      {/* Nav groups */}
      <nav className="flex-1 py-1">
        <NavGroup items={STATIONS} eyebrow="Stations" collapsed={collapsed} />
        <NavGroup items={QUARTERS} eyebrow="Quarters" collapsed={collapsed} />
      </nav>

      {/* Theme picker */}
      <ThemePicker collapsed={collapsed} />

      {/* Collapse toggle */}
      <div className="px-2 py-2">
        <button
          onClick={onToggle}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-[0.6875rem] text-pip-dim hover:text-pip-cream hover:bg-[rgba(245,230,200,0.06)] transition-colors font-heading font-bold uppercase tracking-[0.16em]"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4 flex-shrink-0 mx-auto" strokeWidth={1.75} />
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* Rail foot — mono status */}
      <div
        className="px-3 py-3 font-mono text-[0.6875rem] text-pip-dark"
        style={{ borderTop: "1px dashed var(--pip-border)" }}
      >
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2"}`}>
          {wsConnected ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-ok flex-shrink-0" strokeWidth={1.75} />
              {!collapsed && <span className="text-ok">LIVE</span>}
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.75} />
              {!collapsed && <span>OFFLINE</span>}
            </>
          )}
          {!collapsed && <span className="ml-auto">V-69</span>}
        </div>
      </div>
    </aside>
  );
}

export { STORAGE_KEY as SIDEBAR_STORAGE_KEY, loadCollapsed };

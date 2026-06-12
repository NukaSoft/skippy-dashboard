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
  Github,
  Globe,
  PanelLeftClose,
  PanelLeftOpen,
  ClipboardList,
} from "lucide-react";
import ThemePicker from "./ThemePicker";

const NAV_ITEMS = [
  { to: "/", icon: LayoutDashboard, label: "STAT" },
  { to: "/gtd", icon: ClipboardList, label: "GTD" },
  { to: "/kanban", icon: Columns3, label: "BOARD" },
  { to: "/sessions", icon: FolderOpen, label: "DATA" },
  { to: "/activity", icon: Activity, label: "FEED" },
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

export function Sidebar({ wsConnected, collapsed, onToggle }: SidebarProps) {

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 bg-surface-1 border-r border-border flex flex-col z-30 overflow-y-auto overflow-x-hidden transition-[width] duration-200 ${
        collapsed ? "w-[4.25rem]" : "w-60"
      }`}
    >
      {/* Vault 69 Brand */}
      <div className="px-3 py-4 border-b border-border">
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3 px-2"}`}>
          {/* Vault Door Icon */}
          <div className="w-9 h-9 rounded-full border-2 border-accent flex items-center justify-center flex-shrink-0"
               style={{ boxShadow: '0 0 8px rgba(24, 255, 98, 0.3)' }}>
            <span className="font-heading text-accent text-xs font-bold">69</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-heading text-accent truncate tracking-wider">VAULT 69</h1>
              <p className="text-[11px] text-pip-dim">NukaSoft Command Center</p>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 text-sm font-heading tracking-wider transition-colors duration-150 ${
                collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
              } ${
                isActive
                  ? "text-accent border-l-2 border-l-accent bg-accent/10"
                  : "text-pip-dim hover:text-accent hover:bg-surface-3 border-l-2 border-l-transparent"
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Theme picker */}
      <ThemePicker collapsed={collapsed} />

      {/* Collapse toggle */}
      <div className="px-2 py-2">
        <button
          onClick={onToggle}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs text-pip-dim hover:text-accent hover:bg-surface-3 transition-colors font-heading tracking-wider"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4 flex-shrink-0 mx-auto" strokeWidth={2.5} />
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
              <span>COLLAPSE</span>
            </>
          )}
        </button>
      </div>

      {/* Footer */}
      <div
        className={`px-3 py-3 border-t border-border space-y-2 ${collapsed ? "items-center" : ""}`}
      >
        <div className={`flex items-center text-xs font-mono ${collapsed ? "justify-center" : "gap-2"}`}>
          {wsConnected ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-accent flex-shrink-0" />
              {!collapsed && <span className="text-accent">LIVE</span>}
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-pip-dim flex-shrink-0" />
              {!collapsed && <span className="text-pip-dim">OFFLINE</span>}
            </>
          )}
          {!collapsed && <span className="ml-auto text-pip-dark font-heading text-[10px]">V-69</span>}
        </div>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/NukaSoft/skippy-dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pip-dim hover:text-accent transition-colors"
              title="GitHub"
            >
              <Github className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://nukasoft.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pip-dim hover:text-accent transition-colors flex items-center gap-1 text-[11px] font-heading"
              title="nukasoft.ai"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>NUKASOFT.AI</span>
            </a>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center gap-2">
            <a
              href="https://github.com/NukaSoft/skippy-dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pip-dim hover:text-accent transition-colors"
              title="GitHub"
            >
              <Github className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://nukasoft.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pip-dim hover:text-accent transition-colors"
              title="NukaSoft"
            >
              <Globe className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </aside>
  );
}

export { STORAGE_KEY as SIDEBAR_STORAGE_KEY, loadCollapsed };

import { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar, SIDEBAR_STORAGE_KEY, loadCollapsed } from "./Sidebar";
import { TopBar } from "./TopBar";
import { FootLinks } from "./FootLinks";

interface LayoutProps {
  wsConnected: boolean;
}

export function Layout({ wsConnected }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(loadCollapsed);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col">
      <TopBar wsConnected={wsConnected} />
      <Sidebar wsConnected={wsConnected} collapsed={collapsed} onToggle={toggle} />
      <main
        className="flex-1 min-w-0 transition-[margin-left,width] duration-200"
        style={{
          marginLeft: collapsed ? "4.125rem" : "13.5rem",
          width: collapsed ? "calc(100% - 4.125rem)" : "calc(100% - 13.5rem)",
        }}
      >
        <div className="px-6 py-6 max-w-full overflow-x-hidden">
          <Outlet />
          <FootLinks />
        </div>
      </main>
    </div>
  );
}

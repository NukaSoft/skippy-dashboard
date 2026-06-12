import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useCallback } from "react";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { KanbanBoard } from "./pages/KanbanBoard";
import { Sessions } from "./pages/Sessions";
import { SessionDetail } from "./pages/SessionDetail";
import { ActivityFeed } from "./pages/ActivityFeed";
import { Analytics } from "./pages/Analytics";
import { Workflows } from "./pages/Workflows";
import { Library } from "./pages/Library";
import { Settings } from "./pages/Settings";
import { Bishop } from "./pages/Bishop";
import { GtdBoard } from "./pages/GtdBoard";
import { NotFound } from "./pages/NotFound";
import { useWebSocket } from "./hooks/useWebSocket";
import { useNotifications } from "./hooks/useNotifications";
import { ThemeContext, useThemeProvider } from "./hooks/useTheme";
import { eventBus } from "./lib/eventBus";
import type { WSMessage } from "./lib/types";

export default function App() {
  const onMessage = useCallback((msg: WSMessage) => {
    eventBus.publish(msg);
  }, []);

  const { connected } = useWebSocket(onMessage);
  useNotifications();
  const themeValue = useThemeProvider();

  return (
    <ThemeContext.Provider value={themeValue}>
    <BrowserRouter basename={window.location.pathname.startsWith("/dashboard") ? "/dashboard" : "/"}>
      <Routes>
        <Route element={<Layout wsConnected={connected} />}>
          <Route index element={<Dashboard />} />
          <Route path="gtd" element={<GtdBoard />} />
          <Route path="kanban" element={<KanbanBoard />} />
          <Route path="sessions" element={<Sessions />} />
          <Route path="sessions/:id" element={<SessionDetail />} />
          <Route path="activity" element={<ActivityFeed />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="workflows" element={<Workflows />} />
          <Route path="library" element={<Library />} />
          <Route path="bishop" element={<Bishop />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </ThemeContext.Provider>
  );
}

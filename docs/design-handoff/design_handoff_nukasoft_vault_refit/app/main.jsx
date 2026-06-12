// SKIPPY COMMAND CENTER — app root
/* global React, ReactDOM, SK_DATA, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakToggle */
/* global TopBar, RailNav, TabNav, DockNav, StatPage, GtdPage, BoardPage, DataPage, FeedPage */
/* global AnalyticsPage, WorkflowsPage, LibraryPage, BishopPage, ConfigPage */

const { useState: useStateA, useEffect: useEffectA } = React;

const SK_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "layout": "A · Crew Rail",
  "theme": "vault",
  "crt": false,
  "profile": "desktop"
}/*EDITMODE-END*/;

const PROFILE_FONT = { desktop: "16px", tablet: "15px", tv: "21px" };

function App() {
  const [t, setTweak] = useTweaks(SK_TWEAK_DEFAULTS);
  const [view, setView] = useStateA(() => {
    try { return localStorage.getItem("sk-view") || "stat"; } catch { return "stat"; }
  });
  const onNav = (v) => {
    setView(v);
    try { localStorage.setItem("sk-view", v); } catch {}
    window.scrollTo(0, 0);
  };

  useEffectA(() => {
    document.documentElement.style.fontSize = PROFILE_FONT[t.profile] || "16px";
    document.body.style.background = t.profile === "tablet" ? "#150903" : "";
    return () => { document.documentElement.style.fontSize = ""; };
  }, [t.profile]);

  const layoutKey = (t.layout || "A")[0]; // "A" | "B" | "C"
  const isDock = layoutKey === "C";

  const PAGES = {
    stat: <StatPage onNav={onNav} />, gtd: <GtdPage />, board: <BoardPage />,
    data: <DataPage />, feed: <FeedPage />, analytics: <AnalyticsPage />,
    workflows: <WorkflowsPage />, library: <LibraryPage />, bishop: <BishopPage />,
    config: <ConfigPage tweaks={{ theme: t.theme, crt: t.crt, layout: t.layout }} />,
  };

  return (
    <div className={"sk-viewport" + (t.profile === "tablet" ? " tablet" : "")}>
      <div className="sk-app" data-theme={t.theme} data-crt={t.crt ? "on" : "off"}>
        <div className={"sk-shell" + (isDock ? " dock-pad" : "")}>
          <TopBar stardate={SK_DATA.stardate} onHome={() => onNav("stat")} />
          {layoutKey === "B" && <TabNav view={view} onNav={onNav} />}
          <div className="sk-body">
            {layoutKey === "A" && <RailNav view={view} onNav={onNav} />}
            <main className="sk-main">{PAGES[view]}<FootLinks /></main>
          </div>
          {isDock && <DockNav view={view} onNav={onNav} />}
        </div>
        <div className="sk-crt-scan"></div>
      </div>

      <TweaksPanel>
        <TweakSection label="Layout" />
        <TweakRadio label="Shell" value={t.layout}
          options={["A · Crew Rail", "B · The Bridge", "C · Quarterdeck"]}
          onChange={(v) => setTweak("layout", v)} />
        <TweakRadio label="Display profile" value={t.profile}
          options={["desktop", "tablet", "tv"]}
          onChange={(v) => setTweak("profile", v)} />
        <TweakSection label="Theme" />
        <TweakRadio label="Palette" value={t.theme}
          options={["vault", "terminal"]}
          onChange={(v) => setTweak("theme", v)} />
        <TweakToggle label="CRT romance" value={t.crt}
          onChange={(v) => setTweak("crt", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

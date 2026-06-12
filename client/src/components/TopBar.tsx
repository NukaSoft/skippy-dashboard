import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { stardate } from "../lib/stardate";

interface TopBarProps {
  wsConnected: boolean;
}

/** The red command bar — sits above every shell layout. */
export function TopBar({ wsConnected }: TopBarProps) {
  const [sd, setSd] = useState(() => stardate());

  useEffect(() => {
    const id = setInterval(() => setSd(stardate()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <header
      className="sticky top-0 z-40 flex items-center gap-4 px-[1.125rem] h-[3.375rem] flex-none bg-accent"
      style={{ borderBottom: "3px solid var(--pip-ink)" }}
    >
      <Link to="/" className="flex items-center gap-2.5 min-w-0" title="Home — STAT">
        <img
          src="/brand/NukaSoft_Log.png"
          alt="NukaSoft"
          className="h-9 w-auto flex-shrink-0"
          draggable={false}
        />
        <div className="min-w-0 leading-tight">
          <div className="font-heading font-bold uppercase tracking-[0.16em] text-[0.8125rem] text-pip-cream truncate">
            Skippy Command Center
          </div>
          <div className="font-mono text-[0.625rem] text-pip-cream/70 truncate">
            VAULT 69 · NUKASOFT.AI
          </div>
        </div>
      </Link>

      <div
        className="ml-auto flex items-center gap-2 font-mono text-[0.6875rem] text-pip-cream whitespace-nowrap"
        style={{ textShadow: "1px 1px 0 var(--pip-ink)" }}
      >
        <span
          className={`inline-block w-2 h-2 rounded-full ${wsConnected ? "animate-pip-pulse" : ""}`}
          style={{ background: wsConnected ? "var(--pip-green)" : "var(--pip-ink)" }}
        />
        <span>{wsConnected ? "hot-rod online" : "no signal"}</span>
        <span className="opacity-60">·</span>
        <span>Stardate {sd}</span>
      </div>
    </header>
  );
}

import { useEffect, useState } from "react";

type CamKind = "ipcam" | "youtube";
interface CamConfig {
  kind: CamKind;
  src: string;
}

const CAM_KEY = "sk-cam";

function loadCam(): CamConfig | null {
  try {
    const raw = localStorage.getItem(CAM_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as CamConfig;
    if (v && (v.kind === "ipcam" || v.kind === "youtube") && typeof v.src === "string") return v;
    return null;
  } catch {
    return null;
  }
}

function saveCam(cfg: CamConfig | null) {
  try {
    if (cfg) localStorage.setItem(CAM_KEY, JSON.stringify(cfg));
    else localStorage.removeItem(CAM_KEY);
  } catch {
    // ignore
  }
}

function youtubeId(url: string): string | null {
  const m =
    url.match(/(?:youtube\.com\/(?:watch\?v=|live\/|embed\/)|youtu\.be\/)([\w-]{6,})/) ??
    (/^[\w-]{6,}$/.test(url.trim()) ? [url, url.trim()] : null);
  return m ? m[1]! : null;
}

/** Periscope — live camera card on the STAT page. */
export function Periscope() {
  const [cam, setCam] = useState<CamConfig | null>(loadCam);
  const [kind, setKind] = useState<CamKind>(cam?.kind ?? "ipcam");
  const [url, setUrl] = useState(cam?.src ?? "");
  const [feedError, setFeedError] = useState(false);

  useEffect(() => {
    setFeedError(false);
  }, [cam]);

  const live = cam !== null && !feedError;

  function patchIn() {
    const trimmed = url.trim();
    if (!trimmed) {
      setCam(null);
      saveCam(null);
      return;
    }
    const cfg: CamConfig = { kind, src: trimmed };
    setCam(cfg);
    saveCam(cfg);
  }

  return (
    <div className="card overflow-hidden">
      {/* 16:9 well */}
      <div
        className="relative w-full"
        style={{ aspectRatio: "16 / 9", background: "var(--pip-terminal-well)", borderRadius: "6px 6px 0 0" }}
      >
        {cam ? (
          cam.kind === "ipcam" ? (
            <img
              src={cam.src}
              alt="Periscope feed"
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setFeedError(true)}
            />
          ) : (
            <iframe
              title="Periscope feed"
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${youtubeId(cam.src) ?? ""}?autoplay=1&mute=1`}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          )
        ) : (
          <div className="absolute inset-0 sk-static flex items-center justify-center">
            <span
              className="font-mono text-[0.6875rem] tracking-[0.2em] text-pip-dim"
              style={{ textShadow: "1px 1px 0 var(--pip-ink)" }}
            >
              AWAITING SIGNAL
            </span>
          </div>
        )}

        {/* Overlay chrome */}
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-between px-2.5 py-1.5 font-mono text-[10px] text-pip-cream"
          style={{ textShadow: "1px 1px 0 var(--pip-ink)" }}
        >
          <span className="flex items-center gap-1.5">
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full ${live ? "animate-pip-pulse" : ""}`}
              style={{ background: live ? "var(--pip-crit)" : "var(--pip-dark)" }}
            />
            REC · CAM 01 · VAULT DOOR
          </span>
          <span>{live ? "LIVE" : "NO SIGNAL"}</span>
        </div>
      </div>

      {/* Source row */}
      <div className="p-2.5 flex items-center gap-2" style={{ borderTop: "1px dashed var(--pip-border)" }}>
        <div className="flex rounded-md overflow-hidden flex-shrink-0" style={{ border: "1px solid var(--pip-border)" }}>
          {(["ipcam", "youtube"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className="px-2 py-1 font-heading font-bold uppercase tracking-[0.1em] text-[0.5625rem] transition-colors"
              style={
                kind === k
                  ? { background: "var(--pip-primary)", color: "var(--pip-ink)" }
                  : { background: "transparent", color: "var(--pip-dim)" }
              }
            >
              {k === "ipcam" ? "IP CAM" : "YouTube"}
            </button>
          ))}
        </div>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && patchIn()}
          placeholder={kind === "ipcam" ? "http://cam/stream.mjpg" : "YouTube URL or video id"}
          className="input flex-1 min-w-0 !py-1 !px-2 text-xs"
        />
        <button onClick={patchIn} className="btn-ghost text-[0.6875rem] !py-1 !px-2.5 flex-shrink-0">
          Patch in
        </button>
      </div>
    </div>
  );
}

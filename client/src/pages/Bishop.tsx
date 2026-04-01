import { useEffect, useState, useCallback } from "react";
import { Shield, Wifi, Cpu, Thermometer, HardDrive, Activity, AlertTriangle, Users } from "lucide-react";

interface BishopReport {
  timestamp: string;
  subsystems: Array<{ name: string; status: string; extra: string }>;
  devices: Array<{
    name: string; type: string; model: string; ip: string;
    state: number; cpu: string; mem: string; temp: number;
    uptime_days: number; version: string; upgradable: boolean;
  }>;
  speedtest: { down: number; up: number; latency: number };
  clients: { total: number; wired: number; wifi: number; poor_signal: Array<{ name: string; signal: number }> };
  services: Array<{ name: string; status: string }>;
  alarms: string[];
}

interface WanData {
  timestamp: number;
  rx_rate: number;
  tx_rate: number;
  latency: number;
  wan_ip: string;
  cpu: string;
  mem: string;
  temp: number;
}

function formatRate(b: number): string {
  if (b > 1e6) return (b / 1e6).toFixed(1) + " MB/s";
  if (b > 1e3) return (b / 1e3).toFixed(0) + " KB/s";
  return b + " B/s";
}

function SegBar({ pct, segments = 10 }: { pct: number; segments?: number }) {
  const filled = Math.round((pct / 100) * segments);
  return (
    <div className="pip-seg-bar">
      {Array.from({ length: segments }, (_, i) => (
        <div key={i} className={`seg ${i < filled ? (pct > 80 ? "warn" : "filled") : ""}`} />
      ))}
    </div>
  );
}

export function Bishop() {
  const [report, setReport] = useState<BishopReport | null>(null);
  const [wan, setWan] = useState<WanData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    try {
      const res = await fetch("/bishop/api/report");
      if (!res.ok) throw new Error("Failed to fetch");
      setReport(await res.json());
      setError(null);
    } catch {
      setError("Bishop offline — cannot reach /bishop/api/report");
    }
  }, []);

  const loadWan = useCallback(async () => {
    try {
      const res = await fetch("/bishop/api/wan");
      if (res.ok) setWan(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    loadReport();
    loadWan();
    const reportInterval = setInterval(loadReport, 60000);
    const wanInterval = setInterval(loadWan, 5000);
    return () => { clearInterval(reportInterval); clearInterval(wanInterval); };
  }, [loadReport, loadWan]);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-accent" strokeWidth={2.5} />
          <h1 className="text-2xl font-heading text-accent tracking-wider">BISHOP</h1>
        </div>
        <div className="card p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-pip-amber mx-auto mb-3" />
          <p className="text-pip-amber">{error}</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-accent animate-pulse" strokeWidth={2.5} />
          <h1 className="text-2xl font-heading text-accent tracking-wider">BISHOP</h1>
        </div>
        <p className="text-pip-dim">Scanning network...</p>
      </div>
    );
  }

  const allOk = report.subsystems.every((s) => s.status === "ok");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-accent" strokeWidth={2.5} />
          <div>
            <h1 className="text-2xl font-heading text-accent tracking-wider">BISHOP — NETWORK OPS</h1>
            <p className="text-xs text-pip-dim font-mono">
              Last scan: {new Date(report.timestamp).toLocaleTimeString()} · UDM API · 10-min cycle
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full border text-xs font-heading tracking-wider ${
          allOk ? "border-accent/30 text-accent bg-accent/10" : "border-pip-amber/30 text-pip-amber bg-pip-amber/10"
        }`}>
          {allOk ? "ALL SYSTEMS NOMINAL" : "WARNINGS DETECTED"}
        </div>
      </div>

      {/* Live WAN throughput */}
      {wan && (
        <div className="grid grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-accent" />
              <span className="text-xs text-pip-dim font-heading">DOWNLOAD</span>
            </div>
            <p className="text-2xl font-heading text-accent pip-glow">{formatRate(wan.rx_rate)}</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-pip-dim" />
              <span className="text-xs text-pip-dim font-heading">UPLOAD</span>
            </div>
            <p className="text-2xl font-heading text-accent">{formatRate(wan.tx_rate)}</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="w-4 h-4 text-accent" />
              <span className="text-xs text-pip-dim font-heading">LATENCY</span>
            </div>
            <p className="text-2xl font-heading text-accent">{wan.latency}ms</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="w-4 h-4 text-accent" />
              <span className="text-xs text-pip-dim font-heading">UDM TEMP</span>
            </div>
            <p className="text-2xl font-heading text-accent">{wan.temp}°C</p>
          </div>
        </div>
      )}

      {/* Speed test */}
      {report.speedtest && (
        <div className="card p-4">
          <h2 className="text-sm font-heading mb-3">SPEED TEST</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-pip-dim w-8">↓</span>
              <div className="flex-1 h-5 bg-surface-3 rounded overflow-hidden">
                <div className="h-full bg-gradient-to-r from-accent to-pip-dim rounded flex items-center pl-2 text-[10px] font-bold text-surface-0"
                  style={{ width: `${Math.min(report.speedtest.down / 1000 * 100, 100)}%` }}>
                  {report.speedtest.down} Mbps
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-pip-dim w-8">↑</span>
              <div className="flex-1 h-5 bg-surface-3 rounded overflow-hidden">
                <div className="h-full bg-gradient-to-r from-pip-dim to-pip-dark rounded flex items-center pl-2 text-[10px] font-bold text-accent"
                  style={{ width: `${Math.min(report.speedtest.up / 1000 * 100, 100)}%` }}>
                  {report.speedtest.up} Mbps
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Subsystems */}
        <div className="card p-4">
          <h2 className="text-sm font-heading mb-3">SUBSYSTEMS</h2>
          <div className="space-y-1">
            {report.subsystems.map((s) => (
              <div key={s.name} className="flex items-center justify-between py-1 border-b border-dotted border-border">
                <span className="text-xs text-pip-dim">{s.name}</span>
                <span className={`text-xs font-heading ${s.status === "ok" ? "text-accent" : "text-pip-amber"}`}>
                  {s.status.toUpperCase()}
                </span>
              </div>
            ))}
            {report.clients && (
              <div className="flex items-center justify-between py-1 mt-1">
                <span className="text-xs text-pip-dim flex items-center gap-1"><Users className="w-3 h-3" /> Clients</span>
                <span className="text-xs text-accent">{report.clients.total} ({report.clients.wired}W / {report.clients.wifi}WiFi)</span>
              </div>
            )}
          </div>
        </div>

        {/* Services */}
        <div className="card p-4">
          <h2 className="text-sm font-heading mb-3">HOT ROD SERVICES</h2>
          <div className="space-y-1">
            {report.services.map((s) => (
              <div key={s.name} className="flex items-center justify-between py-1 border-b border-dotted border-border">
                <span className="text-xs text-pip-dim">{s.name}</span>
                <span className={`text-xs font-heading ${s.status === "active" ? "text-accent" : "text-pip-red"}`}>
                  {s.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Devices */}
      <div className="card p-4">
        <h2 className="text-sm font-heading mb-3">DEVICES</h2>
        <div className="space-y-3">
          {report.devices.map((dev) => (
            <div key={dev.name} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${dev.state === 1 ? "bg-accent" : "bg-pip-red"} animate-pip-pulse`} />
                  <span className="text-sm text-accent">{dev.name}</span>
                  <span className="text-[10px] text-pip-dark">{dev.model}</span>
                </div>
                <span className="text-xs text-pip-dim">{dev.uptime_days}d uptime</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <div className="flex justify-between text-[10px] text-pip-dim mb-0.5">
                    <span><Cpu className="w-3 h-3 inline" /> CPU</span>
                    <span>{dev.cpu}%</span>
                  </div>
                  <SegBar pct={parseFloat(dev.cpu) || 0} />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-pip-dim mb-0.5">
                    <span><HardDrive className="w-3 h-3 inline" /> MEM</span>
                    <span>{dev.mem}%</span>
                  </div>
                  <SegBar pct={parseFloat(dev.mem) || 0} />
                </div>
                {dev.temp > 0 && (
                  <div>
                    <div className="flex justify-between text-[10px] text-pip-dim mb-0.5">
                      <span><Thermometer className="w-3 h-3 inline" /> TEMP</span>
                      <span>{dev.temp}°C</span>
                    </div>
                    <SegBar pct={(dev.temp / 80) * 100} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alarms */}
      <div className="card p-4">
        <h2 className="text-sm font-heading mb-3">ALARMS</h2>
        {report.alarms.length === 0 ? (
          <p className="text-xs text-accent">All clear — no active alarms</p>
        ) : (
          <div className="space-y-1">
            {report.alarms.map((a, i) => (
              <div key={i} className="flex items-center gap-2 py-1 border-b border-dotted border-border">
                <AlertTriangle className="w-3 h-3 text-pip-amber flex-shrink-0" />
                <span className="text-xs text-pip-amber">{a}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Poor signal clients */}
      {report.clients.poor_signal.length > 0 && (
        <div className="card p-4">
          <h2 className="text-sm font-heading mb-3">WEAK SIGNAL CLIENTS</h2>
          <div className="space-y-1">
            {report.clients.poor_signal.map((c, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b border-dotted border-border">
                <span className="text-xs text-pip-dim">{c.name}</span>
                <span className="text-xs text-pip-amber">{c.signal} dBm</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

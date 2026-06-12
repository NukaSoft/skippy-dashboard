/** Stardate: vanity mapping of real time, mono-friendly.
    From the Vault Refit handoff (app/data.js). */
export function stardate(ts: number = Date.now()): string {
  const d = new Date(ts);
  const start = new Date(d.getFullYear(), 0, 0).getTime();
  const day = 86400000;
  const frac = (d.getTime() - start) / (365 * day);
  return (
    79000 +
    Math.round(frac * 1000) +
    (d.getHours() * 60 + d.getMinutes()) / 1440
  ).toFixed(2);
}

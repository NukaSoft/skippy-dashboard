interface HeroProps {
  /** Skippy's status narration under the headline */
  narration: string;
  headline?: string;
}

/** Four-point cream star (clip-path polygon per the handoff). */
function Star({ size, top, right, opacity = 1 }: { size: number; top: string; right: string; opacity?: number }) {
  return (
    <span
      aria-hidden
      className="absolute hidden sm:block"
      style={{
        top,
        right,
        width: size,
        height: size,
        background: "var(--pip-primary)",
        opacity,
        clipPath:
          "polygon(50% 0%, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0% 50%, 38% 38%)",
      }}
    />
  );
}

/** STAT hero panel — red command card with Rita, ribbon, and Skippy narration. */
export function Hero({ narration, headline = "All quiet on the bridge." }: HeroProps) {
  return (
    <div
      className="relative overflow-hidden rounded-lg bg-accent"
      style={{
        border: "2px solid var(--pip-ink)",
        boxShadow: "3px 3px 0 var(--pip-ink)",
        minHeight: "184px",
      }}
    >
      <div className="flex items-stretch gap-4">
        <div className="flex-1 min-w-0 p-5 flex flex-col justify-between gap-3">
          <div>
            <div className="font-heading font-bold uppercase tracking-[0.18em] text-[0.6875rem] text-rad mb-1.5">
              Vault 69 · Master Control Reporting
            </div>
            <div className="font-display text-[1.75rem] leading-[1.05] text-pip-cream">
              {headline}
            </div>
            <p className="mt-2 text-sm text-pip-cream/85 max-w-xl" style={{ fontFamily: "var(--pip-font-heading)" }}>
              {narration}
            </p>
          </div>
          <div
            className="self-start px-4 py-1.5 font-display text-sm"
            style={{
              background: "var(--pip-primary)",
              color: "#241007",
              borderTop: "2px solid var(--pip-ink)",
              borderBottom: "2px solid var(--pip-ink)",
              boxShadow: "2px 2px 0 var(--pip-ink)",
            }}
          >
            OWN YOUR AI BEFORE IT OWNS YOU
          </div>
        </div>

        {/* Rita — anchored bottom-right, right edge cropped 7.5% */}
        <div className="relative w-[200px] flex-shrink-0 hidden sm:block">
          <img
            src="/brand/Rita_1.png"
            alt=""
            aria-hidden
            draggable={false}
            className="absolute bottom-0 right-0"
            style={{
              height: "calc(100% - 10px)",
              width: "auto",
              maxWidth: "none",
              clipPath: "inset(0 7.5% 0 0)",
              filter: "drop-shadow(3px 3px 0 rgba(26,8,5,0.45))",
            }}
          />
        </div>
      </div>

      <Star size={14} top="14px" right="150px" />
      <Star size={9} top="40px" right="120px" opacity={0.8} />
      <Star size={11} top="22px" right="60px" opacity={0.9} />
    </div>
  );
}

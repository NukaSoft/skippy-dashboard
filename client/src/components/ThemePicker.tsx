import { useState, useRef, useEffect } from "react";
import { Palette, Tv2 } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { getStoredCrt, applyCrt } from "../lib/theme";

interface ThemePickerProps {
  collapsed?: boolean;
}

export default function ThemePicker({ collapsed }: ThemePickerProps) {
  const { theme, label, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const [crt, setCrt] = useState<boolean>(getStoredCrt);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    applyCrt(crt);
  }, [crt]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const currentMeta = themes.find((t) => t.id === theme);

  return (
    <div className="relative px-2 py-1" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="theme-picker-btn"
        title={`Theme: ${label}`}
      >
        {collapsed ? (
          <Palette className="w-4 h-4 flex-shrink-0 mx-auto" strokeWidth={1.75} />
        ) : (
          <>
            <span
              className="theme-picker-swatch"
              style={{ backgroundColor: currentMeta?.swatch }}
            />
            <span>{label}</span>
          </>
        )}
      </button>

      {open && (
        <div className="theme-picker-dropdown">
          <div className="theme-picker-category">Theme</div>
          {themes.map((t) => (
            <button
              key={t.id}
              className={`theme-picker-item${t.id === theme ? " active" : ""}`}
              onClick={() => {
                setTheme(t.id);
                setOpen(false);
              }}
              title={t.description}
            >
              <span className="swatch" style={{ backgroundColor: t.swatch }} />
              <span>{t.label}</span>
            </button>
          ))}
          <div className="theme-picker-category">Effects</div>
          <button
            className={`theme-picker-item${crt ? " active" : ""}`}
            onClick={() => setCrt(!crt)}
            title="Scanlines + vignette overlay"
          >
            <Tv2 className="w-3 h-3 flex-shrink-0" strokeWidth={1.75} />
            <span>CRT {crt ? "ON" : "OFF"}</span>
          </button>
        </div>
      )}
    </div>
  );
}

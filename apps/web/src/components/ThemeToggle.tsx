"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "finance-copilot-theme";

type Theme = "dark" | "light";

function getInitialTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "light" ? "light" : "dark";
}

/**
 * Light/dark toggle — see docs/adr/0014-light-mode.md. Dark is the
 * default (the shipped baseline); light is opt-in and persisted to
 * localStorage. The actual attribute flip for first paint happens in
 * app/layout.tsx's inline bootstrap script, so this component just
 * mirrors and updates that state after hydration.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(getInitialTheme());
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage unavailable (private mode, etc.) — theme just
      // won't persist across reloads, not worth surfacing an error.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-[7px] text-xs font-semibold text-[var(--ink-dim)] transition-colors hover:border-[var(--ink-faint)] hover:text-[var(--ink)]"
    >
      {theme === "dark" ? "☀ Light" : "☾ Dark"}
    </button>
  );
}

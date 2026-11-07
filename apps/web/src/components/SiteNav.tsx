import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export const siteNavLinks: { href: string; label: string }[] = [
  { href: "/", label: "Inbox" },
  { href: "/portfolio-health", label: "Portfolio Health" },
];

/**
 * Shared top nav — rounded-rectangle tab buttons (not pills — see
 * docs/adr/0013-rectangular-buttons.md) ported from the mockups'
 * <nav class="topnav">, per
 * docs/adr/0011-triage-inbox-visual-implementation.md. Only the two
 * Finance Copilot pages remain (see docs/adr/0012-scope-narrowing.md) —
 * the old risk-dashboard-era routes were removed, not just unlinked.
 */
export function SiteNav({ current }: { current?: string }) {
  return (
    <nav className="flex flex-wrap items-center gap-1.5">
      {siteNavLinks.map((link) => {
        const isCurrent = link.href === current;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={
              isCurrent
                ? "rounded-md border border-[var(--border)] bg-[var(--surface)] px-3.5 py-[7px] text-xs font-semibold text-[var(--ink)]"
                : "rounded-md border border-transparent px-3.5 py-[7px] text-xs font-semibold text-[var(--ink-dim)] transition-colors hover:border-[var(--border)] hover:text-[var(--ink)]"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Shared brand + nav row — identical markup on every page's header
 * so the dark shell reads consistently across redesigned and
 * untouched routes alike. */
export function TopNav({ current }: { current?: string }) {
  return (
    <nav className="mx-auto flex max-w-[1020px] items-center justify-between px-6 py-[18px]">
      <Link href="/" className="text-sm font-bold tracking-tight text-[var(--ink)] no-underline">
        ◆ Finance Copilot
      </Link>
      <div className="flex items-center gap-3">
        <SiteNav current={current} />
        <ThemeToggle />
      </div>
    </nav>
  );
}

import Link from "next/link";

export const siteNavLinks: { href: string; label: string }[] = [
  { href: "/digest", label: "Digest" },
  { href: "/portfolio-health", label: "Portfolio Health" },
  { href: "/securities", label: "Securities" },
  { href: "/retirement", label: "Retirement" },
  { href: "/scenarios", label: "Scenarios" },
  { href: "/diversification", label: "Diversification" },
  { href: "/actions", label: "Actions" },
];

/**
 * Lightweight persistent nav row, present in every page's header —
 * added as part of docs/adr/0010-research-copilot-reframe.md so that
 * every page can reach every other page (digest, portfolio health,
 * securities, retirement, scenarios, diversification, actions)
 * without a dead end, now that `/` no longer implies "the dashboard."
 */
export function SiteNav({ current }: { current?: string }) {
  return (
    <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {siteNavLinks.map((link) => {
        const isCurrent = link.href === current;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={
              isCurrent
                ? "text-xs font-semibold text-slate-900"
                : "text-xs font-medium text-blue-600 hover:text-blue-700"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

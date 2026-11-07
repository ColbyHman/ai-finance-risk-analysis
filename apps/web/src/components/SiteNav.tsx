import Link from "next/link";

export const siteNavLinks: { href: string; label: string }[] = [
  { href: "/", label: "Inbox" },
  { href: "/portfolio-health", label: "Portfolio Health" },
  { href: "/securities", label: "Securities" },
  { href: "/retirement", label: "Retirement" },
  { href: "/scenarios", label: "Scenarios" },
  { href: "/diversification", label: "Diversification" },
  { href: "/actions", label: "Actions" },
];

/**
 * Shared top nav — dark pill-tab style ported from the mockups'
 * <nav class="topnav">, per
 * docs/adr/0011-triage-inbox-visual-implementation.md. Kept wired to
 * every existing route (not just the 3 redesigned ones) so retirement/
 * scenarios/diversification/actions stay reachable now that `/` means
 * the triage inbox, not "the dashboard."
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
                ? "rounded-full bg-[#20242a] px-3.5 py-[7px] text-xs font-semibold text-[#f4f4f4]"
                : "rounded-full px-3.5 py-[7px] text-xs font-semibold text-[#9ba3ab] hover:text-[#f4f4f4]"
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
      <Link href="/" className="text-sm font-bold tracking-tight text-[#f4f4f4] no-underline">
        ◆ Finance Copilot
      </Link>
      <SiteNav current={current} />
    </nav>
  );
}

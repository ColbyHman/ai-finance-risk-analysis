"use client";

import Link from "next/link";
import type { LiveDiversification } from "@/lib/live-finance";
import { ASSET_CLASS_LABEL, formatCalendarDate, formatShare, shareWords } from "@/lib/market";

/**
 * Diversification (ADR 0017) on Portfolio Health. Numbers only: every
 * figure is arithmetic on units × price and published fund make-ups,
 * and the only words attached to a number are fractions that are true
 * of it ("a majority"). Nothing here says whether the mix is good, or
 * what to change.
 */

const MIX_COLORS: Record<string, string> = {
  stocks: "var(--blue)",
  bonds: "var(--swatch-neutral-1)",
  cash: "var(--ink-faint)",
  other: "var(--surface-2)",
  unclassified: "var(--amber)",
};

function Card({ title, gloss, children, testid }: { title: string; gloss?: string; children: React.ReactNode; testid?: string }) {
  return (
    <section className="mb-4 rounded-[20px] bg-[var(--surface)] px-6 py-5" data-testid={testid}>
      <h3 className="m-0 text-[13.5px] font-bold">{title}</h3>
      {gloss && <p className="m-0 mt-0.5 text-[11px] leading-[1.5] text-[var(--ink-faint)]">{gloss}</p>}
      <div className="mt-3.5">{children}</div>
    </section>
  );
}

function Share({ pct, of }: { pct: number; of?: string }) {
  const words = shareWords(pct);
  return (
    <>
      <span className="font-mono tabular-nums text-[var(--ink)]">{formatShare(pct)}</span>
      {of && <span className="text-[var(--ink-dim)]"> {of}</span>}
      {words && <span className="text-[var(--ink-dim)]"> · {words}</span>}
    </>
  );
}

function Concentration({ d }: { d: LiveDiversification }) {
  const c = d.concentration;
  return (
    <Card title="Concentration" gloss="How much of the portfolio sits in its largest positions." testid="div-concentration">
      <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[12.5px]">
        <li>
          Largest position: <span className="font-bold">{c.largest_ticker}</span>, <Share pct={c.largest_pct} of="of the portfolio" />
        </li>
        {c.holding_count > 3 && (
          <li>
            Top 3 positions: <Share pct={c.top3_pct} of="of the portfolio" />
          </li>
        )}
        <li>
          {c.holding_count} holdings, sized like{" "}
          <span className="font-mono tabular-nums text-[var(--ink)]">{c.effective_holdings.toFixed(1)}</span> equal-sized ones
          <span className="block text-[10.5px] text-[var(--ink-faint)]">1 ÷ the sum of each position&apos;s squared weight</span>
        </li>
      </ul>
    </Card>
  );
}

function AssetMix({ d }: { d: LiveDiversification }) {
  return (
    <Card title="Asset mix" gloss="Funds split into what they hold, as each fund publishes it." testid="div-mix">
      <div className="flex h-3 w-full overflow-hidden rounded-sm bg-[var(--surface-2)]" role="img"
        aria-label={d.asset_mix.map((s) => `${ASSET_CLASS_LABEL[s.class]} ${formatShare(s.pct)}`).join(", ")}>
        {d.asset_mix.map((s) => (
          <div key={s.class} style={{ width: `${s.pct}%`, background: MIX_COLORS[s.class] }} />
        ))}
      </div>
      <ul className="m-0 mt-2.5 flex list-none flex-wrap gap-x-5 gap-y-1 p-0 text-[12px]">
        {d.asset_mix.map((s) => (
          <li key={s.class} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: MIX_COLORS[s.class] }} aria-hidden />
            {ASSET_CLASS_LABEL[s.class]} <span className="font-mono tabular-nums">{s.pct < 0.05 ? "<0.1%" : formatShare(s.pct)}</span>
          </li>
        ))}
      </ul>
      {d.asset_mix[0] && shareWords(d.asset_mix[0].pct) && (
        <p className="m-0 mt-2 text-[12px] text-[var(--ink-dim)]">
          {ASSET_CLASS_LABEL[d.asset_mix[0].class]} are {formatShare(d.asset_mix[0].pct)} of the portfolio, {shareWords(d.asset_mix[0].pct)}.
        </p>
      )}
    </Card>
  );
}

function Sectors({ d }: { d: LiveDiversification }) {
  if (!d.sectors.length) return null;
  const max = Math.max(...d.sectors.map((s) => s.pct_of_portfolio));
  const top = d.sectors[0];
  return (
    <Card
      title="Sector exposure"
      gloss="Stocks you own directly, plus the stock part of each fund split by its published sector weights. Percent of the whole portfolio."
      testid="div-sectors"
    >
      <p className="m-0 mb-3 text-[12.5px]">
        {top.label}: <Share pct={top.pct_of_portfolio} of="of the portfolio" />
        <span className="text-[var(--ink-dim)]">
          {" "}· {formatShare(top.pct_of_stocks)} of the stock portion{shareWords(top.pct_of_stocks) ? `, ${shareWords(top.pct_of_stocks)}` : ""}
        </span>
      </p>
      <div className="flex flex-col gap-1.5">
        {d.sectors.map((s) => (
          <div key={s.key} className="grid grid-cols-[150px_1fr_52px] items-center gap-3 text-[11.5px] max-sm:grid-cols-[110px_1fr_46px]">
            <span className="truncate text-[var(--ink-dim)]">{s.label}</span>
            <div className="flex h-2.5 overflow-hidden rounded-sm bg-[var(--surface-2)]" title={`${formatShare(s.direct_pct)} direct · ${formatShare(s.via_funds_pct)} through funds`}>
              <div style={{ width: `${(s.direct_pct / max) * 100}%`, background: "var(--ink-dim)" }} />
              <div style={{ width: `${(s.via_funds_pct / max) * 100}%`, background: "var(--blue)" }} />
            </div>
            <span className="text-right font-mono tabular-nums">{formatShare(s.pct_of_portfolio)}</span>
          </div>
        ))}
      </div>
      <p className="m-0 mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10.5px] text-[var(--ink-faint)]">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[var(--ink-dim)]" aria-hidden />Owned directly</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[var(--blue)]" aria-hidden />Through funds</span>
        {d.sector_coverage_pct < 99.95 && <span>{formatShare(100 - d.sector_coverage_pct)} of the stock portion has no published sector</span>}
      </p>
    </Card>
  );
}

function Companies({ d }: { d: LiveDiversification }) {
  const rows = d.companies.slice(0, 8);
  if (!rows.length) return null;
  const tickers = new Set(d.holdings.map((h) => h.ticker));
  return (
    <Card
      title="Single-company exposure, including through funds"
      gloss="A company you own directly can also sit inside your funds. Percent of the whole portfolio."
      testid="div-companies"
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="text-left text-[10.5px] uppercase tracking-[0.05em] text-[var(--ink-faint)]">
              <th className="pb-1.5 font-bold">Company</th>
              <th className="pb-1.5 text-right font-bold">Direct</th>
              <th className="pb-1.5 text-right font-bold">Through funds</th>
              <th className="pb-1.5 text-right font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.symbol} className="border-t border-[var(--border)]">
                <td className="py-1.5 pr-2">
                  {tickers.has(c.symbol) ? (
                    <Link href={`/securities/${c.symbol}`} className="font-bold text-[var(--ink)] underline-offset-2 hover:underline">{c.symbol}</Link>
                  ) : (
                    <span className="font-bold">{c.symbol}</span>
                  )}
                  {c.name && <span className="ml-1.5 text-[var(--ink-faint)] max-sm:hidden">{c.name}</span>}
                </td>
                <td className="py-1.5 text-right font-mono tabular-nums text-[var(--ink-dim)]">{c.direct_pct > 0 ? formatShare(c.direct_pct, 2) : "—"}</td>
                <td className="py-1.5 text-right font-mono tabular-nums text-[var(--ink-dim)]">
                  {c.via_funds.length ? (
                    <span title={c.via_funds.map((v) => `${v.fund} ${formatShare(v.pct, 2)}`).join(" · ")}>
                      {formatShare(c.via_funds.reduce((a, v) => a + v.pct, 0), 2)}
                      <span className="ml-1 text-[10px] text-[var(--ink-faint)]">{c.via_funds.map((v) => v.fund).join(", ")}</span>
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="py-1.5 text-right font-mono tabular-nums text-[var(--ink)]">{formatShare(c.total_pct, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {d.fund_coverage.length > 0 && (
        <p className="m-0 mt-2.5 text-[10.5px] leading-[1.5] text-[var(--ink-faint)]">
          Funds are looked through to their published top holdings only:{" "}
          {d.fund_coverage.map((f) => `${f.fund} top ${f.count} = ${formatShare(f.top_holdings_pct)} of the fund`).join(" · ")}. The rest of each
          fund isn&apos;t broken out, so these totals can only be higher, not lower.
        </p>
      )}
    </Card>
  );
}

function cellBg(r: number | null): string {
  if (r == null || r <= 0) return "transparent";
  // Blue intensity by strength; no red/green — this isn't good or bad.
  return `color-mix(in srgb, var(--blue) ${Math.round(r * 55)}%, transparent)`;
}

function MovedTogether({ d }: { d: LiveDiversification }) {
  const c = d.correlation;
  if (!c) return null;
  const n = c.tickers.length;
  return (
    <Card
      title="How your holdings have moved together"
      gloss="Correlation of daily price changes, 1 = always moved together, 0 = unrelated, −1 = opposite. The second figure is the share of days both went the same direction."
      testid="div-correlation"
    >
      <p className="m-0 mb-3 text-[12.5px]">
        Average across all pairs:{" "}
        <span className="font-mono tabular-nums text-[var(--ink)]">{c.average_pairwise != null ? c.average_pairwise.toFixed(2) : "—"}</span>
        <span className="text-[var(--ink-faint)]">
          {" "}· daily closes {formatCalendarDate(c.from, true)} – {formatCalendarDate(c.to, true)}
        </span>
      </p>
      {n > 6 && <p className="m-0 mb-1.5 text-[10.5px] text-[var(--ink-faint)] sm:hidden">Scroll sideways for every holding →</p>}
      <div className="overflow-x-auto">
        <table className="border-collapse text-[11px]">
          <thead>
            <tr>
              <th />
              {c.tickers.map((t) => (
                <th key={t} className="w-[50px] pb-1 text-center text-[10.5px] font-bold text-[var(--ink-dim)] max-sm:w-[40px] max-sm:text-[9.5px]">{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {c.tickers.map((row, i) => (
              <tr key={row}>
                <th className="pr-2 text-left text-[10.5px] font-bold text-[var(--ink-dim)] max-sm:pr-1 max-sm:text-[9.5px]">{row}</th>
                {c.tickers.map((col, j) => {
                  const r = c.matrix[i][j];
                  const same = c.same_direction_pct[i][j];
                  const diag = i === j;
                  return (
                    <td
                      key={col}
                      className="h-[42px] w-[50px] border border-[var(--border)] text-center align-middle font-mono tabular-nums max-sm:w-[40px]"
                      style={{ background: diag ? "var(--surface-2)" : cellBg(r) }}
                      title={diag ? row : r == null ? "Not enough shared trading days" : `${row} & ${col}: correlation ${r.toFixed(2)}; same direction on ${same?.toFixed(0)}% of days`}
                    >
                      {diag ? (
                        <span className="text-[var(--ink-faint)]">—</span>
                      ) : r == null ? (
                        <span className="text-[var(--ink-faint)]">n/a</span>
                      ) : (
                        <>
                          <span className="block text-[12px] text-[var(--ink)] max-sm:text-[10.5px]">{r.toFixed(2)}</span>
                          <span className="block text-[9.5px] text-[var(--ink-dim)]">{same != null ? `${same.toFixed(0)}%` : ""}</span>
                        </>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function DiversificationSection({ d, error }: { d: LiveDiversification | null; error: string | null }) {
  return (
    <div className="mt-8" data-testid="diversification">
      <p className="mb-1 text-[11.5px] font-bold uppercase tracking-[0.06em] text-[var(--ink-faint)]">Diversification</p>
      <p className="m-0 mb-3.5 max-w-[620px] text-[11.5px] leading-[1.5] text-[var(--ink-dim)]">
        How spread out the portfolio is, calculated from units × latest price and what each fund publishes about its holdings.
        Numbers only. Describes your mix, not a recommendation.
      </p>
      {error && <div className="mb-4 rounded-2xl bg-[var(--surface)] px-5 py-4 text-[12px] text-[var(--amber)]">{error}</div>}
      {!d && !error && <div className="mb-4 h-40 animate-pulse rounded-[20px] bg-[var(--surface)]" />}
      {d && d.total_value <= 0 && (
        <div className="mb-4 rounded-[20px] bg-[var(--surface)] px-6 py-6 text-center text-[12px] text-[var(--ink-dim)]">
          Set the units you own above to see how the portfolio is spread.
        </div>
      )}
      {d && d.total_value > 0 && (
        <>
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
            <Concentration d={d} />
            <AssetMix d={d} />
          </div>
          <Sectors d={d} />
          <Companies d={d} />
          <MovedTogether d={d} />
          {(d.missing.length > 0 || d.unpriced.length > 0) && (
            <p className="m-0 mb-3 text-[10.5px] text-[var(--ink-faint)]" data-testid="div-missing">
              {d.unpriced.length > 0 && <>No price for {d.unpriced.join(", ")}: left out. </>}
              {d.missing.map((m) => `${m.ticker}: ${m.what}`).join(" ")}
            </p>
          )}
          <p className="m-0 text-[10.5px] text-[var(--ink-faint)]">Data: {d.source}.</p>
        </>
      )}
    </div>
  );
}

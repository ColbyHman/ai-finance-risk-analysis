"use client";

import type { LivePortfolioHolding, LiveQuote } from "@/lib/live-finance";
import { FREQUENCY_LABEL, formatCalendarDate, formatPrice, relativeDays } from "@/lib/market";

function money(n: number): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Dividend income (ADR 0018): what the units you hold now would have
 * received from the payouts recorded over the last 12 months. A fact
 * about past payments at today's units — not a forecast, and it says
 * so. Numbers only.
 */
export function DividendIncome({
  holdings,
  totalValue,
  quote,
}: {
  holdings: LivePortfolioHolding[] | null;
  totalValue: number;
  quote: (ticker: string) => LiveQuote | undefined;
}) {
  if (!holdings) return null;
  const owned = holdings.filter((h) => h.units > 0);
  if (!owned.length) return null;
  const loaded = owned.every((h) => quote(h.ticker) !== undefined);

  const rows = owned
    .map((h) => {
      const q = quote(h.ticker);
      const d = q?.dividend ?? null;
      const perShare = d?.trailing_amount ?? null;
      return { h, q, d, perShare, income: perShare != null ? perShare * h.units : null };
    })
    .sort((a, b) => (b.income ?? -1) - (a.income ?? -1));
  const payers = rows.filter((r) => r.income != null && r.income > 0);
  const nonPayers = rows.filter((r) => !(r.income != null && r.income > 0) && r.q && !r.q.error);
  const total = payers.reduce((s, r) => s + (r.income ?? 0), 0);
  const yieldOnValue = totalValue > 0 ? (total / totalValue) * 100 : null;

  return (
    <section className="mb-5 rounded-[20px] bg-[var(--surface)] px-6 py-5" data-testid="dividend-income">
      <h2 className="m-0 text-[13.5px] font-bold">Dividend income</h2>
      {!loaded ? (
        <div className="mt-3 h-16 animate-pulse rounded-xl bg-[var(--surface-2)]" />
      ) : (
        <>
          <p className="m-0 mt-2 font-mono text-[26px] font-medium tabular-nums tracking-tight" data-testid="dividend-total">
            {money(total)}
            <span className="ml-2 font-sans text-[12px] font-normal text-[var(--ink-dim)]">a year, from the last 12 months of payouts</span>
          </p>
          {yieldOnValue != null && (
            <p className="m-0 mt-0.5 text-[12px] text-[var(--ink-dim)]">
              <span className="font-mono tabular-nums text-[var(--ink)]">{yieldOnValue.toFixed(2)}%</span> of today&apos;s portfolio value ·{" "}
              about <span className="font-mono tabular-nums text-[var(--ink)]">{money(total / 12)}</span> a month on average
            </p>
          )}

          {payers.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr className="text-left text-[10.5px] uppercase tracking-[0.05em] text-[var(--ink-faint)]">
                    <th className="pb-1.5 font-bold">Holding</th>
                    <th className="pb-1.5 font-bold max-sm:hidden">Pays</th>
                    <th className="pb-1.5 text-right font-bold">Per share, 12 mo</th>
                    <th className="pb-1.5 text-right font-bold">× Units</th>
                    <th className="pb-1.5 text-right font-bold">Income</th>
                    <th className="pb-1.5 pl-4 font-bold max-md:hidden">Next ex-dividend</th>
                  </tr>
                </thead>
                <tbody>
                  {payers.map(({ h, q, d, perShare, income }) => (
                    <tr key={h.ticker} className="border-t border-[var(--border)]">
                      <td className="py-1.5 font-bold">{h.ticker}</td>
                      <td className="py-1.5 text-[var(--ink-dim)] max-sm:hidden">{d?.frequency ? FREQUENCY_LABEL[d.frequency].replace("Pays ", "") : "—"}</td>
                      <td className="py-1.5 text-right font-mono tabular-nums text-[var(--ink-dim)]">{formatPrice(perShare, q?.currency)}</td>
                      <td className="py-1.5 text-right font-mono tabular-nums text-[var(--ink-dim)]">{h.units.toLocaleString("en-US")}</td>
                      <td className="py-1.5 text-right font-mono tabular-nums text-[var(--ink)]">{money(income ?? 0)}</td>
                      <td className="py-1.5 pl-4 text-[var(--ink-dim)] max-md:hidden">
                        {d?.next_ex_date ? (
                          <>
                            {formatCalendarDate(d.next_ex_date)} <span className="text-[var(--ink-faint)]">· {relativeDays(d.next_ex_date)}</span>
                          </>
                        ) : (
                          <span className="text-[var(--ink-faint)]">Not announced</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {nonPayers.length > 0 && (
            <p className="m-0 mt-2.5 text-[11.5px] text-[var(--ink-dim)]">
              No recorded payouts in the last 12 months: {nonPayers.map((r) => r.h.ticker).join(", ")}.
            </p>
          )}
          <p className="m-0 mt-2.5 text-[10.5px] leading-[1.5] text-[var(--ink-faint)]">
            Payouts recorded over the last 12 months × the units you hold now: what those units would have received, not a forecast.
            The source&apos;s history can trail a payout by a few weeks. Data: Yahoo Finance.
          </p>
        </>
      )}
    </section>
  );
}

# Future-state feature mockups — ai-finance-risk-analysis

These were mocked up for context during the Portfolio Health design
pass, but are **not scheduled for the current build**. Keeping them
here, documented, rather than discarding the work.

## Deferred features

1. **Performance attribution** — $ contribution to return per holding
   (distinct from the "biggest movers" % card that IS being built).
2. **Allocation drift vs. target** — current vs. a user-set target
   allocation per asset class.
3. **Cost basis & unrealized gains** — per-holding table with
   long/short-term tags.
4. **Fee drag** — weighted expense ratio + projected cost over time
   (carries the ADR 0009 concept forward).

See `portfolio-health-new-features.html` / `.png` for the mockup.
Revisit these once the triage pipeline (Conduit `finance` domain) and
the current Portfolio Health rework are both shipped — cost basis and
allocation-drift in particular depend on real lot-level data the
fixture/live-mode ingest adapters will need to carry anyway, so they
may fall out "for free" once that pipeline exists rather than needing
separate work.

## From the portfolio-site survey (ADR 0018, 2026-11-11)

Shortlisted but not chosen for the Saturday build. No mockups; each is
one line of UI, and the free data for each was checked to exist.

5. **Fund fees, as a figure** — "Your funds cost about $X a year (VTI
   0.03%, VXUS 0.05%, BND 0.03%)" on Portfolio Health. Yahoo
   `fundProfile.feesExpensesInvestment.annualReportExpenseRatio`.
   Narrower than #4 above: today's cost only, no projection.
6. **Compared with the market today** — the portfolio's day change
   next to the S&P 500's ("−1.37% Tue · S&P 500 −0.4%"). SPY via the
   chart endpoint Conduit already uses.
7. **Portfolio value over time** — record a daily value snapshot from
   now on; the chart starts empty and fills in. Needs a Conduit table
   + scheduled job.
8. **Alerts** — e.g. a Telegram message when a holding turns "Act" or
   an earnings date arrives. A real feature (settings, delivery).
9. **US vs international split** — Yahoo has no country breakdown for
   funds; needs another data source.
10. **CPI release dates in "Coming up"** — BLS's schedule page refuses
    automated requests (403); needs another source.

Declined: showing news exposure in the inbox ("NVDA news touches
13.0% of the portfolio, including through VTI"). Don't re-propose.

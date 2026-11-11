# ADR 0018: Dividend Income and Fed Rate Decisions

## Status
Accepted (Colby, 2026-11-11)

## Context
After ADR 0016/0017, Colby asked what else established portfolio sites
offer that would help without overloading the app.

**Surveyed:**
- Morningstar X-Ray
- Empower
- Sharesight
- Snowball Analytics
- Stock Events
- Simply Wall St
- Kubera
- getquin

**Shortlisted:** four small additions.
- fund fees;
- dividend income;
- the portfolio's day change next to the S&P 500's;
- Fed rate decisions in "Coming up".

**Excluded on purpose:**
- returns and gain/loss, which need cost basis (out of scope since
  ADR 0015);
- target allocations and rebalancing (directive);
- scores and ratings (verdicts);
- net worth, tax and account linking (a different product).

**Colby chose:**
- **Dividend income**, "an overlooked item".
- **Fed decisions.**

He **declined** showing news exposure in the inbox ("NVDA news
touches 13.0% of the portfolio").

## Decision

### Dividend income (Portfolio Health)
A card between the holdings table and Diversification:
- **Headline:** recorded payouts per share over the last 12 months ×
  the units held now, summed. With the test units: **$582.94 a year**.
- **Context figures:**
  - that total as a share of today's portfolio value;
  - the monthly average.
- **Per paying holding:**
  - frequency;
  - per-share total over 12 months;
  - units;
  - income;
  - next ex-dividend date if one is announced, otherwise "Not
    announced".
- Holdings with no recorded payout are named in one line.

It's labelled for what it is: "what those units would have received,
not a forecast". The source's history can trail a payout by weeks;
the card says so too.

It uses the per-share trailing sums `/market` already returns (ADR
0016), so there's no new backend call. Numbers only (ADR 0017's rule).

### Fed rate decisions ("Coming up")
- **Source:** Conduit's `fed.go` reads the Fed's own published FOMC
  calendar (federalreserve.gov), cached 24 h. After a failure it keeps
  the last good list and retries after 10 minutes.
- **API:** `/market` returns the next four meetings as `fed_meetings`.
- **Inbox:** a decision within 30 days appears in "Coming up" as "Fed
  interest-rate decision".
  - Its detail reads: "Announced 2:00 PM ET after the Dec 8–9 meeting,
    with the Fed's economic projections · applies to the whole market,
    not one holding".
  - The row links to the Fed's calendar.
  - The next one is Wed, Dec 9.
- **Parsing:** month-spanning meetings ("Apr/May 30-1") are handled.
  Notation votes and unscheduled meetings are skipped. Only published
  dates are shown.

CPI release dates were considered as well. The BLS schedule page
refuses automated requests (403), so they're left out until there's a
reliable source.

## Consequences
- Portfolio Health gains one card. The inbox gains at most one row per
  Fed meeting.
- One extra upstream request a day (the Fed page).
- The Fed parser depends on the page's markup (`fomc-meeting__month` /
  `__date`). If that changes, the list goes empty rather than wrong,
  and the rest of `/market` is unaffected.

## Not built (recorded in design/mockups/FUTURE-FEATURES.md)
Fund fees, the S&P 500 comparison, portfolio value over time, alerts,
and a US/international split. Inbox news exposure was declined.

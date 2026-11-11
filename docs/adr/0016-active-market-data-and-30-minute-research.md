# ADR 0016: Active Market Data and a 30-Minute Research Cadence

## Status
Accepted (Colby, 2026-11-11: "all of it, now"; build approved without a
separate mockup round ahead of the Saturday presentation)

## Context
The live inbox (ADR 0015) re-researches each holding every 6 hours and
shows no market data beyond Portfolio Health's latest price. For a
product meant to be used in a market that moves all day, that reads as
a report that updates a few times a day, not a working tool. The
presentation is Saturday, Nov 14, when the market is closed.

Colby asked for:
- a research cadence of 30–60 minutes;
- more market data per holding: day change in $ and %, price
  movement, dividend dates, and "any other factors that could
  influence my decisions";
- on the weekend, an **honest "market closed" view** — "accurate
  instead of performative". No replay or simulated-movement mode.

## Decision

### Two clocks
- **Research** (news + SEC filings, then the LLM read): every
  **30 minutes** per holding, up from 6 hours. The schedule constant
  lives in Conduit's finance handler. Migration
  `finance/0005_research_every_30_minutes.sql` moves the existing
  schedule rows and pulls their next run forward. An ingest that finds
  nothing new never calls the LLM (ADR 0015's worker), so most
  half-hourly runs cost two HTTP calls and no inference.
- **Prices**: fetched on demand by the browser, on a clock that follows
  the market:
  - every **1 min** while the regular session is open;
  - every **5 min** pre-market and after hours;
  - every **15 min** while closed.
  - Polling pauses while the tab is hidden.
  - Research results (the inbox) re-poll every 2 min.

### Market data: `GET /api/v1/finance/market`
A new Conduit route returns, per holding:
- **Price action:** price, previous close, change in $ and %, day
  high/low, volume, and the intraday series (5-minute closes).
- **Ranges:** 52-week high/low.
- **Dividends:**
  - yield;
  - the **next ex-dividend and pay dates when announced**;
  - the last recorded payout;
  - payment frequency, from the median gap between ex-dates;
  - the sum of payouts over the last 12 months.
- **Earnings:** the **next earnings date**, flagged *Confirmed* or
  *Estimated* (the source's own flag).
- **Risk/valuation context:** beta, and trailing P/E.

It also returns the **market session**: whether it's pre, open, post or
closed, which close the prices are from, and the next open. All of
this comes from Yahoo Finance's keyless endpoints, cached server-side
per ticker (price 45 s, calendar 30 min, payout history 6 h), so a
page polling every minute costs at most one upstream call per ticker.
A failed ticker returns `error` and nulls; it never fails the response.

### Honesty rules (the "accurate, not performative" requirement)
- **Every change figure is labelled with its session.** It says
  "today" only when the prices are from today's session in New York;
  otherwise it carries the weekday ("−5.47% Fri"). On Saturday, no
  number reads as happening now.
- **The status line says what the prices are:**
  - "Market open · Prices as of 10:55 AM ET, refreshing every minute"
    during the session;
  - "Market closed · Prices are from the Fri, Nov 13 4:00 PM ET close"
    otherwise.
  - No live-looking pulse outside regular hours.
- **Only published dates.** Upcoming ex-dividend and earnings dates are
  shown only when the source has published them. Nothing is projected
  from past patterns:
  - funds get "No upcoming date announced. Last recorded …";
  - an estimated earnings date says *Estimated*.
- **"Last recorded", not "last".** The source's payout history can trail
  the real payout by weeks: BND's Nov 2 ex-date was missing on Nov 11.
- **Day change is not gain/loss.** Portfolio Health's change column is
  units × (price − previous close), and says so. Cost basis remains out
  of scope.
- **The guardrail carries forward.** Every number is a fact with its
  basis, and glosses explain terms inline (beta, P/E, ex-dividend).
  Nothing says whether a number is good or bad. There's no buy/sell/hold
  language, and the panel footer says the data describes the security,
  not a recommendation.

### Where it shows
- **Inbox:**
  - **Status line**: under the page title.
  - **Holdings rows**: price and change.
  - **Triage cards**:
    - price, change, and the nearest dated event as a chip ("Earnings
      in 6 days");
    - the old flat placeholder sparkline is replaced by the real
      session, with the previous close dashed.
  - **New "Coming up"** list: earnings and announced ex-dividend dates
    across all holdings for the next 30 days, in date order. This is a
    cross-holding view, not a re-list of the rows above.
- **Detail page:** a market panel above the research:
  - price and change, the status line, and the session chart;
  - a key-numbers list covering previous close, day range, 52-week
    range with position, volume, beta, next earnings, yield and
    schedule, ex-dividend, and P/E.
- **Portfolio Health:** today's (or the session's) change for the total
  and per position, plus the status line. It re-prices every minute
  while the market is open.

## Consequences
- The inbox looks and behaves like a working tool during market hours.
  On the weekend it plainly shows Friday's close and what's coming up.
- **Dependency on unofficial endpoints.** Yahoo's endpoints are
  unofficial:
  - The summary call (earnings, ex-dividend, yield, beta, P/E) needs a
    cookie+crumb pair. If Yahoo changes that, those fields go empty
    while prices keep working. The client backs off for 2 minutes after
    a failure, so it doesn't hammer Yahoo.
  - Moving to a keyed provider later is a change confined to Conduit's
    `market.go`.
- **More upstream traffic:** research runs 12× as often. Each ingest is
  one EDGAR submissions call (the ticker map is cached) plus one
  Finnhub news call. With 7 holdings that's 14 + 14 requests an hour,
  far inside SEC's 10 requests/second and Finnhub's free 60/minute.
- **Market data doesn't feed the LLM.** The research read is still
  news + filings only. Adding price context to the prompt would need
  its own guardrail review ("X fell because Y" drifts toward advice
  quickly) and is left out on purpose.

## What stays unchanged
- The triage pipeline, its citations and its Act/Watch/Reviewed
  bucketing.
- Holdings management.
- Units editing.
- Client-side fetching through the same-origin `/api/v1/finance` route.
- There is no fixture fallback, and no buy/sell/hold language anywhere.

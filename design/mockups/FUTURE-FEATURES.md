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

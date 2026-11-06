# 0007: Drop the traditional-research comparison

## Status
Accepted

## Context
ADR 0006 added a side-by-side comparison on each security's page: the
AI-assisted read-out next to an equivalent traditional-research workflow,
tied together with a verdict (agree / AI flagged it earlier / diverge).

The AI-vs-traditional comparison itself is being presented live, in a
separate presentation to the group this tool is being shown to. Having
the tool also render that same comparison (with its own mock "analyst
rating," "turnaround," "methods used," etc.) duplicates — and risks
contradicting in detail — content the presentation already covers, and
invites the audience to scrutinize a second, less carefully-worded
version of a story being told live instead of in the UI.

## Decision
Drop the `traditional` half of `SecurityProfile`, the `verdict`/
`verdictNote` fields, and the `MethodologyComparison`/`VerdictBadge`
components entirely — not hidden behind a flag, removed from the mock
data and the bundle. `/securities` and `/securities/[ticker]` keep
everything on the AI side: risk score, model confidence, turnaround,
data freshness, the signals driving the score, and the 30-day trend
chart. `AIAnalysisPanel` replaces `MethodologyComparison` as a
single-column version of that same panel.

ADR 0006 is left as written — it was accurate for what was built at the
time; this ADR documents what changed and why, rather than editing
history to pretend the comparison was never there.

## Consequences
- `securityProfiles` entries are shorter; `Verdict` as a type no longer
  exists.
- The `/securities` index table drops its "Comparison vs. Traditional"
  column; a "Confidence" column takes its place, since that's a real
  AI-side number worth showing in the list view and the column it
  replaced is gone.
- If the comparison framing is ever wanted back in the tool itself
  (rather than only in a live presentation), ADR 0006's mock data shape
  is still in git history and can be restored rather than re-designed
  from scratch.

# 0013: Rounded-rectangle buttons, not pills

## Status
Accepted

## Context
ADR 0011 adopted the "Confident Flat" visual system (Revolut-inspired),
which used 999px/fully-rounded "pill" shapes universally — status
badges, the Mark reviewed button, nav tabs, the timeframe toggle,
ticker tags, source-quality tags, and the allocation bar all shared
the same fully-rounded treatment.

Colby: "lets make the UI buttons more obvious and distinct. I want
rectangular buttons with rounded corners... lets also refactor the
'pills' since those are quite 'AI generated' in nature." Pill-shaped
buttons/badges are a recognizable generic-AI-UI tell, independent of
whether the rest of the design is good — and with everything using
the same fully-rounded shape, actual clickable buttons didn't read as
more actionable than passive status badges.

## Decision
Replace every pill (`rounded-full`) with a rounded rectangle across
the three real pages (`/`, `/portfolio-health`, `/securities/[ticker]`)
and the shared nav:

- **Interactive buttons** (Mark reviewed, the Portfolio Health
  timeframe toggle, the mover-card link, nav tabs): `rounded-lg`
  (10px), with an explicit border and a hover state (border/background
  shift) that passive elements don't get — this is the actual fix for
  "more obvious and distinct," not just the corner radius.
- **Passive badges/tags** (status chips, verdict chips, source-quality
  tags, ticker tags): `rounded-md` (6px), smaller radius than buttons
  so the two read as visually distinct categories, with a border in
  the semantic color instead of a flat fill-only chip.
- **Bars** (allocation bar, triage-inbox allocation bar): `rounded-lg`/
  `rounded-md` depending on height, dropped from fully-rounded ends.

Genuine circles (status dots, the empty-state checkmark bubble, the
timeline's event dots) are left as `rounded-full` — they're circles by
design, not pills being questioned here.

## Consequences
- Buttons and badges are now visually distinguishable at a glance by
  shape class (rounded-lg + border + hover vs. rounded-md + border,
  no hover) as well as by the obvious color/weight differences that
  already existed.
- No markup/data changes — this is a pure Tailwind class edit across
  4 files, verified with `tsc --noEmit` and a visual pass of all 3
  pages plus one live interaction (Mark reviewed) after the change.

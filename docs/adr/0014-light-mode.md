# 0014: Light mode — off-white, not stark white

## Status
Accepted

## Context
Colby: "I would also like a 'light mode' to this site - however it
should be off white and visually appealing." The app had only ever
shipped the dark "Confident Flat" theme (ADR 0011); every structural
and semantic color was already a hardcoded hex value scattered across
4 files via Tailwind arbitrary-value classes (`bg-[#191c1f]` etc.),
not a token system, so there was no mechanism to swap themes without
a full pass.

## Decision
Tokenize every structural/semantic color as a CSS custom property in
`globals.css`, with dark values on `:root` (unchanged — still the
default) and light overrides on `html[data-theme="light"]`:

- Structural: `--bg`, `--surface`, `--surface-2`, `--border`, `--ink`,
  `--ink-dim`, `--ink-faint`.
- Semantic, reused for both text and tinted chip backgrounds:
  `--green`/`--green-dim`, `--red`/`--red-dim`, `--amber`/`--amber-dim`,
  plus two more introduced to tokenize the existing purple/blue source
  tags: `--purple`/`--purple-dim`, `--blue`/`--blue-dim`. Light-mode
  values are meaningfully *darker* than dark-mode's bright versions —
  a straight hex swap of the dark theme's bright green/red/amber as
  TEXT on an off-white background fails contrast; e.g. `--green` is
  `#4ade80` in dark mode but `#15803d` in light mode.
- Two deliberately fixed (non-flipping) tokens, because their role
  doesn't change with theme: `--ink-on-bright` (#191c1f both themes —
  dark text used on a status chip whose own fill is always vivid
  red/amber regardless of page theme) and the `--btn-*` group, which
  *does* flip (the one neutral accent button — Mark reviewed, the
  timeframe toggle, the mover-card link — is a light fill on the dark
  background and a dark fill on the light one, by design, so it reads
  as a button in both).
- Two decorative data-swatch tokens, `--swatch-neutral-1/2`, for the
  two holding colors (VTI, VXUS) that sit on the light/neutral end of
  the existing 7-color ticker palette — those two would wash out
  against an off-white background if left as fixed hex. The other 5
  ticker colors (NVDA green, AAPL/MSFT blues, BND/Cash darker grays)
  are left as plain hex, unconverted — they're decorative data-viz
  categories, not semantic colors, and already have enough contrast
  against both a near-black and an off-white surface.

Light palette: `--bg: #f6f3ed` (warm cream, not `#ffffff`), `--surface:
#ffffff` (so cards still visibly lift off the page), `--ink: #221f1a`
(warm near-black, not pure `#000`).

A `ThemeToggle` client component (button in `TopNav`, labeled "☀
Light" / "☾ Dark") flips `data-theme` on `<html>` and persists the
choice to `localStorage` under `finance-copilot-theme`. An inline
`<script>` in `app/layout.tsx`'s `<head>` reads that value and sets
the attribute before first paint, avoiding a flash of the wrong theme
on load. Dark stays the default for a first-time visitor (no stored
preference) — this is additive, not a default change.

## Consequences
- Every page-chrome color in the app now has exactly one definition
  per theme, in one file (`globals.css`). Any future palette tweak
  (either theme) is a token edit, not a 4-file hex hunt.
- The one genuinely new design decision here is the flipping
  `--btn-*` pair — without it, a plain white "Mark reviewed" button
  would nearly disappear against the new off-white background.
  Flipping it to a dark fill on light mode keeps the "obvious,
  distinct button" property from ADR 0013 true in both themes.
- Not done: no `prefers-color-scheme` auto-detection — the toggle is
  fully manual, dark-by-default. Could be added later if wanted.

## Pitfall hit during verification (worth recording)
A stray Turbopack build-worker process (`pool_entry-[turbopack-node]
...webpack-loaders...`) survived repeated `pkill -f "next dev"` /
`pkill -f "next-server"` calls because its process name doesn't match
either pattern. It kept serving a **stale compiled `globals.css`
chunk** (missing all the new tokens) even after `rm -rf .next` and a
fresh `next dev` launch, because the content-addressed chunk filename
happened to collide and Turbopack's dev cache reused it. Symptom:
`document.documentElement.getAttribute('data-theme')` correctly
reports `"light"` after clicking the toggle, but computed styles never
change — the attribute selector in CSS simply doesn't exist in what's
being served. Fix: `pkill -9 -f "<repo-dir-name>"` (match the full
project path, not just the `next` process name) to catch every
related worker process before restarting.
